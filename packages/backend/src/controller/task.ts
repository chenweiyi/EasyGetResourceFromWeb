import Koa from 'koa';
import {
  addNewTask,
  copyTaskById,
  deleteTaskById,
  execTaskById,
  getTaskById,
  getTaskRecord,
  ITaskType,
  ITaskWithId,
  queryTaskList,
  updateTaskById,
} from '../service/task';
import debugLibrary from 'debug';
import { commonResponse } from './util';

const debug = debugLibrary('task:controller');
export default class TaskController {
  public static async getTaskRecord(ctx: Koa.Context) {
    const query = ctx.query;
    debug('query:', query);
    await commonResponse(
      ctx,
      async () => getTaskRecord(query as unknown as IQueryCommonParams),
      debug,
    );
  }

  public static async getTaskList(ctx: Koa.Context) {
    const query = ctx.query;
    debug('query:', query);
    await commonResponse(
      ctx,
      async () => queryTaskList(query as unknown as IQueryCommonParams),
      debug,
    );
  }

  public static async postAddTask(ctx: Koa.Context) {
    const body: ITaskType = ctx.request.body as ITaskType;
    debug('body:', body);
    await commonResponse(ctx, async () => await addNewTask(body), debug);
  }

  public static async getTaskById(ctx: Koa.Context) {
    const id = ctx.query.id;
    debug('id:', id);
    await commonResponse(ctx, async () => await getTaskById(+id), debug);
  }

  public static async updateTaskById(ctx: Koa.Context) {
    const body: ITaskWithId = ctx.request.body as ITaskWithId;
    debug('body:', body);
    await commonResponse(
      ctx,
      async () =>
        await updateTaskById({
          ...body,
          id: +body.id,
        }),
      debug,
    );
  }

  public static async deleteTaskById(ctx: Koa.Context) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(ctx, async () => await deleteTaskById(+id));
  }

  public static async copyTaskById(ctx: Koa.Context) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(ctx, async () => await copyTaskById(+id), debug);
  }

  public static async execTaskById(ctx: Koa.Context) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(ctx, async () => await execTaskById(+id), debug);
  }
}
