<template>
  <div>
    <h1>PMS Login</h1>
    <el-form>
      <el-form-item label="Username">
        <el-input v-model="username" />
      </el-form-item>
      <el-form-item label="Password">
        <el-input type="password" v-model="password" />
      </el-form-item>
      <el-button type="primary" @click="handleLogin">Login</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useUserStore from '@/store/user'; // 使用 Pinia 的状态管理
import { useRouter } from 'vue-router'; // 使用 Vue Router 进行页面跳转

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const userStore = useUserStore();
const router = useRouter();

const handleLogin = async () => {
  try {
    await userStore.login({ username: username.value, password: password.value });
    // 处理成功登录
    await router.push({name: 'index'}); // 跳转到主页
  } catch (error) {
    errorMessage.value = error.message;
  }
};
</script>
