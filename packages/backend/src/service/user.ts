import { genRandomNumber, getDirname } from '../utils/business';
import { transporter } from '../utils/mail';
import { MyContext } from '../@types/api';
import dayjs from 'dayjs';
import { getConn } from '../utils/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import debugLibrary from 'debug';
import { encodeStr } from '../utils/crypto';
import jwt from 'jsonwebtoken';
import pug from 'pug';
import path from 'node:path';

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

  if (!email || !uid) {
    throw new Error(`Need email and uid, got email: ${email}, uid: ${uid}.`);
  }

  let isAlreadySend = false;
  for (let value of ctx.mailValidators.values()) {
    if (value.email === email) {
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

  if (ctx.mailValidators.has(uid)) {
    return;
  } else {
    ctx.mailValidators.set(uid, {
      email,
      num,
      time: dayjs().valueOf(),
    });
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

  if (!ctx.mailValidators.has(uid)) {
    throw new Error('验证码已过期');
  }

  if (ctx.mailValidators.get(uid).num !== code) {
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

  if (!ctx.mailValidators.has(uid)) {
    throw new Error('验证码已过期');
  }

  if (ctx.mailValidators.get(uid).num !== code) {
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

    const token = jwt.sign(
      {
        email,
        id: res.insertId,
        lastLoginTime: data[0].last_login_time,
        status: data[0].status,
        type: data[0].type,
      },
      process.env.secret,
      {
        expiresIn: isNaN(Number(process.env.expire))
          ? process.env.expire
          : Number(process.env.expire),
      },
    );

    ctx.response.set('token', token);
  } catch (error) {
    throw error;
  } finally {
    conn.release();
  }
};
