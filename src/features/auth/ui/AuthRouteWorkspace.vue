<template>
  <section class="auth-page" :class="{ 'auth-page--register': isRegistering }">
    <div class="auth-page__backdrop" aria-hidden="true"></div>

    <article
      class="auth-card"
      :class="{
        'auth-card--login': !isRegistering,
        'auth-card--register': isRegistering,
      }"
    >
      <header class="auth-card__header">
        <div
          class="auth-card__brand"
          :class="{ 'auth-card__brand--stacked': isRegistering }"
        >
          <span class="auth-card__mark">Z</span>
          <span class="auth-card__brand-name">ZhiCore</span>
        </div>
        <h1>{{ isRegistering ? "创建账号" : "欢迎回来" }}</h1>
        <p>
          {{
            isRegistering
              ? "加入 ZhiCore，开始沉淀你的知识记录。"
              : "登录你的账号，继续你的学习与创作之旅。"
          }}
        </p>
      </header>

      <p v-if="registerSuccessMessage" class="auth-card__success" role="status">
        <CheckCircle2 aria-hidden="true" />
        <span>{{ registerSuccessMessage }}</span>
      </p>

      <form
        v-if="!isRegistering"
        class="auth-card__form"
        aria-label="登录"
        novalidate
        @submit.prevent="submitLogin"
      >
        <label class="auth-field" for="login-email">
          <span>邮箱</span>
          <span class="auth-field__control">
            <input
              id="login-email"
              v-model="loginUsername"
              type="email"
              autocomplete="email"
              placeholder="liamchen@example.com"
              :aria-invalid="Boolean(loginFieldErrors.email)"
              :aria-describedby="
                loginFieldErrors.email ? 'login-email-error' : undefined
              "
            />
            <Check class="auth-field__state-icon" aria-hidden="true" />
          </span>
          <span
            v-if="loginFieldErrors.email"
            id="login-email-error"
            class="auth-card__field-error"
          >
            {{ loginFieldErrors.email }}
          </span>
        </label>

        <label class="auth-field" for="login-password">
          <span>密码</span>
          <span class="auth-field__control">
            <input
              id="login-password"
              v-model="loginPassword"
              :type="isLoginPasswordVisible ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="请输入密码"
              :aria-invalid="Boolean(loginError)"
              :aria-describedby="
                loginError ? 'login-password-error' : undefined
              "
            />
            <button
              class="auth-field__icon-btn"
              type="button"
              :aria-label="isLoginPasswordVisible ? '隐藏密码' : '显示密码'"
              @click="isLoginPasswordVisible = !isLoginPasswordVisible"
            >
              <EyeOff v-if="isLoginPasswordVisible" aria-hidden="true" />
              <Eye v-else aria-hidden="true" />
            </button>
          </span>
        </label>

        <p
          v-if="loginError"
          id="login-password-error"
          class="auth-card__error"
          role="alert"
        >
          <CircleAlert aria-hidden="true" />
          <span>{{ loginError }}</span>
        </p>

        <div class="auth-card__row">
          <label class="auth-check">
            <input v-model="rememberMe" type="checkbox" />
            <span aria-hidden="true"></span>
            记住我
          </label>
          <button class="auth-card__text-btn" type="button" disabled>
            忘记密码?
          </button>
        </div>

        <button
          class="auth-card__submit"
          type="submit"
          :disabled="isLoginSubmitting"
        >
          {{ isLoginSubmitting ? "登录中..." : "登录" }}
        </button>

        <div class="auth-card__divider">
          <span>或使用以下方式登录</span>
        </div>

        <div class="auth-card__socials" aria-label="第三方登录">
          <button type="button" aria-label="GitHub 登录暂未接入" disabled>
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.51.47-3.16-.63-3.36-1.21-.11-.3-.6-1.21-1.03-1.45-.35-.19-.85-.66-.01-.67.79-.01 1.35.74 1.54 1.05.9 1.55 2.34 1.11 2.91.85.09-.67.35-1.11.64-1.37-2.22-.26-4.55-1.14-4.55-5.05 0-1.11.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05.8-.23 1.65-.34 2.5-.34s1.7.11 2.5.34c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.92-2.34 4.79-4.57 5.05.36.32.68.93.68 1.89 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.1 10.1 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z"
              />
            </svg>
          </button>
          <button type="button" aria-label="Gmail 登录暂未接入" disabled>
            <Mail aria-hidden="true" />
          </button>
          <button type="button" aria-label="Apple 登录暂未接入" disabled>
            <Apple aria-hidden="true" />
          </button>
        </div>

        <p class="auth-card__switch">
          <span>还没有账号?</span>
          <button type="button" @click="toggleMode('Register')">
            立即注册
          </button>
        </p>
      </form>

      <form
        v-else
        class="auth-card__form auth-card__form--register"
        aria-label="注册"
        @submit.prevent="submitRegister"
      >
        <label class="auth-field" for="reg-email">
          <span>邮箱</span>
          <span class="auth-field__control">
            <Mail aria-hidden="true" />
            <input
              id="reg-email"
              v-model="registerEmail"
              type="email"
              autocomplete="email"
              placeholder="请输入邮箱地址"
              :aria-invalid="Boolean(registerFieldErrors.email)"
              :aria-describedby="
                registerFieldErrors.email ? 'reg-email-error' : undefined
              "
            />
          </span>
          <span
            v-if="registerFieldErrors.email"
            id="reg-email-error"
            class="auth-card__field-error"
          >
            {{ registerFieldErrors.email }}
          </span>
        </label>

        <label class="auth-field" for="reg-nickname">
          <span>昵称</span>
          <span class="auth-field__control">
            <UserRound aria-hidden="true" />
            <input
              id="reg-nickname"
              v-model="registerNickname"
              type="text"
              autocomplete="nickname"
              placeholder="请输入昵称"
              :aria-invalid="Boolean(registerFieldErrors.nickname)"
              :aria-describedby="
                registerFieldErrors.nickname ? 'reg-nickname-error' : undefined
              "
            />
          </span>
          <span
            v-if="registerFieldErrors.nickname"
            id="reg-nickname-error"
            class="auth-card__field-error"
          >
            {{ registerFieldErrors.nickname }}
          </span>
        </label>

        <label
          class="auth-field auth-field--inline-action auth-field--wide"
          for="reg-email-token"
        >
          <span>邮箱验证码</span>
          <span class="auth-field__inline">
            <span class="auth-field__control">
              <ShieldCheck aria-hidden="true" />
              <input
                id="reg-email-token"
                v-model="registerEmailVerificationToken"
                type="text"
                autocomplete="one-time-code"
                placeholder="请输入邮箱验证码"
                :aria-invalid="
                  Boolean(registerFieldErrors.emailVerificationToken)
                "
                :aria-describedby="
                  registerFieldErrors.emailVerificationToken
                    ? 'reg-email-token-error'
                    : undefined
                "
              />
            </span>
            <button class="auth-field__send-btn" type="button" disabled>
              发送验证码
            </button>
          </span>
          <span
            v-if="registerFieldErrors.emailVerificationToken"
            id="reg-email-token-error"
            class="auth-card__field-error"
          >
            {{ registerFieldErrors.emailVerificationToken }}
          </span>
        </label>

        <label class="auth-field" for="reg-password">
          <span>密码</span>
          <span class="auth-field__control">
            <LockKeyhole aria-hidden="true" />
            <input
              id="reg-password"
              v-model="registerPassword"
              :type="isRegisterPasswordVisible ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="请输入密码"
              :aria-invalid="Boolean(registerFieldErrors.password)"
              :aria-describedby="
                registerFieldErrors.password ? 'reg-password-error' : undefined
              "
            />
            <button
              class="auth-field__icon-btn"
              type="button"
              :aria-label="isRegisterPasswordVisible ? '隐藏密码' : '显示密码'"
              @click="isRegisterPasswordVisible = !isRegisterPasswordVisible"
            >
              <EyeOff v-if="isRegisterPasswordVisible" aria-hidden="true" />
              <Eye v-else aria-hidden="true" />
            </button>
          </span>
          <span
            v-if="registerFieldErrors.password"
            id="reg-password-error"
            class="auth-card__field-error"
          >
            {{ registerFieldErrors.password }}
          </span>
        </label>

        <label class="auth-field" for="reg-confirm">
          <span>确认密码</span>
          <span class="auth-field__control">
            <LockKeyhole aria-hidden="true" />
            <input
              id="reg-confirm"
              v-model="registerConfirmPassword"
              :type="isConfirmPasswordVisible ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="请再次输入密码"
              :aria-invalid="Boolean(registerFieldErrors.confirmPassword)"
              :aria-describedby="
                registerFieldErrors.confirmPassword
                  ? 'reg-confirm-error'
                  : undefined
              "
            />
            <button
              class="auth-field__icon-btn"
              type="button"
              :aria-label="isConfirmPasswordVisible ? '隐藏密码' : '显示密码'"
              @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
            >
              <EyeOff v-if="isConfirmPasswordVisible" aria-hidden="true" />
              <Eye v-else aria-hidden="true" />
            </button>
          </span>
          <span
            v-if="registerFieldErrors.confirmPassword"
            id="reg-confirm-error"
            class="auth-card__field-error"
          >
            {{ registerFieldErrors.confirmPassword }}
          </span>
        </label>

        <label class="auth-check auth-check--terms">
          <input type="checkbox" required />
          <span aria-hidden="true"></span>
          我已阅读并同意《用户协议》和《隐私政策》
        </label>

        <p v-if="registerFormError" class="auth-card__error" role="alert">
          <CircleAlert aria-hidden="true" />
          <span>{{ registerFormError }}</span>
        </p>

        <button
          class="auth-card__submit"
          type="submit"
          :disabled="isRegisterSubmitting"
        >
          {{ isRegisterSubmitting ? "注册中..." : "注册" }}
        </button>

        <p class="auth-card__switch">
          <span>已有账号?</span>
          <button type="button" @click="toggleMode('Login')">立即登录</button>
        </p>
      </form>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Apple,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "@lucide/vue";

