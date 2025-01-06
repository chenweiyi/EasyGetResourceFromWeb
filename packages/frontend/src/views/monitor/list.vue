<script setup lang="ts">
import MonitorNew from '@/views/monitor/new.vue';

const taskData = ref<IMonitorData[]>([]);
const loading = ref(false);
const selectRow = ref<IMonitorData>();
const visible = ref(false);

const startMonitor = async (row: IMonitorData) => {
  if (row.status === 0) {
    ElMessage.error('监控单已删除');
    return;
  }
  if (row.status === 2) {
    ElMessage.error('监控单正在运行');
    return;
  }
  try {
    await execMonitorById(row.id);
  } catch (error) {
    console.error(error);
  }
};

const stopMonitor = async (row: IMonitorData) => {};

const editMonitor = (row: IMonitorData) => {
  selectRow.value = row;
  visible.value = true;
};

const deleteMonitor = (row: IMonitorData) => {
  ElMessageBox.confirm(`确认删除监控单「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteMonitorById(row.id);
      query();
    })
    .catch(() => {});
};

const query = async () => {
  try {
    loading.value = true;
    const data = await getMonitorList();
    taskData.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  visible.value = false;
  selectRow.value = undefined;
  query();
};

onMounted(() => {
  query();
});
</script>

<template>
  <div v-loading="loading">
    <el-table :data="taskData">
      <el-table-column type="expand">
        <template #default="scope">
          <div class="px-20px py-10px bg-slate-50">
            <el-form label-width="106px">
              <el-form-item label="创建时间">
                {{ scope.row.createTime }}
              </el-form-item>
              <el-form-item label="更新时间">
                {{ scope.row.updateTime }}
              </el-form-item>
              <el-form-item label="描述信息">
                {{ scope.row.descr }}
              </el-form-item>
              <el-form-item label="任务流程">
                {{ scope.row.taskFlow }}
              </el-form-item>
            </el-form>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="监控单名称" show-overflow-tooltip />
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
      <el-table-column prop="cronTime" label="定时规则" show-overflow-tooltip />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tooltip
            content="正在运行"
            v-if="scope.row.status === 2"
            placement="top"
          >
            <i-ep-video-play class="text-green" />
          </el-tooltip>
          <el-tooltip
            content="正常"
            v-else-if="scope.row.status === 1"
            placement="top"
          >
            <i-ep-select class="text-green" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="nextTime" label="下一次执行时间" width="180px" />
      <el-table-column label="操作" width="220px">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            v-if="scope.row.status === 1"
            @click="startMonitor(scope.row)"
          >
            启动
          </el-button>
          <el-button
            type="primary"
            size="small"
            v-if="scope.row.status === 2"
            @click="stopMonitor(scope.row)"
          >
            停止
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="editMonitor(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="small"
            @click="deleteMonitor(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      v-model="visible"
      title="编辑监控单"
      width="1100px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <MonitorNew v-if="selectRow" :id="selectRow.id" @close="closeModal" />
    </el-dialog>
  </div>
</template>
