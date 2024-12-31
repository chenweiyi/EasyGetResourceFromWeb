import Koa from 'koa';
import {
  addNewTask,
  execTaskById,
  getTaskById,
  getTaskRecord,
  ITaskType,
  ITaskWithId,
  queryTaskList,
  updateTaskById,
} from '../service/task.mjs';
import debugLibrary from 'debug';

const debug = debugLibrary('task:controller');
export default class TaskController {
  public static async getTaskRecord(ctx: Koa.Context) {
    debug('getTaskRecord...');
    try {
      const res = await getTaskRecord();
      debug('getTaskRecord res:', res);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async postAddTaskRecord(ctx: Koa.Context) {}

  public static async getTaskList(ctx: Koa.Context) {
    try {
      const res = await queryTaskList();
      debug('getTaskList res:', res);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async postAddTask(ctx: Koa.Context) {
    const body: ITaskType = ctx.request.body as ITaskType;
    debug('body:', body);
    try {
      const id = await addNewTask(body);
      debug('id:', id);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: id,
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async getTaskById(ctx: Koa.Context) {
    const id = ctx.query.id;
    debug('id:', id);
    try {
      const res = await getTaskById(+id);
      debug('res:', res);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async updateTaskById(ctx: Koa.Context) {
    const body: ITaskWithId = ctx.request.body as ITaskWithId;
    debug('body:', body);
    try {
      const { id, name, url, enableProxy, fields, retryNum } = body;
      const res = await updateTaskById({
        id: +id,
        name,
        url,
        enableProxy,
        fields,
        retryNum,
      });
      debug('res:', res);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async execTaskById(ctx: Koa.Context) {
    const id = ctx.params.id;
    debug('id:', id);
    try {
      await execTaskById(+id);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
      };
    } catch (error) {
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }
}
