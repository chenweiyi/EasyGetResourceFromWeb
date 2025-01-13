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

export type IMonitorData = IMonitorType & {
  id: number;
  status: number;
  taskNames: string[];
  createTime: string;
  updateTime: string;
  nextTime: string;
  execTotalNum: number;
};

export type IMonitorListData = {
  list: IMonitorData[];
  total: number;
};

export type IMonitorRecord = {
  id: number;
  name: string;
  monitorId: number;
  startTime: string;
  endTime: string;
  status: number;
  execTime: number;
  result: string;
  taskIds: number[];
  taskNames: string[];
};

export type IMonitorRecordData = {
  list: IMonitorRecord[];
  total: number;
};

export type IJudgeCronTime = {
  cronTime: string;
};

export const addNewMonitor: (data: IMonitorType) => Promise<null> = data => {
  return axios({
    url: '/monitor/add',
    method: 'post',
    data,
  });
};

export const updateMonitorById: (
  data: IMonitorWithId,
) => Promise<null> = data => {
  return axios({
    url: '/monitor/update',
    method: 'post',
    data,
  });
};

export const getMonitorById: (id: number) => Promise<IMonitorData[]> = id => {
  return axios({
    url: `/monitor/get?id=${id}`,
    method: 'get',
  });
};

export const getMonitorList: (
  params: IQueryCommonParams,
) => Promise<IMonitorListData> = params => {
  return axios({
    url: '/monitor/list',
    method: 'get',
    params,
  });
};

export const deleteMonitorById: (id: number) => Promise<null> = id => {
  return axios({
    url: `/monitor/delete/${id}`,
    method: 'post',
  });
};

export const execMonitorById: (id: number) => Promise<null> = (id: number) => {
  return axios({
    url: `/monitor/exec/${id}`,
    method: 'post',
  });
};

export const stopMonitorById: (id: number) => Promise<null> = (id: number) => {
  return axios({
    url: `/monitor/stop/${id}`,
    method: 'post',
  });
};

export const getMonitorRecord: (
  params: IQueryCommonParams,
) => Promise<IMonitorRecordData> = params => {
  return axios({
    url: '/monitor/record/list',
    method: 'get',
    params,
  });
};

export const judgeCronTime: (
  data: IJudgeCronTime,
  headers?: Record<string, any>,
) => Promise<void> = (data, headers = {}) => {
  return axios({
    url: '/common/judge/cron',
    method: 'post',
    data,
    headers,
  });
};
