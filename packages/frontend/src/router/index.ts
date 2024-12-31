import { type RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/task',
  },
  {
    path: '/task',
    name: 'task',
    redirect: '/task/record',
    component: () => import('../views/Task.vue'),
    meta: {
      title: '任务',
      menu: true,
      icon: IconHugeiconsTaskEdit02,
    },
    children: [
      {
        path: 'record',
        name: 'task-record',
        component: () => import('../views/task/record.vue'),
      },
      {
        path: 'list',
        name: 'task-list',
        component: () => import('../views/task/list.vue'),
      },
      {
        path: 'new',
        name: 'task-new',
        component: () => import('../views/task/new.vue'),
      },
    ],
  },
  {
    path: '/data',
    name: 'data',
    component: () => import('../views/Data.vue'),
    meta: {
      title: '数据',
      menu: true,
      icon: IconMaterialSymbolsBarChart4BarsRounded,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export { routes, router as default };
