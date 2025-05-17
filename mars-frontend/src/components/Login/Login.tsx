import React, {useState} from "react";
import {useUser} from "../../hooks/useUser";
import {Button, TextField, Snackbar, Alert} from '@mui/material';
import {hostname} from "../../consts";
import "../../style.css"
import "./Login.css"


type LoginProps = {
  ws: WebSocket | undefined;
  setWs: (ws: WebSocket | undefined) => void;
  createWebSocket: (url: string) => WebSocket | undefined;
}

export const Login: React.FC<LoginProps> = ({ws, setWs, createWebSocket}) => {
  const {login, setUser} = useUser();
  const [userName, setUsername] = useState(login);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "warning" | "info" | "success">("error");

  const RESERVED_USERNAMES = ['System', 'Admin', 'Server'];

  const showError = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
  };

  const validateUsername = (username: string): boolean => {
    if (!username || username.trim().length === 0) {
      showError("Имя пользователя не может быть пустым");
      return false;
    }

    if (RESERVED_USERNAMES.includes(username)) {
      showError(`"${username}" - зарезервированное имя`);
      return false;
    }

    if (username.length > 20) {
      showError("Имя пользователя слишком длинное (макс. 20 символов)");
      return false;
    }

    if (!/^[a-zA-Zа-яА-Я0-9_\- ]+$/.test(username)) {
      showError("Имя может содержать только буквы, цифры, пробелы, дефисы и подчёркивания");
      return false;
    }

    return true;
  };

  const handleChangeLogin = (event: any) => {
    setUsername(event.target.value);
  };

  // при авторизации регистрируем новое вебсокет соединеие
  const handleClickSignInBtn = () => {
    if (!validateUsername(userName)) {
      return;
    }
    setUser({
      userInfo: {
        Data: {
          login: userName,
        },
      },
    });
    if (ws) {
      ws.close(1000, 'User enter userName');
    } else {
      console.log('ws.close(1000, User enter userName); dont work');
    }
    setWs(
      createWebSocket(
        `ws://${hostname}:8002/?username=${encodeURIComponent(userName)}`,
      ),
    );
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <div className="home-frame1">
        <div className="home-frame-app-bar1">
          <div className="home-frame-paper1">
            <div className="home-frame-toolbar1">
              <div className="home-left-side1">
                <button className="home-frame-icon-button1">
                  <div className="home-frame-icon1">
                    <div className="home-menu-filled1">
                      <img
                        src="/external/icons8chat5018612-f9qi-200h.png"
                        alt="icons8chat5018612"
                        className="home-icons8chat5011"
                      />
                    </div>
                  </div>
                </button>
                <div className="home-frame-typography1">
                  <span className="home-text10 typographyh6">Чат-комната</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="home-container2">
          <div className="home-frame-card-header1">
            <div className="home-content1">
              <span className="home-text11 typographyh5">Войти</span>
              <span className="home-text12 typographybody2">
                Начните общение прямо сейчас
              </span>
            </div>
          </div>
          <div className="home-card-content">
            <div className="home-content2">
              <TextField 
                id="outlined-basic" 
                variant="outlined"
                className="home-text13 inputvalue"
                value={userName}
                onChange={handleChangeLogin}
                placeholder="Введите имя"
                onKeyPress={(e) => e.key === 'Enter' && handleClickSignInBtn()}
              />
            </div>
            <Button 
              className="home-frame-button1" 
              onClick={handleClickSignInBtn}
              disabled={!userName || userName.trim().length === 0}
            >
              <div className="home-base1">
                <span className="home-text14 buttonlarge">Вход</span>
              </div>
            </Button>
            
          </div>
        </div>
      </div>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <div
          className="home-rectangle11"
        />

    </>
  );
}