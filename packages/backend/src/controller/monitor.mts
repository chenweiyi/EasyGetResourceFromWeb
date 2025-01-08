import Koa from 'koa';
import debugLibrary from 'debug';
import {
  addNewMonitor,
  deleteMonitorById,
  execMonitorById,
  getMonitorById,
  getMonitorRecord,
  queryMonitorList,
  stopAllMonitor,
  stopMonitorById,
  updateMonitorById,
  type IMonitorType,
  type IMonitorWithId,
} from '../service/monitor.mjs';
import { MyContext, MyQueryContext } from '../@types/api';

const debug = debugLibrary('monitor:controller');

export default class TaskController {
  public static async postAddMonitor(ctx: Koa.Context) {
    const body: IMonitorType = ctx.request.body as IMonitorType;
    debug('body:', body);
    try {
      const id = await addNewMonitor(body);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: id,
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async postUpdateMonitor(ctx: Koa.Context) {
    const body: IMonitorWithId = ctx.request.body as IMonitorWithId;
    debug('body:', body);
    try {
      const res = await updateMonitorById({
        ...body,
        id: +body.id,
      });
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async getMonitorById(ctx: Koa.Context) {
    const id = ctx.query.id;
    debug('id:', id);
    try {
      const res = await getMonitorById(+id);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async getMonitorList(ctx: MyQueryContext) {
    try {
      const query = ctx.query;
      debug('query:', query);
      const res = await queryMonitorList(query);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async deleteMonitorById(ctx: Koa.Context) {
    const id = ctx.params.id;
    debug('id:', id);
    try {
      await deleteMonitorById(+id);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async execMonitorById(ctx: MyContext) {
    const id = ctx.params.id;
    debug('id:', id);
    try {
      await execMonitorById(ctx, +id);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async stopMonitorById(ctx: MyContext) {
    const id = ctx.params.id;
    debug('id:', id);
    try {
      await stopMonitorById(ctx, +id);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async stopAllMonitor(ctx: MyContext) {
    try {
      await stopAllMonitor(ctx);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }

  public static async getMonitorRecord(ctx: MyQueryContext) {
    try {
      const query = ctx.query;
      debug('query:', query);
      const res = await getMonitorRecord(query);
      ctx.status = 200;
      ctx.body = {
        code: 0,
        msg: 'success',
        data: res,
      };
    } catch (error) {
      debug(error);
      ctx.status = 200;
      ctx.body = {
        code: 500,
        msg: error.message,
      };
    }
  }
}
