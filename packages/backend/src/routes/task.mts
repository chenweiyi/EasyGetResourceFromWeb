import TaskController from '../controller/task.mjs';
import { router } from './index.mjs';

router.get('/task/record/list', TaskController.getTaskRecord);
router.post('/task/record/add', TaskController.postAddTaskRecord);
router.get('/task/list', TaskController.getTaskList);
router.post('/task/add', TaskController.postAddTask);

export { router };
