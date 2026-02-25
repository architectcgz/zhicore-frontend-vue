<!--
  应用头部组件
  包含导航栏、搜索框、用户菜单、通知和消息图标
  支持响应式设计和汉堡菜单
-->

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import ThemeToggle from './ThemeToggle.vue';
import NotificationDropdown from '../notification/NotificationDropdown.vue';

// 定义事件
const emit = defineEmits<{
  'toggle-sidebar': [];
}>();

// 定义 props
const props = defineProps<{
  isSidebarOpen?: boolean;
}>();

// 路由和状态
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// 主题
// 响应式状态
const searchQuery = ref('');
const showUserMenu = ref(false);
const showNotifications = ref(false);

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const unreadNotificationCount = computed(() => notificationStore.unreadCount);
const unreadMessageCount = ref(0); // TODO: 从消息 store 获取

// 导航链接
const navLinks = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '文章', path: '/posts', icon: '📝' },
  { name: '标签', path: '/tags', icon: '🏷️' },
  { name: '排行榜', path: '/ranking', icon: '🏆' },
];

/**
 * 处理搜索提交
 */
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value.trim() }
    });
    searchQuery.value = '';
  }
};

/**
 * 处理搜索输入
 */
const handleSearchInput = () => {
  // TODO: 实现搜索建议
};

/**
 * 切换侧边栏
 */
const toggleSidebar = () => {
  emit('toggle-sidebar');
};

/**
 * 切换用户菜单
 */
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

/**
 * 切换通知面板
 */
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
};

/**
 * 处理用户菜单项点击
 */
const handleUserMenuClick = (action: string) => {
  showUserMenu.value = false;
  
  switch (action) {
    case 'profile':
      router.push(`/users/${user.value?.id}`);
      break;
    case 'settings':
      router.push('/settings');
      break;
    case 'drafts':
      router.push('/drafts');
      break;
    case 'create':
      router.push('/posts/create');
      break;
    case 'admin':
      router.push('/admin/dashboard');
      break;
    case 'logout':
      authStore.logout();
      router.push('/');
      break;
  }
};

/**
 * 导航到登录页
 */
const goToLogin = () => {
  router.push('/auth/login');
};

/**
 * 导航到注册页
 */
const goToRegister = () => {
  router.push('/auth/register');
};

/**
 * 导航到消息页面
 */
const goToMessages = () => {
  router.push('/messages');
};

/**
 * 关闭所有下拉菜单
 */
const closeAllDropdowns = () => {
  showUserMenu.value = false;
  showNotifications.value = false;
};

// 点击外部关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.app-header__dropdown')) {
    closeAllDropdowns();
  }
};

