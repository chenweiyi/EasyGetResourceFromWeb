<script setup lang="ts">
import WhiteBoard from '@/layouts/WhiteBoard.vue';

const formRef = ref();
const form = ref({
  email: '',
  password: '',
});
const loading = ref(false);
const router = useRouter();

const validateEmail = (
  rule: any,
  value: string,
  callback: (error?: Error) => void,
) => {
  // 验证是否为邮箱
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return reg.test(value.trim())
    ? callback()
    : callback(new Error('请输入正确的邮箱'));
};

const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      required: true,
      message: '密码长度不能小于6位',
      trigger: 'blur',
      min: 6,
    },
  ],
});

const submit = async () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        loading.value = true;
        await login({
          email: form.value.email,
          password: form.value.password,
        });
        const store = useUserStore();
        const res = await getUserInfo();
        store.setUserInfo(res);
        ElMessage.success('登录成功');
        router.push({
          name: 'task',
        });
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

const register = () => {
  router.push({
    name: 'register',
  });
};

const findPassword = () => {
  router.push({
    name: 'findpassword',
  });
};
</script>

<template>
  <WhiteBoard>
    <div class="bg min-w-1300px">
      <div class="login-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
          <el-form-item label="邮箱地址" prop="email">
            <el-input
              v-model="form.email"
              placeholder="请输入邮箱地址"
              autocomplete="off"
              clearable
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              show-password
              autocomplete="new-password"
              clearable
            />
          </el-form-item>
          <el-form-item class="mt-40px">
            <el-button
              type="primary"
              class="flex-1"
              :loading="loading"
              :disabled="loading"
              @click="submit"
              >登录</el-button
            >
            <el-button type="success" @click="register" class="60px"
              >注册</el-button
            >
          </el-form-item>
          <div class="flex justify-end items-center">
            <span class="text-gray-400 text-12px">忘记密码？</span>
            <el-button
              link
              type="primary"
              size="small"
              class="pl-2px! pr-0!"
              @click="findPassword"
              >找回密码</el-button
            >
          </div>
        </el-form>
      </div>
    </div>
  </WhiteBoard>
</template>

<style scoped lang="less">
.bg {
  background: url('../assets/login-bg.jpg') no-repeat center center;
  background-size: cover;
  height: 100vh;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    filter: blur(3px); // 背景虚化效果
    z-index: 1;
  }

  .login-form {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    padding: 40px;
    padding-bottom: 20px;
    background: rgba(255, 255, 255, 0.8);
    border: 0;
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
