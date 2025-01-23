import { CronJob } from 'cron';

export type ICronMap = Map<
  number,
  {
    job: CronJob;
    completePromise: Promise<void>;
  }
>;

const cronMap: ICronMap = new Map();

export { cronMap };
