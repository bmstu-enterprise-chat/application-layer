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
  function formatTime(isoDateTime: string | undefined) {
    if (!isoDateTime) return '';
  
    try {
      const dateTime = new Date(isoDateTime);
      return dateTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return '';
    }
  }

  if (msg.sender === 'System') {
    return (
      <div className="system-message">
        <div className={`system-message-content error'}`}>
         
            <span style={{color: '#ff4444'}}>⚠️ {msg.payload}</span>

          <span className="system-message-time">
            {msg.send_time ? formatTime(msg.send_time) : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
          <div className={`${msg.sender === login ? "msg--own" : "msg--alien"} msg--container`}>
        <div className={`${msg.sender === login ? "msg--own--reverse" : "msg--alien--reverse"} msg`}>

    <div className={`home-card2 ${msg.sender === login ? "msg--bg--own" : "msg--bg--alien"}`}>
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
          </div>
        </div>
        <div className="home-text21">
          <span className="home-text22 typographybody1">{msg.sender ?? 'Аноним'}</span>
        </div>
      </div>
      <div className="home-frame-card-content3">
        <div className="home-frame-typography5">
        <span className="home-text23 typographybody2">
          {msg.send_time ? formatTime(msg.send_time) : 'Неизвестное время'}
        </span>
        </div>
      </div>
      <div className="home-frame-card-content4">
        <div className="home-frame-typography6">
            <span className={`msg--text home-text24 typographybody2`}>
              {msg.payload}
            </span>          
        </div>
      </div>
    </div>
    </div>
    </div>
    </>
  );
}