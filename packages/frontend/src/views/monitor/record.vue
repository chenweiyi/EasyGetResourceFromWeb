<script setup lang="ts">
import type { IMonitorRecord } from '@/api/monitor';
import JsonViewer from '@/components/JsonViewer.vue';

const loading = ref(false);
const data = ref<IMonitorRecord[]>([]);
const total = ref(0);
const current = ref(1);
const pageSize = ref(10);

const getStatus = (status: number) => {
  switch (status) {
    case 0:
      return '成功';
    case 1:
      return '失败';
  }
};

const getStatusType = (status: number) => {
  switch (status) {
    case 0:
      return 'success';
    case 1:
      return 'danger';
  }
};

const seeDetial = (result: string) => {
  ElMessageBox({
    title: '查看结果',
    message: h(JsonViewer, { result }),
    showConfirmButton: false,
    customClass: 'json-viewer-box',
  });
};

const query = async () => {
  try {
    loading.value = true;
    const res = await getMonitorRecord({
      current: current.value,
      pageSize: pageSize.value,
    });
    console.log('res:', res);
    data.value = res.list;
    total.value = res.total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  query();
});

watch(() => [pageSize.value, current.value], query);
</script>

<template>
  <div v-loading="loading">
    <el-table :data="data">
      <el-table-column prop="id" label="Id" width="70" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="taskIds" label="监控任务" show-overflow-tooltip>
        <template #default="scope">
          <el-tag
            v-for="(item, index) in scope.row.taskNames"
            :key="item"
            class="mr-4px"
          >
            {{ item }} [{{ scope.row.taskIds[index] }}]
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="结束时间" width="180" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)">{{
            getStatus(scope.row.status)
          }}</el-tag>
        </template>
      </el-table-column>
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
    <my-pagination
      :total="total"
      v-model:current="current"
      v-model:page-size="pageSize"
    />
  </div>
</template>

<style lang="less">
.el-message-box.json-viewer-box {
  --el-messagebox-width: 600px;
}
</style>