onMounted(() => {
  if (typeof document === 'undefined') return;
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <header class="app-header">
    <div class="app-header__container">
      <!-- 左侧区域 -->
      <div class="app-header__left">
        <!-- 汉堡菜单按钮（移动端） -->
        <button
          class="app-header__hamburger"
          aria-label="切换侧边栏"
          :aria-expanded="props.isSidebarOpen"
          @click="toggleSidebar"
        >
          <span />
          <span />
          <span />
        </button>
        
        <!-- 侧边栏切换按钮（桌面端） -->
        <button
          class="app-header__sidebar-toggle"
          aria-label="切换侧边栏"
          :aria-expanded="props.isSidebarOpen"
          @click="toggleSidebar"
        >
          <span class="app-header__sidebar-toggle-icon">☰</span>
        </button>
        
        <!-- Logo -->
        <router-link 
          to="/" 
          class="app-header__logo"
        >
          <h1 class="app-header__logo-text">
            知构
          </h1>
        </router-link>
        
        <!-- 桌面端导航链接 -->
        <nav class="app-header__nav">
          <router-link
            v-for="link in navLinks"
            :key="link.path"
            :to="link.path"
            class="app-header__nav-link"
            :class="{ 'app-header__nav-link--active': route.path === link.path }"
          >
            <span class="app-header__nav-icon">{{ link.icon }}</span>
            <span class="app-header__nav-text">{{ link.name }}</span>
          </router-link>
        </nav>
      </div>
      
      <!-- 中间搜索区域 -->
      <div class="app-header__search">
        <form 
          class="app-header__search-form"
          @submit.prevent="handleSearch"
        >
          <input
            v-model="searchQuery"
            type="text"
            class="app-header__search-input"
            placeholder="搜索文章、用户..."
            @input="handleSearchInput"
          >
          <button
            type="submit"
            class="app-header__search-button"
            aria-label="搜索"
          >
            <span class="app-header__search-icon">🔍</span>
          </button>
        </form>
      </div>
      
      <!-- 右侧区域 -->
      <div class="app-header__right">
        <!-- 主题切换 -->
        <ThemeToggle />
        
        <!-- 已登录用户功能 -->
        <template v-if="isAuthenticated">
          <!-- 通知图标 -->
          <div class="app-header__dropdown">
            <button
              class="app-header__icon-button"
              :class="{ 'app-header__icon-button--active': showNotifications }"
              aria-label="通知"
              :aria-expanded="showNotifications"
              @click="toggleNotifications"
            >
              <span class="app-header__icon">🔔</span>
              <span 
                v-if="unreadNotificationCount > 0"
                class="app-header__badge"
                aria-label="`${unreadNotificationCount} 条未读通知`"
              >
                {{ unreadNotificationCount > 99 ? '99+' : unreadNotificationCount }}
              </span>
            </button>
            
            <!-- 通知下拉面板 -->
            <NotificationDropdown
              :visible="showNotifications"
              @update:visible="showNotifications = $event"
              @close="showNotifications = false"
            />
          </div>
          
          <!-- 消息图标 -->
          <button
            class="app-header__icon-button"
            aria-label="消息"
            @click="goToMessages"
          >
            <span class="app-header__icon">💬</span>
            <span 
              v-if="unreadMessageCount > 0"
              class="app-header__badge"
              aria-label="`${unreadMessageCount} 条未读消息`"
            >
              {{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}
            </span>
          </button>
          
          <!-- 用户菜单 -->
          <div class="app-header__dropdown">
            <button
              class="app-header__user-button"
              :class="{ 'app-header__user-button--active': showUserMenu }"
              aria-label="用户菜单"
              :aria-expanded="showUserMenu"
              @click="toggleUserMenu"
            >
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.nickname"
                class="app-header__user-avatar"
              >
              <div
                v-else
                class="app-header__user-avatar app-header__user-avatar--placeholder"
              >
                {{ user?.nickname?.charAt(0) || 'U' }}
              </div>
              <span class="app-header__user-name">
                {{ user?.nickname || '用户' }}
              </span>
              <span class="app-header__user-arrow">▼</span>
            </button>
            
            <!-- 用户下拉菜单 -->
            <div
              v-if="showUserMenu"
              class="app-header__dropdown-panel app-header__user-menu"
            >
              <div class="app-header__user-info">
                <img
                  v-if="user?.avatar"
                  :src="user.avatar"
                  :alt="user.nickname"
                  class="app-header__user-info-avatar"
                >
                <div
                  v-else
                  class="app-header__user-info-avatar app-header__user-info-avatar--placeholder"
                >
                  {{ user?.nickname?.charAt(0) || 'U' }}
                </div>
                <div class="app-header__user-details">
                  <div class="app-header__user-details-name">
                    {{ user?.nickname || '用户' }}
                  </div>
                  <div class="app-header__user-details-email">
                    {{ user?.email }}
                  </div>
                </div>
              </div>
              
              <div class="app-header__user-menu-divider" />
              
              <button
                class="app-header__user-menu-item"
                @click="handleUserMenuClick('create')"
              >
                <span class="app-header__user-menu-icon">✏️</span>
                写文章
              </button>
              
              <button
                class="app-header__user-menu-item"
                @click="handleUserMenuClick('profile')"
              >
                <span class="app-header__user-menu-icon">👤</span>
                个人主页
              </button>
              
              <button
                class="app-header__user-menu-item"
                @click="handleUserMenuClick('drafts')"
              >
                <span class="app-header__user-menu-icon">📄</span>
                我的草稿
              </button>
              
              <button
                class="app-header__user-menu-item"
                @click="handleUserMenuClick('settings')"
              >
                <span class="app-header__user-menu-icon">⚙️</span>
                账户设置
              </button>
              
              <div 
                v-if="user?.role === 'ADMIN'"
                class="app-header__user-menu-divider"
              />
              
              <button
                v-if="user?.role === 'ADMIN'"
                class="app-header__user-menu-item"
                @click="handleUserMenuClick('admin')"
              >
                <span class="app-header__user-menu-icon">🛠️</span>
                管理后台
              </button>
              
              <div class="app-header__user-menu-divider" />
              
              <button
                class="app-header__user-menu-item app-header__user-menu-item--danger"
                @click="handleUserMenuClick('logout')"
              >
                <span class="app-header__user-menu-icon">🚪</span>
                退出登录
              </button>
            </div>
          </div>
        </template>
        
        <!-- 未登录用户功能 -->
        <template v-else>
          <button
            class="app-header__auth-button app-header__auth-button--secondary"
            @click="goToLogin"
          >
            登录
          </button>
          <button
            class="app-header__auth-button app-header__auth-button--primary"
            @click="goToRegister"
          >
            注册
          </button>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.app-header__container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-lg);
}

/* ========== 左侧区域 ========== */

.app-header__left {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  flex: 1;
  min-width: 0;
}

.app-header__hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-md);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.app-header__hamburger:hover span {
  background-color: var(--color-text);
}

