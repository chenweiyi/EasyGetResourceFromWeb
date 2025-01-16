import axios from 'axios';

console.log('mode:', import.meta.env.MODE);

const AXIOS_DEFAULT_CONFIG = {
  baseURL: '/q',
  timeout: 10000,
  maxContentLength: 2000,
  headers: {},
};

// 创建axios实例
const service = axios.create(AXIOS_DEFAULT_CONFIG);

// request interceptors
service.interceptors.request.use(
  request => {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers['Authorization'] = `Bearer ${token}`;
    }
    if (request.method === 'get') {
      request.params = Object.assign(request.params || {}, {
        _: new Date().getTime(),
      });
    }
    if (request.method === 'post') {
      if (!request.headers['Content-Type']) {
        request.headers['Content-Type'] = 'application/json';
      }
    } else {
      request.headers['Content-Type'] = 'application/json';
    }
    return request;
  },
  error => {
    ElMessage.error('请求失败，请检测网络状态');
    console.error(error);
  },
);

// response interceptors
service.interceptors.response.use(
  async response => {
    const res = response.data;
    const config = response.config;
    const headers = response.headers;
    if (headers['token']) {
      localStorage.setItem('token', headers['token']);
    }
    if (res.code === 0) {
      return res.data;
    } else {
      if (config.headers['notAlertWhenError'] !== '1') {
        ElMessage.error(res.msg || 'error');
      }
    }
    return Promise.reject(res);
  },
  error => {
    console.error(error);
    if (error.status === 401) {
      if (import.meta.env.MODE === 'production') {
        window.location.href = '/login';
        return;
      }
    }
    ElMessage.error(error.msg || error.message || '服务错误');
    return Promise.reject(error);
  },
);

export default service;
