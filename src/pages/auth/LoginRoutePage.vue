<template>
  <section class="auth-page">
    <div class="auth-page__perspective">
      <div
        class="auth-page__flip-card"
        :class="{ 'is-flipped': isRegistering }"
      >
        <!-- 正面：登录表单 -->
        <div class="auth-page__glass-panel flip-front">
          <div class="auth-page__brand">
            <div class="auth-page__logo">Z</div>
            <p class="auth-page__eyebrow">知构 ZhiCore</p>
          </div>

          <h2 class="auth-page__title">欢迎回来</h2>
          <p class="auth-page__description">
            登录以发布文章、参与评论与构建你的结构化知识库。
          </p>
          <p
            v-if="registerSuccessMessage"
            class="auth-page__success"
            role="status"
          >
            {{ registerSuccessMessage }}
          </p>

          <form class="auth-page__form" @submit.prevent="submitLogin">
            <div class="auth-page__input-group">
              <label for="login-username">用户名</label>
              <input
                id="login-username"
                v-model="loginUsername"
                type="text"
                autocomplete="username"
                placeholder="请输入用户名"
              />
            </div>

            <div class="auth-page__input-group">
              <label for="login-password">密码</label>
              <input
                id="login-password"
                v-model="loginPassword"
                type="password"
                autocomplete="current-password"
                placeholder="请输入密码"
              />
            </div>

            <p v-if="loginError" class="auth-page__error">
              {{ loginError }}
            </p>

            <button
              type="submit"
              class="auth-page__submit-btn"
              :disabled="isLoginSubmitting"
            >
              {{ isLoginSubmitting ? "登录中..." : "登录" }}
            </button>
          </form>

          <div class="auth-page__toggle">
            <span>还没有账号？</span>
            <button
              class="auth-page__toggle-btn"
              @click="toggleMode('Register')"
            >
              立即注册
            </button>
          </div>
        </div>

        <!-- 背面：注册表单 -->
        <div class="auth-page__glass-panel flip-back">
          <div class="auth-page__brand">
            <div class="auth-page__logo">Z</div>
            <p class="auth-page__eyebrow">知构 ZhiCore</p>
          </div>

          <h2 class="auth-page__title">创建新账号</h2>
          <p class="auth-page__description">加入我们，构建你的结构化知识库。</p>

          <form class="auth-page__form" @submit.prevent="submitRegister">
            <div class="auth-page__input-group">
              <label for="reg-email">邮箱</label>
              <input
                id="reg-email"
                v-model="registerEmail"
                type="email"
                autocomplete="email"
                placeholder="请输入邮箱"
                :aria-invalid="Boolean(registerFieldErrors.email)"
                :aria-describedby="
                  registerFieldErrors.email ? 'reg-email-error' : undefined
                "
              />
              <p
                v-if="registerFieldErrors.email"
                id="reg-email-error"
                class="auth-page__field-error"
              >
                {{ registerFieldErrors.email }}
              </p>
            </div>

            <div class="auth-page__input-group">
              <label for="reg-nickname">昵称</label>
              <input
                id="reg-nickname"
                v-model="registerNickname"
                type="text"
                autocomplete="nickname"
                placeholder="请输入昵称"
                :aria-invalid="Boolean(registerFieldErrors.nickname)"
                :aria-describedby="
                  registerFieldErrors.nickname
                    ? 'reg-nickname-error'
                    : undefined
                "
              />
              <p
                v-if="registerFieldErrors.nickname"
                id="reg-nickname-error"
                class="auth-page__field-error"
              >
                {{ registerFieldErrors.nickname }}
              </p>
            </div>

            <div class="auth-page__input-group">
              <label for="reg-password">密码</label>
              <input
                id="reg-password"
                v-model="registerPassword"
                type="password"
                autocomplete="new-password"
                placeholder="请输入密码"
                :aria-invalid="Boolean(registerFieldErrors.password)"
                :aria-describedby="
                  registerFieldErrors.password
                    ? 'reg-password-error'
                    : undefined
                "
              />
              <p
                v-if="registerFieldErrors.password"
                id="reg-password-error"
                class="auth-page__field-error"
              >
                {{ registerFieldErrors.password }}
              </p>
            </div>

            <div class="auth-page__input-group">
              <label for="reg-confirm">确认密码</label>
              <input
                id="reg-confirm"
                v-model="registerConfirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="请再次输入密码"
                :aria-invalid="Boolean(registerFieldErrors.confirmPassword)"
                :aria-describedby="
                  registerFieldErrors.confirmPassword
                    ? 'reg-confirm-error'
                    : undefined
                "
              />
              <p
                v-if="registerFieldErrors.confirmPassword"
                id="reg-confirm-error"
                class="auth-page__field-error"
              >
                {{ registerFieldErrors.confirmPassword }}
              </p>
            </div>

            <div class="auth-page__input-group">
              <label for="reg-email-token">邮箱验证码 token</label>
              <input
                id="reg-email-token"
                v-model="registerEmailVerificationToken"
                type="text"
                autocomplete="one-time-code"
                placeholder="请输入邮箱验证码 token"
                :aria-invalid="
                  Boolean(registerFieldErrors.emailVerificationToken)
                "
                :aria-describedby="
                  registerFieldErrors.emailVerificationToken
                    ? 'reg-email-token-error'
                    : undefined
                "
              />
              <p
                v-if="registerFieldErrors.emailVerificationToken"
                id="reg-email-token-error"
                class="auth-page__field-error"
              >
                {{ registerFieldErrors.emailVerificationToken }}
              </p>
            </div>

            <p v-if="registerFormError" class="auth-page__error" role="alert">
              {{ registerFormError }}
            </p>

            <button
              type="submit"
              class="auth-page__submit-btn"
              :disabled="isRegisterSubmitting"
            >
              {{ isRegisterSubmitting ? "注册中..." : "注册" }}
            </button>
          </form>

          <div class="auth-page__toggle">
            <span>已有账号？</span>
            <button class="auth-page__toggle-btn" @click="toggleMode('Login')">
              返回登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLoginForm, useRegisterForm } from "@/features/auth";

