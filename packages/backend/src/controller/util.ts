import Koa from 'koa';
import debugLibrary from 'debug';

export const commonResponse = async (
  ctx: Koa.Context,
  task: () => Promise<any>,
  debug?: debugLibrary.Debugger,
) => {
  try {
    const res = await task();
    ctx.status = 200;
    ctx.body = {
      code: 0,
      msg: 'success',
      data: res,
    };
  } catch (error) {
    debug?.(error);
    ctx.status = 200;
    ctx.body = {
      code: 500,
      msg: error.message,
    };
  }
};
