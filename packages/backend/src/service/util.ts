import { PoolConnection, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../utils/mysql';

export type IModifyTableFieldOption = {
  id: number;
  value: number | string | Record<string, any>;
  conn?: PoolConnection;
  field?: string;
  table?: string;
};

export const modifyTableField = async (option: IModifyTableFieldOption) => {
  const { id, value, conn = null, field = 'status', table = 'task' } = option;
  const pool = conn || getPool();
  if (typeof value === 'object') {
    await pool.query<ResultSetHeader>(`UPDATE ${table} SET ? WHERE id IN (?)`, [
      value,
      id,
    ]);
  } else {
    await pool.query<ResultSetHeader>(
      `UPDATE ${table} SET ${field} = ? WHERE id = ?`,
      [value, id],
    );
  }
};