import { useLoginForm } from "../composables/useLoginForm";
import { useRegisterForm } from "../composables/useRegisterForm";

const route = useRoute();
const router = useRouter();

const isRegistering = computed(() => route.name === "Register");
const rememberMe = ref(true);
const isLoginPasswordVisible = ref(false);
const isRegisterPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);

const toggleMode = (name: "Login" | "Register") => {
  router.push({ name });
};

const {
  username: loginUsername,
  password: loginPassword,
  submitting: isLoginSubmitting,
  fieldErrors: loginFieldErrors,
  errorMessage: loginError,
  submit: submitLogin,
} = useLoginForm();

const {
  email: registerEmail,
  nickname: registerNickname,
  password: registerPassword,
  confirmPassword: registerConfirmPassword,
  emailVerificationToken: registerEmailVerificationToken,
  submitting: isRegisterSubmitting,
  fieldErrors: registerFieldErrors,
  formError: registerFormError,
  successMessage: registerSuccessMessage,
  submit: submitRegister,
} = useRegisterForm();

watch(registerSuccessMessage, (message) => {
  if (message) {
    loginUsername.value = registerEmail.value;
  }
});
</script>

<style scoped>
.auth-page {
  position: relative;
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: var(--space-8);
  isolation: isolate;
}

.auth-page--register {
  min-height: calc(100vh - 5.25rem);
  align-items: start;
  padding-block: var(--space-5);
}