.app-header__hamburger:active {
  transform: scale(0.95);
}

.app-header__hamburger:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

.app-header__hamburger:focus:not(:focus-visible) {
  outline: none;
}

.app-header__hamburger:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

.app-header__hamburger span {
  width: 20px;
  height: 1.5px;
  background-color: var(--color-text-secondary);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.app-header__hamburger[aria-expanded="true"] span {
  background-color: var(--color-cta);
}

.app-header__hamburger[aria-expanded="true"] span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}

.app-header__hamburger[aria-expanded="true"] span:nth-child(2) {
  opacity: 0;
}

.app-header__hamburger[aria-expanded="true"] span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

.app-header__sidebar-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: all var(--transition-base);
}

.app-header__sidebar-toggle:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
}

.app-header__sidebar-toggle:focus {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-header__sidebar-toggle:focus:not(:focus-visible) {
  outline: none;
}

.app-header__sidebar-toggle:focus-visible {
  outline: 2px solid var(--color-cta);
  outline-offset: 2px;
}

.app-header__sidebar-toggle-icon {
  font-size: var(--font-size-lg);
}

.app-header__logo {
  text-decoration: none;
  color: var(--color-text);
  flex-shrink: 0;
}

.app-header__logo-text {
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  background: linear-gradient(135deg, var(--color-primary), var(--color-cta));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.app-header__nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-base);
  white-space: nowrap;
}

.app-header__nav-link:hover {
  background-color: var(--color-hover);
  color: var(--color-text);
}

.app-header__nav-link--active {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
}

.app-header__nav-icon {
  font-size: var(--font-size-base);
}

/* ========== 搜索区域 ========== */

.app-header__search {
  flex: 1;
  max-width: 400px;
  min-width: 200px;
}

.app-header__search-form {
  position: relative;
  display: flex;
  align-items: center;
}

.app-header__search-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-md) 0 var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  transition: all var(--transition-base);
}

