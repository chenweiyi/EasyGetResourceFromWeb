import { storeToRefs } from 'pinia';
import type { RouteLocationNormalized } from 'vue-router';

export default async function guard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) {
  const store = useUserStore();
  const { userInfo } = storeToRefs(store);
  console.log('from:', from);
  console.log('to:', to);

  if (!userInfo.value) {
    try {
      const res = await getUserInfo();
      store.setUserInfo(res);
      if (res) {
        if (to.name === 'login') {
          return { path: '/', replace: true };
        } else {
          return;
        }
      } else {
        if (to.name === 'login') {
          return;
        } else {
          return { name: 'login' };
        }
      }
    } catch (e: any) {
      if (e?.status === 401) {
        if (to.name === 'login') {
          return;
        } else {
          return { name: 'login' };
        }
      }
      return { name: '500' };
    }
  }
}
