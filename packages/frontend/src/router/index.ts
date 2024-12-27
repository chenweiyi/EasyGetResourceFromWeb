import { createRouter, createWebHistory } from 'vue-router';
import TaskIcon from '~icons/hugeicons/task-edit-02';
import DataIcon from '~icons/material-symbols/bar-chart-4-bars-rounded';

const routes = [
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
      icon: TaskIcon,
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
      icon: DataIcon,
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export { routes, router as default };
