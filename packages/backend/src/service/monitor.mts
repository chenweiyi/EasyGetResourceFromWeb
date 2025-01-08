import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../utils/mysql.mjs';
import debugLibrary from 'debug';
import dayjs from 'dayjs';
import { crawlerPatch, IPatchCrawlerOptions } from '../crawler/index.mjs';
import { type ITaskField } from './task.mjs';
import { CronJob } from 'cron';
import { MyContext, MyQueryContext } from '../@types/api';

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
      m.exec_total_num,
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
    taskIds: r.task_ids.split(',').map(id => Number(id)),
    taskNames: r.task_names.split(','),
    cronTime: r.cron_time,
    status: r.status,
    taskFlow: r.task_flow,
    createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
    execTotalNum: r.exec_total_num,
  }));
};

export const queryMonitorList = async (query: MyQueryContext['query']) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();
  try {
    // 查询总数
    const [totalRows] = await conn.query<RowDataPacket[]>(
      `SELECT 
        m.id, COUNT(*) as total 
      FROM 
        monitor AS m
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

    const [rows] = await conn.query<RowDataPacket[]>(
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
      m.exec_total_num,
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
    LIMIT ${(+query.current - 1) * +query.pageSize}, ${+query.pageSize}
  `,
    );
    return {
      list: rows.map(r => ({
        id: r.id,
        name: r.name,
        descr: r.descr,
        taskIds: r.task_ids.split(',').map(id => Number(id)),
        taskNames: r.task_names.split(','),
        cronTime: r.cron_time,
        status: r.status,
        taskFlow: r.task_flow,
        createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
        updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
        execTotalNum: r.exec_total_num,
        nextTime: r.next_time
          ? dayjs(r.next_time).format('YYYY-MM-DD HH:mm:ss')
          : '',
      })),
      total: totalRows[0]?.total ?? 0,
    };
  } catch (error) {
    throw error;
  } finally {
    conn?.release();
  }
};

export const deleteMonitorById = async (id: number) => {
  return await modifyMonitorField(id, 0);
};

export const execMonitorById = async (ctx: MyContext, id: number) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();

  try {
    if (ctx.cronMap?.has(id)) {
      throw new Error('监控单任务已存在');
    }
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
      'SELECT id, url, fields, enable_proxy as useProxy FROM task WHERE id IN (?) AND status != 0',
      res[0][0].task_ids.split(',').map(id => Number(id)),
    );

    if (tasks[0].length === 0) {
      throw new Error('查询监控单关联任务为空或关联任务已删除');
    }

    const taskFlow = JSON.parse(res[0][0].task_flow);
    let cronTime = res[0][0].cron_time.trim();

    debug('cronTime:', cronTime);

    if (!isNaN(cronTime)) {
      // 兼容时间戳
      cronTime = new Date(cronTime);
    }

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
          debug('next date:', date);

          await modifyMonitorField(id, date, conn, 'next_time');
        } catch (error) {
          debug(error);
        } finally {
          conn2.release();
        }
      },
      start: false,
      timeZone: 'Asia/Shanghai',
    });

    const nextDate = job.nextDate();
    const date = dayjs(nextDate.setZone('Asia/Shanghai').valueOf()).format(
      'YYYY-MM-DD HH:mm:ss',
    );

    debug('date:', date);
    await modifyMonitorField(id, date, conn, 'next_time');

    if (!ctx.cronMap) {
      ctx.cronMap = new Map<number, CronJob>();
    }

    if (!ctx.cronMap.has(id)) {
      ctx.cronMap.set(id, job);
    } else {
      const cropDemo = ctx.cronMap.get(id);
      cropDemo.stop();
      ctx.cronMap.set(id, job);
    }
  } catch (error) {
    debug(error);
    throw new Error(error);
  } finally {
    conn.release();
  }
};

export const stopMonitorById = async (ctx: MyContext, id: number) => {
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

    if (!ctx.cronMap?.has(id)) {
      throw new Error('监控单任务不存在或已删除');
    } else {
      const cropDemo = ctx.cronMap.get(id);
      cropDemo.stop();
      ctx.cronMap.delete(id);
    }
    // 更新任务状态为正在执行
    await modifyMonitorField(id, 1, conn);
  } catch (error) {
    debug(error);
    throw new Error(error);
  } finally {
    conn.release();
  }
};

export const stopAllMonitor = async (ctx: MyContext) => {
  if (ctx.cronMap.size > 0) {
    const ids = Array.from(ctx.cronMap.keys());
    for (let [key, value] of ctx.cronMap) {
      value.stop();
    }
    ctx.cronMap.clear();
    const pool = getPool();
    await pool.query<ResultSetHeader>(
      'UPDATE monitor SET status = 1 WHERE id IN (?)',
      ids,
    );
  }
};

export const getMonitorRecord = async (query: MyQueryContext['query']) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();

  try {
    // 查询总数
    const [totalRows] = await conn.query<RowDataPacket[]>(
      `SELECT
        mr.monitor_id,
        COUNT(*) as total 
      FROM monitorRecord as mr 
      LEFT JOIN
        monitor as m ON mr.monitor_id = m.id
      LEFT JOIN 
        monitor_task as mt ON mr.monitor_id = mt.monitor_id
      LEFT JOIN
        task as t ON mt.task_id = t.id 
      WHERE 
        m.status != 0
      GROUP BY 
        mr.monitor_id
      `,
    );

    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT 
        mr.id, 
        mr.monitor_id, 
        mr.status,
        mr.start_time, 
        mr.end_time,
        mr.exec_time,
        mr.result,
        GROUP_CONCAT(t.id) as task_ids,
        GROUP_CONCAT(t.name) as task_names
      FROM monitorRecord as mr 
      LEFT JOIN
        monitor as m ON mr.monitor_id = m.id
      LEFT JOIN 
        monitor_task as mt ON mr.monitor_id = mt.monitor_id
      LEFT JOIN
        task as t ON mt.task_id = t.id 
      GROUP BY
        mr.monitor_id
      ORDER BY mr.end_time DESC
      LIMIT ${(+query.current - 1) * +query.pageSize}, ${+query.pageSize}
      `,
    );
    return {
      list: rows.map(row => ({
        id: row.id,
        monitorId: row.monitor_id,
        startTime: dayjs(row.start_time).format('YYYY-MM-DD HH:mm:ss'),
        endTime: dayjs(row.end_time).format('YYYY-MM-DD HH:mm:ss'),
        status: row.status,
        execTime: row.exec_time,
        result: row.result,
        name: row.name,
        taskIds: row.task_ids.split(',').map(id => Number(id)),
        taskNames: row.task_names.split(','),
      })),
      total: totalRows[0]?.total ?? 0,
    };
  } catch (error) {
    throw error;
  } finally {
    conn?.release();
  }
};
