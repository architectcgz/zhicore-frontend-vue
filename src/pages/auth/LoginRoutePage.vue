<template>
  <section class="login-page">
    <div class="login-page__glass-panel">
      <div class="login-page__brand">
        <div class="login-page__logo">Z</div>
        <p class="login-page__eyebrow">知构 ZhiCore</p>
      </div>
      
      <h2 class="login-page__title">欢迎回来</h2>
      <p class="login-page__description">
        登录以发布文章、参与评论与构建你的结构化知识库。
      </p>

      <form class="login-page__form" @submit.prevent="submit">
        <div class="login-page__input-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="请输入用户名"
          />
        </div>
        
        <div class="login-page__input-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
          />
        </div>

        <p v-if="errorMessage" class="login-page__error">
          {{ errorMessage }}
        </p>

        <button type="submit" class="login-page__submit-btn" :disabled="submitting">
          {{ submitting ? "登录中..." : "登录" }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useLoginForm } from "@/features/auth";

const { username, password, submitting, errorMessage, submit } = useLoginForm();
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: 
    radial-gradient(circle at top right, rgba(0, 229, 181, 0.15), transparent 40%),
    radial-gradient(circle at bottom left, rgba(0, 168, 255, 0.1), transparent 40%),
    linear-gradient(135deg, #0a0f14 0%, #111a22 100%);
}

.login-page__glass-panel {
  width: 100%;
  max-width: 440px;
  padding: 48px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
  animation: fadeUp 0.6s ease-out forwards;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-page__brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}

.login-page__logo {
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

.login-page__eyebrow {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary);
  font-weight: 600;
}

.login-page__title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-strong);
  margin: 0 0 12px;
  text-align: center;
}

.login-page__description {
  color: var(--color-text-soft);
  text-align: center;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 32px;
}

.login-page__form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-page__input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-page__input-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text);
  margin-left: 4px;
}

.login-page__input-group input {
  padding: 14px 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text-strong);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.login-page__input-group input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(0, 0, 0, 0.3);
  box-shadow: 0 0 0 3px rgba(0, 229, 181, 0.15);
}

.login-page__input-group input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.login-page__submit-btn {
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

.login-page__submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 229, 181, 0.4);
  background: var(--color-primary-soft);
}

.login-page__submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-page__submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-page__error {
  margin: 0;
  font-size: 0.9rem;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  text-align: center;
}

@media (max-width: 600px) {
  .login-page__glass-panel {
    padding: 32px 24px;
  }
}
</style>
