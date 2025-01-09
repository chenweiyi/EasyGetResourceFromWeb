<script setup lang="ts">
import TaskNew from '@/views/task/new.vue';
import JsonViewer from '@/components/JsonViewer.vue';
import type { ITaskData } from '@/api/task';

const taskData = ref<ITaskData[]>([]);
const loading = ref(false);
const selectRow = ref<ITaskData>();
const visible = ref(false);
const total = ref(0);
const current = ref(1);
const pageSize = ref(10);

const startTask = async (row: ITaskData) => {
  if (row.status === 0) {
    ElMessage.error('任务已删除');
    return;
  }
  if (row.status === 3) {
    ElMessage.error('任务正在运行');
    return;
  }
  try {
    row.status = 3;
    await execTaskById(row.id);
    await query();
  } catch (error) {
    console.error(error);
  }
};

const editTask = (row: ITaskData) => {
  selectRow.value = row;
  visible.value = true;
};

const copyTask = async (row: ITaskData) => {
  try {
    await copyTaskById(row.id);
    await query();
  } catch (error) {
    console.error(error);
  }
};

const deleteTask = (row: ITaskData) => {
  ElMessageBox.confirm(`确认删除任务「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      console.log('delete');
      await deleteTaskById(row.id);
      query();
    })
    .catch(() => {});
};

const seeCode = (code?: string) => {
  if (!code) return;
  ElMessageBox({
    title: '查看代码',
    message: h(JsonViewer, { result: code, type: 'js' }),
    showConfirmButton: false,
    customClass: 'json-viewer-box',
  });
};

const query = async () => {
  try {
    loading.value = true;
    const data = await getTaskList({
      current: current.value,
      pageSize: pageSize.value,
    });
    taskData.value = data.list;
    total.value = data.total;
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

watch(() => [pageSize.value, current.value], query);
</script>

<template>
  <div v-loading="loading">
    <el-table :data="taskData">
      <el-table-column type="expand">
        <template #default="scope">
          <div class="px-20px py-10px bg-slate-50">
            <el-form label-width="106px">
              <el-form-item label="爬取地址">
                {{ scope.row.url }}
              </el-form-item>
              <el-form-item label="描述信息">
                {{ scope.row.descr }}
              </el-form-item>
              <el-form-item label="创建时间">
                {{ scope.row.createTime }}
              </el-form-item>
              <el-form-item label="最大重试次数">
                {{ scope.row.retryNum }}
              </el-form-item>
              <el-form-item label="执行总次数">
                {{ scope.row.execTotalNum }}
              </el-form-item>
              <el-form-item label="字段设置">
                <el-table :data="scope.row.fields">
                  <el-table-column
                    prop="key"
                    label="字段名称"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="type" label="字段类型" />
                  <el-table-column prop="unit" label="字段单位" />
                  <el-table-column
                    prop="value"
                    label="字段值"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="access" label="字段访问方式" />
                  <el-table-column
                    prop="accessArgs"
                    label="访问参数"
                    show-overflow-tooltip
                  />
                  <el-table-column prop="code" label="代码实现">
                    <template #default="scope">
                      <el-button
                        type="primary"
                        size="small"
                        v-if="scope.row.code"
                        @click="seeCode(scope.row.code)"
                      >
                        查看代码
                      </el-button>
                      <span v-else> - </span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-form>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="任务名称" show-overflow-tooltip>
        <template #default="scope">
          <span>{{ scope.row.name }}</span>
          <span class="ml-4px">[{{ scope.row.id }}]</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tooltip
            content="正在运行"
            v-if="scope.row.status === 3"
            placement="top"
          >
            <i-ep-video-play class="text-blue" />
          </el-tooltip>
          <el-tooltip
            content="暂停中"
            v-else-if="scope.row.status === 2"
            placement="top"
          >
            <i-ep-video-pause class="text-yellow" />
          </el-tooltip>
          <el-tooltip
            content="正常"
            v-else-if="scope.row.status === 1"
            placement="top"
          >
            <i-ep-select class="text-green" />
          </el-tooltip>
          <el-tooltip
            content="有错误"
            v-else-if="scope.row.status === 4"
            placement="top"
          >
            <i-ep-warning-filled class="text-red" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="enableProxy" label="是否开启代理" width="130">
        <template #default="scope">
          <el-switch
            v-model="scope.row.enableProxy"
            :active-value="1"
            :inactive-value="0"
            inline-prompt
            active-text="ON"
            inactive-text="OFF"
            disabled
          />
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="180" />
      <el-table-column prop="lastExecTime" label="最近执行时间" width="180" />
      <el-table-column label="操作" width="300">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            :loading="scope.row.status === 3"
            :disabled="scope.row.status === 3"
            @click="startTask(scope.row)"
          >
            启动
          </el-button>
          <el-button type="primary" size="small" @click="editTask(scope.row)">
            编辑
          </el-button>
          <el-button type="primary" size="small" @click="copyTask(scope.row)">
            复制
          </el-button>
          <el-button type="danger" size="small" @click="deleteTask(scope.row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <my-pagination
      :total="total"
      v-model:current="current"
      v-model:page-size="pageSize"
    />
    <el-dialog
      v-model="visible"
      title="编辑任务"
      width="1100px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
    >
      <TaskNew
        v-if="selectRow"
        :id="selectRow.id"
        @close="closeModal"
        @updated="query()"
      />
    </el-dialog>
  </div>
</template>
