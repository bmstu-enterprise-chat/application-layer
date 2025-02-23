import express from 'express';
import axios from 'axios';
import http from 'http';
import ws, { type WebSocket } from 'ws';

const port: number = 8001; // порт на котором будет развернут этот (вебсокет) сервер
const hostname = 'localhost'; // адрес вебсокет сервера
const transportLevelPort = 8002; // порт сервера транспортного уровня
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

const app = express() // создание экземпляра приложения express
const server = http.createServer(app) // создание HTTP-сервера

// Используйте express.json() для парсинга JSON тела запроса
app.use(express.json())

app.post('/receive', (req: { body: Message }, res: { sendStatus: (arg0: number) => void }) => {
  const message: Message = req.body
  sendMessageToOtherUsers(message.username, message)
  res.sendStatus(200)
})

// запуск сервера приложения
server.listen(port, hostname, () => {
  console.log(`Server started at http://${hostname}:${port}`)
})

const wss = new ws.WebSocketServer({ server })
const users: Users = {}

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

wss.on('connection', (websocketConnection: WebSocket, req: Request) => {
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

    void sendMsgToTransportLevel(message)
  })

  websocketConnection.on('close', (event: any) => {
    console.log(username, '[close] Соединение прервано', event)

    delete users.username
  })
})