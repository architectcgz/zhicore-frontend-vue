<!--
  注册页面
  实现用户注册功能，包含表单验证、密码强度指示器、服务条款等功能
-->

<template>
  <div class="register-page">
    <section class="register-card surface-panel">
      <div class="register-card__header">
        <span class="register-card__eyebrow">创建账号</span>
        <h2 class="register-card__title">
          创建账户
        </h2>
        <p class="register-card__subtitle">
          加入知构，开始发布内容、参与主题讨论并建立自己的创作者主页。
        </p>
      </div>

      <form
        class="register-form"
        @submit="onSubmit"
      >
        <div class="register-form__field">
          <label
            for="username"
            class="register-form__label"
          >
            用户名
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            :class="[
              'register-form__input',
              usernameError ? 'register-form__input--error' : ''
            ]"
            placeholder="请输入用户名"
          >
          <p
            v-if="usernameError"
            class="register-form__error"
          >
            {{ usernameError }}
          </p>
          <p
            v-else
            class="register-form__hint"
          >
            3-20 个字符，支持字母、数字、下划线。
          </p>
        </div>

        <div class="register-form__field">
          <label
            for="email"
            class="register-form__label"
          >
            邮箱地址
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            :class="[
              'register-form__input',
              emailError ? 'register-form__input--error' : ''
            ]"
            placeholder="请输入邮箱地址"
          >
          <p
            v-if="emailError"
            class="register-form__error"
          >
            {{ emailError }}
          </p>
          <p
            v-else
            class="register-form__hint"
          >
            用于账户验证、找回密码和重要通知。
          </p>
        </div>

        <div class="register-form__field">
          <label
            for="password"
            class="register-form__label"
          >
            密码
          </label>
          <div class="register-form__password-wrap">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :class="[
                'register-form__input register-form__input--password',
                passwordError ? 'register-form__input--error' : ''
              ]"
              placeholder="请输入密码"
            >
            <button
              type="button"
              class="register-form__toggle"
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
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                />
              </svg>
            </button>
          </div>
          <p
            v-if="passwordError"
            class="register-form__error"
          >
            {{ passwordError }}
          </p>

          <div
            v-if="password"
            class="register-form__strength"
          >
            <div class="register-form__strength-head">
              <div class="register-form__strength-bar">
                <div
                  :class="['register-form__strength-fill', passwordStrength.color]"
                  :style="{ width: `${passwordStrength.percentage}%` }"
                />
              </div>
              <span :class="['register-form__strength-text', passwordStrength.textColor]">
                {{ passwordStrength.text }}
              </span>
            </div>
            <ul class="register-form__checklist">
              <li :class="{ 'register-form__checkitem--done': passwordChecks.length }">
                至少 8 个字符
              </li>
              <li :class="{ 'register-form__checkitem--done': passwordChecks.hasUpperCase }">
                包含大写字母
              </li>
              <li :class="{ 'register-form__checkitem--done': passwordChecks.hasLowerCase }">
                包含小写字母
              </li>
              <li :class="{ 'register-form__checkitem--done': passwordChecks.hasNumber }">
                包含数字
              </li>
              <li :class="{ 'register-form__checkitem--done': passwordChecks.hasSpecial }">
                包含特殊字符
              </li>
            </ul>
          </div>
        </div>

        <div class="register-form__field">
          <label
            for="confirmPassword"
            class="register-form__label"
          >
            确认密码
          </label>
          <div class="register-form__password-wrap">
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              :class="[
                'register-form__input register-form__input--password',
                confirmPasswordError ? 'register-form__input--error' : ''
              ]"
              placeholder="请再次输入密码"
            >
            <button
              type="button"
              class="register-form__toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <svg
                v-if="showConfirmPassword"
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
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                />
              </svg>
            </button>
          </div>
          <p
            v-if="confirmPasswordError"
            class="register-form__error"
          >
            {{ confirmPasswordError }}
          </p>
        </div>

        <div class="register-form__agreement">
          <label
            for="agreeToTerms"
            class="register-form__agreement-label"
          >
            <input
              id="agreeToTerms"
              v-model="agreeToTerms"
              type="checkbox"
              class="register-form__checkbox"
            >
            <span>
              我已阅读并同意
              <a
                href="/terms"
                target="_blank"
                class="register-form__link"
              >服务条款</a>
              和
              <a
                href="/privacy"
                target="_blank"
                class="register-form__link"
              >隐私政策</a>
            </span>
          </label>
          <p
            v-if="agreeToTermsError"
            class="register-form__error"
          >
            {{ agreeToTermsError }}
          </p>
        </div>

        <button
          type="submit"
          :disabled="isLoading || !isFormValid"
          class="register-form__submit"
        >
          <span
            v-if="isLoading"
            class="register-form__spinner"
          />
          {{ isLoading ? '注册中...' : '创建账户' }}
        </button>
      </form>

      <div class="register-card__footer">
        <p class="register-card__footer-text">
          已有账户？
          <router-link
            to="/auth/login"
            class="register-card__footer-link"
          >
            立即登录
          </router-link>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
/**
 * 注册页面组件
 * 实现用户注册功能，包含表单验证、密码强度指示器、服务条款等功能
 */

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useField, useForm } from 'vee-validate';
import { ElMessage } from 'element-plus';
import * as yup from 'yup';
import { useAuthStore } from '@/stores/auth';
import type { RegisterRequest } from '@/types';
import { getErrorMessage } from '@/types/errors';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

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
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&=#+\-_.,;:'"<>()[\]{}|/\\~])[A-Za-z\d@$!%*?&=#+\-_.,;:'"<>()[\]{}|/\\~]+$/, '密码必须包含大小写字母、数字和特殊字符'),
  confirmPassword: yup
    .string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '两次输入的密码不一致'),
  agreeToTerms: yup
    .boolean()
    .required('请同意服务条款')
    .oneOf([true], '请同意服务条款'),
});

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

