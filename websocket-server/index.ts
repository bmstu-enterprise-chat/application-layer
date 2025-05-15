import express from 'express';
import axios from 'axios';
import http from 'http';
import ws, { type WebSocket } from 'ws';
import exp from 'constants';

const port_earth: number = 8001; // порт на котором будет развернут этот (вебсокет) сервер
const port_mars: number = 8002; // порт на котором будет развернут этот (вебсокет) сервер
const hostname = '0.0.0.0'; // адрес вебсокет сервера
const transportLevelPort = 8080; // порт сервера транспортного уровня
const transportLevelHostname = '10.147.17.22'; // адрес сервера транспортного уровня
const TYPING_SYMBOL = '\u200B__TYPING__\u200B'; // Специальный символ для статуса "печатает"

interface Message {
  id?: number
  username: string
  data?: string
  send_time?: string
  error?: string
}

interface Message_to_transport{
    sender: string,
    data: string,
    send_time: string
}

type Users = Record<string, Array<{
  id: number
  ws: WebSocket
}>>

const app_earth = express() // создание экземпляра приложения express
const server_earth = http.createServer(app_earth) // создание HTTP-сервера
const app_mars = express() // создание экземпляра приложения express
const server_mars = http.createServer(app_mars) // создание HTTP-сервера

// Используйте express.json() для парсинга JSON тела запроса
app_earth.use(express.json())
app_mars.use(express.json())

app_earth.post('/receive', (req: { body: Message }, res: { sendStatus: (arg0: number) => void }) => {
  const message: Message = req.body
  sendMessageToOtherUsers(message.username, message)
  res.sendStatus(200)
})
app_mars.post('/receive', (req: { body: Message }, res: { sendStatus: (arg0: number) => void }) => {
  const message: Message = req.body
  sendMessageToMarsUsers(message.username, transformToTransportMessage(message))
  res.sendStatus(200)
})

// запуск серверов приложения
server_earth.listen(port_earth, hostname, () => {
  console.log(`server_earth started at http://${hostname}:${port_earth}`)
})
server_mars.listen(port_mars, hostname, () => {
  console.log(`server_mars started at http://${hostname}:${port_mars}`)
})

const wss_earth = new ws.WebSocketServer({ server: server_earth })
const wss_mars = new ws.WebSocketServer({ server: server_mars })
const users: Users = {}
const mars_users: Users = {}

function transformToTransportMessage(message: Message): Message_to_transport {
  return {
    sender: message.username,
    data: message.data || '', // Provide default empty string if data is undefined
    send_time: message.send_time || new Date().toISOString() // Use current time if not provided
  };
}

const sendMsgToTransportLevel = async (message: Message, retries = 3): Promise<void> => {
  try {
    const transportMessage = transformToTransportMessage(message);
    
    const response = await axios.post(
      `http://${transportLevelHostname}:${transportLevelPort}/send`,
      transportMessage,
      { timeout: 5000 } // 5 second timeout
    );

    // Send success notification to Earth client
    if (response.status === 200) {
      const successMsg: Message = {
        username: 'System',
        data: 'Сообщение отправлено',
        send_time: new Date().toISOString()
      };
      users[message.username]?.forEach(element => {
        element.ws.send(JSON.stringify(successMsg));
      });
    } else {
      throw new Error(`HTTP ${response.status}`);
    }

  } catch (error) {
    console.error(`Transport layer error (${retries} retries left):`, error);

    // Prepare error message for Earth client
    const errorMsg: Message = {
      username: 'System',
      send_time: new Date().toISOString(),
      error: getTransportErrorText(error)
    };

    users[message.username]?.forEach(element => {
      element.ws.send(JSON.stringify(errorMsg));
    });

    // Retry logic
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
      return sendMsgToTransportLevel(message, retries - 1);
    }
  }
};


function getTransportErrorText(error: any): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 500) {
      return 'Пакет утерян на канальном уровне';
    } else if (error.response?.status === 404) {
      return 'Сообщение не отправлено (404)';
    } else if (error.code === 'EHOSTUNREACH') {
      return 'Транспортный сервер недоступен';
    }
  }
  return 'Ошибка при отправке сообщения';
}


function sendMessageToOtherUsers (username: string, message: Message): void {
  const msgString = JSON.stringify(message)
  for (const key in users) {
    if (key !== username) {
      users[key].forEach(element => {
        element.ws.send(msgString)
      })
    }
  }
}

function sendMessageToMarsUsers (username: string, message: Message_to_transport): void {
  const msgString = JSON.stringify(message)
  for (const key in mars_users) {
    console.log(`Message ${message.data} sent to Mars`)
    if (key !== username) {
      mars_users[key].forEach(element => {
        element.ws.send(msgString)
      })
    }
  }
}

wss_earth.on('connection', (websocketConnection: WebSocket, req: Request) => {
  if (req.url.length === 0) {
    console.log(`Error: req.url = ${req.url}`)
    return
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const url = new URL(req?.url, `http://${req.headers.host}`)
  const username = url.searchParams.get('username')

  if (username !== null) {
    console.log(`[open] Connected, username: ${username}`)

    if (username in users) {
      users[username] = [...users[username], { id: users[username].length, ws: websocketConnection }]
    } else {
      users[username] = [{ id: 1, ws: websocketConnection }]
    }
  } else {
    console.log('[open] Connected')
  }

  console.log('users collection', users)

  websocketConnection.on('message', (messageString: string) => {
    console.log('[message] Received from ' + username + ': ' + messageString)

    const message: Message = JSON.parse(messageString)
    message.username = message.username ?? username

    void sendMessageToOtherUsers(message.username ,message)
    if (!(message.username==="System" || message.data ==="" || message.data===TYPING_SYMBOL)){
      void sendMsgToTransportLevel(message)
    }
  })

  websocketConnection.on('close', (event: any) => {
    console.log(username, '[close] Соединение прервано', event)

    delete users.username
  })
})

wss_mars.on('connection', (websocketConnection: WebSocket, req: Request) => {
  if (req.url.length === 0) {
    console.log(`Error: req.url = ${req.url}`)
    return
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const url = new URL(req?.url, `http://${req.headers.host}`)
  const username = url.searchParams.get('username')

  if (username !== null) {
    console.log(`[open] Connected, username: ${username}`)

    if (username in mars_users) {
      mars_users[username] = [...mars_users[username], { id: mars_users[username].length, ws: websocketConnection }]
    } else {
      mars_users[username] = [{ id: 1, ws: websocketConnection }]
    }
  } else {
    console.log('[open] Connected')
  }

  console.log('users collection', mars_users)

  websocketConnection.on('message', (messageString: string) => {
    console.log('[message] Received from ' + username + ': ' + messageString);

    const message: Message_to_transport = JSON.parse(messageString)
    message.sender = message.sender ?? username

    void sendMessageToMarsUsers(message.sender ,message)
  });

  websocketConnection.on('close', (event: any) => {
    console.log(username, '[close] Соединение прервано', event)

    delete mars_users.username
  })
})