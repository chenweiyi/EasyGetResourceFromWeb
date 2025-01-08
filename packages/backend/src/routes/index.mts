import RouterEngine from '@koa/router';
import { genTaskRoute } from './task.mjs';
import { genMonitorRoute } from './monitor.mjs';

const router = new RouterEngine();
router.prefix('/q');

genTaskRoute(router);
genMonitorRoute(router);

export { router };
