<!--
  默认布局组件
  包含 Header、Footer、Sidebar 的三栏布局
  适用于首页、文章详情、用户中心等页面
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import AppSidebar from '@/components/common/AppSidebar.vue';

// 响应式侧边栏状态
const isSidebarOpen = ref(false);

// 侧边栏容器引用
const sidebarRef = ref<HTMLElement | null>(null);

// 汉堡按钮引用（用于返回焦点）
const hamburgerButtonRef = ref<HTMLElement | null>(null);

// 当前路由
const route = useRoute();

// 是否移动端
const isMobile = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.matchMedia('(max-width: 767px)').matches;
};

// 是否显示侧边栏（某些页面可能不需要侧边栏）
const showSidebar = computed(() => {
  // 如果侧边栏被显式打开（如移动端抽屉），则总是显示
  if (isSidebarOpen.value) {
    return true;
  }

  // PC 端仅首页显示
  if (!isMobile.value) {
    return route.name === 'Home';
  }

  // 移动端根据路由配置决定是否显示（默认显示）
  return route.meta?.showSidebar !== false;
});

// 是否显示右侧栏（PC 端只在主页显示）
const showAside = computed(() => {
  return route.name === 'Home';
});

/**
 * 切换侧边栏显示状态（移动端）
 */
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

/**
 * 关闭侧边栏
 */
const closeSidebar = () => {
  isSidebarOpen.value = false;
};

/**
 * 处理 Escape 键关闭侧边栏
 */
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isSidebarOpen.value) {
    closeSidebar();
  }
};

// 挂载时添加 Escape 键监听
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);

  updateIsMobile();
  window.addEventListener('resize', updateIsMobile);
  
  // 获取汉堡按钮引用
  const hamburgerButton = document.querySelector('.app-header__hamburger') as HTMLElement;
  if (hamburgerButton) {
    hamburgerButtonRef.value = hamburgerButton;
  }
});

// 卸载时移除 Escape 键监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  window.removeEventListener('resize', updateIsMobile);
});
</script>

<template>
  <div class="default-layout">
    <!-- 页头 -->
    <AppHeader 
      class="default-layout__header"
      :is-sidebar-open="isSidebarOpen"
      @toggle-sidebar="toggleSidebar"
    />
    
    <!-- 主要内容区域 -->
    <div class="default-layout__main">
      <!-- 侧边栏 -->
      <AppSidebar
        v-if="showSidebar"
        ref="sidebarRef"
        class="default-layout__sidebar"
        :class="{ 'default-layout__sidebar--open': isSidebarOpen }"
        :is-open="isSidebarOpen"
        @close="closeSidebar"
      />
      
      <!-- 内容区域 -->
      <main class="default-layout__content">
        <div class="default-layout__content-inner">
          <slot />
        </div>
      </main>
      
      <!-- 右侧栏（可选，PC 端只在主页显示） -->
      <aside 
        v-if="showAside"
        class="default-layout__aside"
      >
        <!-- Teleport 目标：主页侧边栏 -->
        <div
          id="home-sidebar-slot"
          class="default-layout__aside-slot"
        />
      </aside>
    </div>
    
    <!-- 页脚 -->
    <AppFooter class="default-layout__footer" />
    
    <!-- 移动端侧边栏遮罩 -->
    <div
      v-if="isSidebarOpen"
      class="default-layout__overlay"
      role="button"
      tabindex="0"
      aria-label="关闭侧边栏"
      @click="closeSidebar"
      @keydown.enter="closeSidebar"
      @keydown.space.prevent="closeSidebar"
      @keydown.esc="closeSidebar"
    />
  </div>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
}

.default-layout__header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.default-layout__main {
  flex: 1;
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.default-layout__sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: calc(80px + var(--space-lg)); /* Header height + padding */
  height: fit-content;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}

.default-layout__content {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.default-layout__content-inner {
  background-color: var(--color-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  min-height: 600px;
}

.default-layout__aside {
  width: 320px;
  flex-shrink: 0;
  position: sticky;
  top: calc(80px + var(--space-lg));
  align-self: flex-start;
}

.default-layout__aside-slot {
  width: 100%;
}

.default-layout__footer {
  margin-top: var(--space-2xl);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
}

.default-layout__overlay {
  display: none;
}

.default-layout__overlay:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: -4px;
}

.default-layout__overlay:focus:not(:focus-visible) {
  outline: none;
}

.default-layout__overlay:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: -4px;
}

/* ========== 响应式设计 ========== */