.auth-page__backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  background:
    linear-gradient(
      125deg,
      color-mix(in srgb, var(--color-bg) 98%, transparent) 0%,
      color-mix(in srgb, var(--color-bg) 92%, var(--color-primary)) 50%,
      color-mix(in srgb, var(--color-primary) 20%, var(--color-bg)) 100%
    ),
    var(--color-bg);
}

.auth-page__backdrop::before,
.auth-page__backdrop::after {
  position: absolute;
  inset: -18%;
  background-repeat: no-repeat;
  content: "";
  filter: blur(0.5rem);
  opacity: 0.82;
}

.auth-page__backdrop::before {
  background:
    radial-gradient(
      ellipse at 88% 28%,
      color-mix(in srgb, var(--color-primary) 58%, transparent) 0%,
      transparent 28%
    ),
    radial-gradient(
      ellipse at 18% 72%,
      color-mix(in srgb, var(--color-primary) 30%, transparent) 0%,
      transparent 24%
    );
  transform: rotate(-10deg);
}

.auth-page__backdrop::after {
  background:
    linear-gradient(
      118deg,
      transparent 0%,
      color-mix(in srgb, var(--color-primary) 8%, transparent) 34%,
      color-mix(in srgb, var(--color-primary) 44%, transparent) 45%,
      transparent 61%
    ),
    linear-gradient(
      12deg,
      transparent 58%,
      color-mix(in srgb, var(--color-primary) 18%, transparent) 74%,
      transparent 86%
    );
  transform: rotate(4deg);
}

