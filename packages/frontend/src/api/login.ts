export type ILoginData = {
  email: string;
  password: string;
};

export type IEmailVerifyCodeParams = {
  email: string;
  uid: string;
  type: 'register' | 'findpassword';
};

export type IRegisterParams = {
  email: string;
  password: string;
  code: string;
  uid: string;
};

export type IFindPasswordParams = {
  email: string;
  uid: string;
  code: string;
  password: string;
};

export type IGetUserInfoParams = {
  email: string;
  id: number;
  lastLoginTime: string;
  status: number;
  type: number;
};

export const login: (data: ILoginData) => Promise<null> = data => {
  return axios({
    url: '/user/login',
    method: 'post',
    data,
  });
};

export const getEmailVerifyCode: (
  params: IEmailVerifyCodeParams,
) => Promise<null> = params => {
  return axios({
    url: '/user/verify/code',
    method: 'get',
    params,
  });
};

export const registerUser: (data: IRegisterParams) => Promise<null> = data => {
  return axios({
    url: '/user/register',
    method: 'post',
    data,
  });
};

export const findPassword: (
  data: IFindPasswordParams,
) => Promise<null> = data => {
  return axios({
    url: '/user/findpassword',
    method: 'post',
    data,
  });
};

export const getUserInfo: () => Promise<IGetUserInfoParams> = () => {
  return axios({
    url: '/user/getuserinfo',
    method: 'get',
    headers: {
      notAlertWhenError: 1,
    },
  });
};
