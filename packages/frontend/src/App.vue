<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const route = useRoute();
watch(
  () => route.name,
  () => {
    document.title = `EasyGetResourceFromWeb - ${route.meta.title as string}`;
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<style scoped lang="less"></style>
