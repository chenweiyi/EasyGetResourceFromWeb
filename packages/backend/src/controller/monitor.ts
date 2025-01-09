import Koa from 'koa';
import debugLibrary from 'debug';
import {
  addNewMonitor,
  deleteMonitorById,
  execMonitorById,
  getMonitorById,
  getMonitorRecord,
  IJudgeCronRequestBody,
  judgeCronTime,
  queryMonitorList,
  stopAllMonitor,
  stopMonitorById,
  updateMonitorById,
  type IMonitorType,
  type IMonitorWithId,
} from '../service/monitor';
import { MyContext, MyQueryContext } from '../@types/api';
import { commonResponse } from './util';

const debug = debugLibrary('monitor:controller');

export default class TaskController {
  public static async postAddMonitor(ctx: Koa.Context) {
    const body: IMonitorType = ctx.request.body as IMonitorType;
    debug('body:', body);
    await commonResponse(ctx, async () => await addNewMonitor(body), debug);
  }

  public static async postUpdateMonitor(ctx: Koa.Context) {
    const body: IMonitorWithId = ctx.request.body as IMonitorWithId;
    debug('body:', body);
    await commonResponse(
      ctx,
      async () =>
        await updateMonitorById({
          ...body,
          id: +body.id,
        }),
      debug,
    );
  }

  public static async getMonitorById(ctx: Koa.Context) {
    const id = ctx.query.id;
    debug('id:', id);
    await commonResponse(ctx, async () => await getMonitorById(+id), debug);
  }

  public static async getMonitorList(ctx: MyQueryContext) {
    const query = ctx.query;
    debug('query:', query);
    await commonResponse(ctx, async () => await queryMonitorList(query), debug);
  }

  public static async deleteMonitorById(ctx: Koa.Context) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(ctx, async () => await deleteMonitorById(+id), debug);
  }

  public static async execMonitorById(ctx: MyContext) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(
      ctx,
      async () => await execMonitorById(ctx, +id),
      debug,
    );
  }

  public static async stopMonitorById(ctx: MyContext) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(
      ctx,
      async () => await stopMonitorById(ctx, +id),
      debug,
    );
  }

  public static async stopAllMonitor(ctx: MyContext) {
    await commonResponse(ctx, async () => await stopAllMonitor(ctx), debug);
  }

  public static async getMonitorRecord(ctx: MyQueryContext) {
    const query = ctx.query;
    debug('query:', query);
    await commonResponse(ctx, async () => getMonitorRecord(query), debug);
  }

  public static async postCronJudge(ctx: Koa.Context) {
    const body = ctx.request.body as unknown as IJudgeCronRequestBody;
    debug('body:', body);
    await commonResponse(ctx, async () => await judgeCronTime(body));
  }
}
