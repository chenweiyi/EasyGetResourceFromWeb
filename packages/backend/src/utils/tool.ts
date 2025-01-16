import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const genRandomNumber = (length: number) => {
  const chars = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export const getDirname = () => {
  return dirname(fileURLToPath(import.meta.url));
};
