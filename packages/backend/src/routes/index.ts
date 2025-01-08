import RouterEngine from '@koa/router';
import { genTaskRoute } from './task';
import { genMonitorRoute } from './monitor';

const router = new RouterEngine();
router.prefix('/q');

genTaskRoute(router);
genMonitorRoute(router);

export { router };
