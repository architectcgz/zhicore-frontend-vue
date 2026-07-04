<template>
  <div class="app-layout">
    <header class="app-layout__header">
      <RouterLink class="app-layout__brand" to="/">
        <span class="app-layout__brand-mark">知</span>
        <span>
          <strong>知构</strong>
          <small>ZhiCore</small>
        </span>
      </RouterLink>

      <nav class="app-layout__nav" aria-label="知构主导航">
        <RouterLink to="/">
          <BookOpen class="app-layout__nav-icon" aria-hidden="true" />
          <span>发现</span>
        </RouterLink>
        <RouterLink to="/posts/demo">
          <FileText class="app-layout__nav-icon" aria-hidden="true" />
          <span>文章</span>
        </RouterLink>
        <RouterLink to="/ranking">
          <TrendingUp class="app-layout__nav-icon" aria-hidden="true" />
          <span>热榜</span>
        </RouterLink>
        <RouterLink to="/editor">
          <PenLine class="app-layout__nav-icon" aria-hidden="true" />
          <span>写作</span>
        </RouterLink>
      </nav>

      <div class="app-layout__actions">
        <button class="app-layout__logout" type="button" @click="logout">
          退出
        </button>
      </div>
    </header>

    <main
      class="app-layout__main"
      :class="{ 'app-layout__main--flush': isShellFlush }"
    >
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, FileText, PenLine, TrendingUp } from "@lucide/vue";
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

defineProps<{
  logout: () => void | Promise<void>;
}>();

const route = useRoute();

const isShellFlush = computed(() => route.meta.appShellFlush === true);
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--color-bg);
}

.app-layout__header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  padding: 12px clamp(18px, 4vw, 42px);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-bg-elevated) 94%, transparent);
  backdrop-filter: blur(14px);
}

.app-layout__brand {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  font-size: 18px;
  font-weight: 760;
  color: var(--color-text-strong);
  text-decoration: none;
}

.app-layout__brand-mark {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: var(--radius-lg);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-weight: 800;
  line-height: 1;
}

.app-layout__brand span:last-child {
  display: grid;
  gap: 2px;
  line-height: 1.05;
}

.app-layout__brand small {
  color: var(--color-text-soft);
  font-size: 12px;
  font-weight: 600;
}

.app-layout__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated-2);
}

.app-layout__nav a {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-text-soft);
  text-decoration: none;
}

.app-layout__nav span {
  font-size: 13px;
  font-weight: 650;
}

.app-layout__nav-icon {
  width: 17px;
  height: 17px;
  stroke-width: 2;
}

.app-layout__nav a.router-link-active {
  color: var(--color-text-strong);
  background: var(--color-bg-elevated);
}

.app-layout__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.app-layout__logout {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  text-decoration: none;
}

.app-layout__logout {
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  color: var(--color-text-soft);
  cursor: pointer;
}

.app-layout__main {
  padding: clamp(18px, 4vw, 42px);
}

.app-layout__main--flush {
  padding: 0;
}

@media (max-width: 720px) {
  .app-layout__header {
    grid-template-columns: 1fr auto;
    align-items: start;
  }

  .app-layout__nav {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .app-layout__actions {
    justify-content: flex-end;
  }
}

@media (max-width: 520px) {
  .app-layout__header {
    grid-template-columns: 1fr;
  }

  .app-layout__actions {
    justify-content: flex-start;
  }
}
</style>
