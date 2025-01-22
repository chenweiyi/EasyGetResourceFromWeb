import { transporter } from '../utils/mail';
import { MyContext, MyStateContext } from '../@types/api';
import dayjs from 'dayjs';
import { getConn } from '../utils/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import debugLibrary from 'debug';
import { encodeStr } from '../utils/crypto';
import pug from 'pug';
import path from 'node:path';
import { genRandomNumber, getDirname } from '../utils/tool';
import { setJwtToken } from '../utils/business';
import {
  getMailKeys,
  getMailValidator,
  getMailValues,
  PREFIX,
  setMailValidator,
} from '../utils/redisEmailService';

export type IVerifyCodeParams = {
  email: string;
  uid: string;
  type: 'register' | 'findpassword';
};

export type IRegisterUserParams = {
  email: string;
  password: string;
  uid: string;
  code: string;
};

export type IFindPasswordParams = {
  email: string;
  uid: string;
  code: string;
  password: string;
};

export type ILoginUserParams = {
  email: string;
  password: string;
};

const debug = debugLibrary('user:service');

export const getEmailVerifyCode = async (
  ctx: MyContext,
  query: IVerifyCodeParams,
) => {
  const { email, uid, type } = query;

  if (!email || !uid || !type) {
    throw new Error(
      `Need email and uid, got email: ${email}, uid: ${uid}, type: ${type}.`,
    );
  }

  let isAlreadySend = false;
  const mailValidatorsValues = await getMailValues();
  for (let value of mailValidatorsValues) {
    if (value.email === email && value.type === type) {
      isAlreadySend = true;
      break;
    }
  }

  if (isAlreadySend) {
    throw new Error('该邮箱已经发送验证码, 请查收邮件');
  }

  const conn = await getConn();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM user WHERE email = ?',
      [email],
    );

    if (type === 'register') {
      if (rows.length > 0) {
        throw new Error('邮箱已存在');
      }
    } else if (type === 'findpassword') {
      if (rows.length === 0) {
        throw new Error('该邮箱未注册');
      }
    }
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }

  const num = genRandomNumber(4);

  debug('num:', num);
  const keys = await getMailKeys();
  if (keys.some(key => key.replace(PREFIX, '') === uid)) {
    return;
  } else {
    await setMailValidator(
      `${PREFIX}${uid}`,
      {
        email,
        num,
        time: dayjs().valueOf(),
        type,
      },
      +process.env.MAIL_VALID_LIFE_TIME * 60,
    );
  }

  let html = '';
  let subject = '';

  if (type === 'register') {
    subject = 'Register Account - EasyGetResourceFromWeb';
    html = pug.renderFile(
      path.join(getDirname(), '../templates/register-code-email.pug'),
      {
        email,
        num,
        validLifeTime: process.env.MAIL_VALID_LIFE_TIME,
      },
    );
  } else if (type === 'findpassword') {
    subject = 'Forget Password - EasyGetResourceFromWeb';
    html = pug.renderFile(
      path.join(getDirname(), '../templates/findpassword-code-email.pug'),
      {
        email,
        num,
        validLifeTime: process.env.MAIL_VALID_LIFE_TIME,
      },
    );
  }

  await transporter.sendMail({
    from: 'EasyGetResourceFromWeb 🦋 <easygetresource@163.com>',
    to: email,
    subject,
    html,
  });

  debug('mail send success!');
};

export const registerUser = async (
  ctx: MyContext,
  data: IRegisterUserParams,
) => {
  const { email, password, uid, code } = data;

  if (!email || !password || !uid) {
    throw new Error(
      `Need email, password and uid, got email: ${email}, password: ${password}, uid: ${uid}.`,
    );
  }

  const keys = await getMailKeys();
  if (!keys.find(key => key.replace(PREFIX, '') === uid)) {
    throw new Error('验证码已过期');
  }
  const targetValue = await getMailValidator(`${PREFIX}${uid}`);
  if (targetValue.num !== code) {
    throw new Error('验证码不正确');
  }

  const conn = await getConn();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM user WHERE email = ?',
      [email],
    );

    if (rows.length > 0) {
      throw new Error('邮箱已存在');
    }

    const d = {
      email,
      password: encodeStr(password),
      create_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      update_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    debug('d:', d);

    const [res] = await conn.query<ResultSetHeader>(
      'INSERT INTO user SET ?',
      d,
    );

    if (res.affectedRows === 0) {
      throw new Error('添加用户失败');
    }
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

export const findPassword = async (
  ctx: MyContext,
  data: IFindPasswordParams,
) => {
  const { email, uid, code, password } = data;

  if (!email || !uid || !code || !password) {
    throw new Error(
      `Need email, uid, code and password, got email: ${email}, uid: ${uid}, code: ${code}, password: ${password}.`,
    );
  }

  const keys = await getMailKeys();
  if (!keys.find(key => key.replace(PREFIX, '') === uid)) {
    throw new Error('验证码已过期');
  }

  const targetValue = await getMailValidator(`${PREFIX}${uid}`);
  if (targetValue.num !== code) {
    throw new Error('验证码不正确');
  }

  const conn = await getConn();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM user WHERE email = ?',
      [email],
    );

    if (rows.length === 0) {
      throw new Error('邮箱不存在');
    }

    const d = {
      password: encodeStr(password),
      update_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    debug('d:', d);

    const [res] = await conn.query<ResultSetHeader>(
      'UPDATE user SET ? WHERE email = ?',
      [d, email],
    );

    if (res.affectedRows === 0) {
      throw new Error('更新用户信息失败');
    }
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

export const loginUser = async (ctx: MyContext, data: ILoginUserParams) => {
  const { email, password } = data;

  if (!email || !password) {
    throw new Error(
      `Need email and password, got email: ${email}, password: ${password}.`,
    );
  }

  const encodePassword = encodeStr(password);

  const conn = await getConn();
  try {
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM user WHERE email = ? AND password = ?',
      [email, encodePassword],
    );

    if (rows.length === 0) {
      throw new Error('邮箱或密码错误');
    }

    if (rows[0].status !== 1) {
      throw new Error('账号已被禁用或删除');
    }

    const d = {
      last_login_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    debug('d:', d);
    const [res] = await conn.query<ResultSetHeader>(
      'UPDATE user SET ? WHERE email = ?',
      [d, email],
    );

    if (res.affectedRows === 0) {
      throw new Error('更新用户信息失败');
    }

    const [data] = await conn.query<RowDataPacket[]>(
      'SELECT * FROM user WHERE email = ?',
      [email],
    );

    setJwtToken(ctx, {
      email,
      id: data[0].id,
      name: data[0].name,
      lastLoginTime: data[0].last_login_time,
      status: data[0].status,
      type: data[0].type,
    });
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};

export const getUserInfo = async (ctx: MyStateContext) => {
  return ctx.state.user;
};
