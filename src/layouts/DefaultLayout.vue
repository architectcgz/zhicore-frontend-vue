<!--
  默认布局组件
  包含 Header、Footer、Sidebar 的主站布局
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import AppSidebar from '@/components/common/AppSidebar.vue';

const isSidebarOpen = ref(false);
const route = useRoute();
const isMobile = ref(false);

const updateIsMobile = () => {
  if (typeof window === 'undefined') {
    return;
  }

  isMobile.value = window.matchMedia('(max-width: 767px)').matches;
};

const isHomeRoute = computed(() => route.name === 'Home');
const isPostDetailRoute = computed(() => route.name === 'PostDetail');
const cardlessRouteNames = new Set([
  'UserProfile',
  'Settings',
  'Posts',
  'CategoryList',
  'CategoryDetail',
  'TagList',
  'TagDetail',
  'Ranking',
]);
const isCardlessContentRoute = computed(() => {
  const routeName = String(route.name ?? '');
  if (cardlessRouteNames.has(routeName)) {
    return true;
  }

  // /posts 当前只有父路由，不挂载具体页面组件；保留无卡片主区域以避免落回默认卡片壳。
  if (route.path === '/posts') {
    return true;
  }

  return false;
});
const showSidebar = computed(() => {
  if (!isMobile.value) {
    return false;
  }

  if (isSidebarOpen.value) {
    return true;
  }

  return route.meta?.showSidebar !== false;
});

const showAside = computed(() => !isMobile.value && isHomeRoute.value);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  isSidebarOpen.value = false;
};

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isSidebarOpen.value) {
    closeSidebar();
  }
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
  document.addEventListener('keydown', handleEscapeKey);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateIsMobile);
  document.removeEventListener('keydown', handleEscapeKey);
});
</script>

<template>
  <div class="default-layout">
    <AppHeader
      class="default-layout__header"
      :is-sidebar-open="isSidebarOpen"
      @toggle-sidebar="toggleSidebar"
    />

    <div
      v-if="isPostDetailRoute"
      id="post-detail-progress-bar"
      class="default-layout__reading-progress"
    >
      <div
        id="post-detail-progress-fill"
        class="default-layout__reading-progress-fill"
      />
    </div>

    <div
      class="default-layout__main"
      :class="{
        'default-layout__main--with-aside': showAside,
        'default-layout__main--post-detail': isPostDetailRoute,
      }"
    >
      <AppSidebar
        v-if="showSidebar"
        class="default-layout__sidebar"
        :class="{ 'default-layout__sidebar--open': isSidebarOpen }"
        :is-open="isSidebarOpen"
        @close="closeSidebar"
      />

      <div
        v-if="isPostDetailRoute"
        id="post-detail-reading-slot"
        class="default-layout__portal default-layout__portal--reading"
      />

      <main class="default-layout__content">
        <div
          class="default-layout__content-inner"
          :class="{
            'default-layout__content-inner--home': isHomeRoute,
            'default-layout__content-inner--transparent': isPostDetailRoute,
            'default-layout__content-inner--plain': isCardlessContentRoute,
          }"
        >
          <slot />
        </div>
      </main>

      <div
        v-if="isPostDetailRoute"
        id="post-detail-action-slot"
        class="default-layout__portal default-layout__portal--action"
      />

      <aside
        v-if="showAside"
        class="default-layout__aside"
      >
        <div
          id="home-sidebar-slot"
          class="default-layout__aside-shell"
        />
      </aside>
    </div>

    <AppFooter class="default-layout__footer" />

    <button
      v-if="isSidebarOpen"
      class="default-layout__overlay"
      type="button"
      aria-label="关闭侧边栏"
      @click="closeSidebar"
    />
  </div>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.default-layout__header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 120;
  background: transparent;
}

.default-layout__reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 130;
  height: 3px;
  pointer-events: none;
}

