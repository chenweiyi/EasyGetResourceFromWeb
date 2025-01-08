<script setup lang="ts">
const props = defineProps<{
  total: number;
}>();

const current = defineModel<number>('current');
const pageSize = defineModel<number>('pageSize');
</script>

<template>
  <el-pagination
    background
    size="small"
    layout="prev, pager, next, jumper, sizes, total"
    v-if="total > 10"
    class="justify-center mt-20px"
    :total="total"
    :page-sizes="[10, 20, 50]"
    v-model:current-page="current"
    v-model:page-size="pageSize"
  />
</template>

<style scoped lang="less"></style>
