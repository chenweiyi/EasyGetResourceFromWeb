<script setup lang="ts">
type IRecord = {
  id: number;
  taskId: number;
  url: string;
  startTime: string;
  endTime: string;
  status: number;
  execCount: number;
  execStatus: number;
  execTime: number;
  result: string;
  proxyOn: number;
};

const data = ref<IRecord[]>([]);

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

const getExecStatus = (status: number) => {
  switch (status) {
    case 1:
      return '正在执行';
    case 2:
      return '完成';
    case 3:
      return '等待';
    case 4:
      return '正在取消';
    case 5:
      return '取消成功';
    case 6:
      return '等待取消';
  }
};

const getProxyStatus = (proxyOn: number) => {
  return proxyOn === 1 ? '开启' : '未配置';
};

const getProxyStatusType = (proxyOn: number) => {
  return proxyOn === 1 ? 'success' : 'info';
};
</script>

<template>
  <el-table :data="data">
    <el-table-column prop="id" label="Id" />
    <el-table-column prop="taskId" label="任务Id" />
    <el-table-column prop="url" label="爬取地址" />
    <el-table-column prop="startTime" label="开始时间" />
    <el-table-column prop="endTime" label="结束时间" />
    <el-table-column prop="status" label="状态">
      <template #default="scope">
        <el-tag :type="getStatusType(scope.row.status)">{{
          getStatus(scope.row.status)
        }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="execCount" label="执行次数" />
    <el-table-column prop="execStatus" label="执行状态">
      <template #default="scope">
        <span>{{ getExecStatus(scope.row.execStatus) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="execTime" label="执行时间" />
    <el-table-column prop="result" label="执行结果">
      <template #default="scope">
        <div>{{ scope.row.result }}</div>
      </template>
    </el-table-column>
    <el-table-column prop="proxyOn" label="是否开启代理">
      <template #default="scope">
        <el-tag :type="getProxyStatusType(scope.row.proxyOn)">{{
          getProxyStatus(scope.row.proxyOn)
        }}</el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>
