import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const SERVER_ID_FILE = process.env.SERVER_ID_FILE;

// 获取或生成 serverId
export const getServerId = (): string => {
  if (fs.existsSync(SERVER_ID_FILE)) {
    const id = fs.readFileSync(SERVER_ID_FILE, 'utf-8').trim();
    if (id) {
      return id;
    }
  }
  const serverId = uuidv4();
  fs.writeFileSync(SERVER_ID_FILE, serverId, 'utf-8');
  return serverId;
};
