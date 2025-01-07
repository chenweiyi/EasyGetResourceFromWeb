import { type MyContext } from '../app.mjs';
import MonitorController from '../controller/monitor.mjs';
import { router } from './index.mjs';

router.post('/monitor/add', MonitorController.postAddMonitor);
router.post('/monitor/update', MonitorController.postUpdateMonitor);
router.get('/monitor/get', MonitorController.getMonitorById);
router.get('/monitor/list', MonitorController.getMonitorList);
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
router.get('/monitor/record/list', MonitorController.getMonitorRecord);

export { router };
