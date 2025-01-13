import Koa from 'koa';
import debugLibrary from 'debug';
import {
  getCronExecTimes,
  IGetCronExecTimesQuery,
  IJudgeCronRequestBody,
  judgeCronTime,
} from '../service/common';
import { commonResponse } from '../utils/business';

const debug = debugLibrary('common:controller');

export default class CommonController {
  public static async postJudgeCron(ctx: Koa.Context) {
    const body = ctx.request.body as unknown as IJudgeCronRequestBody;
    debug('body:', body);
    await commonResponse(ctx, async () => await judgeCronTime(body));
  }

  public static async getCronExecTimes(ctx: Koa.Context) {
    const query = ctx.query as unknown as IGetCronExecTimesQuery;
    debug('query:', query);
    await commonResponse(ctx, async () => await getCronExecTimes(query), debug);
  }
}
