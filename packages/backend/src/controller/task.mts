import Koa from 'koa';
import { getTaskRecord } from '../service/task.mjs';

export default class TaskController {
  public static async getTaskRecord(ctx: Koa.Context) {
    console.log('getTaskRecord...');
    const res = await getTaskRecord();
    ctx.status = 200;
    if (res) {
      const [rows, fields] = res;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: rows,
        fields: fields,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: 'error',
        data: null,
        fields: null,
      };
    }
  }

  public static async postAddTaskRecord(ctx: Koa.Context) {}

  public static async getTaskList(ctx: Koa.Context) {
    ctx.status = 200;
    ctx.body = 'Hello koa';
  }

  public static async postAddTask(ctx: Koa.Context) {
    ctx.status = 200;
    ctx.body = 'Hello koa';
  }
}