const route = useRoute();
const router = useRouter();

// Flip state based on route
const isRegistering = computed(() => route.name === "Register");

const toggleMode = (name: "Login" | "Register") => {
  router.push({ name });
};

// Login Logic (re-using existing composable for consistency, but extracting its refs)
const {
  username: loginUsername,
  password: loginPassword,
  submitting: isLoginSubmitting,
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(
      circle at top right,
      rgba(0, 229, 181, 0.15),
      transparent 40%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(0, 168, 255, 0.1),
      transparent 40%
    ),
    linear-gradient(135deg, #0a0f14 0%, #111a22 100%);
  perspective: 1200px;
}

.auth-page__perspective {
  width: 100%;
  max-width: 440px;
  perspective: 1500px;
}

.auth-page__flip-card {
  width: 100%;
  display: grid;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.auth-page__flip-card.is-flipped {
  transform: rotateY(180deg);
}

.flip-front,
.flip-back {
  grid-area: 1 / 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.flip-back {
  transform: rotateY(180deg);
}

.auth-page__glass-panel {
  padding: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
}

.auth-page__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.auth-page__logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.auth-page__eyebrow {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 600;
}

.auth-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 12px;
  text-align: center;
}

.auth-page__description {
  color: var(--color-text-soft);
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 32px;
}

.auth-page__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-page__input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.auth-page__input-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  margin-left: 4px;
}

.auth-page__input-group input {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text-strong);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.auth-page__input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 3px rgba(0, 229, 181, 0.15);
}

.auth-page__input-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.auth-page__submit-btn {
  margin-top: 12px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: var(--color-primary);
  color: #000;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 229, 181, 0.3);
}

.auth-page__submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 229, 181, 0.4);
  background: var(--color-primary-soft);
}

.auth-page__submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auth-page__submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-page__error {
  margin: 0;
  font-size: 0.9rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  text-align: center;
}

.auth-page__success {
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: var(--color-primary);
  background: rgba(0, 229, 181, 0.1);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(0, 229, 181, 0.2);
  text-align: center;
}

.auth-page__field-error {
  margin: 0;
  font-size: 0.82rem;
  color: #ff8a8a;
}

.auth-page__toggle {
  margin-top: 24px;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-soft);
}

.auth-page__toggle-btn {
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 0.95rem;
  font-weight: 600;
  margin-left: 4px;
  padding: 4px 8px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.auth-page__toggle-btn:hover {
  color: var(--color-primary-soft);
  text-decoration: underline;
}

@media (max-width: 600px) {
  .auth-page {
    padding: 16px;
  }
  .auth-page__glass-panel {
    padding: 32px 20px;
  }
  .auth-page__title {
    font-size: 1.5rem;
  }
}
</style>
