<script setup lang="ts">
type IMenuItem = {
  label: string;
  value: string;
};

const router = useRouter();
const route = useRoute();

const menus = ref<IMenuItem[]>([
  {
    label: '任务记录',
    value: 'task-record',
  },
  {
    label: '任务列表',
    value: 'task-list',
  },
  {
    label: '新建任务',
    value: 'task-new',
  },
]);

const active = ref(route.name);

const clickMenu = (menu: IMenuItem) => {
  router.push({ name: menu.value });
};

watch(
  () => route.name,
  val => {
    if (val) {
      active.value = val;
    }
  },
);
</script>

<template>
  <el-card class="menu-card">
    <ul class="menus">
      <li
        v-for="menu in menus"
        :key="menu.value"
        class="menu-item"
        :class="[menu.value === active ? 'active' : '']"
        @click="clickMenu(menu)"
      >
        {{ menu.label }}
      </li>
    </ul>
  </el-card>
  <el-card class="mt-12px min-h-500px">
    <RouterView />
  </el-card>
</template>

<style scoped lang="less">
.menu-card {
  :deep(.el-card__body) {
    padding: 0px 20px;
  }
}

.menus {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.menu-item {
  position: relative;
  margin-right: 30px;
  padding: 12px 0;
  cursor: pointer;
  &:hover {
    color: #409eff;
  }
  &.active {
    color: #409eff;
    &:after {
      content: '';
      position: absolute;
      display: block;
      width: 20px;
      height: 2px;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0 auto;
      background-color: #409eff;
    }
  }
}
</style>
