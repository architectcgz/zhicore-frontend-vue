<template>
  <div class="auth-layout">
    <header class="auth-layout__header">
      <RouterLink class="auth-layout__brand" to="/" aria-label="返回知构首页">
        <span class="auth-layout__brand-mark">知</span>
        <span class="auth-layout__brand-text">
          <strong>知构</strong>
          <small>ZhiCore</small>
        </span>
      </RouterLink>

      <nav class="auth-layout__actions" aria-label="认证辅助导航">
        <RouterLink class="auth-layout__link" to="/">返回首页</RouterLink>
      </nav>
    </header>

    <main class="auth-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--color-bg);
}

.auth-layout__header {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: space-between;
  min-height: 4rem;
  padding: var(--space-3) clamp(var(--space-5), 4vw, var(--space-10));
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg-elevated) 94%, transparent);
}

.auth-layout__brand {
  display: inline-flex;
  gap: var(--space-3);
  align-items: center;
  color: var(--color-text-strong);
  text-decoration: none;
}

.auth-layout__brand-mark {
  display: grid;
  width: 2.25rem;
  height: 2.25rem;
  place-items: center;
  border-radius: var(--radius-lg);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-weight: 800;
  line-height: 1;
}

.auth-layout__brand-text {
  display: grid;
  gap: 0.125rem;
  line-height: 1.05;
}

.auth-layout__brand-text strong {
  font-size: 1rem;
  font-weight: 760;
}

.auth-layout__brand-text small {
  color: var(--color-text-soft);
  font-size: 0.75rem;
  font-weight: 600;
}

.auth-layout__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: flex-end;
}

.auth-layout__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.375rem;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-panel-soft);
  color: var(--color-text-soft);
  font-size: 0.875rem;
  font-weight: 650;
  text-decoration: none;
}

.auth-layout__link:hover,
.auth-layout__link:focus-visible {
  color: var(--color-text-strong);
  border-color: var(--color-border-strong);
}

.auth-layout__link:focus-visible {
  outline: 0.125rem solid var(--color-primary-soft);
  outline-offset: 0.125rem;
}

.auth-layout__main {
  min-height: 0;
}

@media (max-width: 520px) {
  .auth-layout__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .auth-layout__actions {
    justify-content: flex-start;
  }
}
</style>
