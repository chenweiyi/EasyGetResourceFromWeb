import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    UnoCSS(),
    Icons(),
    AutoImport({
      eslintrc: {
        enabled: true,
      },
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
      imports: [
        'vue',
        'vue-router',
        {
          from: 'vue',
          imports: ['FunctionalComponent'],
          type: true,
        },
        {
          dayjs: [['default', 'dayjs']],
        },
        {
          from: 'vue-router',
          imports: ['createRouter', 'createWebHistory'],
        },
        {
          from: 'vue-router',
          imports: ['RouteRecordRaw'],
          type: true,
        },
        {
          from: 'element-plus',
          imports: ['FormInstance'],
          type: true,
        },
      ],
      dirs: ['./src/api', './src/components', './src/utils'],
    }),
    Components({
      resolvers: [
        IconsResolver(),
        ElementPlusResolver({
          importStyle: 'css',
        }),
      ],
      globs: ['./src/components/**/*.vue', './src/layouts/**/*.vue'],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      '/q': {
        target: 'http://127.0.0.1:3010',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/q/, '/q'),
      },
    },
  },
});
