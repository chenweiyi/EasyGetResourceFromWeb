<script setup lang="ts">
import WhiteBoard from '@/layouts/WhiteBoard.vue';
import { v4 as uuid } from 'uuid';

const router = useRouter();
const formRef = ref();
const form = ref({
  email: '',
  code: '',
  password: '',
});
const uid = ref('');
const countDown = ref<number>();
const codeLoading = ref(false);
const registerLoading = ref(false);
const validEmail = ref(false);

let timer: ReturnType<typeof setInterval> | undefined = undefined;

const validateEmail = (
  rule: any,
  value: string,
  callback: (error?: Error) => void,
) => {
  // 验证是否为邮箱
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (reg.test(value.trim())) {
    validEmail.value = true; // 邮箱验证通过，设置 validEmail 为 true
    callback();
  } else {
    validEmail.value = false; // 邮箱验证不通过，设置 validEmail 为 false
    callback(new Error('请输入正确的邮箱'));
  }
};

const rules = reactive({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    {
      required: true,
      message: '需要4位验证码',
      trigger: 'blur',
      min: 4,
      max: 4,
    },
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

const getValidCode = async () => {
  uid.value = uuid();
  clearInterval(timer);
  codeLoading.value = true;
  try {
    await getEmailVerifyCode({
      email: form.value.email,
      uid: uid.value,
      type: 'register',
    });
    countDown.value = 60;
    timer = setInterval(() => {
      if (countDown.value! > 0) {
        countDown.value! -= 1;
      } else {
        countDown.value = undefined;
      }
    }, 1000);
  } catch (e) {
  } finally {
    codeLoading.value = false;
  }
};

const register = async () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      registerLoading.value = true;
      try {
        await registerUser({
          email: form.value.email,
          password: form.value.password,
          code: form.value.code,
          uid: uid.value,
        });
        ElMessage.success('注册成功');
        router.push({
          name: 'login',
        });
      } catch (e) {
        form.value.code = '';
      } finally {
        registerLoading.value = false;
      }
    }
  });
};

const login = () => {
  router.push({
    name: 'login',
  });
};
</script>

<template>
  <WhiteBoard>
    <div class="bg min-w-1300px">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="login-form"
      >
        <el-form-item label="邮箱地址" prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱地址"
            clearable
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item label="验证码" prop="code">
          <el-input
            class="flex-1"
            v-model="form.code"
            placeholder="请输入验证码"
            show-code
            clearable
          />
          <el-button
            class="ml-12px"
            type="primary"
            @click="getValidCode"
            :disabled="countDown != undefined || codeLoading || !validEmail"
          >
            <span>获取验证码</span>
            <span class="ml-2px" v-if="countDown! > 0">{{ countDown! }}</span>
          </el-button>
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
            :disabled="registerLoading"
            @click="register"
            >注册</el-button
          >
        </el-form-item>
        <div class="flex justify-end items-center">
          <span class="text-gray-400 text-12px">已有账号？去</span>
          <el-button
            link
            type="primary"
            size="small"
            class="pl-2px! pr-0!"
            @click="login"
            >登录</el-button
          >
        </div>
      </el-form>
    </div>
  </WhiteBoard>
</template>

<style scoped lang="less">
.bg {
  background: url('../assets/register-bg.jpg') no-repeat center center;
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
    filter: blur(1px); // 背景虚化效果
    z-index: 1;
  }

  .login-form {
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 450px;
    padding: 40px;
    padding-bottom: 20px;
    background: rgba(250, 250, 250, 0.9);
    border-radius: 10px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
