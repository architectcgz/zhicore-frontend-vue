<!--
  注册页面
  实现用户注册功能，包含表单验证、密码强度指示器、服务条款等功能
-->
<template>
  <div class="register-page min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
    <div class="max-w-md w-full space-y-8">
      <!-- 页面标题 -->
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          创建账户
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          加入我们的博客社区
        </p>
      </div>

      <!-- 注册表单 -->
      <div class="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg">
        <form
          class="space-y-6"
          @submit="onSubmit"
        >
          <!-- 用户名输入框 -->
          <div>
            <label
              for="username"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              用户名
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              autocomplete="username"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-colors',
                usernameError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="请输入用户名"
            >
            <p
              v-if="usernameError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ usernameError }}
            </p>
            <p
              v-else
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              用户名将作为您的唯一标识，3-20个字符，支持字母、数字、下划线
            </p>
          </div>

          <!-- 邮箱输入框 -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              邮箱地址
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :class="[
                'appearance-none relative block w-full px-3 py-2 border rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-colors',
                emailError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              ]"
              placeholder="请输入邮箱地址"
            >
            <p
              v-if="emailError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ emailError }}
            </p>
            <p
              v-else
              class="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              用于账户验证和找回密码
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
                autocomplete="new-password"
                :class="[
                  'appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-colors',
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
            
            <!-- 密码强度指示器 -->
            <div
              v-if="password"
              class="mt-2"
            >
              <div class="flex items-center space-x-2">
                <div class="flex-1">
                  <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      :class="[
                        'h-2 rounded-full transition-all duration-300',
                        passwordStrength.color
                      ]"
                      :style="{ width: `${passwordStrength.percentage}%` }"
                    />
                  </div>
                </div>
                <span :class="['text-xs font-medium', passwordStrength.textColor]">
                  {{ passwordStrength.text }}
                </span>
              </div>
              <div class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                <ul class="space-y-1">
                  <li :class="passwordChecks.length ? 'text-green-600 dark:text-green-400' : ''">
                    ✓ 至少8个字符
                  </li>
                  <li :class="passwordChecks.hasUpperCase ? 'text-green-600 dark:text-green-400' : ''">
                    ✓ 包含大写字母
                  </li>
                  <li :class="passwordChecks.hasLowerCase ? 'text-green-600 dark:text-green-400' : ''">
                    ✓ 包含小写字母
                  </li>
                  <li :class="passwordChecks.hasNumber ? 'text-green-600 dark:text-green-400' : ''">
                    ✓ 包含数字
                  </li>
                  <li :class="passwordChecks.hasSpecial ? 'text-green-600 dark:text-green-400' : ''">
                    ✓ 包含特殊字符
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 确认密码输入框 -->
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              确认密码
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :class="[
                  'appearance-none relative block w-full px-3 py-2 pr-10 border rounded-md placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm transition-colors',
                  confirmPasswordError ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                ]"
                placeholder="请再次输入密码"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg
                  v-if="showConfirmPassword"
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
              v-if="confirmPasswordError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ confirmPasswordError }}
            </p>
          </div>

          <!-- 服务条款同意复选框 -->
          <div>
            <div class="flex items-start">
              <input
                id="agreeToTerms"
                v-model="agreeToTerms"
                type="checkbox"
                :class="[
                  'h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1',
                  agreeToTermsError ? 'border-red-300' : ''
                ]"
              >
              <label
                for="agreeToTerms"
                class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                我已阅读并同意
                <a
                  href="/terms"
                  target="_blank"
                  class="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline"
                >
                  服务条款
                </a>
                和
                <a
                  href="/privacy"
                  target="_blank"
                  class="text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 underline"
                >
                  隐私政策
                </a>
              </label>
            </div>
            <p
              v-if="agreeToTermsError"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            >
              {{ agreeToTermsError }}
            </p>
          </div>

          <!-- 注册按钮 -->
          <div>
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              {{ isLoading ? '注册中...' : '创建账户' }}
            </button>
          </div>
        </form>

        <!-- 登录链接 -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            已有账户？
            <router-link
              to="/auth/login"
              class="font-medium text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            >
              立即登录
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 注册页面组件
 * 实现用户注册功能，包含表单验证、密码强度指示器、服务条款等功能
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
import { getErrorMessage } from '@/types/errors';
import type { RegisterRequest } from '@/types';