.default-layout__reading-progress-fill {
  height: 100%;
  width: var(--post-reading-progress, 0%);
  background: linear-gradient(
    90deg,
    var(--color-accent, #34d399) 0%,
    color-mix(in srgb, var(--color-accent, #34d399) 70%, #f6c778) 100%
  );
  transition: width 120ms linear;
  transform-origin: left center;
}

.default-layout__main {
  flex: 1;
  display: grid;
  gap: var(--space-xl);
  width: min(1640px, calc(100% - 40px));
  margin: 130px auto 0;
  padding: var(--space-xl) 0 var(--space-3xl);
}

.default-layout__main--with-aside {
  grid-template-columns: minmax(0, 1fr) 360px;
}

.default-layout__main--post-detail {
  grid-template-columns: 240px minmax(0, 1fr) 124px;
  align-items: start;
}

.default-layout__content {
  min-width: 0;
}

.default-layout__portal {
  min-width: 0;
}

.default-layout__portal--reading {
  position: sticky;
  top: 104px;
  align-self: start;
}

.default-layout__portal--action {
  position: sticky;
  top: 96px;
  align-self: start;
  width: 124px;
  justify-self: end;
}

.default-layout__content-inner {
  min-height: 64vh;
  padding: var(--space-xl);
  border-radius: var(--radius-2xl);
  border: 1px solid var(--color-border);
  background: var(--gradient-card);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(20px);
}

.default-layout__content-inner--home {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.default-layout__content-inner--transparent {
  padding: 0;
  border-color: transparent;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.default-layout__content-inner--plain {
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.default-layout__aside {
  position: sticky;
  top: 112px;
  align-self: start;
}

.default-layout__aside-shell {
  min-height: 0;
  padding: 0;
  border-radius: 0;
}

.default-layout__footer {
  position: relative;
  margin-top: auto;
  border-top: 1px solid var(--color-border);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), rgba(18, 49, 76, 0.03));
  backdrop-filter: blur(14px);
}

.default-layout__sidebar {
  display: none;
}

.default-layout__overlay {
  position: fixed;
  inset: 0;
  z-index: 140;
  border: none;
  background: rgba(6, 15, 25, 0.46);
  backdrop-filter: blur(6px);
}

@media (max-width: 1199px) {
  .default-layout__main {
    width: min(100%, calc(100% - 24px));
    gap: var(--space-lg);
    margin-top: 124px;
    padding-top: var(--space-lg);
  }

  .default-layout__main--with-aside {
    grid-template-columns: minmax(0, 1fr) 320px;
  }

  .default-layout__main--post-detail {
    grid-template-columns: minmax(0, 1fr) 124px;
  }

  .default-layout__portal--reading {
    display: none;
  }

  .default-layout__content-inner {
    padding: var(--space-lg);
  }

  .default-layout__content-inner--transparent {
    padding: 0;
  }
}

@media (max-width: 1023px) {
  .default-layout__main {
    grid-template-columns: minmax(0, 1fr);
  }

  .default-layout__aside {
    display: none;
  }

  .default-layout__main--post-detail {
    grid-template-columns: minmax(0, 1fr);
  }

  .default-layout__portal--reading {
    display: none;
  }

  .default-layout__portal--action {
    width: 100%;
    justify-self: stretch;
  }
}

@media (max-width: 767px) {
  .default-layout__header {
    top: 0;
  }

  .default-layout__main {
    width: min(100%, calc(100% - 12px));
    margin-top: 98px;
    padding: var(--space-sm) 0 var(--space-xl);
  }

  .default-layout__content-inner {
    padding: var(--space-md);
    border-radius: var(--radius-xl);
  }

  .default-layout__content-inner--home {
    padding: 0;
  }

  .default-layout__content-inner--transparent {
    padding: 0;
  }

  .default-layout__portal--action {
    display: none;
  }

  .default-layout__sidebar {
    display: block;
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 160;
    width: min(86vw, 320px);
    height: 100vh;
    padding: 84px var(--space-md) var(--space-md);
    border-right: 1px solid var(--color-border);
    background: rgba(251, 248, 242, 0.9);
    box-shadow: var(--shadow-2xl);
    transform: translateX(-100%);
    transition: transform var(--transition-slow);
    backdrop-filter: blur(18px);
    overflow-y: auto;
  }

  [data-theme='dark'] .default-layout__sidebar {
    background: rgba(8, 19, 31, 0.92);
  }

  .default-layout__sidebar--open {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .default-layout__sidebar {
    transition: none;
  }
}
</style>
