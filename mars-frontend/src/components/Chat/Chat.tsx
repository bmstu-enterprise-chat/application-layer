import {useUser} from "../../hooks/useUser";
import {Message} from "../../consts";
import {Input} from "../Input/Input";
import {MessageCard} from "../MessageCard/MessageCard";
import {Button} from "@mui/material";
import React from "react";
import "../../style.css"
import "./Chat.css"

type ChatProps = {
  messages: Message[];
  ws: WebSocket | undefined;
  messageArray: Message[];
  setMessageArray: (msg: Message[]) => void;
  typingUsers: string[];
  setTypingUsers: (us: string[]) => void;
}

export const Chat: React.FC<ChatProps> = ({messages, ws, messageArray, setMessageArray, typingUsers, setTypingUsers}) => {
  const {login, resetUser} = useUser();

  // при логауте закрываем соединение
  const handleClickLogoutBtn = () => {
    resetUser();
    setMessageArray([]);
    setTypingUsers([]); // Очищаем статусы печатающих пользователей
    if (ws) {
      ws.close(4000, login);
    } else {
      console.log("ws.close(4000, 'User logout'); don't work");
    }
  };

  return (
    <>
    <div className="home-frame1">
      <div className="home-frame-app-bar2">
          <div className="home-frame-paper2">
            <div className="home-frame-toolbar2">
              <div className="home-left-side2">
                <button className="home-frame-icon-button2">
                  <div className="home-frame-icon2">
                    <div className="home-menu-filled2">
                      <img
                        src="/external/icons8chat5018612-f9v-200h.png"
                        alt="icons8chat5018612"
                        className="home-icons8chat5012"
                      />
                    </div>
                  </div>
                </button>
                <div className="home-frame-typography2">
                  <span className="home-text15 typographyh6">Чат-комната</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      <div className="home-frame2">
        <div className="home-lg1200px">
          <div className="home-title">
            <span className="home-text16 typographyh5">Сообщения</span>
          </div>
          <div className="home-frame-divider-horizontal">
            <div className="home-minheight"></div>
            <img
              src="/external/divideri8606-mok.svg"
              alt="DividerI8606"
              className="home-divider"
            />
          </div>
          {messageArray.length >0 ?
            <div className="home-jobs-xs12md8">
              {messageArray.map((msg: Message, index: number) => (
                <div key={index} className="chat--msg">
                  <MessageCard msg={msg}/>
                </div>
              ))}

            </div>
            :
            <div className="chat--no-msg">
              <div style={{fontSize: '2em', color: 'gray'}}>Здесь будут сообщения</div>
            </div>
          }

        </div>
        <div className="typing-status" style={{
          minHeight: '20px',
          color: 'gray',
          fontStyle: 'italic',
          margin: '0.5em 0',
          zIndex: 5
        }}>
        {typingUsers.length > 0 && (
          typingUsers.length === 1 
            ? `${typingUsers[0]} печатает...`
            : `${typingUsers.slice(0, -1).join(', ')} и ${typingUsers.slice(-1)[0]} печатают...`
        )}
        </div>
        <Input ws={ws} setMessageArray={setMessageArray}/>
        
      </div>
      <div
        className="home-rectangle12"
      />
      <Button variant="contained"
                  className="exit-button"
                  onClick={handleClickLogoutBtn}
                >
                Выход
      </Button>
    </div>
    </>
  );
}