/* 平板设备 (768px - 1023px) */
@media (max-width: 1023px) {
  .default-layout__main {
    gap: var(--space-md);
    padding: var(--space-md);
  }
  
  .default-layout__aside {
    display: none; /* 平板设备隐藏右侧栏 */
  }
  
  .default-layout__sidebar {
    width: 240px;
  }
  
  .default-layout__content-inner {
    padding: var(--space-lg);
  }
}

/* 移动设备 (< 768px) */
@media (max-width: 767px) {
  .default-layout__main {
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-sm);
  }
  
  .default-layout__sidebar {
    position: fixed;
    top: 0;
    left: 0;
    /* 任务 3.1: 设置固定宽度为 280px */
    width: 280px;
    /* 任务 3.1: 设置高度为 100vh */
    height: 100vh;
    z-index: 200;
    /* 任务 7.1: 实现向左侧滑出的动画 - 初始状态 */
    transform: translateX(-100%);
    /* 任务 7.1: 使用 300ms 的动画时长和 cubic-bezier(0.4, 0, 0.2, 1) 缓动函数 */
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    max-height: none;
    overflow-y: auto;
    background-color: var(--color-bg);
    border-radius: 0;
    padding-top: calc(56px + var(--space-lg)); /* 移动端 header 高度 56px + padding */
    /* 任务 3.1: 添加 var(--shadow-2xl) 阴影 */
    box-shadow: var(--shadow-2xl);
    /* 任务 7.3: 添加 will-change 提示 */
    will-change: transform;
    /* 任务 7.3: 使用 -webkit-overflow-scrolling: touch 优化滚动 */
    -webkit-overflow-scrolling: touch;
  }
  
  .default-layout__sidebar--open {
    /* 任务 7.1: 实现从左侧滑入的动画 - 打开状态 */
    transform: translateX(0);
  }
  
  .default-layout__content-inner {
    padding: var(--space-md);
    border-radius: var(--radius-md);
  }
  
  .default-layout__overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* 任务 7.2: 添加半透明黑色遮罩层 rgba(0, 0, 0, 0.5) */
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 150;
    /* 任务 7.2: 实现淡入动画 */
    animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
    /* 任务 7.3: 添加 will-change 提示 */
    will-change: opacity;
  }
}

/* 小屏移动设备 (< 480px) */
@media (max-width: 479px) {
  .default-layout__main {
    padding: var(--space-xs);
  }
  
  .default-layout__sidebar {
    width: 85vw;
    max-width: 320px;
  }
  
  .default-layout__content-inner {
    padding: var(--space-sm);
  }
}

/* 大屏设备 (> 1440px) */
@media (min-width: 1441px) {
  .default-layout__main {
    gap: var(--space-xl);
    padding: var(--space-xl);
  }
  
  .default-layout__sidebar {
    width: 320px;
  }
  
  .default-layout__aside {
    width: 360px;
  }
  
  .default-layout__content-inner {
    padding: var(--space-3xl);
  }
}

/* 动画定义 */
/* 任务 7.2: 实现淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 任务 7.2: 实现淡出动画 */
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

/* 任务 8.3: 添加减少动画支持 */
@media (prefers-reduced-motion: reduce) {
  .default-layout__sidebar {
    transition: none;
  }
  
  .default-layout__overlay {
    animation: none;
  }
}

/* ========== 横屏模式优化 ========== */

/* 任务 9.2: 优化横屏模式 - 移动设备横屏 */
@media (max-width: 767px) and (orientation: landscape) {
  .default-layout__sidebar {
    /* 任务 9.2: 调整侧边栏宽度 - 横屏时使用更小的宽度 */
    width: 240px;
    /* 任务 9.2: 确保内容不被遮挡 - 调整顶部内边距 */
    padding-top: calc(48px + var(--space-md));
    /* 任务 9.2: 优化滚动体验 */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  .default-layout__main {
    /* 任务 9.2: 减小主内容区域内边距 */
    padding: var(--space-xs);
  }
  
  .default-layout__content-inner {
    /* 任务 9.2: 减小内容内边距以节省空间 */
    padding: var(--space-sm);
    min-height: auto;
  }
}

/* 任务 9.2: 小屏设备横屏模式 */
@media (max-width: 479px) and (orientation: landscape) {
  .default-layout__sidebar {
    /* 任务 9.2: 更小的侧边栏宽度 */
    width: 200px;
    /* 任务 9.2: 调整顶部内边距 */
    padding-top: calc(44px + var(--space-sm));
    /* 任务 9.2: 减小内边距 */
    padding-left: var(--space-sm);
    padding-right: var(--space-sm);
  }
  
  .default-layout__main {
    padding: var(--space-xs);
  }
  
  .default-layout__content-inner {
    padding: var(--space-xs);
  }
}
</style>
