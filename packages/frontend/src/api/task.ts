import axios from './axios';

export type ITaskType = {
  name: string;
  url: string;
  enableProxy: number;
  fields: Array<ITaskField>;
  descr?: string;
  retryNum?: number | string;
  loadDelayTime?: string;
};

export type ITaskData = ITaskType & {
  id: number;
  status: number;
  createTime: string;
  updateTime: string;
  execTotalNum: number;
  lastExecTime: string;
};

export type ITaskListData = {
  list: ITaskData[];
  total: number;
};

export type ITaskWithId = ITaskType & {
  id: number | string;
};

export type ITaskField = {
  key: string;
  value: string;
  access: 'innerText' | 'attr';
  accessArgs?: string;
  type: 'number' | 'string' | 'list';
  unit?: string;
  code?: string;
};

export type ITaskRecord = {
  id: number;
  name: string;
  taskId: number;
  url: string;
  startTime: string;
  endTime: string;
  status: number;
  execTime: number;
  execNum: number;
  result: string;
};

export type ITaskRecordData = {
  total: number;
  list: ITaskRecord[];
};

/**
 * 添加新任务
 */
export const addNewTask: (data: ITaskType) => Promise<null> = data => {
  return axios({
    url: '/task/add',
    method: 'post',
    data,
  });
};

/**
 * 更新任务
 */
export const updateTaskById: (data: ITaskWithId) => Promise<null> = data => {
  return axios({
    url: '/task/update',
    method: 'post',
    data,
  });
};

/**
 * 删除任务
 */
export const deleteTaskById: (id: number | string) => Promise<null> = id => {
  return axios({
    url: `/task/delete/${id}`,
    method: 'post',
  });
};

/**
 * copy任务
 */
export const copyTaskById: (id: number | string) => Promise<null> = id => {
  return axios({
    url: `/task/copy/${id}`,
    method: 'post',
  });
};

/**
 * 获取任务列表
 */
export const getTaskList: (
  params: IQueryCommonParams,
) => Promise<ITaskListData> = params => {
  return axios({
    url: '/task/list',
    method: 'get',
    params,
  });
};

/**
 * 获取指定的任务
 */
export const getTaskById: (
  id: number | string,
) => Promise<ITaskData[]> = id => {
  return axios({
    url: '/task/get',
    method: 'get',
    params: {
      id,
    },
  });
};

/**
 * 执行指定的任务
 */
export const execTaskById: (
  id: number | string,
  timeout?: number,
) => Promise<null> = (id, timeout = 60000) => {
  return axios({
    url: `/task/exec/${id}`,
    method: 'post',
    timeout,
  });
};

export const getTaskRecord: (
  params: IQueryCommonParams,
) => Promise<ITaskRecordData> = params => {
  return axios({
    url: '/task/record/list',
    method: 'get',
    params,
  });
};
