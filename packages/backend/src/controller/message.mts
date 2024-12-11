import Koa from 'koa'

export default class MessageController {
  public static async sayHello(ctx: Koa.Context) {
    ctx.status = 200;
    ctx.body = 'Hello koa'
  }
}
