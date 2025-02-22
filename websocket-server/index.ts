import express from 'express'
import axios from 'axios'
import http from 'http'
import ws, {type WebSocket} from 'ws'

const port: number = 8001; // порт на котором будет развернут этот (вебсокет) сервер
const hostname = 'localhost'; // адрес вебсокет сервера
const transportLevelPort = 8002; // порт сервера транспортного уровня
const transportLevelHostname = '192.168.12.172'; // адрес сервера транспортного уровня

interface MessageCard {
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

  const app = express(); // создание экземпляра приложения express
  const server = http.createServer(app); // создание HTTP-сервера
  
  // Используйте express.json() для парсинга JSON тела запроса
  app.use(express.json());
  
  // запуск сервера приложения
  server.listen(port, hostname, () => {
    console.log(`Server started at http://${hostname}:${port}`)
  })

  const wss = new ws.WebSocketServer({server})
  const users: Users = {}

  // обрабочик на коннект для вебсокета
wss.on('connection', (websocketConnection: WebSocket, req: Request) => {
    if (req.url.length === 0) {
      console.log(`Error: req.url = ${req.url}`)
      return
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const url = new URL(req?.url, `http://${req.headers.host}`)
    const username = url.searchParams.get('username') // берем имя юзера из параметра
  
    if (username !== null) {
      console.log(`[open] Connected, username: ${username}`)
  
      if (username in users) {
        users[username] = [...users[username], {id: users[username].length, ws: websocketConnection}]
      } else {
        users[username] = [{id: 1, ws: websocketConnection}]
      }
    } else {
      console.log('[open] Connected')
    }
  
    console.log('users collection', users)
  
    // обработчик на закрытие
    websocketConnection.on('close', (event: any) => {
      console.log(username, '[close] Соединение прервано', event)
  
      delete users.username
    })
  })