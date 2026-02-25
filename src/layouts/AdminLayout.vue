<!--
  管理后台布局组件
  包含侧边栏导航、顶部导航栏、面包屑导航
  适用于管理员后台页面
-->

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  Menu as IconMenu,
  Fold as IconFold,
  Expand as IconExpand,
  HomeFilled,
  User,
  Document,
  ChatLineSquare,
  Bell,
  Setting,
  SwitchButton,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { MenuItem } from '@/types/components';
import logoSvg from '@/assets/logo.svg';

// 路由和认证
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// 侧边栏状态
const isCollapsed = ref(false);
const isMobileSidebarOpen = ref(false);

/**
 * 管理后台菜单配置
 */
const menuItems: MenuItem[] = [
  {
    path: '/admin/dashboard',
    title: '仪表板',
    icon: HomeFilled,
  },
  {
    path: '/admin/users',
    title: '用户管理',
    icon: User,
  },
  {
    path: '/admin/posts',
    title: '文章管理',
    icon: Document,
  },
  {
    path: '/admin/comments',
    title: '评论管理',
    icon: ChatLineSquare,
  },
  {
    path: '/admin/reports',
    title: '举报管理',
    icon: Bell,
  },
  {
    path: '/admin/settings',
    title: '系统设置',
    icon: Setting,
  },
];

/**
 * 当前激活的菜单路径
 */
const activeMenu = computed(() => route.path);

/**
 * 面包屑导航
 */
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title);
  return [
    { title: '管理后台', path: '/admin/dashboard' },
    ...matched.map(item => ({
      title: item.meta.title as string,
      path: item.path,
    })),
  ];
});

/**
 * 切换侧边栏折叠状态
 */
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

/**
 * 切换移动端侧边栏
 */
const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

/**
 * 关闭移动端侧边栏
 */
const closeMobileSidebar = () => {
  isMobileSidebarOpen.value = false;
};

/**
 * 处理菜单点击
 */
const handleMenuClick = (path: string) => {
  router.push(path);
  closeMobileSidebar();
};

/**
 * 退出登录
 */
const handleLogout = async () => {
  try {
    await authStore.logout();
    ElMessage.success('退出登录成功');
    router.push('/auth/login');
  } catch (error) {
    ElMessage.error('退出登录失败');
  }
};

/**
 * 返回前台
 */
const goToFrontend = () => {
  router.push('/');
};
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <aside
      class="admin-layout__sidebar"
      :class="{
        'admin-layout__sidebar--collapsed': isCollapsed,
        'admin-layout__sidebar--mobile-open': isMobileSidebarOpen,
      }"
    >
      <!-- Logo 区域 -->
      <div class="admin-layout__logo">
        <img
          v-if="!isCollapsed"
          :src="logoSvg"
          alt="Logo"
          class="admin-layout__logo-img"
        >
        <span
          v-if="!isCollapsed"
          class="admin-layout__logo-text"
        >
          管理后台
        </span>
        <img
          v-else
          :src="logoSvg"
          alt="Logo"
          class="admin-layout__logo-img--small"
        >
      </div>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        class="admin-layout__menu"
        background-color="var(--color-primary)"
        text-color="rgba(255, 255, 255, 0.8)"
        active-text-color="#ffffff"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.path"
          :index="item.path"
          @click="handleMenuClick(item.path)"
        >
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>
            {{ item.title }}
          </template>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 主内容区域 -->
    <div class="admin-layout__main">
      <!-- 顶部导航栏 -->
      <header class="admin-layout__header">
        <!-- 左侧：折叠按钮 -->
        <div class="admin-layout__header-left">
          <!-- 桌面端折叠按钮 -->
          <el-button
            class="admin-layout__collapse-btn desktop-only"
            text
            @click="toggleCollapse"
          >
            <el-icon size="20">
              <IconExpand v-if="isCollapsed" />
              <IconFold v-else />
            </el-icon>
          </el-button>

          <!-- 移动端菜单按钮 -->
          <el-button
            class="admin-layout__collapse-btn mobile-only"
            text
            @click="toggleMobileSidebar"
          >
            <el-icon size="20">
              <IconMenu />
            </el-icon>
          </el-button>

          <!-- 面包屑导航 -->
          <el-breadcrumb
            separator="/"
            class="admin-layout__breadcrumb"
          >
            <el-breadcrumb-item
              v-for="(item, index) in breadcrumbs"
              :key="item.path"
              :to="index < breadcrumbs.length - 1 ? item.path : undefined"
            >
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <!-- 右侧：用户信息和操作 -->
        <div class="admin-layout__header-right">
          <!-- 返回前台按钮 -->
          <el-button
            type="primary"
            size="small"
            @click="goToFrontend"
          >
            返回前台
          </el-button>

          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleLogout">
            <div class="admin-layout__user">
              <el-avatar
                :src="authStore.user?.avatar"
                :size="32"
              >
                {{ authStore.user?.nickname?.charAt(0) }}
              </el-avatar>
              <span class="admin-layout__username">
                {{ authStore.user?.nickname }}
              </span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 内容区域 -->
      <main class="admin-layout__content">
        <div class="admin-layout__content-inner">
          <slot />
        </div>
      </main>
    </div>

    <!-- 移动端遮罩 -->
    <div
      v-if="isMobileSidebarOpen"
      class="admin-layout__overlay"
      @click="closeMobileSidebar"
    />
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

