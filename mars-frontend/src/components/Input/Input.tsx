import React, {useState} from "react";
import {useUser} from "../../hooks/useUser";
import {Message} from "../../consts";
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

  // в инпуте делаем обработчик на изменение состояния инпута
  const handleChangeMessage = (event: any) => {
    const newMsg: Message = {
      data: event.target.value,
      username: login,
      send_time: String(new Date()),
    };
    setMessage(newMsg);
  };

  // на кнопку Отправить мы должны посать сообщение по вебсокету
  const handleClickSendMessBtn = () => {
    if (login && ws) {
      message.send_time = '2024-02-23T13:45:41Z';
      const msgJSON = JSON.stringify(message);
      ws.send(msgJSON);
      setMessageArray((currentMsgArray: any) => [...currentMsgArray, message]);
    }
  };

  return (
    <>
      <div className="home-frame3">
          <div className="home-frame-text-field-multiline">
            <div className="home-frame-text-field2">
              <div className="home-input2">
                <div className="home-content3">
                <input className="home-text25 inputvalue"
                  disabled
                  placeholder="Отправка сообщений с Марса недоступна"
                  value={message.data}
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
          <Button className="home-frame-button2" disabled onClick={handleClickSendMessBtn} style={{margin: '0 2em',padding: '0 2em'}}>
            <div className="home-base2">
              <span className="home-text27 buttonlarge">Отправить</span>
            </div>
          </Button>
        </div>
    </>
  );
}