// 路由相关
const router = useRouter();

// 认证 Store
const authStore = useAuthStore();

// 表单状态
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 表单验证 Schema
const validationSchema = yup.object({
  username: yup
    .string()
    .required('请输入用户名')
    .min(3, '用户名至少3个字符')
    .max(20, '用户名不能超过20个字符')
    .matches(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  email: yup
    .string()
    .required('请输入邮箱地址')
    .email('请输入有效的邮箱地址')
    .max(100, '邮箱地址不能超过100个字符'),
  password: yup
    .string()
    .required('请输入密码')
    .min(8, '密码至少8个字符')
    .max(128, '密码不能超过128个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=#+\-_.,;:'"<>()\[\]{}|/\\~])[A-Za-z\d@$!%*?&=#+\-_.,;:'"<>()\[\]{}|/\\~]+$/, '密码必须包含大小写字母、数字和特殊字符'),
  confirmPassword: yup
    .string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '两次输入的密码不一致'),
  agreeToTerms: yup
    .boolean()
    .required('请同意服务条款')
    .oneOf([true], '请同意服务条款'),
});

// 使用 VeeValidate 表单验证
const { handleSubmit, errors, meta } = useForm({
  validationSchema,
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  },
});

// 表单字段
const { value: username } = useField<string>('username');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');
const { value: agreeToTerms } = useField<boolean>('agreeToTerms');

// 错误信息
const usernameError = computed(() => errors.value.username);
const emailError = computed(() => errors.value.email);
const passwordError = computed(() => errors.value.password);
const confirmPasswordError = computed(() => errors.value.confirmPassword);
const agreeToTermsError = computed(() => errors.value.agreeToTerms);

// 表单是否有效
const isFormValid = computed(() => meta.value.valid);

// 密码强度检查
const passwordChecks = computed(() => {
  const pwd = password.value || '';
  return {
    length: pwd.length >= 8,
    hasUpperCase: /[A-Z]/.test(pwd),
    hasLowerCase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecial: /[@$!%*?&=#+\-_.,;:'"<>()\[\]{}|/\\~]/.test(pwd),
  };
});

// 密码强度计算
const passwordStrength = computed(() => {
  const checks = passwordChecks.value;
  const score = Object.values(checks).filter(Boolean).length;
  
  if (score === 0) {
    return {
      percentage: 0,
      text: '很弱',
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
    };
  } else if (score <= 2) {
    return {
      percentage: 25,
      text: '弱',
      color: 'bg-red-400',
      textColor: 'text-red-600 dark:text-red-400',
    };
  } else if (score <= 3) {
    return {
      percentage: 50,
      text: '中等',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    };
  } else if (score <= 4) {
    return {
      percentage: 75,
      text: '强',
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
    };
  } else {
    return {
      percentage: 100,
      text: '很强',
      color: 'bg-green-500',
      textColor: 'text-green-600 dark:text-green-400',
    };
  }
});

/**
 * 处理表单提交
 */
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;

  try {
    const registerData: RegisterRequest = {
      username: values.username,
      email: values.email,
      password: values.password,
      confirmPassword: values.confirmPassword,
      agreeToTerms: values.agreeToTerms,
    };

    // 调用注册 API
    await authStore.register(registerData);

    // 注册成功提示
    ElMessage.success('注册成功！欢迎加入我们！');

    // 重定向到首页
    await router.push('/');
  } catch (error: unknown) {
    console.error('Registration failed:', error);
    
    // 显示错误信息
    const errorMessage = getErrorMessage(error);
    ElMessage.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
});

// 页面标题
document.title = '注册 - 博客系统';
</script>

<style scoped>
/* 自定义样式 */
.register-page {
  /* 背景渐变动画 */
  background: linear-gradient(-45deg, #10b981, #059669, #0d9488, #0f766e);
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
.dark .register-page {
  background: linear-gradient(-45deg, #1a1a1a, #2d2d2d, #065f46, #1f2937);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
}

/* 输入框聚焦动画 */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

/* 按钮悬停效果 */
button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 密码强度指示器动画 */
.password-strength-bar {
  transition: width 0.3s ease-in-out;
}

/* 复选框样式 */
input[type="checkbox"]:checked {
  background-color: #10b981;
  border-color: #10b981;
}

/* 链接悬停效果 */
a:hover {
  text-decoration: underline;
}
</style>