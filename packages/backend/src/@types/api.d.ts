import { Context } from 'koa';
import { CronJob } from 'cron';

interface MyContext extends Context {
  cronMap: Map<number, CronJob>;
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
