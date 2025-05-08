export const hostname = 'localhost';

export type Message = {
  id?: number;
  username?: string;
  data?: string;
  send_time?: string;
  error?: string;
};

export const TYPING_SYMBOL = '\u200B__TYPING__\u200B'; // Специальный символ для статуса "печатает"