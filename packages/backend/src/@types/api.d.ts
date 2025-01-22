import { Context } from 'koa';
import { CronJob } from 'cron';

interface IMailValidatorValue {
  /** 验证码 */
  num: string;
  /** 邮箱 */
  email: string;
  /** 时间戳 */
  time: number;
  type: 'register' | 'findpassword';
}

type IJWTUser = {
  email: string;
  id: number;
  name?: string;
  lastLoginTime: string;
  status: number;
  type: number;
};

type ISessionJWTUser = IJWTUser & {
  iat: number;
  exp: number;
};

interface MyContext extends Context {
  cronMap: Map<number, CronJob>;
}

interface MyStateContext extends MyContext {
  state: {
    user: ISessionJWTUser;
  };
}

interface JudgeCronRequestBody {
  request: {
    body: {
      cronTime: string;
    };
  };
}

interface MyQueryContext extends Context {
  query: {
    current: string;
    pageSize: string;
  };
}
