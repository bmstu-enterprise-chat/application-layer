export const hostname = 'localhost';

export type Message = {
  sender?: string;
  payload?: string;
  send_time?: string;
};

export const TYPING_SYMBOL = '\u200B__TYPING__\u200B'; // Специальный символ для статуса "печатает"