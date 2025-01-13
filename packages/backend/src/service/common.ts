import { CronJob } from 'cron';
import { CRON_MIN_INTERVAL_SECONED } from '../const';
import debugLibrary from 'debug';
import dayjs from 'dayjs';

const debug = debugLibrary('common:service');

export type IJudgeCronRequestBody = {
  cronTime: string;
};

export const judgeCronTime = async (data: IJudgeCronRequestBody) => {
  const { cronTime } = data;
  let time: string = cronTime.trim();
  let ct: string | Date = time;

  if (!isNaN(Number(time))) {
    // 兼容时间戳
    ct = new Date(+time);
  }

  const job = CronJob.from({
    cronTime: ct,
    onTick: async () => {},
    start: false,
    timeZone: 'Asia/Shanghai',
  });

  const dates = job.nextDates(3);
  if (!dates.length && typeof ct === 'object') {
    // 兼容时间戳
    return;
  }

  const interval =
    process.env.CRON_MIN_INTERVAL_SECONED || CRON_MIN_INTERVAL_SECONED;
  const intervalMS = +interval * 1000;

  const date1 = dates[0].setZone('Asia/Shanghai').valueOf();
  const date2 = dates[1].setZone('Asia/Shanghai').valueOf();
  const date3 = dates[2].setZone('Asia/Shanghai').valueOf();
  debug('date1:', dayjs(date1).format('YYYY-MM-DD HH:mm:ss'));
  debug('date2:', dayjs(date2).format('YYYY-MM-DD HH:mm:ss'));
  debug('date3:', dayjs(date3).format('YYYY-MM-DD HH:mm:ss'));

  if (date2 - date1 < intervalMS) {
    throw new Error(`执行间隔时间过短，不少于 ${interval} s`);
  }
};
