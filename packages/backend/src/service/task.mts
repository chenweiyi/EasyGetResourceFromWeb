import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getPool } from '../utils/mysql.mjs';
import debugLibrary from 'debug';
import dayjs from 'dayjs';
import { crawler, type ICrawlerOptions } from '../crawler/index.mjs';

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

const retryCrawler = async (
  crawlerOption: ICrawlerOptions,
  retryNum: number,
  currentRetryNum: number = 0,
) => {
  let result: ITaskField[] = [];
  try {
    result = await crawler(crawlerOption);
    return {
      result,
      currentRetryNum,
    };
  } catch (error) {
    debug(error);
    if (retryNum > 0 && currentRetryNum <= retryNum) {
      try {
        return await retryCrawler(crawlerOption, retryNum, currentRetryNum + 1);
      } catch (error) {
        debug(error);
        throw error;
      }
    } else {
      throw error;
    }
  }
};

export const modifyTaskField = async (
  id: number,
  value: number | string | Record<string, any>,
  conn?: PoolConnection,
  field: string = 'status',
) => {
  const pool = conn || getPool();
  if (typeof value === 'object') {
    await pool.query<ResultSetHeader>(`UPDATE task SET ? WHERE id IN (?)`, [
      value,
      id,
    ]);
  } else {
    await pool.query<ResultSetHeader>(
      `UPDATE task SET ${field} = ? WHERE id = ?`,
      [value, id],
    );
  }
};

export const getTaskRecord = async (query: IQueryCommonParams) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();

  try {
    // 查询总数
    const [totalRows] = await conn.query<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
     FROM record AS a 
     LEFT JOIN task AS b 
     ON a.task_id = b.id AND b.status != 0`,
    );

    const sql = `SELECT 
      a.id, 
      a.task_id, 
      a.start_time, 
      a.end_time, 
      a.status, 
      a.exec_time, 
      a.exec_num, 
      a.result, 
      b.name, 
      b.url, 
      b.enable_proxy
    FROM 
      record AS a 
    LEFT JOIN 
      task AS b 
    ON 
      a.task_id = b.id AND b.status != 0
    ORDER BY 
      a.end_time DESC
    LIMIT ${(+query.current - 1) * +query.pageSize}, ${+query.pageSize}
    `;

    debug('sql:', sql);

    const [rows] = await conn.query<RowDataPacket[]>(sql);
    return {
      list: rows.map(row => ({
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
      })),
      total: totalRows[0]?.total ?? 0,
    };
  } catch (error) {
    throw error;
  } finally {
    conn?.release();
  }
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

export const queryTaskList = async (query: IQueryCommonParams) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();

  // 查询总数
  const [totalRows] = await conn.query<RowDataPacket[]>(
    `SELECT COUNT(*) as total 
     FROM task AS a 
     WHERE a.status != 0 AND a.status != 2
    `,
  );

  const [rows] = await conn.query<RowDataPacket[]>(
    'SELECT * FROM task WHERE status != 0 ORDER BY create_time DESC',
  );
  return {
    list: rows.map(r => ({
      id: r.id,
      name: r.name,
      url: r.url,
      descr: r.descr,
      enableProxy: r.enable_proxy,
      status: r.status,
      retryNum: r.retry_num,
      fields: JSON.parse(r.fields),
      createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
      updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
      execTotalNum: r.exec_total_num,
      lastExecTime: r.last_exec_time
        ? dayjs(r.last_exec_time).format('YYYY-MM-DD HH:mm:ss')
        : '',
    })),
    total: totalRows[0]?.total ?? 0,
  };
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
    descr: r.descr,
    enableProxy: r.enable_proxy,
    status: r.status,
    retryNum: r.retry_num,
    fields: JSON.parse(r.fields),
    createTime: dayjs(r.create_time).format('YYYY-MM-DD HH:mm:ss'),
    updateTime: dayjs(r.update_time).format('YYYY-MM-DD HH:mm:ss'),
    execTotalNum: r.exec_total_num,
    lastExecTime: dayjs(r.last_exec_time).format('YYYY-MM-DD HH:mm:ss'),
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
  return await modifyTaskField(id, 0);
};

export const copyTaskById = async (id: number) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM task WHERE id = ?',
      [id],
    );
    if (rows.length === 0) {
      throw new Error('任务不存在或已删除');
    }

    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const d = {
      name: rows[0].name + '_copy',
      descr: rows[0].descr || '',
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
      throw new Error('添加任务失败');
    }
    return res[0].insertId;
  } catch (error) {
    debug(error);
    throw error;
  } finally {
    conn.release();
  }
};

export const execTaskById = async (id: number) => {
  let conn: PoolConnection | null = null;
  const pool = getPool();
  conn = await pool.getConnection();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      `SELECT 
        id, 
        url, 
        fields, 
        enable_proxy as useProxy, 
        retry_num as retryNum,
        exec_total_num as execTotalNum 
      FROM 
        task 
      WHERE id = ? AND status != 0`,
      [id],
    );
    if (rows.length === 0) {
      throw new Error('任务不存在或已删除');
    }

    const startTime = dayjs();
    // 更新任务状态为正在执行
    await modifyTaskField(
      id,
      {
        status: 3,
        last_exec_time: startTime.format('YYYY-MM-DD HH:mm:ss'),
      },
      conn,
    );

    // 执行任务
    const task = rows[0];
    const { url, fields, useProxy, retryNum, execTotalNum } = task;
    let result: {
      result: ITaskField[];
      currentRetryNum: number;
    } | null = null;
    let isError = false;
    try {
      result = await retryCrawler(
        {
          url,
          useProxy,
          fields: JSON.parse(fields),
        },
        retryNum,
        0,
      );
    } catch (error) {
      console.error(error);
      isError = true;
    }

    // 更新任务记录
    const endTime = dayjs();
    const d2 = {
      task_id: id,
      start_time: startTime.format('YYYY-MM-DD HH:mm:ss'),
      end_time: endTime.format('YYYY-MM-DD HH:mm:ss'),
      status: isError ? 2 : result.currentRetryNum > 0 ? 1 : 0,
      exec_time: endTime.diff(startTime, 's'),
      result: isError ? JSON.stringify({}) : JSON.stringify(result.result),
      exec_num: isError ? retryNum + 1 : result.currentRetryNum + 1,
    };

    debug('d2:', d2);

    const res2 = await conn.query<ResultSetHeader>('INSERT INTO record SET ?', [
      d2,
    ]);

    if (res2[0].affectedRows === 0) {
      throw new Error('插入任务记录失败');
    }

    await modifyTaskField(id, 1, conn);
    await modifyTaskField(id, execTotalNum + 1, conn, 'exec_total_num');
    return res2[0].insertId;
  } catch (error) {
    debug('error:', error);
    throw error;
  } finally {
    conn.release();
  }
};
