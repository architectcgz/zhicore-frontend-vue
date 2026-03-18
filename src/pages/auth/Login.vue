<!--
  登录页面
  实现用户登录功能，包含表单验证、记住我、忘记密码等功能
-->

<template>
  <div class="login-page">
    <section class="login-card surface-panel">
      <div class="login-card__header">
        <span class="login-card__eyebrow">账号登录</span>
        <h2 class="login-card__title">
          欢迎回来
        </h2>
        <p class="login-card__subtitle">
          登录您的账户，继续浏览内容流、草稿和个人主页。
        </p>

        <div class="login-card__signal-row">
          <span class="login-card__signal">内容流同步</span>
          <span class="login-card__signal">草稿自动保存</span>
          <span class="login-card__signal">个人主页管理</span>
        </div>
      </div>

      <form
        class="login-form"
        @submit="onSubmit"
      >
        <div class="login-form__field">
          <label
            for="username"
            class="login-form__label"
          >
            用户名或邮箱
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            :class="[
              'login-form__input',
              usernameError ? 'login-form__input--error' : ''
            ]"
            placeholder="请输入用户名或邮箱"
          >
          <p
            v-if="usernameError"
            class="login-form__error"
          >
            {{ usernameError }}
          </p>
        </div>

        <div class="login-form__field">
          <label
            for="password"
            class="login-form__label"
          >
            密码
          </label>
          <div class="login-form__password-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              :class="[
                'login-form__input login-form__input--password',
                passwordError ? 'login-form__input--error' : ''
              ]"
              placeholder="请输入密码"
            >
            <button
              type="button"
              class="login-form__toggle"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="showPassword"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="m3 3 18 18M10.58 10.58A2 2 0 0 0 13.42 13.42M9.88 5.09A9.91 9.91 0 0 1 12 4.88c5.05 0 8.52 3.3 9.63 7.12a10.74 10.74 0 0 1-2.52 4.05M6.61 6.61A10.85 10.85 0 0 0 2.37 12c1.11 3.82 4.58 7.12 9.63 7.12 1.72 0 3.31-.38 4.72-1.04" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M2.75 12S6.15 6.75 12 6.75 21.25 12 21.25 12 17.85 17.25 12 17.25 2.75 12 2.75 12Z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </button>
          </div>
          <p
            v-if="passwordError"
            class="login-form__error"
          >
            {{ passwordError }}
          </p>
        </div>

        <div class="login-form__meta">
          <label class="login-form__check">
            <input
              id="remember-me"
              v-model="rememberMe"
              type="checkbox"
              class="login-form__checkbox"
            >
            <span>记住我</span>
          </label>

          <router-link
            to="/auth/forgot-password"
            class="login-form__link"
          >
            忘记密码？
          </router-link>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="login-form__submit"
        >
          <span
            v-if="isLoading"
            class="login-form__spinner"
          />
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <div class="login-form__divider">
          <span>或者使用</span>
        </div>

        <div class="login-form__socials">
          <button
            type="button"
            class="login-form__social-button"
            @click="handleSocialLogin('github')"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.53.1.72-.22.72-.51v-1.85c-2.95.64-3.57-1.25-3.57-1.25-.48-1.21-1.17-1.53-1.17-1.53-.96-.65.08-.64.08-.64 1.05.08 1.61 1.08 1.61 1.08.94 1.6 2.45 1.14 3.05.87.1-.68.37-1.14.67-1.4-2.35-.27-4.83-1.18-4.83-5.24 0-1.15.42-2.09 1.09-2.82-.11-.27-.47-1.35.1-2.82 0 0 .9-.29 2.95 1.08a10.21 10.21 0 0 1 5.37 0c2.05-1.37 2.95-1.08 2.95-1.08.57 1.47.21 2.55.1 2.82.67.73 1.09 1.67 1.09 2.82 0 4.07-2.49 4.97-4.86 5.23.39.34.73.99.73 2.01v2.98c0 .29.19.62.73.51A10.5 10.5 0 0 0 12 1.5Z" />
            </svg>
            <span>GitHub</span>
          </button>

          <button
            type="button"
            class="login-form__social-button"
            @click="handleSocialLogin('google')"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path fill="#4285F4" d="M22.56 12.25c0-.77-.07-1.5-.2-2.2H12v4.17h5.93a5.07 5.07 0 0 1-2.2 3.32v2.76h3.57c2.09-1.92 3.26-4.75 3.26-8.05Z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.45-.98 7.27-2.65l-3.57-2.76c-.98.67-2.23 1.06-3.7 1.06-2.85 0-5.28-1.92-6.14-4.51H2.2v2.84A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M5.86 14.14A6.63 6.63 0 0 1 5.5 12c0-.74.13-1.46.36-2.14V7.02H2.2A11 11 0 0 0 1 12c0 1.78.43 3.46 1.2 4.98l2.86-2.22.8-.62Z" />
              <path fill="#EA4335" d="M12 5.35c1.61 0 3.05.56 4.19 1.63l3.14-3.13C17.45 2.1 14.97 1 12 1A11 11 0 0 0 2.2 7.02l3.66 2.84C6.72 7.27 9.15 5.35 12 5.35Z" />
            </svg>
            <span>Google</span>
          </button>
        </div>
      </form>

      <div class="login-card__footer">
        <p class="login-card__footer-text">
          还没有账户？
          <router-link
            to="/auth/register"
            class="login-card__footer-link"
          >
            立即注册
          </router-link>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页面组件
 * 实现用户登录功能，包含表单验证、记住我、社交登录等功能
 */

