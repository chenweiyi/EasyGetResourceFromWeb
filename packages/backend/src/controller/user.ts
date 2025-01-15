import Koa from 'koa';
import debugLibrary from 'debug';
import { commonResponse } from '../utils/business';
import {
  ILoginUserParams,
  IRegisterUserParams,
  IVerifyCodeParams,
  getEmailVerifyCode,
  loginUser,
  registerUser,
} from '../service/user';
import { MyContext } from '../@types/api';

const debug = debugLibrary('user:controller');

export default class UserController {
  public static async getEmailVerifyCode(ctx: MyContext) {
    const query = ctx.query as unknown as IVerifyCodeParams;
    debug('query:', query);
    await commonResponse(
      ctx,
      async () => await getEmailVerifyCode(ctx, query),
      debug,
      ['邮箱已存在', '该邮箱已经发送验证码, 请查收邮件'],
    );
  }

  public static async postRegisterUser(ctx: MyContext) {
    const body = ctx.request.body as IRegisterUserParams;
    debug('body:', body);
    await commonResponse(
      ctx,
      async () => await registerUser(ctx, body),
      debug,
      ['验证码已过期', '验证码不正确', '邮箱已存在'],
    );
  }

  public static async postLoginUser(ctx: MyContext) {
    const body = ctx.request.body as ILoginUserParams;
    debug('body:', body);
    await commonResponse(ctx, async () => await loginUser(ctx, body), debug, [
      '邮箱或密码错误',
      '账号已被禁用或删除',
    ]);
  }
}
