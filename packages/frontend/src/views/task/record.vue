<script setup lang="ts">
import type { ITaskRecord } from '@/api/task';

const data = ref<ITaskRecord[]>([]);

const getStatus = (status: number) => {
  switch (status) {
    case 0:
      return '成功';
    case 1:
      return '脆弱';
    case 2:
      return '失败';
  }
};

const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'success';
    case 1:
      return 'warning';
    case 2:
      return 'danger';
  }
};

const seeDetial = (result: string) => {};

const query = async () => {
  try {
    const res = await getTaskRecord();
    console.log('res:', res);
    data.value = res;
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  query();
});
</script>

<template>
  <el-table :data="data">
    <el-table-column prop="id" label="Id" width="70" />
    <el-table-column prop="name" label="任务名称" />
    <el-table-column prop="url" label="爬取地址" show-overflow-tooltip />
    <el-table-column prop="startTime" label="开始时间" width="180" />
    <el-table-column prop="endTime" label="结束时间" width="180" />
    <el-table-column prop="status" label="状态">
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)">{{
          getStatus(scope.row.status)
        }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="execNum" label="执行次数" />
    <el-table-column prop="execTime" label="执行耗时（s）" />
    <el-table-column prop="result" label="执行结果" show-overflow-tooltip>
      <template #default="scope">
        <el-button
          type="primary"
          size="small"
          @click="seeDetial(scope.row.result)"
        >
          查看结果
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
