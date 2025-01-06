import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../utils/mysql.mjs';
import debugLibrary from 'debug';
import dayjs from 'dayjs';
import { crawler } from '../crawler/index.mjs';

const debug = debugLibrary('task:service');

export type ITaskType = {
  name: string;
  url: string;
  enableProxy: number;
  retryNum: number;
  descr?: string;
  fields: Array<ITaskField>;
};

export type ITaskWithId = ITaskType & {
  id: number | string;
};

export type ITaskField = {
  key: string;
  value: string;
  type: 'number' | 'string' | 'list';
  unit?: string;
  access: 'innerText' | 'attr';
  accessArgs?: string;
  code?: string;
};

export const modifyTaskStatus = async (id: number, status: number) => {
  const pool = getPool();
  const [rows] = await pool.query<ResultSetHeader>(
    'UPDATE task SET status = ? WHERE id = ?',
    [status, id],
  );
  if (rows.affectedRows === 0) {
    throw new Error('修改任务状态失败');
  }
  return rows.insertId;
};

export const getTaskRecord = async () => {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT 
      a.id, a.task_id, a.start_time, a.end_time, a.status, a.exec_time, a.exec_num, a.result, 
      b.name, b.url, b.enable_proxy
    FROM record AS a LEFT JOIN task AS b 
    ON a.task_id = b.id AND b.status != 0
    ORDER BY a.end_time DESC`,
  );
  return rows.map(row => ({
    id: row.id,
    taskId: row.task_id,
    startTime: dayjs(row.start_time).format('YYYY-MM-DD HH:mm:ss'),
    endTime: dayjs(row.end_time).format('YYYY-MM-DD HH:mm:ss'),
    status: row.status,
    execTime: row.exec_time,
    execNum: row.exec_num,
    result: row.result,
    name: row.name,
    url: row.url,
    enableProxy: row.enable_proxy,
  }));
};

export const addNewTask = async (data: ITaskType) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();
  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT * FROM task WHERE name = ?',
    [data.name],
  );
  if (rows.length > 0) {
    conn.release();
    throw new Error('任务已存在');
  }

  const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const d = {
    name: data.name,
    url: data.url,
    enable_proxy: data.enableProxy,
    status: 1,
    descr: data.descr || '',
    fields: JSON.stringify(data.fields),
    create_time: time,
    update_time: time,
  };

  debug('d:', d);

  const res = await conn.query<ResultSetHeader>('INSERT INTO task SET ?', d);
  if (res[0].affectedRows === 0) {
    conn.release();
    throw new Error('添加任务失败');
  }
  conn.release();
  return res[0].insertId;
};

export const queryTaskList = async () => {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM task WHERE status != 0 ORDER BY create_time DESC',
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    url: r.url,
    enableProxy: r.enable_proxy,
    status: r.status,
    retryNum: r.retry_num,
    fields: JSON.parse(r.fields),
    createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
  }));
};

export const getTaskById = async (id: number) => {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM task WHERE id = ?',
    [id],
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    url: r.url,
    enableProxy: r.enable_proxy,
    status: r.status,
    retryNum: r.retry_num,
    fields: JSON.parse(r.fields),
    createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
  }));
};

export const updateTaskById = async (data: ITaskWithId) => {
  const pool = getPool();
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM task WHERE id = ?',
    [data.id],
  );
  if (rows.length === 0) {
    throw new Error('任务不存在');
  }
  const d = {
    name: data.name,
    descr: data.descr || '',
    url: data.url,
    enable_proxy: data.enableProxy,
    retry_num: data.retryNum,
    fields: JSON.stringify(data.fields),
    update_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  };

  debug('d:', d);

  const res = await pool.query<ResultSetHeader>(
    'UPDATE task SET ? WHERE id = ?',
    [d, data.id],
  );
  if (res[0].affectedRows === 0) {
    throw new Error('更新任务失败');
  }
  return res[0].insertId;
};

export const deleteTaskById = async (id: number) => {
  return await modifyTaskStatus(id, 0);
};

export const copyTaskById = async (id: number) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();
  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT * FROM task WHERE id = ?',
    [id],
  );
  if (rows.length === 0) {
    conn.release();
    throw new Error('任务不存在或已删除');
  }

  const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const d = {
    name: rows[0].name + '_copy',
    url: rows[0].url,
    enable_proxy: rows[0].enable_proxy,
    status: 1,
    retry_num: rows[0].retry_num,
    fields: JSON.stringify(JSON.parse(rows[0].fields)),
    create_time: time,
    update_time: time,
  };

  debug('d:', d);

  const res = await conn.query<ResultSetHeader>('INSERT INTO task SET ?', d);
  if (res[0].affectedRows === 0) {
    conn.release();
    throw new Error('添加任务失败');
  }
  conn.release();
  return res[0].insertId;
};

export const execTaskById = async (id: number) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();
  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT url, fields, enable_proxy as useProxy FROM task WHERE id = ? AND status != 0',
    [id],
  );
  if (rows.length === 0) {
    conn.release();
    throw new Error('任务不存在或已删除');
  }

  // 更新任务状态为正在执行
  await modifyTaskStatus(id, 3);

  // 执行任务
  const startTime = dayjs();
  const task = rows[0];
  const { url, fields, useProxy } = task;
  let result: ITaskField[] = [];
  let isError = false;
  let retryNum = 0;
  try {
    result = await crawler({
      url,
      useProxy,
      fields: JSON.parse(fields),
    });
  } catch (error) {
    console.error(error);
    isError = true;
  }

  // 更新任务记录
  const endTime = dayjs();
  const d2 = {
    task_id: task.id,
    start_time: startTime.format('YYYY-MM-DD HH:mm:ss'),
    end_time: endTime.format('YYYY-MM-DD HH:mm:ss'),
    status: isError ? 2 : retryNum > 0 ? 1 : 0,
    exec_time: endTime.diff(startTime, 's'),
    result: isError ? JSON.stringify({}) : JSON.stringify(result),
    exec_num: retryNum + 1,
  };

  debug('d2:', d2);

  const res2 = await conn.query<ResultSetHeader>('INSERT INTO record SET ?', [
    d2,
  ]);

  debug('res2:', res2);

  if (res2[0].affectedRows === 0) {
    conn.release();
    throw new Error('插入任务记录失败');
  }

  conn.release();
  await modifyTaskStatus(id, 1);
  return res2[0].insertId;
};
