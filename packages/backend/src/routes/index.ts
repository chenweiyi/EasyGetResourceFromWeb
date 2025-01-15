import RouterEngine from '@koa/router';
import { genCommonRoute } from './common';
import { genUserRoute } from './user';
import { genTaskRoute } from './task';
import { genMonitorRoute } from './monitor';

const router = new RouterEngine();
router.prefix('/q');

genCommonRoute(router);
genUserRoute(router);
genTaskRoute(router);
genMonitorRoute(router);

export { router };
