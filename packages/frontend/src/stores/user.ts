import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { IGetUserInfoParams } from '@/api/login';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<IGetUserInfoParams>();

  const setUserInfo = (info: IGetUserInfoParams | undefined) => {
    userInfo.value = info;
  };

  return { userInfo, setUserInfo };
});
