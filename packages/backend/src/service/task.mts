import { getPool } from '../utils/mysql.mjs';

export const getTaskRecord = async () => {
  try {
    const pool = getPool();
    const [rows, fields] = await pool.query('SELECT * FROM record');
    return [
      rows,
      fields.map(f => ({
        name: f.name,
      })),
    ];
  } catch (error) {
    console.error(error);
    return null;
  }
};