.app-header__search-input:focus {
  outline: none;
  border-color: var(--color-cta);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.app-header__search-input::placeholder {
  color: var(--color-text-tertiary);
}

.app-header__search-button {
  position: absolute;
  right: var(--space-xs);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-full);
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.app-header__search-button:hover {
  background-color: var(--color-primary);
}

.app-header__search-icon {
  font-size: var(--font-size-sm);
}

/* ========== 右侧区域 ========== */

.app-header__right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.app-header__icon-button {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--radius-full);
  background-color: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
}

.app-header__icon-button:hover,
.app-header__icon-button--active {
  background-color: var(--color-hover);
  color: var(--color-text);
}

.app-header__icon {
  font-size: var(--font-size-lg);
}

.app-header__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 var(--space-xs);
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.app-header__user-button {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-radius: var(--radius-full);
  background-color: transparent;
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-base);
  max-width: 200px;
}

.app-header__user-button:hover,
.app-header__user-button--active {
  background-color: var(--color-hover);
}

.app-header__user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.app-header__user-avatar--placeholder {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.app-header__user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__user-arrow {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  transition: transform var(--transition-base);
}

.app-header__user-button--active .app-header__user-arrow {
  transform: rotate(180deg);
}

.app-header__auth-button {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  white-space: nowrap;
}

.app-header__auth-button--secondary {
  background-color: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.app-header__auth-button--secondary:hover {
  background-color: var(--color-hover);
  border-color: var(--color-cta);
}

.app-header__auth-button--primary {
  background-color: var(--color-cta);
  border: 1px solid var(--color-cta);
  color: var(--color-text-inverse);
}

.app-header__auth-button--primary:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

/* ========== 下拉菜单 ========== */

.app-header__dropdown {
  position: relative;
}

.app-header__dropdown-panel {
  position: absolute;
  top: calc(100% + var(--space-sm));
  right: 0;
  min-width: 280px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  overflow: hidden;
}

.app-header__dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

.app-header__dropdown-header h3 {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.app-header__dropdown-action {
  background: none;
  border: none;
  color: var(--color-cta);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: color var(--transition-base);
}

.app-header__dropdown-action:hover {
  color: var(--color-primary);
}

.app-header__dropdown-content {
  max-height: 300px;
  overflow-y: auto;
}

.app-header__empty-state {
  padding: var(--space-xl);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* 用户菜单特殊样式 */
.app-header__user-menu {
  min-width: 240px;
}

.app-header__user-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

.app-header__user-info-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.app-header__user-info-avatar--placeholder {
  background-color: var(--color-cta);
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.app-header__user-details-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-xs);
}

.app-header__user-details-email {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.app-header__user-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border: none;
  background: none;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-base);
}

.app-header__user-menu-item:hover {
  background-color: var(--color-hover);
}

.app-header__user-menu-item--danger {
  color: var(--color-danger);
}

.app-header__user-menu-item--danger:hover {
  background-color: var(--color-danger-light);
}

.app-header__user-menu-icon {
  font-size: var(--font-size-base);
  width: 20px;
  text-align: center;
}

.app-header__user-menu-divider {
  height: 1px;
  background-color: var(--color-border-light);
  margin: var(--space-xs) 0;
}

/* ========== 性能优化 ========== */

/* 使用硬件加速 - 所有动画使用 transform 和 opacity */
.app-header__hamburger span {
  /* 使用 GPU 加速 */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.app-header__dropdown-panel {
  /* 使用 GPU 加速 */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.app-header__dropdown-panel {
  contain: layout style paint;
}

.app-header__icon-button,
.app-header__user-button {
  contain: layout style;
}

/* ========== 响应式设计 ========== */

/* 平板设备 (768px - 1023px) */
@media (max-width: 1023px) {
  .app-header__container {
    padding: 0 var(--space-md);
    gap: var(--space-md);
  }
  
  .app-header__nav {
    display: none;
  }
  
  .app-header__sidebar-toggle {
    display: block;
  }
  
  .app-header__search {
    max-width: 300px;
  }
  
  .app-header__user-name {
    display: none;
  }
}

/* 移动设备 (< 768px) */
@media (max-width: 767px) {
  .app-header__container {
    padding: 0 12px;
    gap: 8px;
    height: 56px;
  }
  
  .app-header__hamburger {
    display: flex;
  }
  
  .app-header__sidebar-toggle {
    display: none;
  }
  
  .app-header__search {
    display: none;
  }
  
  .app-header__logo-text {
    font-size: 16px;
  }
  
  .app-header__right {
    gap: var(--space-sm);
  }
  
  .app-header__dropdown-panel {
    right: calc(-1 * var(--space-sm));
    left: var(--space-sm);
    min-width: auto;
  }
  
  .app-header__icon-button {
    width: 32px;
    height: 32px;
  }
  
  .app-header__icon {
    font-size: 18px;
  }
  
  .app-header__user-avatar {
    width: 28px;
    height: 28px;
  }
}

/* 小屏移动设备 (< 480px) */
@media (max-width: 479px) {
  .app-header__container {
    height: 56px;
    padding: 0 8px;
    gap: 6px;
  }
  
  .app-header__left {
    gap: 8px;
  }
  
  .app-header__logo-text {
    font-size: 15px;
  }
  
  .app-header__hamburger {
    width: 32px;
    height: 32px;
  }
  
  .app-header__icon-button {
    width: 32px;
    height: 32px;
  }
  
  .app-header__icon {
    font-size: 16px;
  }
  
  .app-header__badge {
    min-width: 16px;
    height: 16px;
    font-size: 10px;
    padding: 0 4px;
  }
  
  .app-header__user-avatar {
    width: 24px;
    height: 24px;
  }
  
  .app-header__auth-button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .app-header__right {
    gap: 6px;
  }
  
  .app-header__dropdown-panel {
    right: -8px;
    left: 8px;
    max-width: calc(100vw - 16px);
  }
  
  .app-header__user-menu {
    min-width: 200px;
  }
  
  .app-header__user-info {
    padding: 12px;
    gap: 10px;
  }
  
  .app-header__user-info-avatar {
    width: 40px;
    height: 40px;
  }
  
  .app-header__user-details-name {
    font-size: 14px;
  }
  
  .app-header__user-details-email {
    font-size: 12px;
  }
  
  .app-header__user-menu-item {
    padding: 10px 12px;
    gap: 10px;
    font-size: 13px;
  }
  
  .app-header__user-menu-icon {
    font-size: 16px;
    width: 16px;
  }
}

/* ========== 减少动画支持 ========== */

@media (prefers-reduced-motion: reduce) {
  /* 禁用所有过渡效果 */
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .app-header__hamburger span {
    transition: none;
  }
}

/* ========== 横屏模式优化 ========== */

@media (max-width: 767px) and (orientation: landscape) {
  .app-header__container {
    height: 48px;
    padding: 0 12px;
  }
  
  .app-header__logo-text {
    font-size: 14px;
  }
  
  .app-header__hamburger {
    width: 32px;
    height: 32px;
  }
  
  .app-header__icon-button {
    width: 28px;
    height: 28px;
  }
  
  .app-header__icon {
    font-size: 16px;
  }
  
  .app-header__user-avatar {
    width: 24px;
    height: 24px;
  }
  
  .app-header__dropdown-panel {
    max-height: calc(100vh - 60px);
    overflow-y: auto;
  }
  
  .app-header__dropdown-content {
    max-height: calc(100vh - 160px);
  }
}

@media (max-width: 479px) and (orientation: landscape) {
  .app-header__container {
    height: 44px;
    padding: 0 8px;
    gap: 4px;
  }
  
  .app-header__left {
    gap: 6px;
  }
  
  .app-header__right {
    gap: 4px;
  }
  
  .app-header__logo-text {
    font-size: 13px;
  }
  
  .app-header__icon-button {
    width: 28px;
    height: 28px;
  }
  
  .app-header__icon {
    font-size: 14px;
  }
  
  .app-header__badge {
    min-width: 14px;
    height: 14px;
    font-size: 9px;
  }
}
</style>
