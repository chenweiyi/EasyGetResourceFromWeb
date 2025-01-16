import { type RouteRecordRaw } from 'vue-router';
import guard from './guard';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'root',
    redirect: '/task',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      menu: false,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: '注册',
      menu: false,
    },
  },
  {
    path: '/findpassword',
    name: 'findpassword',
    component: () => import('../views/FindPassword.vue'),
    meta: {
      title: '找回密码',
      menu: false,
    },
  },
  {
    path: '/monitor',
    name: 'monitor',
    redirect: '/monitor/record',
    component: () => import('../views/Monitor.vue'),
    meta: {
      title: '监控',
      menu: true,
      icon: IconEpMonitor,
    },
    children: [
      {
        path: 'record',
        name: 'monitor-record',
        component: () => import('../views/monitor/record.vue'),
        meta: {
          title: '监控记录',
        },
      },
      {
        path: 'list',
        name: 'monitor-list',
        component: () => import('../views/monitor/list.vue'),
        meta: {
          title: '监控列表',
        },
      },
      {
        path: 'new',
        name: 'monitor-new',
        component: () => import('../views/monitor/new.vue'),
        meta: {
          title: '新建监控',
        },
      },
    ],
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
        meta: {
          title: '任务记录',
        },
      },
      {
        path: 'list',
        name: 'task-list',
        component: () => import('../views/task/list.vue'),
        meta: {
          title: '任务列表',
        },
      },
      {
        path: 'new',
        name: 'task-new',
        component: () => import('../views/task/new.vue'),
        meta: {
          title: '新建任务',
        },
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
  {
    path: '/500',
    name: '500',
    component: () => import('../views/500.vue'),
    meta: {
      title: '500',
      menu: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: () => import('../views/404.vue'),
    meta: {
      title: '404',
      menu: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(guard);

export { routes, router as default };
