import RouterEngine from '@koa/router';
import { genCommonRoute } from './common';
import { genTaskRoute } from './task';
import { genMonitorRoute } from './monitor';
import { genUserRoute } from './user';
import { jwtRefresh } from './middlewares/jwtRefresh';
import { MyContext, MyStateContext } from '../@types/api';

const router = new RouterEngine<MyStateContext, MyContext>();
router.prefix('/q');

// 需放在其他路由之前
router.use(['/task', '/monitor', '/common'], jwtRefresh);

genCommonRoute(router);
genTaskRoute(router);
genMonitorRoute(router);
genUserRoute(router);

export { router };
