import React, {useState} from "react";
import {useUser} from "../../hooks/useUser";
import {Message, TYPING_SYMBOL} from "../../consts";
import {Button, TextField} from "@mui/material";
import "../../style.css"
import "./Input.css"

type InputProps = {
  ws: any,
  setMessageArray: any,
}

export const Input: React.FC<InputProps> = ({ws, setMessageArray}) => {
  const {login} = useUser();
  const [message, setMessage] = useState<Message>({data: ''});
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout>();

const handleChangeMessage = (event: any) => {
  const newMsg: Message = {
    data: event.target.value,
    username: login,
    send_time: String(new Date()),
  };
  setMessage(newMsg);

  if (event.target.value.trim().length === 0) {
    return; // Не отправляем статус для пустого ввода
  }

  // Отправляем сообщение о наборе текста
  if (ws && login) {
    // Очищаем предыдущий таймер
    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Отправляем сообщение о наборе
    const typingMsg: Message = {
      username: login,
      data: TYPING_SYMBOL, // Используем специальный символ
      send_time: new Date().toISOString()
    };
    ws.send(JSON.stringify(typingMsg));
    
    // Устанавливаем таймер для отправки сообщения о прекращении набора
    const timeout = setTimeout(() => {
      const stopTypingMsg: Message = {
        username: login,
        data: '',
        send_time: new Date().toISOString()
      };
      ws.send(JSON.stringify(stopTypingMsg));
    }, 2000);
    setTypingTimeout(timeout);
  }
};


  // на кнопку Отправить мы должны посать сообщение по вебсокету
  const handleClickSendMessBtn = () => {
    if (login && ws && message.data?.trim()) {
      const messageToSend = {
        ...message,
        send_time: new Date().toISOString(), // Используем текущее время
        username: login // Добавляем username на всякий случай
      };
      const msgJSON = JSON.stringify(messageToSend);
      ws.send(msgJSON);
      setMessageArray((currentMsgArray: any) => [...currentMsgArray, messageToSend]);
      setMessage({ data: '' });
    }
  };

  return (
    <>
      <div className="home-frame3">
          <div className="home-frame-text-field-multiline">
            <div className="home-frame-text-field2">
              <div className="home-input2">
                <div className="home-content3">
                <input
                  className="home-text25 inputvalue"
                  placeholder="Введите сообщение"
                  value={message.data || ''} // Добавляем fallback на случай undefined
                  onChange={handleChangeMessage}
                  style={{width: '100%', minHeight:'30px', maxHeight:'300px', background: 'none', border: 'none'}}
                />
                </div>
              </div>
              <div className="home-label-container">
                <span className="home-text26 inputlabel">Сообщение</span>
              </div>
            </div>
          </div>
          <Button className="home-frame-button2" onClick={handleClickSendMessBtn} style={{margin: '0 2em',padding: '0 2em'}}>
            <div className="home-base2">
              <span className="home-text27 buttonlarge">Отправить</span>
            </div>
          </Button>
        </div>
    </>
  );
}