import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useField, useForm } from 'vee-validate';
import { ElMessage } from 'element-plus';
import * as yup from 'yup';
import { useAuthStore } from '@/stores/auth';
import type { LoginRequest } from '@/types';
import { getErrorMessage } from '@/types/errors';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isLoading = ref(false);
const showPassword = ref(false);

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

const { handleSubmit, errors } = useForm({
  validationSchema,
  initialValues: {
    username: '',
    password: '',
    rememberMe: false,
  },
});

const { value: username } = useField<string>('username');
const { value: password } = useField<string>('password');
const { value: rememberMe } = useField<boolean>('rememberMe');

const usernameError = computed(() => errors.value.username);
const passwordError = computed(() => errors.value.password);

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;

  try {
    const loginData: LoginRequest = {
      username: values.username,
      password: values.password,
      rememberMe: values.rememberMe,
    };

    await authStore.login(loginData);
    ElMessage.success('登录成功！');

    const redirectTo = (route.query.redirect as string) || '/';
    await router.push(redirectTo);
  } catch (error: unknown) {
    console.error('Login failed:', error);
    ElMessage.error(getErrorMessage(error));
  } finally {
    isLoading.value = false;
  }
});

const handleSocialLogin = (provider: 'github' | 'google') => {
  ElMessage.info(`${provider === 'github' ? 'GitHub' : 'Google'} 登录功能暂未开放`);
};

document.title = '登录 - 知构';
</script>

<style scoped>
.login-page {
  width: min(100%, 520px);
}

.login-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-xl);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-bg-secondary) 94%, transparent) 0%, color-mix(in srgb, var(--color-surface-overlay) 88%, transparent) 100%);
  box-shadow:
    var(--shadow-lg),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.login-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 52%, white) 30%, color-mix(in srgb, var(--color-cta) 58%, white) 68%, transparent);
  opacity: 0.9;
  pointer-events: none;
}

.login-card__header {
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-light);
}

.login-card__eyebrow {
  display: inline-flex;
  margin-bottom: 12px;
  color: var(--color-text-tertiary);
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.login-card__title {
  margin-bottom: 10px;
  color: var(--color-text);
  font-size: 2rem;
  line-height: 1.1;
}

.login-card__subtitle {
  color: var(--color-text-secondary);
  line-height: 1.75;
}

.login-card__signal-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: var(--space-md);
}

.login-card__signal {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--color-surface-overlay) 92%, transparent);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  box-shadow: var(--shadow-inner);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-form__label {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: var(--font-weight-semibold);
}

.login-form__input {
  width: 100%;
  min-height: 52px;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--color-bg-secondary) 82%, transparent);
  color: var(--color-text);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base),
    transform var(--transition-base);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.login-form__input::placeholder {
  color: var(--color-text-tertiary);
}

.login-form__input:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: var(--shadow-focus);
  background: color-mix(in srgb, var(--color-bg-reading) 88%, transparent);
}

.login-form__input--error {
  border-color: var(--color-danger);
}

.login-form__password-wrap {
  position: relative;
}

.login-form__input--password {
  padding-right: 52px;
}

.login-form__toggle {
  position: absolute;
  top: 50%;
  right: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-secondary);
  transform: translateY(-50%);
  transition:
    color var(--transition-base),
    background-color var(--transition-base);
}

.login-form__toggle:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.login-form__toggle svg,
.login-form__social-button svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.login-form__error {
  color: var(--color-danger);
  font-size: 0.82rem;
}

.login-form__meta,
.login-form__check,
.login-form__socials {
  display: flex;
  align-items: center;
}

.login-form__meta {
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.login-form__check {
  gap: 10px;
  color: var(--color-text-secondary);
  font-size: 0.88rem;
}

.login-form__checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-cta);
}

.login-form__link {
  color: var(--color-cta);
  font-size: 0.88rem;
  font-weight: var(--font-weight-semibold);
}

.login-form__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 52px;
  border: none;
  border-radius: 18px;
  background: var(--gradient-hero);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-md);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    opacity var(--transition-base);
}

.login-form__submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.login-form__submit:disabled {
  opacity: 0.6;
}

.login-form__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.32);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.75s linear infinite;
}

.login-form__divider {
  position: relative;
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 0.82rem;
}

.login-form__divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  border-top: 1px solid var(--color-border-light);
}

.login-form__divider span {
  position: relative;
  padding: 0 12px;
  background: color-mix(in srgb, var(--color-bg-secondary) 94%, transparent);
  border-radius: var(--radius-full);
}

.login-form__socials {
  gap: 12px;
}

.login-form__social-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-height: 48px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--color-surface-overlay) 94%, transparent);
  color: var(--color-text);
  transition:
    transform var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base);
}

.login-form__social-button:hover {
  transform: translateY(-1px);
  border-color: var(--color-border-dark);
  background: color-mix(in srgb, var(--color-hover) 72%, var(--color-surface-overlay));
}

.login-card__footer {
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border-light);
}

.login-card__footer-text {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  text-align: center;
}

.login-card__footer-link {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .login-page {
    width: 100%;
  }

  .login-card {
    padding: var(--space-lg);
    border-radius: var(--radius-xl);
  }

  .login-card__title {
    font-size: 1.8rem;
  }

  .login-form__socials {
    flex-direction: column;
  }

  .login-form__social-button {
    width: 100%;
  }
}
</style>
