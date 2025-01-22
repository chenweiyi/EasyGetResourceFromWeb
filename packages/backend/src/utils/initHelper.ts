import { getConn } from './mysql';
import { RowDataPacket } from 'mysql2/promise';
import debugLibrary from 'debug';
import app from '../app';
import { getRedisClient, RedisService } from './redis';
import { getServerId } from './serverId';

const debug = debugLibrary('InitHelper');

const initRedis = async () => {
  await getRedisClient();
};

const restoreData = async () => {
  const conn = await getConn();
  const cronMap = app.context.cronMap;
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM monitor WHERE status = 2',
    );

    if (rows.length === 0) return;

    const ids = rows.map(row => row.id);
    const serverId = getServerId();
    const updateIds = [];
    for (let id of ids) {
      const isMember = await RedisService.sIsMember(
        `monitor-execing:${serverId}`,
        id + '',
      );
      if (isMember && !cronMap.has(id)) {
        updateIds.push(id);
      }
    }

    if (updateIds.length > 0) {
      await conn.query<RowDataPacket[]>(
        `UPDATE monitor SET status = 1 WHERE id IN (?)`,
        updateIds,
      );
      await RedisService.sRem(
        `monitor-execing:${serverId}`,
        updateIds.map(id => id + ''),
      );
    }
  } catch (error) {
    debug(error);
  } finally {
    conn.release();
  }
};

export { restoreData, initRedis };
