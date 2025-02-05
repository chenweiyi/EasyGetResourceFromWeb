<script setup lang="ts">
import spider from '@/assets/spider.png';
import avatar from '@/assets/avatar.jpeg';
import { routes } from '@/router';
import { storeToRefs } from 'pinia';

type IMenu = {
  title: string;
  path: string;
  name: string;
  icon: FunctionalComponent;
};

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const { userInfo } = storeToRefs(userStore);

const menus = ref<IMenu[]>(
  routes
    .filter(r => r.meta?.menu)
    .map(r => ({
      title: (r.meta!.title as string) ?? '',
      path: r.path,
      name: r.name! as string,
      icon: r.meta!.icon as FunctionalComponent,
    })),
);

const active = computed(() => {
  const menu = menus.value.find(m => route.path.startsWith(m.path));
  if (menu) {
    return menu.name;
  }
  return '';
});

const clickMenu = (menu: IMenu) => {
  router.push({ name: menu.name });
};

const logout = () => {
  localStorage.removeItem('token');
  location.reload();
};
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="common-header">
        <div class="w-1200px h-full flex items-center">
          <div class="h-full flex items-center">
            <img
              :src="spider"
              alt=""
              class="w-36px h-36px mr-8px transition rotate-20"
            />
            <span class="text-18px">EasyGetResourceFromWeb</span>
            <span class="separator"></span>
          </div>
          <div class="common-menus">
            <ul class="menus">
              <li
                v-for="menu in menus"
                :key="menu.name"
                class="menu-item"
                :class="[menu.name === active ? 'active' : '']"
                @click="clickMenu(menu)"
              >
                <component :is="menu.icon"></component>
                <span class="ml-8px">{{ menu.title }}</span>
              </li>
            </ul>
          </div>
          <div class="flex-1"></div>
          <div class="flex items-center h-full">
            <el-popover
              placement="bottom"
              trigger="hover"
              width="350"
              :show-after="500"
            >
              <template #reference>
                <div class="flex items-center h-full">
                  <el-avatar :size="30" :src="avatar" />
                  <span class="ml-8px">{{
                    userInfo!.name || userInfo!.email
                  }}</span>
                </div>
              </template>
              <div class="flex flex-col items-stretch">
                <div class="flex items-center">
                  <el-avatar :size="40" :src="avatar" />
                  <div class="flex flex-col ml-24px">
                    <template v-if="userInfo!.name">
                      <span class="text-14px mb-8px">{{ userInfo!.name }}</span>
                      <span class="text-12px">{{ userInfo!.email }}</span>
                    </template>
                    <template v-else>
                      <span class="text-14px">{{ userInfo!.email }}</span>
                    </template>
                  </div>
                </div>
                <el-divider></el-divider>
                <div class="flex justify-center items-center">
                  <el-button type="primary" plain @click="logout"
                    >退出登录</el-button
                  >
                </div>
              </div>
            </el-popover>
          </div>
        </div>
      </el-header>
      <el-main class="flex! justify-center">
        <div class="w-1200px">
          <slot></slot>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped lang="less">
.common-layout {
  .common-header {
    background-color: rgb(2, 139, 255);
    height: 60px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .separator {
    width: 1px;
    height: 20px;
    background-color: #fff;
    margin: 0 20px;
  }
}

.menus {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
  margin-left: 30px;
}

.menu-item {
  position: relative;
  display: flex;
  align-items: center;
  margin-right: 60px;
  padding: 12px 0;
  cursor: pointer;
  color: #eee;
  &:hover {
    color: #fff;
  }
  &.active {
    color: #fff;
    &:after {
      content: '';
      position: absolute;
      display: block;
      width: 20px;
      height: 4px;
      border-radius: 2px;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      background-color: #fff;
    }
  }
}
</style>