.auth-card {
  width: min(34rem, 100%);
  padding: var(--space-12);
  border: 1px solid color-mix(in srgb, var(--color-primary) 36%, transparent);
  border-radius: var(--radius-lg);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--color-bg) 70%, transparent),
    color-mix(in srgb, var(--color-bg-elevated) 54%, transparent)
  );
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 10%, transparent),
    0 1.5rem 5rem rgba(0, 0, 0, 0.36),
    0 0 4rem color-mix(in srgb, var(--color-primary) 12%, transparent);
  backdrop-filter: blur(1.375rem);
  -webkit-backdrop-filter: blur(1.375rem);
}

.auth-card--login {
  width: min(30rem, 100%);
  padding: var(--space-8);
}

.auth-card--register {
  width: min(44rem, 100%);
  padding: var(--space-5) var(--space-6);
}

.auth-card__header {
  display: grid;
  justify-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-6);
  text-align: center;
}

.auth-card__brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  color: var(--color-text-strong);
  font-size: 2rem;
  font-weight: 850;
  line-height: 1;
}

.auth-card__brand--stacked {
  display: inline-flex;
  justify-items: initial;
  gap: var(--space-2);
  font-size: 1rem;
}

.auth-card--login .auth-card__brand {
  gap: var(--space-3);
  font-size: 1.5rem;
}

.auth-card--register .auth-card__brand {
  font-size: 0.9375rem;
}

.auth-card__mark {
  display: grid;
  width: 3.75rem;
  height: 3.125rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 70%, transparent);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-size: 2.5rem;
  font-weight: 850;
  line-height: 1;
  text-shadow: 0 0 1rem
    color-mix(in srgb, var(--color-primary) 72%, transparent);
  box-shadow: 0 0 1.5rem
    color-mix(in srgb, var(--color-primary) 32%, transparent);
}

.auth-card__brand--stacked .auth-card__mark {
  width: 2.25rem;
  height: 2rem;
  font-size: 1.5rem;
}

.auth-card--login .auth-card__mark {
  width: 3rem;
  height: 2.5rem;
  font-size: 2rem;
}

.auth-card h1 {
  margin: var(--space-4) 0 0;
  color: var(--color-text-strong);
  font-size: 2rem;
  font-weight: 850;
  line-height: 1.15;
}

.auth-card--login h1 {
  margin-top: var(--space-3);
  font-size: 1.5rem;
}

.auth-card--register h1 {
  margin-top: var(--space-3);
  font-size: 1.5rem;
}

.auth-card p {
  margin: 0;
}

