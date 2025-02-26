import React from "react";
import {useUser} from "../../hooks/useUser";
import {Message} from "../../consts";
import "./MessageCard.css"
import "../../style.css"

type MessageProps = {
  msg: Message;
}

export const MessageCard: React.FC<MessageProps> = ({msg}) => {
  const {login} = useUser();

  // функция для форматирования времени, чтобы оно красиво отображалось
  function formatTime(isoDateTime: string | number | Date) {
    const dateTime = new Date(isoDateTime);
    return dateTime.toLocaleString('en-US', {
      timeZone: 'UTC',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
  }

  return (
    <>
          <div className={`${msg.username === login ? "msg--own" : "msg--alien"} msg--container`}>
        <div className={`${msg.username === login ? "msg--own--reverse" : "msg--alien--reverse"} msg`}>

    <div className={`home-card2`}>
      <div className="home-frame-card-header3">
        <div className="home-avatar-wrapper2">
          <div className="home-frame-avatar2">
            <div className="home-frame-icon4">
              <img
                src="/external/personfilledi8606-rmw.svg"
                alt="PersonFilledI8606"
                className="home-person-filled2"
              />
            </div>
            <div className="home-minwidth2"></div>
          </div>
        </div>
        <div className="home-text21">
          <span className="home-text22 typographybody1">{msg.username ?? 'Аноним'}</span>
        </div>
      </div>
      <div className="home-frame-card-content3">
        <div className="home-frame-typography5">
          <span className="home-text23 typographybody2">
          {formatTime(msg.send_time ?? String(new Date()))}
          </span>
        </div>
      </div>
      <div className="home-frame-card-content4">
        <div className="home-frame-typography6">
          {msg.error ?
            <div style={{color: 'gray'}}>Ошибка при отправке: {msg.error}</div>
            :
            <span className={`msg--text home-text24 typographybody2 ${msg.username === login ? "msg--bg--own" : "msg--bg--alien"}`}>
              {msg.data}
            </span>          
          }         
        </div>
      </div>
    </div>
    </div>
    </div>
    </>
  );
}