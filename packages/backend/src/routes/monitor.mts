import MonitorController from '../controller/monitor.mjs';
import { router } from './index.mjs';

router.post('/monitor/add', MonitorController.postAddMonitor);
router.post('/monitor/update', MonitorController.postUpdateMonitor);
router.get('/monitor/get', MonitorController.getMonitorById);
router.get('/monitor/list', MonitorController.getMonitorList);
router.post('/monitor/delete/:id', MonitorController.deleteMonitorById);
router.post('/monitor/exec/:id', MonitorController.execMonitorById);

export { router };