.auth-card__header p {
  color: var(--color-text);
  font-size: 1rem;
}

.auth-card--login .auth-card__header {
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.auth-card--register .auth-card__header {
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.auth-card--login .auth-card__header p {
  font-size: 0.875rem;
}

.auth-card--register .auth-card__header p {
  font-size: 0.875rem;
}

.auth-card__form {
  display: grid;
  gap: var(--space-5);
}

.auth-card--login .auth-card__form {
  gap: var(--space-4);
}

.auth-card__form--register {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-3);
}

.auth-card__form--register .auth-field--wide,
.auth-card__form--register .auth-check--terms,
.auth-card__form--register .auth-card__error,
.auth-card__form--register .auth-card__submit,
.auth-card__form--register .auth-card__switch {
  grid-column: 1 / -1;
}

.auth-field {
  display: grid;
  gap: var(--space-2);
  color: var(--color-text-strong);
  font-size: 0.9375rem;
  font-weight: 700;
}

.auth-card--login .auth-field {
  font-size: 0.875rem;
}

.auth-card--register .auth-field {
  font-size: 0.875rem;
}

.auth-field__control {
  display: flex;
  align-items: center;
  min-height: 3.25rem;
  padding: 0 var(--space-4);
  border: 1px solid
    color-mix(in srgb, var(--color-border-strong) 90%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-bg) 68%, transparent);
  color: var(--color-text-soft);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.auth-card--login .auth-field__control {
  min-height: 2.875rem;
}

.auth-card--register .auth-field__control {
  min-height: 2.875rem;
}

.auth-field__control:focus-within {
  border-color: color-mix(in srgb, var(--color-primary) 88%, transparent);
  background: color-mix(in srgb, var(--color-bg) 78%, transparent);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--color-primary) 42%, transparent),
    0 0 1.375rem color-mix(in srgb, var(--color-primary) 26%, transparent);
}

.auth-field__control > svg {
  flex: 0 0 auto;
  width: 1.125rem;
  height: 1.125rem;
}

.auth-field__control input {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--color-text-strong);
  caret-color: var(--color-primary);
}

.auth-field__control input::placeholder {
  color: color-mix(in srgb, var(--color-text-soft) 64%, transparent);
}

.auth-field__state-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-left: var(--space-3);
  color: var(--color-primary);
}

.auth-field__icon-btn {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
}

.auth-card--login .auth-field__icon-btn {
  width: 1.75rem;
  height: 1.75rem;
}

.auth-field__icon-btn svg {
  width: 1.125rem;
  height: 1.125rem;
}

.auth-field__inline {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-2);
}

.auth-field__inline .auth-field__control {
  min-width: 0;
}

.auth-field__send-btn {
  min-width: 8.5rem;
  border: 1px solid color-mix(in srgb, var(--color-primary) 45%, transparent);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-bg-elevated) 62%, transparent);
  color: var(--color-primary);
  font-weight: 800;
}

.auth-field__send-btn:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.auth-card__field-error,
.auth-card__error {
  color: var(--color-danger);
  font-size: 0.875rem;
  font-weight: 650;
}

.auth-card__error,
.auth-card__success {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.auth-card__error svg,
.auth-card__success svg {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
}

.auth-card__success {
  margin-bottom: var(--space-4);
  color: var(--color-primary);
}

.auth-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.auth-check {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  color: var(--color-text);
  font-size: 0.9375rem;
  font-weight: 600;
}

.auth-check input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.auth-check > span {
  display: grid;
  width: 1.25rem;
  height: 1.25rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--color-primary) 62%, transparent);
  border-radius: var(--radius-sm);
  color: var(--color-bg);
}

.auth-check input:checked + span {
  background: var(--color-primary);
}

.auth-check input:checked + span::after {
  width: 0.375rem;
  height: 0.625rem;
  border-right: 0.125rem solid currentColor;
  border-bottom: 0.125rem solid currentColor;
  content: "";
  transform: rotate(45deg) translateY(-0.0625rem);
}

