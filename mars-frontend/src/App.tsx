import React, {useEffect, useState} from 'react';
import './App.css';
import './style.css'
import {useUser} from "./hooks/useUser";
import {Login} from "./components/Login/Login";
import {hostname, Message, TYPING_SYMBOL} from "./consts";
import {Chat} from "./components/Chat/Chat";

function App() {
  const {login} = useUser();
  const [ws, setWs] = useState<WebSocket | undefined>();  // весокет
  const [messageArray, setMessageArray] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // создание вебсокета должно быть после рендера - поместим в useEffect
  useEffect(() => {
    if (login) {
      setWs(
        createWebSocket(
          `ws://${hostname}:8002/?username=${encodeURIComponent(login)}`,
        ),
      );
    } else {
      setWs(new WebSocket(`ws://${hostname}`));
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTypingUsers(prev => {
        if (prev.length > 0) {
          return prev;
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // создаем вебсокет
  const createWebSocket = (url: string) => {
    const ws = new WebSocket(url); // создаем новый инстанс

    // обработчик на открытие соединения
    ws.onopen = function () {
      console.log('WebSocket connection opened');
    };

    // обработчик на получение сообщения
    ws.onmessage = function (event) {
      const message = JSON.parse(event.data) as Message;
      console.log(`${message.sender}: ${message.payload}`)
    
      // Проверяем на специальный символ
      if (message.payload === TYPING_SYMBOL) {
        // Пользователь печатает
        setTypingUsers(prev => 
          [...new Set([...prev, message.sender || ''])]
        );
      } else if (message.payload === '') {
        // Пользователь прекратил печатать
        setTypingUsers(prev => 
          prev.filter(user => user !== message.sender)
        );
      } else if (message.payload && !message.payload.includes(TYPING_SYMBOL)) {
        // Обычное сообщение - убираем пользователя из списка печатающих
        setTypingUsers(prev => 
          prev.filter(user => user !== message.sender)
        );
        setMessageArray(prev => [...prev, message]);
      }
    };

    // обработчик на закрытие
    ws.onclose = function () {
      console.log('WebSocket connection closed');
    };

    // обработчик на ошибку
    ws.onerror = function (event) {
      console.error('WebSocket error:', event);
      setMessageArray(prev => [...prev, {
        sender: 'System',
        errormsg: 'Connection error occurred',
        error: true,
        send_time: new Date().toISOString()
      }]);
    };

    return ws;
  };

  // дальше будут две страницы - с чатом и авторизацией
  return (
    <>
      <div className="App">
        {login ?
          <Chat messages={messageArray} ws={ws} messageArray={messageArray} setMessageArray={setMessageArray} typingUsers={typingUsers} setTypingUsers={setTypingUsers}/>
          :
          <Login ws={ws} setWs={setWs} createWebSocket={createWebSocket}/>
        }
      </div>
    </>
  );
}

export default App;