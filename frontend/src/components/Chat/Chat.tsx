import {useUser} from "../../hooks/useUser";
import {Message} from "../../consts";
import {Input} from "../Input/Input";
import {MessageCard} from "../MessageCard/MessageCard";
import {Button} from "@mui/material";
import React from "react";

type ChatProps = {
  ws: WebSocket | undefined;
}

export const Chat: React.FC<ChatProps> = ({ws}) => {
  const {login, resetUser} = useUser();

  // при логауте закрываем соединение
  const handleClickLogoutBtn = () => {
    resetUser();
    if (ws) {
      ws.close(4000, login);
    } else {
      console.log("ws.close(4000, 'User logout'); don't work");
    }
  };

  return (
    <>
      <div className="chat">
        <div className="chat--header">
          {/* имя нашего пользователя */}
          Сообщения от {login}
        </div>

        <div className="chat--body">
          {/* здесь в будущем будут находиться карточки с сообщениями */}
        </div>

        <Input ws={ws} setMessageArray={setMessageArray}/>
      </div>

        <Button variant="contained"
                onClick={handleClickLogoutBtn}
                style={{
                  height: 'fit-content',
                  margin: '1em'
                }}
        >
          Выход
        </Button>
    </>
  );
}