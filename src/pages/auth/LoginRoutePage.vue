<template>
  <section class="login-page">
    <div class="login-page__panel">
      <p class="login-page__eyebrow">知构</p>
      <h2>登录</h2>
      <p class="login-page__description">
        登录后即可发布文章、参与评论与收藏。
      </p>

      <form class="login-page__form" @submit.prevent="submit">
        <label>
          <span>用户名</span>
          <input
            v-model="username"
            type="text"
            autocomplete="username"
            placeholder="请输入用户名"
          />
        </label>
        <label>
          <span>密码</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            placeholder="请输入密码"
          />
        </label>

        <p v-if="errorMessage" class="login-page__error">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="submitting">
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
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: var(--space-6);
  background:
    radial-gradient(circle at top, rgba(37, 99, 235, 0.12), transparent 30%),
    linear-gradient(
      180deg,
      var(--color-bg-elevated) 0%,
      var(--color-bg-elevated-2) 100%
    );
}

.login-page__panel {
  width: min(26.25rem, 100%);
  padding: var(--space-8);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  box-shadow: var(--shadow-panel);
}

.login-page__eyebrow {
  margin: 0 0 var(--space-2);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-primary-soft);
}

.login-page__description {
  color: var(--color-text-soft);
}

.login-page__form {
  display: grid;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

.login-page__form label {
  display: grid;
  gap: var(--space-2);
}

.login-page__form input {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  color: var(--color-text);
}

.login-page__form button {
  padding: var(--space-3) var(--space-4);
  border: 0;
  border-radius: var(--radius-lg);
  background: linear-gradient(
    135deg,
    var(--color-primary),
    var(--color-primary-strong)
  );
  color: white;
  cursor: pointer;
}

.login-page__error {
  margin: 0;
  color: var(--color-danger);
}
</style>
