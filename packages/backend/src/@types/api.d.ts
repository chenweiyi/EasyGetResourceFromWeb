import { Context } from 'koa';
import { CronJob } from 'cron';

interface MyContext extends Context {
  cronMap: Map<number, CronJob>;
}

interface MyQueryContext extends Context {
  query: {
    current: string;
    pageSize: string;
  };
}