/* ========== 侧边栏 ========== */

.admin-layout__sidebar {
  width: 240px;
  background-color: var(--color-primary);
  color: white;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  overflow-x: hidden;
  overflow-y: auto;
}

.admin-layout__sidebar--collapsed {
  width: 64px;
}

.admin-layout__logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-layout__logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.admin-layout__logo-img--small {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.admin-layout__logo-text {
  font-size: 18px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.admin-layout__menu {
  flex: 1;
  border: none;
}

.admin-layout__menu :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8);
}

.admin-layout__menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1);
}

.admin-layout__menu :deep(.el-menu-item.is-active) {
  background-color: var(--color-cta);
  color: white;
}

/* ========== 主内容区域 ========== */

.admin-layout__main {
  flex: 1;
  margin-left: 240px;
  display: flex;
  flex-direction: column;
  transition: margin-left var(--transition-base);
}

.admin-layout__sidebar--collapsed + .admin-layout__main {
  margin-left: 64px;
}

/* ========== 顶部导航栏 ========== */

.admin-layout__header {
  height: 64px;
  background-color: white;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.admin-layout__header-left {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.admin-layout__collapse-btn {
  color: var(--color-text);
}

.admin-layout__breadcrumb {
  font-size: 14px;
}

.admin-layout__header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.admin-layout__user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-base);
}

.admin-layout__user:hover {
  background-color: var(--color-bg-secondary);
}

.admin-layout__username {
  font-size: 14px;
  color: var(--color-text);
}

/* ========== 内容区域 ========== */

.admin-layout__content {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

.admin-layout__content-inner {
  background-color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-sm);
  min-height: calc(100vh - 64px - var(--space-lg) * 2);
}

/* ========== 移动端遮罩 ========== */

.admin-layout__overlay {
  display: none;
}

/* ========== 响应式设计 ========== */

.desktop-only {
  display: inline-flex;
}

.mobile-only {
  display: none;
}

/* 平板设备 (768px - 1023px) */
@media (max-width: 1023px) {
  .admin-layout__content {
    padding: var(--space-md);
  }

  .admin-layout__content-inner {
    padding: var(--space-lg);
  }

  .admin-layout__breadcrumb {
    display: none;
  }
}

/* 移动设备 (< 768px) */
@media (max-width: 767px) {
  .admin-layout__sidebar {
    transform: translateX(-100%);
    transition: transform var(--transition-base);
  }

  .admin-layout__sidebar--mobile-open {
    transform: translateX(0);
  }

  .admin-layout__main {
    margin-left: 0;
  }

  .admin-layout__sidebar--collapsed + .admin-layout__main {
    margin-left: 0;
  }

  .admin-layout__header {
    padding: 0 var(--space-md);
  }

  .admin-layout__username {
    display: none;
  }

  .admin-layout__content {
    padding: var(--space-sm);
  }

  .admin-layout__content-inner {
    padding: var(--space-md);
    border-radius: var(--radius-md);
  }

  .admin-layout__overlay {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }

  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: inline-flex;
  }
}
</style>
