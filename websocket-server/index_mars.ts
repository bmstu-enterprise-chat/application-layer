import express from 'express';
import http from 'http';
import ws, { type WebSocket } from 'ws';

const port_mars: number = 8002; // порт на котором будет развернут этот (вебсокет) сервер
const hostname = '0.0.0.0'; // адрес вебсокет сервера

interface Message {
  id?: number
  username: string
  data?: string
  send_time?: string
  error?: string
}

interface Message_from_transport{
  sender: string,
  payload: string,
  send_time: string,
  error: boolean,
  errormsg: string
}

type Users = Record<string, Array<{
  id: number
  ws: WebSocket
}>>

const app_mars = express() // создание экземпляра приложения express
const server_mars = http.createServer(app_mars) // создание HTTP-сервера

// Используйте express.json() для парсинга JSON тела запроса
app_mars.use(express.json())

app_mars.post('/receive', (req: { body: Message_from_transport }, res: { sendStatus: (arg0: number) => void }) => {
  const message: Message_from_transport = req.body
  sendMessageToMarsUsers(message.sender, message)
  res.sendStatus(200)
})

// запуск серверов приложения
server_mars.listen(port_mars, hostname, () => {
  console.log(`server_mars started at http://${hostname}:${port_mars}`)
})

const wss_mars = new ws.WebSocketServer({ server: server_mars })
const mars_users: Users = {}

function sendMessageToMarsUsers (username: string, message: Message_from_transport): void {
  if (message.error){
    console.error(`Transport layer error`);
    // Prepare error message for Earth client
    const errorMsg: Message_from_transport = {
      sender: 'System',
      send_time: new Date().toISOString(),
      error: message.error,
      errormsg: `Failure for ${message.sender}: ${message.errormsg.substring(0,30)}`,
      payload:`There, take this: ( ﾟヮﾟ)`
    };
    const errmsgString = JSON.stringify(errorMsg)
    for (const key in mars_users) {
      mars_users[key].forEach(element => {
        console.log(`sent ${message.payload}`)
        element.ws.send(errmsgString)
      })
    }
    return
  }
  const msgString = JSON.stringify(message)
  for (const key in mars_users) {
      if (key !== username) {
      mars_users[key].forEach(element => {
        console.log(`sent ${message.payload}`)
        element.ws.send(msgString)
      })
    }
  }
}


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
  });

  websocketConnection.on('close', (event: any) => {
    console.log(username, '[close] Соединение прервано', event)

    delete mars_users.username
  })
})