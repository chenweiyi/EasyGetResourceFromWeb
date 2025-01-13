<script setup lang="ts">
import { ClickOutside as vClickOutside } from 'element-plus';
const props = defineProps<{
  id?: number;
}>();

type IMonitorFormType = Omit<IMonitorType, 'cronTime'> & {
  cronTimeStamp: string;
  cronRuleTime: string;
  execTotalNum: number;
  cronType: string;
};

const emit = defineEmits(['close']);

const router = useRouter();
const form = ref<IMonitorFormType>({
  name: '',
  descr: '',
  taskIds: [],
  taskFlow: '',
  execTotalNum: 0,
  cronTimeStamp: '',
  cronRuleTime: '',
  cronType: 'cron',
});

const rules = ref({
  name: [{ required: true, message: '请输入监控单名称', trigger: 'blur' }],
  taskIds: [{ required: true, message: '请选择任务', trigger: 'change' }],
  taskFlow: [{ required: true, message: '请输入任务流程', trigger: 'blur' }],
  cronType: [{ required: true, message: '请选择时间类型', trigger: 'change' }],
  cronTimeStamp: [
    {
      validator: (
        rule: any,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        if (form.value.cronType === 'specific' && !value) {
          callback(new Error('请选择时间'));
        } else {
          callback();
        }
      },
      trigger: 'change',
    },
    {
      asyncValidator: async (rule: any, value: string) => {
        try {
          await judgeCronTime(
            { cronTime: dayjs(value).valueOf() + '' },
            {
              notAlertWhenError: 1,
            },
          );
        } catch (error) {
          throw new Error((error as { msg: string }).msg);
        }
      },
      trigger: 'change',
    },
  ],
  cronRuleTime: [
    {
      validator: (
        rule: any,
        value: string,
        callback: (error?: Error) => void,
      ) => {
        if (form.value.cronType === 'cron' && !value) {
          callback(new Error('请填写时间规则'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
    {
      asyncValidator: async (rule: any, value: string) => {
        try {
          await judgeCronTime(
            { cronTime: value },
            {
              notAlertWhenError: 1,
            },
          );
        } catch (error) {
          throw new Error((error as { msg: string }).msg);
        }
      },
      trigger: 'blur',
    },
  ],
});

const cronTypeOptions = ref([
  { label: '时间点', value: 'specific' },
  { label: 'cron规则', value: 'cron' },
]);

const formRef = ref<FormInstance>();
const loading = ref(false);
const tasks = ref<ITaskData[]>([]);
const cache = ref(JSON.stringify(form.value));
const changed = ref(false);
const nextTimes = ref<string[]>([]);
const seeNextTimesRef = ref();
const poppoverRef = ref();
const execTimeLoading = ref(false);

const getTasks = async () => {
  try {
    const res = await getTaskList({
      current: 1,
      pageSize: 1000,
    });
    tasks.value = res.list;
  } catch (error) {
    console.error(error);
    tasks.value = [];
  }
};

const handleTaskChange = (val: string[]) => {
  form.value.taskFlow = JSON.stringify(val);
};

const getCronTime = () => {
  if (form.value.cronType === 'cron') {
    return form.value.cronRuleTime;
  } else if (form.value.cronType === 'specific') {
    return dayjs(form.value.cronTimeStamp).valueOf();
  }
  return '';
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
            cronTime: getCronTime(),
          });
          ElMessage.success('更新成功');
          emit('close');
        } else {
          await addNewMonitor({
            name: form.value.name,
            descr: form.value.descr,
            taskIds: form.value.taskIds,
            taskFlow: form.value.taskFlow,
            cronTime: getCronTime(),
          });
          ElMessage.success('添加成功');
          router.push({
            name: 'monitor-list',
          });
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

const seeNextTimes = async () => {
  if (!form.value.cronRuleTime) return;
  try {
    execTimeLoading.value = true;
    nextTimes.value = [];
    await sleep();
    const res = await getCronExecTimes({
      cronTime: form.value.cronRuleTime,
      next: 10,
    });
    nextTimes.value = res || [];
  } catch (error) {
    nextTimes.value = [];
  } finally {
    execTimeLoading.value = false;
  }
};

const onClickOutside = () => {
  unref(poppoverRef).popperRef?.delayHide?.();
};

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
    const cronTime = monitor[0].cronTime;
    const isCronRuleType = isNaN(Number(cronTime));
    form.value = {
      ...monitor[0],
      cronType: !isCronRuleType ? 'specific' : 'cron',
      cronRuleTime: isCronRuleType ? monitor[0].cronTime : '',
      cronTimeStamp: !isCronRuleType
        ? dayjs(+monitor[0].cronTime).format('YYYY-MM-DD HH:mm:ss')
        : '',
    };
    cache.value = JSON.stringify(form.value);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await getTasks();
  if (props.id) {
    query();
  }
});

watch(
  form,
  val => {
    if (!props.id) {
      return;
    }
    if (JSON.stringify(val) !== cache.value) {
      changed.value = true;
    } else {
      changed.value = false;
    }
  },
  {
    deep: true,
  },
);
</script>

<template>
  <div class="flex flex-col" v-loading="loading">
    <div class="flex justify-end">
      <el-button
        type="primary"
        v-if="props.id"
        :disabled="loading || !changed"
        @click="submit"
        >更新</el-button
      >
      <el-button type="primary" v-else :disabled="loading" @click="submit"
        >添加</el-button
      >
      <el-button
        type="danger"
        :disabled="loading"
        @click="reset"
        v-if="!props.id"
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
          <template #label>
            <div class="flex items-center">
              <span class="mr-4px">选择任务</span>
              <el-tooltip content="执行后不允许修改" placement="top">
                <i-ep-info-filled class="text-gray-400 w-16px h-16px" />
              </el-tooltip>
            </div>
          </template>
          <el-select
            v-model="form.taskIds"
            placeholder="请选择任务"
            clearable
            multiple
            :disabled="!!props.id && form.execTotalNum! > 0"
            @change="handleTaskChange"
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
          <template #label>
            <div class="flex items-center">
              <span class="mr-4px">任务流程</span>
              <el-tooltip content="执行后不允许修改" placement="top">
                <i-ep-info-filled class="text-gray-400 w-16px h-16px" />
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-model="form.taskFlow"
            placeholder="[1,2,3]表示任务1,2,3串行执行；[1,[2,3],4]表示任务1,[2,3],4串行执行，任务2,3并行执行"
            :disabled="!!props.id && form.execTotalNum! > 0"
          />
        </el-form-item>
        <el-form-item label="执行时间" class="w-700px" prop="cronTime">
          <template #label>
            <div class="flex items-center">
              <span class="mr-4px">执行时间</span>
              <el-tooltip
                content="cron规则参考 https://crontab.guru/"
                placement="top"
              >
                <i-ep-info-filled class="text-gray-400 w-16px h-16px" />
              </el-tooltip>
            </div>
          </template>
          <div class="flex items-center w-full">
            <el-form-item prop="cronType" class="w-150px! mr-12px">
              <el-select
                placeholder="请选择时间类型"
                v-model="form.cronType"
                clearable
              >
                <el-option
                  v-for="item in cronTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item
              prop="cronRuleTime"
              class="flex-1 flex"
              v-if="form.cronType === 'cron'"
            >
              <el-input
                class="flex-1 mr-8px"
                v-model="form.cronRuleTime"
                placeholder="cron时间规则: 秒 分 时 日 月 周，秒可不指定。"
              />

              <el-button
                ref="seeNextTimesRef"
                type="primary"
                size="small"
                v-click-outside="onClickOutside"
                :disabled="!form.cronRuleTime || execTimeLoading"
                @click="seeNextTimes"
                >查看执行时间</el-button
              >
            </el-form-item>
            <el-form-item
              prop="cronTimeStamp"
              class="flex-1"
              v-if="form.cronType === 'specific'"
            >
              <el-date-picker
                class="w-full!"
                v-model="form.cronTimeStamp"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="datetime"
                placeholder="请选择时间点"
              />
            </el-form-item>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <el-popover
      ref="poppoverRef"
      placement="top"
      width="200"
      trigger="click"
      virtual-triggering
      :virtual-ref="seeNextTimesRef"
    >
      <div
        class="min-h-100px next-times flex flex-wrap items-center"
        v-loading="execTimeLoading"
      >
        <div
          v-for="(time, index) in nextTimes"
          :key="index"
          class="mr-12px text-gray-500"
        >
          {{ index + 1 }}. {{ time }}
        </div>
      </div>
    </el-popover>
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