const { value: username } = useField<string>('username');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');
const { value: agreeToTerms } = useField<boolean>('agreeToTerms');

const usernameError = computed(() => errors.value.username);
const emailError = computed(() => errors.value.email);
const passwordError = computed(() => errors.value.password);
const confirmPasswordError = computed(() => errors.value.confirmPassword);
const agreeToTermsError = computed(() => errors.value.agreeToTerms);
const isFormValid = computed(() => meta.value.valid);

const passwordChecks = computed(() => {
  const pwd = password.value || '';
  return {
    length: pwd.length >= 8,
    hasUpperCase: /[A-Z]/.test(pwd),
    hasLowerCase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecial: /[@$!%*?&=#+\-_.,;:'"<>()[\]{}|/\\~]/.test(pwd),
  };
});

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
  }

  if (score <= 2) {
    return {
      percentage: 25,
      text: '弱',
      color: 'bg-red-400',
      textColor: 'text-red-600 dark:text-red-400',
    };
  }

  if (score <= 3) {
    return {
      percentage: 50,
      text: '中等',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    };
  }

  if (score <= 4) {
    return {
      percentage: 75,
      text: '强',
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
    };
  }

  return {
    percentage: 100,
    text: '很强',
    color: 'bg-green-500',
    textColor: 'text-green-600 dark:text-green-400',
  };
});

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

    await authStore.register(registerData);
    ElMessage.success('注册成功！欢迎加入我们！');
    await router.push('/');
  } catch (error: unknown) {
    console.error('Registration failed:', error);
    ElMessage.error(getErrorMessage(error));
  } finally {
    isLoading.value = false;
  }
});

document.title = '注册 - 知构';
</script>

<style scoped>
.register-page {
  width: min(100%, 540px);
}

.register-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-bg-secondary) 94%, transparent) 0%, color-mix(in srgb, var(--color-surface-overlay) 88%, transparent) 100%);
  box-shadow:
    var(--shadow-lg),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.register-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 52%, white) 30%, color-mix(in srgb, var(--color-cta) 58%, white) 68%, transparent);
  opacity: 0.9;
  pointer-events: none;
}

.register-card__header {
  padding-bottom: 10px;
  border-bottom: 1px solid var(--color-border-light);
}

.register-card__eyebrow {
  display: inline-flex;
  margin-bottom: 8px;
  color: var(--color-text-tertiary);
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.register-card__title {
  margin-bottom: 6px;
  color: var(--color-text);
  font-size: 1.85rem;
  line-height: 1.1;
}

.register-card__subtitle {
  color: var(--color-text-secondary);
  line-height: 1.62;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.register-form__field,
.register-form__agreement {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.register-form__label {
  color: var(--color-text);
  font-size: 0.9rem;
  font-weight: var(--font-weight-semibold);
}

.register-form__input {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: color-mix(in srgb, var(--color-bg-secondary) 82%, transparent);
  color: var(--color-text);
  transition:
    border-color var(--transition-base),
    box-shadow var(--transition-base),
    background-color var(--transition-base);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.register-form__input::placeholder {
  color: var(--color-text-tertiary);
}

.register-form__input:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: var(--shadow-focus);
  background: color-mix(in srgb, var(--color-bg-reading) 88%, transparent);
}

.register-form__input--error {
  border-color: var(--color-danger);
}

.register-form__password-wrap {
  position: relative;
}

.register-form__input--password {
  padding-right: 48px;
}

.register-form__toggle {
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

.register-form__toggle:hover {
  background: var(--color-hover);
  color: var(--color-text);
}

.register-form__toggle svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.register-form__hint,
.register-form__error,
.register-form__agreement-label,
.register-form__footer-text {
  font-size: 0.82rem;
}

.register-form__hint {
  color: var(--color-text-tertiary);
}

.register-form__error {
  color: var(--color-danger);
}

.register-form__strength {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--color-border-light);
  border-radius: 14px;
  background: color-mix(in srgb, var(--color-surface-overlay) 92%, transparent);
  box-shadow: var(--shadow-inner);
}

.register-form__strength-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.register-form__strength-bar {
  flex: 1;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-border-light);
}

.register-form__strength-fill {
  height: 100%;
  border-radius: 999px;
  transition: width var(--transition-base);
}

.register-form__checklist {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.register-form__checkitem--done {
  color: var(--color-success);
}

.register-form__agreement-label {
  display: flex;
  gap: 10px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.register-form__checkbox {
  width: 16px;
  height: 16px;
  margin-top: 4px;
  accent-color: var(--color-cta);
  flex-shrink: 0;
}

.register-form__link {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

.register-form__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  border: none;
  border-radius: 16px;
  background: var(--gradient-hero);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-md);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    opacity var(--transition-base);
}

.register-form__submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.register-form__submit:disabled {
  opacity: 0.6;
}

.register-form__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.32);
  border-top-color: #fff;
  border-radius: 50%;
  animation: register-spin 0.75s linear infinite;
}

.register-card__footer {
  padding-top: 10px;
  border-top: 1px solid var(--color-border-light);
}

.register-card__footer-text {
  color: var(--color-text-secondary);
  font-size: 0.92rem;
  text-align: center;
}

.register-card__footer-link {
  color: var(--color-cta);
  font-weight: var(--font-weight-semibold);
}

@keyframes register-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767px) {
  .register-page {
    width: 100%;
  }

  .register-card {
    padding: var(--space-md);
    border-radius: var(--radius-xl);
  }

  .register-card__title {
    font-size: 1.7rem;
  }

  .register-form__checklist {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
