<script setup lang="ts">
import MonitorNew from '@/views/monitor/new.vue';

type IMonitorDataWithLoading = IMonitorData & {
  loading: boolean;
};

const taskData = ref<IMonitorDataWithLoading[]>([]);
const loading = ref(false);
const selectRow = ref<IMonitorData>();
const visible = ref(false);

const startMonitor = async (row: IMonitorDataWithLoading) => {
  if (row.status === 0) {
    ElMessage.error('监控单已删除');
    return;
  }
  if (row.status === 3) {
    ElMessage.error('监控单正在运行');
    return;
  }
  try {
    row.loading = true;
    // await execTaskById(row.id);
  } catch (error) {
    console.error(error);
  } finally {
    row.loading = false;
  }
};

const editMonitor = (row: IMonitorDataWithLoading) => {
  selectRow.value = row;
  visible.value = true;
};

const deleteMonitor = (row: IMonitorDataWithLoading) => {
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
    taskData.value = data.map(d => ({
      ...d,
      loading: false,
    }));
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
      <el-table-column prop="taskIds" label="包含任务" show-overflow-tooltip />
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
      <el-table-column prop="updateTime" label="更新时间" width="180px" />
      <el-table-column label="操作" width="300px">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            :loading="scope.row.loading"
            :disabled="scope.row.loading"
            @click="startMonitor(scope.row)"
          >
            启动
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
      title="编辑任务"
      width="1100px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <MonitorNew v-if="selectRow" :id="selectRow.id" @close="closeModal" />
    </el-dialog>
  </div>
</template>
