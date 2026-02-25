<!--
  登录页面
  实现用户登录功能，包含表单验证、记住我、忘记密码等功能
-->
<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- 页面标题 -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          欢迎回来
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          登录您的账户
        </p>
      </div>

      <!-- 登录表单 -->
      <div class="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
        <form
          class="space-y-6"
          @submit="onSubmit"
        >
          <!-- 用户名/邮箱输入框 -->
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              用户名或邮箱
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors',
                usernameError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="请输入用户名或邮箱"
            >
            <p
              v-if="usernameError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ usernameError }}
            </p>
          </div>

          <!-- 密码输入框 -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              密码
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                :class="[
                  'appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors',
                  passwordError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                ]"
                placeholder="请输入密码"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="showPassword"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464m1.414 1.414L8.464 8.464m5.656 5.656l1.415 1.415m-1.415-1.415l1.415 1.415M14.828 14.828L16.243 16.243"
                  />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <p
              v-if="passwordError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ passwordError }}
            </p>
          </div>

          <!-- 记住我和忘记密码 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label
                for="remember-me"
                class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                记住我
              </label>
            </div>

            <div class="text-sm">
              <router-link
                to="/auth/forgot-password"
                class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                忘记密码？
              </router-link>
            </div>
          </div>

          <!-- 登录按钮 -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span
                v-if="isLoading"
                class="absolute left-0 inset-y-0 flex items-center pl-3"
              >
                <svg
                  class="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </span>
              {{ isLoading ? '登录中...' : '登录' }}
            </button>
          </div>

          <!-- 社交登录 -->
          <div class="mt-6">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">或者使用</span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="handleSocialLogin('github')"
              >
                <svg
                  class="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span class="ml-2">GitHub</span>
              </button>

              <button
                type="button"
                class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                @click="handleSocialLogin('google')"
              >
                <svg
                  class="w-5 h-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span class="ml-2">Google</span>
              </button>
            </div>
          </div>
        </form>

        <!-- 注册链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            还没有账户？
            <router-link
              to="/auth/register"
              class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              立即注册
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页面组件
 * 实现用户登录功能，包含表单验证、记住我、社交登录等功能
 */

import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { getErrorMessage } from '@/types/errors';
import type { LoginRequest } from '@/types';

// 路由相关
const router = useRouter();
const route = useRoute();

// 认证 Store
const authStore = useAuthStore();

// 表单状态
const isLoading = ref(false);
const showPassword = ref(false);

// 表单验证 Schema
const validationSchema = yup.object({
  username: yup
    .string()
    .required('请输入用户名或邮箱')
    .min(3, '用户名至少3个字符')
    .max(50, '用户名不能超过50个字符'),
  password: yup
    .string()
    .required('请输入密码')
    .min(6, '密码至少6个字符')
    .max(128, '密码不能超过128个字符'),
  rememberMe: yup.boolean().default(false),
});

// 使用 VeeValidate 表单验证
const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    username: '',
    password: '',
    rememberMe: false,
  },
});

// 表单字段
const { value: username } = useField<string>('username');
const { value: password } = useField<string>('password');
const { value: rememberMe } = useField<boolean>('rememberMe');

// 错误信息
const usernameError = computed(() => errors.value.username);
const passwordError = computed(() => errors.value.password);

/**
 * 处理表单提交
 */
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;

  try {
    const loginData: LoginRequest = {
      username: values.username,
      password: values.password,
      rememberMe: values.rememberMe,
    };

    // 调用登录 API
    await authStore.login(loginData);

    // 登录成功提示
    ElMessage.success('登录成功！');

    // 重定向到目标页面或首页
    const redirectTo = (route.query.redirect as string) || '/';
    await router.push(redirectTo);
  } catch (error: unknown) {
    console.error('Login failed:', error);
    
    // 显示错误信息
    const errorMessage = getErrorMessage(error);
    ElMessage.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
});

/**
 * 处理社交登录
 * @param provider 登录提供商
 */
const handleSocialLogin = (provider: 'github' | 'google') => {
  // 这里只是 UI 实现，实际的社交登录需要后端支持
  ElMessage.info(`${provider === 'github' ? 'GitHub' : 'Google'} 登录功能暂未开放`);
  
  // 实际实现时，可以重定向到对应的 OAuth 授权页面
  // window.location.href = `/api/v1/auth/oauth/${provider}`;
};

// 页面标题
document.title = '登录 - 博客系统';
</script>

<style scoped>
/* 自定义样式 */
.login-page {
  /* 背景渐变动画 */
  background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}

@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 深色模式下的背景 */
.dark .login-page {
  background: linear-gradient(-45deg, #1a1a1a, #2d2d2d, #1e3a8a, #1f2937);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}

/* 输入框聚焦动画 */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* 按钮悬停效果 */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 社交登录按钮悬停效果 */
button[type="button"]:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>