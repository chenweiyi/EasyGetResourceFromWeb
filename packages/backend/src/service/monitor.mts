import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../utils/mysql.mjs';
import debugLibrary from 'debug';
import dayjs from 'dayjs';
import { crawler } from '../crawler/index.mjs';

const debug = debugLibrary('monitor:service');

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
    // task_ids: data.taskIds.join(','),
    cron_time: data.cronTime,
    task_flow: data.taskFlow,
    status: 1,
    create_time: time,
    update_time: time,
  };

  debug('d:', d);

  try {
    await conn.beginTransaction();
    const res = await conn.query<ResultSetHeader>(
      'INSERT INTO monitor SET ?',
      d,
    );
    if (res[0].affectedRows === 0) {
      throw new Error('添加监控单失败');
    }

    const mt = data.taskIds.map(id => {
      return {
        monitor_id: res[0].insertId,
        task_id: id,
      };
    });

    debug('mt:', mt);

    const res2 = await conn.query<ResultSetHeader>(
      'INSERT INTO monitor_task SET ?',
      mt,
    );
    debug('affectedRows:', res2[0].affectedRows);

    if (res2[0].affectedRows !== data.taskIds.length) {
      throw new Error('添加监控任务关联表失败');
    }

    await conn.commit();

    debug('insertId:', res[0].insertId);
    return res[0].insertId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
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
    `SELECT 
      m.id, 
      m.name, 
      m.descr, 
      m.cron_time, 
      m.status, 
      m.task_flow, 
      m.create_time, 
      m.update_time,
      GROUP_CONCAT(t.id) as task_ids,
      GROUP_CONCAT(t.name) as task_names
    FROM monitor as m 
    LEFT JOIN 
      monitor_task as mt ON m.id = mt.monitor_id
    LEFT JOIN
      task as t ON mt.task_id = t.id
    WHERE 
      m.status != 0 
    GROUP BY 
      m.id
    ORDER BY m.create_time DESC
  `,
  );
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    descr: r.descr,
    taskIds: r.task_ids.split(','),
    taskNames: r.task_names.split(','),
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
