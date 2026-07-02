<template>
  <div class="app-layout">
    <header class="app-layout__header">
      <RouterLink
        class="app-layout__brand"
        to="/"
      >
        知构
      </RouterLink>

      <nav
        class="app-layout__nav"
        aria-label="主导航"
      >
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/editor">编辑器</RouterLink>
      </nav>

      <button
        class="app-layout__logout"
        type="button"
        @click="logout"
      >
        退出
      </button>
    </header>

    <main class="app-layout__main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

defineProps<{
  logout: () => void | Promise<void>
}>()
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--color-bg);
}

.app-layout__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 18px;
  align-items: center;
  padding: 14px clamp(18px, 4vw, 42px);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg-elevated) 88%, transparent);
  backdrop-filter: blur(18px);
}

.app-layout__brand {
  font-size: 18px;
  font-weight: 760;
  color: var(--color-text-strong);
  text-decoration: none;
}

.app-layout__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.app-layout__nav a,
.app-layout__logout {
  min-height: 36px;
  padding: 7px 12px;
  border-radius: 10px;
  color: var(--color-text-soft);
  text-decoration: none;
}

.app-layout__nav a.router-link-active {
  color: var(--color-text-strong);
  background: var(--color-bg-elevated-2);
}

.app-layout__logout {
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  cursor: pointer;
}

.app-layout__main {
  padding: clamp(18px, 4vw, 42px);
}

@media (max-width: 720px) {
  .app-layout__header {
    grid-template-columns: 1fr auto;
  }

  .app-layout__nav {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}
</style>
