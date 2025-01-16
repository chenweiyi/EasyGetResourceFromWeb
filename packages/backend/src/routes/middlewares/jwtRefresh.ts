import dayjs from 'dayjs';
import { MyStateContext } from '../../@types/api';
import { setJwtToken } from '../../utils/business';

const jwtRefresh = async (ctx: MyStateContext, next: any) => {
  const token = ctx.state.user;
  const rollTime = process.env.ROLL_REFRESH_BUFFER;
  const diffUnit = rollTime.split(',')[0] as dayjs.QUnitType | dayjs.OpUnitType;
  const diffValue = +rollTime.split(',')[1];
  if (token) {
    const { exp, iat, ...other } = token;
    if (dayjs(exp * 1000).diff(dayjs(), diffUnit) < diffValue) {
      setJwtToken(ctx, {
        ...other,
      });
    }
  }

  await next();
};

export { jwtRefresh };
