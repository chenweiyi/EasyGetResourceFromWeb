import RouterEngine from '@koa/router';
import UserController from '../controller/user';
import { MyContext } from '../@types/api';

const genUserRoute = (router: RouterEngine) => {
  router.get<any, MyContext>(
    '/user/verify/code',
    UserController.getEmailVerifyCode,
  );
  router.post('/user/register', UserController.postRegisterUser);
  router.post('/user/login', UserController.postLoginUser);
  router.post('/user/findpassword', UserController.postFindPassword);
};

export { genUserRoute };
