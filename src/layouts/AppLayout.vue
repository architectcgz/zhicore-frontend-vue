<template>
  <div class="app-layout">
    <header class="app-layout__header">
      <div class="app-layout__brand-area">
        <RouterLink class="app-layout__brand" to="/">
          <span class="app-layout__brand-mark">知</span>
          <span>
            <strong>知构</strong>
            <small>ZhiCore</small>
          </span>
        </RouterLink>
      </div>

      <nav class="app-layout__nav" aria-label="知构主导航">
        <RouterLink class="app-layout__nav-link" to="/" aria-label="发现">
          <BookOpen class="app-layout__nav-icon" aria-hidden="true" />
          <span>发现</span>
        </RouterLink>
        <RouterLink
          class="app-layout__nav-link"
          to="/structure"
          aria-label="分类"
        >
          <Network class="app-layout__nav-icon" aria-hidden="true" />
          <span>分类</span>
        </RouterLink>
        <RouterLink
          class="app-layout__nav-link app-layout__nav-link--overflow-direct"
          to="/ranking"
          aria-label="热榜"
        >
          <TrendingUp class="app-layout__nav-icon" aria-hidden="true" />
          <span>热榜</span>
        </RouterLink>
        <RouterLink
          class="app-layout__nav-link app-layout__nav-link--overflow-direct"
          to="/editor"
          aria-label="写作"
        >
          <PenLine class="app-layout__nav-icon" aria-hidden="true" />
          <span>写作</span>
        </RouterLink>
        <details class="app-layout__more">
          <summary class="app-layout__more-summary">...更多</summary>
          <div class="app-layout__more-menu">
            <RouterLink to="/ranking">热榜</RouterLink>
            <RouterLink to="/editor">写作</RouterLink>
          </div>
        </details>
      </nav>

      <div class="app-layout__actions">
        <RouterLink
          v-if="!isLoggedIn"
          class="app-layout__session-action app-layout__login"
          to="/auth/login"
        >
          登录
        </RouterLink>
        <button
          v-else
          class="app-layout__session-action app-layout__logout"
          type="button"
          @click="logout"
        >
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
import { BookOpen, Network, PenLine, TrendingUp } from "@lucide/vue";
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

defineProps<{
  isLoggedIn: boolean;
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

.app-layout__brand-area,
.app-layout__brand {
  display: inline-flex;
  align-items: center;
}

.app-layout__brand-area {
  gap: var(--space-2);
}

.app-layout__brand {
  gap: 10px;
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

.app-layout__nav a,
.app-layout__more-summary {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-text-soft);
  text-decoration: none;
}

.app-layout__more {
  position: relative;
  display: none;
}

.app-layout__more-summary {
  list-style: none;
  cursor: pointer;
}

.app-layout__more-summary::-webkit-details-marker {
  display: none;
}

.app-layout__more-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  z-index: 30;
  display: grid;
  gap: var(--space-1);
  min-width: 108px;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-panel);
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

.app-layout__nav a.router-link-exact-active,
.app-layout__more-menu a.router-link-exact-active {
  color: var(--color-text-strong);
  background: var(--color-bg-elevated);
}

.app-layout__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.app-layout__session-action {
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  text-decoration: none;
  border: 1px solid var(--color-border);
  background: var(--color-panel-soft);
  color: var(--color-text-soft);
  font: inherit;
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
    grid-template-columns: auto auto minmax(0, 1fr);
    gap: var(--space-2);
    align-items: center;
    min-height: 48px;
    padding: var(--space-2) var(--space-3);
  }

  .app-layout__brand-area,
  .app-layout__brand {
    gap: var(--space-1);
    min-width: 0;
  }

  .app-layout__brand-mark {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-md);
    font-size: 15px;
  }

  .app-layout__brand span:last-child {
    display: block;
  }

  .app-layout__brand strong {
    font-size: 13px;
    line-height: 1;
  }

  .app-layout__brand small {
    display: none;
  }

  .app-layout__nav {
    flex-wrap: nowrap;
    gap: var(--space-1);
    justify-content: space-between;
    min-width: 0;
    width: auto;
    max-width: min(54vw, 176px);
    justify-self: start;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }

  .app-layout__nav a,
  .app-layout__more-summary {
    flex: 0 0 auto;
    min-height: 30px;
    min-width: 0;
    padding: 0 var(--space-1);
    border-radius: 0;
    color: var(--color-text-soft);
    font-size: 0.6875rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .app-layout__nav span {
    font-size: 0.6875rem;
    line-height: 1;
  }

  .app-layout__nav a.router-link-exact-active {
    width: auto;
    padding: 0 var(--space-1);
    background: transparent;
    box-shadow: inset 0 -2px 0 var(--color-accent);
    color: var(--color-text-strong);
  }

  .app-layout__nav-icon {
    display: none;
  }

  .app-layout__more-menu {
    right: auto;
    left: 50%;
    min-width: 96px;
    transform: translateX(-50%);
  }

  .app-layout__more-menu a {
    justify-content: flex-start;
    min-height: 32px;
    padding: 0 var(--space-2);
  }

  .app-layout__actions {
    flex-wrap: nowrap;
    justify-content: flex-end;
    justify-self: end;
    min-width: 0;
  }

  .app-layout__session-action {
    min-height: 30px;
    padding: 0 var(--space-2);
    border-radius: 0;
    background: transparent;
    font-size: 0.6875rem;
    font-weight: 700;
  }
}

@media (max-width: 360px) {
  .app-layout__header {
    grid-template-columns: auto minmax(112px, 132px) minmax(0, 1fr);
  }

  .app-layout__nav {
    width: 100%;
  }

  .app-layout__nav-link--overflow-direct {
    display: none;
  }

  .app-layout__more {
    display: block;
  }
}
</style>
