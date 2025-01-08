import RouterEngine from '@koa/router';
import TaskController from '../controller/task';

const genTaskRoute = (router: RouterEngine) => {
  router.get('/task/record/list', TaskController.getTaskRecord);
  router.get('/task/list', TaskController.getTaskList);
  router.post('/task/add', TaskController.postAddTask);
  router.get('/task/get', TaskController.getTaskById);
  router.post('/task/update', TaskController.updateTaskById);
  router.post('/task/delete/:id', TaskController.deleteTaskById);
  router.post('/task/copy/:id', TaskController.copyTaskById);
  router.post('/task/exec/:id', TaskController.execTaskById);
};

export { genTaskRoute };
