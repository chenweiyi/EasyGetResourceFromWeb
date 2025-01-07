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
};

export type IMonitorRecord = {
  id: number;
  monitorId: number;
  startTime: string;
  endTime: string;
  status: number;
  execTime: number;
  result: string;
  taskIds: number[];
  taskNames: string[];
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

export const getMonitorList: () => Promise<IMonitorData[]> = () => {
  return axios({
    url: '/monitor/list',
    method: 'get',
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

export const getMonitorRecord: () => Promise<IMonitorRecord[]> = () => {
  return axios({
    url: '/monitor/record/list',
    method: 'get',
  });
};
