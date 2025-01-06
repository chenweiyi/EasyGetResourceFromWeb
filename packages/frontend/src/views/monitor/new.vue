<script setup lang="ts">
const props = defineProps<{
  id?: number;
}>();

const emit = defineEmits(['close']);

const form = ref<IMonitorType>({
  name: '',
  descr: '',
  taskIds: [],
  taskFlow: '',
  cronTime: '',
});

const rules = ref({
  name: [{ required: true, message: '请输入监控单名称', trigger: 'blur' }],
  taskIds: [{ required: true, message: '请选择任务', trigger: 'change' }],
  cronTime: [{ required: true, message: '请选择执行时间', trigger: 'blur' }],
  taskFlow: [{ required: true, message: '请输入任务流程', trigger: 'blur' }],
});

const formRef = ref<FormInstance>();
const loading = ref(false);
const tasks = ref<ITaskData[]>([]);

const getTasks = async () => {
  try {
    tasks.value = await getTaskList();
  } catch (error) {
    console.error(error);
    tasks.value = [];
  }
};

const submit = async () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid, fields) => {
    console.log('valid:', valid);
    console.log('fields:', fields);
    if (valid) {
      console.log('submit...');
      try {
        loading.value = true;
        if (props.id) {
          await updateMonitorById({
            id: props.id,
            name: form.value.name,
            descr: form.value.descr,
            taskIds: form.value.taskIds,
            taskFlow: form.value.taskFlow,
            cronTime: form.value.cronTime,
          });
          ElMessage.success('更新成功');
          emit('close');
        } else {
          await addNewMonitor({
            name: form.value.name,
            descr: form.value.descr,
            taskIds: form.value.taskIds,
            taskFlow: form.value.taskFlow,
            cronTime: form.value.cronTime,
          });
          ElMessage.success('添加成功');
        }
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    } else {
      console.log('error submit...');
    }
  });
};

const editTaskFlow = () => {};

const reset = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

const query = async () => {
  if (!props.id) return;
  try {
    loading.value = true;
    const monitor = await getMonitorById(props.id);
    console.log('monitor:', monitor);
    form.value = monitor[0];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getTasks();
  if (props.id) {
    query();
  }
});
</script>

<template>
  <div class="flex flex-col" v-loading="loading">
    <div class="flex justify-end">
      <el-button type="primary" :disabled="loading" @click="submit">{{
        props.id ? '更新' : '添加'
      }}</el-button>
      <el-button type="danger" :disabled="loading" @click="reset"
        >重置</el-button
      >
    </div>
    <div class="max-h-600px overflow-y-auto mb-30px mt-12px">
      <el-form
        ref="formRef"
        class="my-form w-full"
        label-width="120px"
        :model="form"
        :rules="rules"
      >
        <el-form-item label="监控单名称" class="w-400px" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入监控单名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="描述信息" class="w-400px" prop="descr">
          <el-input
            v-model="form.descr"
            placeholder="请输入描述信息"
            clearable
          />
        </el-form-item>
        <el-form-item label="选择任务" class="w-400px" prop="taskIds">
          <el-select
            v-model="form.taskIds"
            placeholder="请选择任务"
            clearable
            multiple
          >
            <el-option
              v-for="item in tasks"
              :key="item.id"
              :label="`${item.name} [${item.id}]`"
              :value="item.id"
            >
              <span class="mr-8px">{{ item.id }}</span>
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="任务流程" class="w-700px" prop="taskFlow">
          <el-input
            v-model="form.taskFlow"
            placeholder="[1,2,3]表示任务1,2,3串行执行；[1,[2,3],4]表示任务1,[2,3],4串行执行，任务2,3并行执行"
          />
        </el-form-item>
        <el-form-item label="执行时间" class="w-400px" prop="cronTime">
          <el-input v-model="form.cronTime" placeholder="秒 分 时 日 月 周" />
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="less" scoped>
.my-table {
  :deep(.el-table__body .cell) {
    overflow-y: auto;
    height: 80px;
    position: relative;
  }

  :deep(.el-table__body .cell .el-form-item),
  :deep(.el-table__body .cell .el-button) {
    margin-top: 20px;
  }
}
</style>
