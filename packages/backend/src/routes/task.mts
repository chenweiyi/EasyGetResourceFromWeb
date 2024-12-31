import TaskController from '../controller/task.mjs';
import { router } from './index.mjs';

router.get('/task/record/list', TaskController.getTaskRecord);
router.get('/task/list', TaskController.getTaskList);
router.post('/task/add', TaskController.postAddTask);
router.get('/task/get', TaskController.getTaskById);
router.post('/task/update', TaskController.updateTaskById);
router.post('/task/exec/:id', TaskController.execTaskById);

export { router };
