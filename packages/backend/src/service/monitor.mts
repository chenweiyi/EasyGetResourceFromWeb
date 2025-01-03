import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../utils/mysql.mjs';
import debugLibrary from 'debug';
import dayjs from 'dayjs';
import { crawler } from '../crawler/index.mjs';

const debug = debugLibrary('task:service');

export type IMonitorType = {
  name: string;
  descr: string;
  taskIds: number[];
  taskFlow: string;
  cronTime: string;
};

export type IMonitorWithId = IMonitorType & {
  id: number | string;
};

export const modifyMonitorStatus = async (id: number, status: number) => {
  const pool = getPool();
  const [rows] = await pool.query<ResultSetHeader>(
    'UPDATE monitor SET status = ? WHERE id = ?',
    [status, id],
  );
  if (rows.affectedRows === 0) {
    throw new Error('修改监控单状态失败');
  }
  return rows.insertId;
};

export const addNewMonitor = async (data: IMonitorType) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();
  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT * FROM monitor WHERE name = ?',
    [data.name],
  );
  if (rows.length > 0) {
    conn.release();
    throw new Error('监控单已存在');
  }

  const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const d = {
    name: data.name,
    descr: data.descr,
    task_ids: data.taskIds.join(','),
    cron_time: data.cronTime,
    task_flow: data.taskFlow,
    status: 1,
    create_time: time,
    update_time: time,
  };

  debug('d:', d);

  const res = await conn.query<ResultSetHeader>('INSERT INTO monitor SET ?', d);
  if (res[0].affectedRows === 0) {
    conn.release();
    throw new Error('添加监控单失败');
  }
  conn.release();
  return res[0].insertId;
};

export const updateMonitorById = async (data: IMonitorWithId) => {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM monitor WHERE id = ?',
    [data.id],
  );
  if (rows.length === 0) {
    throw new Error('监控单不存在');
  }
  const d = {
    name: data.name,
    descr: data.descr,
    task_ids: data.taskIds.join(','),
    cron_time: data.cronTime,
    task_flow: data.taskFlow,
    update_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };

  debug('d:', d);

  const res = await pool.query<ResultSetHeader>(
    'UPDATE monitor SET ? WHERE id = ?',
    [d, data.id],
  );
  if (res[0].affectedRows === 0) {
    throw new Error('更新监控单失败');
  }
  return res[0].insertId;
};

export const getMonitorById = async (id: number) => {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM monitor WHERE id = ?',
    [id],
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    descr: r.descr,
    taskIds: r.task_ids.split(','),
    cronTime: r.cron_time,
    status: r.status,
    taskFlow: r.task_flow,
    createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
  }));
};

export const queryMonitorList = async () => {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM monitor WHERE status != 0 ORDER BY create_time DESC',
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    descr: r.descr,
    taskIds: r.task_ids.split(','),
    cronTime: r.cron_time,
    status: r.status,
    taskFlow: r.task_flow,
    createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
  }));
};

export const deleteMonitorById = async (id: number) => {
  return await modifyMonitorStatus(id, 0);
};
