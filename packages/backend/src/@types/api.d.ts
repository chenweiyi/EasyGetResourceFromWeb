import { Context } from 'koa';
import { CronJob } from 'cron';

interface IMailValidatorValue {
  /** 验证码 */
  num: string;
  /** 邮箱 */
  email: string;
  /** 时间戳 */
  time: number;
}

interface MyContext extends Context {
  cronMap: Map<number, CronJob>;
  mailValidators: Map<string, IMailValidatorValue>;
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
