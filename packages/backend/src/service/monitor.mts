import Koa from 'koa';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../utils/mysql.mjs';
import debugLibrary from 'debug';
import dayjs from 'dayjs';
import { crawlerPatch, IPatchCrawlerOptions } from '../crawler/index.mjs';
import { type ITaskField } from './task.mjs';
import { CronJob } from 'cron';

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

export const modifyMonitorField = async (
  id: number,
  value: number | string,
  conn?: PoolConnection,
  field: string = 'status',
) => {
  const pool = conn || getPool();
  const [rows] = await pool.query<ResultSetHeader>(
    `UPDATE monitor SET ${field} = ? WHERE id = ?`,
    [value, id],
  );
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
    `SELECT 
      m.id, 
      m.name, 
      m.descr, 
      m.cron_time, 
      m.status, 
      m.task_flow, 
      m.create_time, 
      m.update_time,
      m.next_time,
      GROUP_CONCAT(t.id) as task_ids,
      GROUP_CONCAT(t.name) as task_names
    FROM monitor as m 
    LEFT JOIN 
      monitor_task as mt ON m.id = mt.monitor_id
    LEFT JOIN
      task as t ON mt.task_id = t.id
    WHERE 
      m.id = ? and m.status != 0 
    GROUP BY 
      m.id
    `,
    [id],
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
      m.next_time,
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
    nextTime: r.next_time
      ? dayjs(r.next_time).format('YYYY-MM-DD HH:mm:ss')
      : '',
  }));
};

export const deleteMonitorById = async (id: number) => {
  return await modifyMonitorField(id, 0);
};

export const execMonitorById = async (ctx: Koa.Context, id: number) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();

  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM monitor WHERE id = ? AND status != 0',
      [id],
    );
    if (rows.length === 0) {
      throw new Error('监控单不存在或已删除');
    }

    // 查询监控
    const res = await conn.query<RowDataPacket[]>(
      `SELECT 
        m.id, 
        m.name, 
        m.task_flow,
        m.cron_time,
        GROUP_CONCAT(t.id) as task_ids,
      FROM monitor as m
      LEFT JOIN 
        monitor_task as mt ON m.id = mt.monitor_id
      LEFT JOIN
        task as t ON mt.task_id = t.id
      WHERE 
        m.status != 0
      GROUP BY 
        m.id
    `,
    );

    if (res[0].length === 0) {
      throw new Error('查询监控单关联任务为空');
    }

    const tasks = await conn.query<RowDataPacket[]>(
      'SELECT id, url, fields, enable_proxy as useProxy FROM task WHERE id = ? AND status != 0',
      res[0][0].task_ids.split(','),
    );

    if (tasks[0].length === 0) {
      throw new Error('查询监控单关联任务为空或关联任务已删除');
    }

    const taskFlow = JSON.parse(res[0][0].task_flow);
    const cronTime = res[0][0].cron_time;

    const job = CronJob.from({
      cronTime,
      onTick: async () => {
        const conn2 = await pool.getConnection();
        try {
          // 更新任务状态为正在执行
          await modifyMonitorField(id, 2, conn2);
          // 执行任务
          const startTime = dayjs();
          let result: ITaskField[] = [];
          let isError = false;
          try {
            result = await crawlerPatch(
              tasks[0] as IPatchCrawlerOptions,
              taskFlow,
            );
          } catch (error) {
            debug(error);
            isError = true;
          }

          // 更新任务记录
          const endTime = dayjs();
          const d2 = {
            monitor_id: id,
            start_time: startTime.format('YYYY-MM-DD HH:mm:ss'),
            end_time: endTime.format('YYYY-MM-DD HH:mm:ss'),
            status: isError ? 1 : 0,
            exec_time: endTime.diff(startTime, 's'),
            result: isError ? JSON.stringify({}) : JSON.stringify(result),
          };

          debug('d2:', d2);

          const res2 = await conn2.query<ResultSetHeader>(
            'INSERT INTO monitorRecord SET ?',
            [d2],
          );

          debug('res2:', res2);

          if (res2[0].affectedRows === 0) {
            throw new Error('插入监控单记录失败');
          }

          const nextDate = job.nextDate();
          const date = dayjs(
            nextDate.setZone('Asia/Shanghai').valueOf(),
          ).format('YYYY-MM-DD HH:mm:ss');
          debug('date:', date);

          await modifyMonitorField(id, date, conn, 'next_time');
        } catch (error) {
          debug(error);
        } finally {
          conn2.release();
        }
      },
      start: true,
      timeZone: 'Asia/Shanghai',
    });

    const nextDate = job.nextDate();
    const date = dayjs(nextDate.setZone('Asia/Shanghai').valueOf()).format(
      'YYYY-MM-DD HH:mm:ss',
    );

    debug('date:', date);
    await modifyMonitorField(id, date, conn, 'next_time');

    if (!ctx.state.cronMap) {
      ctx.state.cronMap = new Map<number, CronJob>();
    }

    if (!(ctx.state.cronMap as Map<number, CronJob>).has(id)) {
      (ctx.state.cronMap as Map<number, CronJob>).set(id, job);
    }
  } catch (error) {
    debug(error);
    throw new Error(error);
  } finally {
    conn.release();
  }
};
