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
import { commonResponse } from '../utils/business';
import { MyStateContext } from '../@types/api';

const debug = debugLibrary('task:controller');
export default class TaskController {
  public static async getTaskRecord(ctx: MyStateContext) {
    const query = ctx.query;
    debug('query:', query);
    await commonResponse(
      ctx,
      async () => getTaskRecord(ctx, query as unknown as IQueryCommonParams),
      debug,
    );
  }

  public static async getTaskList(ctx: MyStateContext) {
    const query = ctx.query;
    debug('query:', query);
    await commonResponse(
      ctx,
      async () => queryTaskList(ctx, query as unknown as IQueryCommonParams),
      debug,
    );
  }

  public static async postAddTask(ctx: MyStateContext) {
    const body: ITaskType = ctx.request.body as ITaskType;
    debug('body:', body);
    await commonResponse(ctx, async () => await addNewTask(ctx, body), debug);
  }

  public static async getTaskById(ctx: MyStateContext) {
    const id = ctx.query.id;
    debug('id:', id);
    await commonResponse(
      ctx,
      async () => await getTaskById(+id, ctx.state.user.id),
      debug,
    );
  }

  public static async updateTaskById(ctx: MyStateContext) {
    const body: ITaskWithId = ctx.request.body as ITaskWithId;
    debug('body:', body);
    await commonResponse(
      ctx,
      async () =>
        await updateTaskById({
          ...body,
          id: +body.id,
          userId: ctx.state.user.id,
        }),
      debug,
    );
  }

  public static async deleteTaskById(ctx: MyStateContext) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(
      ctx,
      async () => await deleteTaskById(+id, ctx.state.user.id),
    );
  }

  public static async copyTaskById(ctx: MyStateContext) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(
      ctx,
      async () => await copyTaskById(+id, ctx.state.user.id),
      debug,
    );
  }

  public static async execTaskById(ctx: Koa.Context) {
    const id = ctx.params.id;
    debug('id:', id);
    await commonResponse(
      ctx,
      async () => await execTaskById(+id, ctx.state.user.id),
      debug,
    );
  }
}
