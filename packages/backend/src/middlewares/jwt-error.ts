export default function jwtError(ctx: any, next: any) {
  return next().catch((err: any) => {
    if (process.env._ENV_ === 'online') {
      if (err?.status === 401) {
        // 生产环境不暴露具体错误信息
        ctx.status = 401;
        ctx.body = 'Authentication Error';
      } else {
        throw err;
      }
    } else {
      throw err;
    }
  });
}
