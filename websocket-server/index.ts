import express from 'express';
import axios from 'axios';
import http from 'http';
import ws, { type WebSocket } from 'ws';
import exp from 'constants';

const port_earth: number = 8001; // порт на котором будет развернут этот (вебсокет) сервер
const port_mars: number = 8002; // порт на котором будет развернут этот (вебсокет) сервер
const hostname = 'localhost'; // адрес вебсокет сервера
const transportLevelPort = 8080; // порт сервера транспортного уровня
const transportLevelHostname = '192.168.12.172'; // адрес сервера транспортного уровня

interface Message {
  id?: number
  username: string
  data?: string
  send_time?: string
  error?: string
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
  sendMessageToMarsUsers(message.username, message)
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

const sendMsgToTransportLevel = async (message: Message): Promise<void> => {
  const response = await axios.post(`http://${transportLevelHostname}:${transportLevelPort}/send`, message)
  if (response.status !== 200) {
    message.error = 'Error from transport level by sending message'
    users[message.username].forEach(element => {
      if (message.id === element.id) {
        element.ws.send(JSON.stringify(message))
      }
    })
  }
  console.log('Response from transport level: ', response)
}

function sendMessageToOtherUsers (username: string, message: Message): void {
  const msgString = JSON.stringify(message)
  for (const key in users) {
    console.log(`[array] key: ${key}, users[keys]: ${JSON.stringify(users[key])} username: ${username}`)
    if (key !== username) {
      users[key].forEach(element => {
        element.ws.send(msgString)
      })
    }
  }
}

function sendMessageToMarsUsers (username: string, message: Message): void {
  const msgString = JSON.stringify(message)
  for (const key in mars_users) {
    console.log(`[array] key: ${key}, users[keys]: ${JSON.stringify(users[key])} username: ${username}`)
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
    void sendMsgToTransportLevel(message)
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
    console.log('[message] Received from ' + username + ': ' + messageString)

    const message: Message = JSON.parse(messageString)
    message.username = message.username ?? username

    void sendMessageToMarsUsers(message.username ,message)
  })

  websocketConnection.on('close', (event: any) => {
    console.log(username, '[close] Соединение прервано', event)

    delete mars_users.username
  })
})