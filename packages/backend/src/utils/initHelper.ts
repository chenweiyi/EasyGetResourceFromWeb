import { getConn } from './mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import debugLibrary from 'debug';
import app from '../app';
import dayjs from 'dayjs';
import {
  INTERVEL_CHECK_ZOMBIE_CRON,
  JUDGE_IS_ZOMBIE_CRON_OFFSET,
} from '../const';

const debug = debugLibrary('InitHelper');

const restoreData = async () => {
  const conn = await getConn();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM monitor WHERE status != 0',
    );

    if (rows[0].length === 0) return;

    await conn.query<RowDataPacket[]>(
      `UPDATE monitor SET status = 1 WHERE status != 0`,
    );
  } catch (error) {
    debug(error);
  } finally {
    conn.release();
  }
};

const clearZombieCron = () => {
  setInterval(async () => {
    const cronMap = app.context.cronMap;
    if (cronMap.size > 0) {
      const clearIds: number[] = [];
      for (let [id, cronInstance] of cronMap) {
        try {
          const nextDate = cronInstance.nextDate();
          const now = dayjs();
          const date = dayjs(nextDate.setZone('Asia/Shanghai').valueOf());
          if (now.diff(date, 's') >= JUDGE_IS_ZOMBIE_CRON_OFFSET) {
            cronInstance.stop();
            clearIds.push(id);
          }
        } catch (error) {
          cronInstance.stop();
          clearIds.push(id);
        }
      }

      if (clearIds.length === 0) return;

      debug(`ready to clear [${clearIds}]`);
      for (let id of clearIds) {
        cronMap.delete(id);
      }

      const conn = await getConn();
      try {
        const [rows] = await conn.query<RowDataPacket[]>(
          'SELECT * FROM monitor WHERE id IN (?) AND status != 0',
          clearIds,
        );
        if (rows.length === 0) {
          throw new Error('监控单不存在或已删除');
        }
        await conn.query<ResultSetHeader>(
          'UPDATE monitor SET status = 1 WHERE id IN (?)',
          [clearIds],
        );
      } catch (error) {
        debug(error);
      } finally {
        conn.release();
      }
    }
  }, INTERVEL_CHECK_ZOMBIE_CRON);
};

export { restoreData, clearZombieCron };
