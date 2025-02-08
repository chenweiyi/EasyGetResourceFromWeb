<script setup lang="ts">
const props = defineProps<{
  id?: number;
}>();

const emit = defineEmits(['close', 'updated']);

const router = useRouter();
const form = ref<ITaskType & { execTotalNum?: number }>({
  name: '',
  url: '',
  enableProxy: 0,
  retryNum: undefined,
  descr: '',
  fields: [
    {
      key: '',
      value: '',
      access: 'innerText',
      accessArgs: '',
      type: 'string',
      unit: '',
      code: undefined,
    },
  ],
  loadDelayTime: '',
});

const rules = ref({
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入爬取地址', trigger: 'blur' }],
  enableProxy: [
    { required: true, message: '请选择是否开启代理', trigger: 'blur' },
  ],
});

const fieldsRules = ref({
  key: [{ required: true, message: '请输入字段名称', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字段值', trigger: 'blur' }],
  type: [{ required: true, message: '请选择字段类型', trigger: 'blur' }],
  access: [{ required: true, message: '请选择访问方式', trigger: 'change' }],
  accessArgs: [{ required: true, message: '请选择访问参数', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入字段单位', trigger: 'blur' }],
});

const formRef = ref<FormInstance>();
const loading = ref(false);
const cache = ref(JSON.stringify(form.value));
const changed = ref(false);

const addFields = () => {
  form.value.fields.push({
    key: '',
    value: '',
    access: 'innerText',
    accessArgs: '',
    type: 'string',
    unit: '',
    code: undefined,
  });
};

const typeOptions = ref([
  { label: '数字', value: 'number' },
  { label: '字符串', value: 'string' },
  { label: '列表', value: 'list' },
]);

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
          await updateTaskById({
            id: props.id,
            name: form.value.name,
            url: form.value.url,
            enableProxy: form.value.enableProxy,
            fields: form.value.fields,
            descr: form.value.descr,
            retryNum: form.value.retryNum == null ? 2 : +form.value.retryNum,
            loadDelayTime: form.value.loadDelayTime || undefined,
          });
          ElMessage.success('更新成功');
          emit('updated');
          emit('close');
        } else {
          await addNewTask({
            name: form.value.name,
            url: form.value.url,
            enableProxy: form.value.enableProxy,
            fields: form.value.fields,
            descr: form.value.descr,
            retryNum: form.value.retryNum == null ? 2 : +form.value.retryNum,
            loadDelayTime: form.value.loadDelayTime || undefined,
          });
          ElMessage.success('添加成功');
          router.push({
            name: 'task-list',
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

const reset = () => {
  if (!formRef.value) return;
  formRef.value.resetFields();
};

const query = async () => {
  if (!props.id) return;
  try {
    loading.value = true;
    const task = await getTaskById(props.id);
    console.log('task:', task);
    form.value = task[0];
    cache.value = JSON.stringify(task[0]);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
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
        <el-form-item label="任务名称" class="w-400px" prop="name">
          <el-input v-model="form.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务描述" class="w-400px" prop="descr">
          <el-input v-model="form.descr" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="爬取地址" class="w-400px" prop="url">
          <template #label>
            <div class="flex items-center">
              <span class="mr-4px">爬取地址</span>
              <el-tooltip content="执行后不允许修改" placement="top">
                <i-ep-info-filled class="text-gray-400 w-16px h-16px" />
              </el-tooltip>
            </div>
          </template>
          <el-input
            v-model="form.url"
            placeholder="请输入爬取地址"
            :disabled="!!props.id && form.execTotalNum! > 0"
          />
        </el-form-item>
        <el-form-item label="最大重试次数" class="w-400px" prop="retryNum">
          <el-input
            v-model="form.retryNum"
            placeholder="请输入重试次数, 默认为2"
            type="number"
          />
        </el-form-item>
        <el-form-item label="延迟加载时间" class="w-400px" prop="loadDelayTime">
          <el-input
            v-model="form.loadDelayTime"
            placeholder="请输入延迟加载时间, 单位毫秒"
            type="number"
          />
        </el-form-item>
        <el-form-item label="是否开启代理" class="w-400px" prop="enableProxy">
          <el-radio-group v-model="form.enableProxy">
            <el-radio :value="0">否</el-radio>
            <el-radio :value="1">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字段设置" prop="fields" class="special-field">
          <template #label>
            <div class="flex items-center">
              <span class="mr-4px">字段设置</span>
              <el-tooltip content="执行后不允许修改" placement="top">
                <i-ep-info-filled class="text-gray-400 w-16px h-16px" />
              </el-tooltip>
            </div>
          </template>
          <el-table class="my-table" :data="form.fields">
            <el-table-column
              prop="key"
              label="字段名称"
              width="150"
              fixed="left"
            >
              <template #header>
                <span class="text-red-500 mr-4px">*</span>
                <span>字段名称</span>
              </template>
              <template #default="scope">
                <el-form-item
                  :rules="fieldsRules.key"
                  :prop="'fields.' + scope.$index + '.key'"
                >
                  <el-input
                    v-model="scope.row.key"
                    placeholder="请输入字段名称"
                    clearable
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="字段类型"
              width="140"
              fixed="left"
            >
              <template #header>
                <span class="text-red-500 mr-4px">*</span>
                <span>字段类型</span>
              </template>
              <template #default="scope">
                <el-form-item
                  :rules="fieldsRules.type"
                  :prop="'fields.' + scope.$index + '.type'"
                >
                  <el-select
                    v-model="scope.row.type"
                    placeholder="请选择字段类型"
                    clearable
                  >
                    <el-option
                      v-for="item in typeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="unit" label="字段单位" width="140">
              <template #default="scope">
                <el-form-item>
                  <el-input
                    v-model="scope.row.unit"
                    placeholder="请输入字段单位"
                    clearable
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="字段值" width="140">
              <template #default="scope">
                <el-form-item
                  :rules="
                    ['number', 'string'].includes(scope.row.type)
                      ? fieldsRules.value
                      : {}
                  "
                  :prop="'fields.' + scope.$index + '.value'"
                >
                  <el-input
                    v-model="scope.row.value"
                    placeholder="请输入字段值"
                    clearable
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="access" label="字段访问方式" width="160">
              <template #default="scope">
                <el-form-item
                  :rules="
                    ['number', 'string'].includes(scope.row.type)
                      ? fieldsRules.access
                      : {}
                  "
                  :prop="'fields.' + scope.$index + '.access'"
                >
                  <el-select
                    v-model="scope.row.access"
                    placeholder="请选择访问方式"
                    clearable
                  >
                    <el-option label="innerText" value="innerText"></el-option>
                    <el-option label="attr" value="attr"></el-option>
                  </el-select>
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="accessArgs" label="访问参数" width="140">
              <template #default="scope">
                <el-form-item
                  :rules="
                    scope.row.access === 'attr' ? fieldsRules.accessArgs : {}
                  "
                  :prop="'fields.' + scope.$index + '.accessArgs'"
                >
                  <el-input
                    v-model="scope.row.accessArgs"
                    placeholder="请输入访问参数"
                    clearable
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column prop="code" label="代码实现" width="200">
              <template #default="scope">
                <el-form-item>
                  <el-input
                    v-model="scope.row.code"
                    placeholder="请输入代码实现"
                    type="textarea"
                    clearable
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="form.fields.splice(scope.$index, 1)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-button
            class="mt-20px"
            type="primary"
            size="small"
            @click="addFields"
          >
            添加字段
          </el-button>
          <div
            v-if="props.id && form.execTotalNum! > 0"
            class="absolute z-10 w-full h-full bg-[rgba(0,0,0,0.5)] hover:cursor-not-allowed"
          ></div>
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

.special-field {
  :deep(.el-form-item__content) {
    position: relative;
  }
}
</style>