.auth-check input:focus-visible + span {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: 0.1875rem;
}

.auth-check--terms {
  flex-wrap: wrap;
}

.auth-card__text-btn,
.auth-card__switch button {
  color: var(--color-primary);
  font-weight: 800;
  text-decoration: none;
}

.auth-card__text-btn,
.auth-card__switch button {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.auth-card__submit {
  min-height: 3.625rem;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-bg);
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 0 1.5rem
    color-mix(in srgb, var(--color-primary) 28%, transparent);
  transition:
    background-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
}

.auth-card__submit:hover:not(:disabled) {
  background: var(--color-primary-soft);
  transform: translateY(-0.0625rem);
  box-shadow: 0 0 2rem color-mix(in srgb, var(--color-primary) 40%, transparent);
}

.auth-card--login .auth-card__submit {
  min-height: 3rem;
}

.auth-card--register .auth-card__submit {
  min-height: 3rem;
}

.auth-card__submit:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.auth-card__divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-4);
  align-items: center;
  color: var(--color-text);
  font-size: 0.9375rem;
}

.auth-card--login .auth-card__divider {
  font-size: 0.8125rem;
}

.auth-card__divider::before,
.auth-card__divider::after {
  height: 0.0625rem;
  background: color-mix(in srgb, var(--color-border-strong) 92%, transparent);
  content: "";
}

.auth-card__socials {
  display: flex;
  justify-content: center;
  gap: var(--space-5);
}

.auth-card__socials button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 3.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-text-strong) 7%, transparent);
  color: var(--color-text-strong);
  cursor: pointer;
}

.auth-card--login .auth-card__socials {
  gap: var(--space-4);
}

.auth-card--login .auth-card__socials button {
  width: 3rem;
  height: 2.75rem;
}

.auth-card__text-btn:disabled,
.auth-card__socials button:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.auth-card__socials svg {
  width: 1.375rem;
  height: 1.375rem;
}

.auth-card__switch {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  color: var(--color-text);
  font-size: 1rem;
}

.auth-card--login .auth-card__switch,
.auth-card--login .auth-check {
  font-size: 0.875rem;
}

.auth-card--register .auth-card__switch,
.auth-card--register .auth-check {
  font-size: 0.875rem;
}

.auth-field__icon-btn:focus-visible,
.auth-field__send-btn:focus-visible,
.auth-card__text-btn:focus-visible,
.auth-card__submit:focus-visible,
.auth-card__socials button:focus-visible,
.auth-card__switch button:focus-visible,
.auth-check a:focus-visible {
  outline: 0.125rem solid var(--color-primary);
  outline-offset: 0.1875rem;
}

@media (max-width: 720px) {
  .auth-page,
  .auth-page--register {
    min-height: 100vh;
    padding: var(--space-4);
  }

  .auth-card,
  .auth-card--register {
    padding: var(--space-6);
  }

  .auth-card__brand {
    font-size: 1.5rem;
  }

  .auth-card h1 {
    font-size: 1.75rem;
  }

  .auth-card--login h1 {
    font-size: 1.5rem;
  }

  .auth-card--login .auth-card__brand {
    font-size: 1.375rem;
  }

  .auth-field__inline {
    grid-template-columns: 1fr;
  }

  .auth-card__form--register {
    grid-template-columns: 1fr;
  }

  .auth-field__send-btn,
  .auth-card__row,
  .auth-card__submit {
    width: 100%;
  }

  .auth-card__row {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 460px) {
  .auth-card {
    padding: var(--space-5);
  }

  .auth-card__mark {
    width: 3rem;
    height: 2.625rem;
    font-size: 2rem;
  }

  .auth-card__divider {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .auth-card__divider::before,
  .auth-card__divider::after {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-field__control,
  .auth-card__submit {
    transition: none;
  }

  .auth-card__submit:hover:not(:disabled) {
    transform: none;
  }
}
</style>
