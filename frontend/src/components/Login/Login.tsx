import {TextField, Button} from '@mui/material';

export const Login = () => {

    return (
      <>
        <div className="login">
          <div className="login--card">
            <div className="login--header">Вход</div>
  
            <TextField id="outlined-basic" label="Введите имя" variant="outlined"
              className="login--input"
            />
  
            <Button variant="contained">
              Войти
            </Button>
  
          </div>
        </div>
      </>
    );
  }