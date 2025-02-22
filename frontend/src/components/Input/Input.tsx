import React, {useState} from "react";
import {useUser} from "../../hooks/useUser";
import {Message} from "../../consts";
import {Button, TextField} from "@mui/material";

export const Input = () => {
  return (
    <>
      <div className="chat-input">
        <input className="chat--input"
          placeholder="Введите сообщение"
          style={{width: '100%'}}
        />
        <Button variant="contained"
                style={{
                  margin: '0 2em',
                  padding: '0 2em',
                }}
        >
          Отправить
        </Button>
      </div>
    </>
  );
}