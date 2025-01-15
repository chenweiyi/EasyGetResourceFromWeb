import RouterEngine from '@koa/router';
import CommonController from '../controller/common';

const genCommonRoute = (router: RouterEngine) => {
  router.post('/common/judge/cron', CommonController.postJudgeCron);
  router.get('/common/cron/exectimes', CommonController.getCronExecTimes);
};

export { genCommonRoute };
