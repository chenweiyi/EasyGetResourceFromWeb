import RouterEngine from '@koa/router';
import { genCommonRoute } from './common';
import { genTaskRoute } from './task';
import { genMonitorRoute } from './monitor';

const router = new RouterEngine();
router.prefix('/q');

genCommonRoute(router);
genTaskRoute(router);
genMonitorRoute(router);

export { router };
