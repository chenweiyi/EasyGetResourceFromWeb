import RouterEngine from '@koa/router';
import MonitorController from '../controller/monitor';
import { MyContext, MyQueryContext } from '../@types/api';

const genMonitorRoute = (router: RouterEngine) => {
  router.post('/monitor/add', MonitorController.postAddMonitor);
  router.post('/monitor/update', MonitorController.postUpdateMonitor);
  router.get('/monitor/get', MonitorController.getMonitorById);
  router.get<any, MyQueryContext>(
    '/monitor/list',
    MonitorController.getMonitorList,
  );
  router.post('/monitor/delete/:id', MonitorController.deleteMonitorById);
  router.post<any, MyContext>(
    '/monitor/exec/:id',
    MonitorController.execMonitorById,
  );
  router.post<any, MyContext>(
    '/monitor/stop/:id',
    MonitorController.stopMonitorById,
  );
  router.post<any, MyContext>(
    '/monitor/stopAll',
    MonitorController.stopAllMonitor,
  );
  router.get<any, MyQueryContext>(
    '/monitor/record/list',
    MonitorController.getMonitorRecord,
  );
};

export { genMonitorRoute };
