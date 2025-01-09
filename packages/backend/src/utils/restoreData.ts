import { getConn } from './mysql';
import { RowDataPacket } from 'mysql2/promise';
import debugLibrary from 'debug';

const debug = debugLibrary('restoreData');

const restoreData = async () => {
  const conn = await getConn();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM monitor WHERE status != 0',
    );

    if (rows[0].length === 0) return;

    await conn.query<RowDataPacket[]>(
      `UPDATE monitor SET status = 1, next_time = null WHERE status != 0`,
    );
  } catch (error) {
    debug(error);
  } finally {
    conn.release();
  }
};

export { restoreData };
