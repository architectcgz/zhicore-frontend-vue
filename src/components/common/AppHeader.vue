<!--
  应用头部组件
  包含导航栏、搜索框、用户菜单、通知和消息图标
-->

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import ThemeToggle from './ThemeToggle.vue';
import NotificationDropdown from '../notification/NotificationDropdown.vue';

const emit = defineEmits<{
  'toggle-sidebar': [];
}>();

const props = defineProps<{
  isSidebarOpen?: boolean;
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

const searchQuery = ref('');
const showUserMenu = ref(false);
const showNotifications = ref(false);
const unreadMessageCount = ref(0);
const isDocked = ref(false);

const navLinks = [
  { name: '首页', path: '/', label: '发现' },
  { name: '文章', path: '/posts', label: '内容' },
  { name: '标签', path: '/tags', label: '话题' },
  { name: '排行榜', path: '/ranking', label: '趋势' },
];

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const unreadNotificationCount = computed(() => notificationStore.unreadCount);

const isLinkActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }

  return route.path === path || route.path.startsWith(`${path}/`);
};

const handleSearch = () => {
  const trimmedQuery = searchQuery.value.trim();
  if (!trimmedQuery) {
    return;
  }

  router.push({
    path: '/search',
    query: { q: trimmedQuery },
  });
  searchQuery.value = '';
};

const toggleSidebar = () => {
  emit('toggle-sidebar');
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showNotifications.value = false;
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showUserMenu.value = false;
};

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

const goToLogin = () => {
  router.push('/auth/login');
};

const goToMessages = () => {
  router.push('/messages');
};

const closeAllDropdowns = () => {
  showUserMenu.value = false;
  showNotifications.value = false;
};

const handleClickOutside = (event: Event) => {
  const target = event.target as Element;
  if (!target.closest('.app-header__dropdown')) {
    closeAllDropdowns();
  }
};

const updateDockedState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  isDocked.value = window.scrollY > 12;
};

onMounted(() => {
  updateDockedState();
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', updateDockedState, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', updateDockedState);
});
</script>

<template>
  <header
    class="app-header app-header__container"
    :class="{ 'app-header--docked': isDocked }"
  >
    <div class="app-header__left">
      <button
        class="app-header__hamburger"
        type="button"
        aria-label="切换侧边栏"
        :aria-expanded="props.isSidebarOpen"
        @click="toggleSidebar"
      >
        <span />
        <span />
        <span />
      </button>

      <router-link
        to="/"
        class="app-header__logo"
      >
        <span class="app-header__logo-mark">知</span>
        <span class="app-header__logo-title">知构</span>
      </router-link>

      <nav class="app-header__nav">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="app-header__nav-link soft-pill"
          :class="{ 'app-header__nav-link--active': isLinkActive(link.path) }"
        >
          <span class="app-header__nav-link-label">{{ link.label }}</span>
          <span class="app-header__nav-link-text">{{ link.name }}</span>
        </router-link>
      </nav>
    </div>

    <div class="app-header__search">
      <form
        class="app-header__search-form soft-pill"
        @submit.prevent="handleSearch"
      >
        <span class="app-header__search-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          class="app-header__search-input"
          placeholder="搜索文章、作者、标签"
        >
        <button
          type="submit"
          class="app-header__search-button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          搜索
        </button>
      </form>
    </div>

    <div class="app-header__right">
      <ThemeToggle />

      <template v-if="isAuthenticated">
        <button
          class="app-header__create-button"
          type="button"
          @click="handleUserMenuClick('create')"
        >
          写文章
        </button>

        <div class="app-header__dropdown">
          <button
            class="app-header__icon-button soft-pill"
            :class="{ 'app-header__icon-button--active': showNotifications }"
            type="button"
            aria-label="通知"
            :aria-expanded="showNotifications"
            @click="toggleNotifications"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 4.25a4.75 4.75 0 0 0-4.75 4.75v2.08c0 .66-.2 1.31-.57 1.86L5.25 15.1c-.48.72.03 1.68.89 1.68h11.72c.86 0 1.37-.96.89-1.68l-1.43-2.16a3.3 3.3 0 0 1-.57-1.86V9A4.75 4.75 0 0 0 12 4.25Z" />
              <path d="M9.75 18.25a2.25 2.25 0 0 0 4.5 0" />
            </svg>
            <span
              v-if="unreadNotificationCount > 0"
              class="app-header__badge"
            >
              {{ unreadNotificationCount > 99 ? '99+' : unreadNotificationCount }}
            </span>
          </button>

          <NotificationDropdown
            :visible="showNotifications"
            @update:visible="showNotifications = $event"
            @close="showNotifications = false"
          />
        </div>

        <button
          class="app-header__icon-button soft-pill"
          type="button"
          aria-label="消息"
          @click="goToMessages"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 6.75A2.75 2.75 0 0 1 7.75 4h8.5A2.75 2.75 0 0 1 19 6.75v5.5A2.75 2.75 0 0 1 16.25 15H10l-4 4V6.75Z" />
          </svg>
          <span
            v-if="unreadMessageCount > 0"
            class="app-header__badge"
          >
            {{ unreadMessageCount > 99 ? '99+' : unreadMessageCount }}
          </span>
        </button>

        <div class="app-header__dropdown">
          <button
            class="app-header__user-button soft-pill"
            :class="{ 'app-header__user-button--active': showUserMenu }"
            type="button"
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
            <span
              v-else
              class="app-header__user-avatar app-header__user-avatar--placeholder"
            >
              {{ user?.nickname?.charAt(0) || 'U' }}
            </span>
            <span class="app-header__user-copy">
              <span class="app-header__user-name">{{ user?.nickname || '用户' }}</span>
              <span class="app-header__user-meta">
                {{ user?.role === 'ADMIN' ? '管理员' : '创作者' }}
              </span>
            </span>
            <span class="app-header__user-arrow" aria-hidden="true">
              <svg viewBox="0 0 20 20">
                <path d="m5 7.5 5 5 5-5" />
              </svg>
            </span>
          </button>

          <div
            v-if="showUserMenu"
            class="app-header__dropdown-panel app-header__user-menu surface-panel"
          >
            <div class="app-header__user-info">
              <img
                v-if="user?.avatar"
                :src="user.avatar"
                :alt="user.nickname"
                class="app-header__user-info-avatar"
              >
              <span
                v-else
                class="app-header__user-info-avatar app-header__user-info-avatar--placeholder"
              >
                {{ user?.nickname?.charAt(0) || 'U' }}
              </span>
              <div class="app-header__user-details">
                <div class="app-header__user-details-name">{{ user?.nickname || '用户' }}</div>
                <div class="app-header__user-details-email">{{ user?.email }}</div>
              </div>
            </div>

            <button
              class="app-header__menu-item"
              type="button"
              @click="handleUserMenuClick('profile')"
            >
              个人主页
            </button>
            <button
              class="app-header__menu-item"
              type="button"
              @click="handleUserMenuClick('drafts')"
            >
              我的草稿
            </button>
            <button
              class="app-header__menu-item"
              type="button"
              @click="handleUserMenuClick('settings')"
            >
              账户设置
            </button>
            <button
              v-if="user?.role === 'ADMIN'"
              class="app-header__menu-item"
              type="button"
              @click="handleUserMenuClick('admin')"
            >
              管理后台
            </button>
            <button
              class="app-header__menu-item app-header__menu-item--danger"
              type="button"
              @click="handleUserMenuClick('logout')"
            >
              退出登录
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <button
          class="app-header__auth-entry-button"
          type="button"
          @click="goToLogin"
        >
          <span class="app-header__auth-entry-label">登录 / 创建账号</span>
          <span class="app-header__auth-entry-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5.75 12h12.5M13.5 7.75 18.25 12l-4.75 4.25" />
            </svg>
          </span>
        </button>
      </template>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  width: 100%;
  transform: translateY(18px);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base);
}

.app-header__container {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(280px, 1fr) auto;
  align-items: center;
  gap: var(--space-lg);
  width: min(1520px, calc(100% - 40px));
  min-height: 84px;
  margin: 0 auto 10px;
  padding: 14px 18px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-2xl);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--color-bg-secondary) 92%, transparent) 0%, color-mix(in srgb, var(--color-surface-overlay) 86%, transparent) 100%);
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(18px);
}

.app-header--docked {
  transform: translateY(0);
}

.app-header__container::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-accent) 52%, white) 30%, color-mix(in srgb, var(--color-cta) 58%, white) 68%, transparent);
  opacity: 0.88;
  pointer-events: none;
}

.app-header__left,
.app-header__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-header__left {
  min-width: 0;
}

.app-header__hamburger {
  display: none;
  width: 42px;
  height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface-overlay);
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  transition: transform var(--transition-base);
}

.app-header__hamburger span {
  width: 18px;
  height: 1.5px;
  background: var(--color-text);
  border-radius: 999px;
}

.app-header__logo {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.app-header__logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: var(--gradient-hero);
  color: var(--color-text-inverse);
  font-family: var(--font-brand);
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-md);
}

.app-header__logo-title {
  font-family: var(--font-brand);
  font-size: 1.35rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-header__nav-link {
  gap: 10px;
  padding: 10px 14px;
  color: var(--color-text-secondary);
  transition:
    transform var(--transition-base),
    background-color var(--transition-base),
    border-color var(--transition-base),
    color var(--transition-base);
}

.app-header__nav-link:hover,
.app-header__nav-link--active {
  color: var(--color-text);
  border-color: var(--color-border-dark);
  background: color-mix(in srgb, var(--color-bg-secondary) 92%, transparent);
}

.app-header__nav-link-label {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.app-header__nav-link-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.app-header__search {
  min-width: 0;
  display: flex;
  justify-content: center;
}

.app-header__search-form {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 460px;
  padding: 6px 6px 6px 14px;
  border-color: rgba(18, 49, 76, 0.16);
  background: color-mix(in srgb, var(--color-surface-overlay) 94%, transparent);
  box-shadow: var(--shadow-inner);
}

.app-header__search-icon {
  display: inline-flex;
  color: var(--color-text-secondary);
}

.app-header__search-icon svg,
.app-header__icon-button svg,
.app-header__user-arrow svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.app-header__search-input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: 0.92rem;
}

.app-header__search-input::placeholder {
  color: var(--color-text-tertiary);
}

.app-header__search-input:focus {
  outline: none;
}

.app-header__search-button,
.app-header__create-button {
  border: none;
  border-radius: var(--radius-full);
  background: var(--gradient-hero);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.app-header__search-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 14px;
  white-space: nowrap;
  font-size: 0.88rem;
}

.app-header__search-button svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.app-header__right {
  justify-content: flex-end;
}

.app-header__create-button,
.app-header__auth-entry-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 10px 0 16px;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-full);
  background: var(--gradient-card);
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    border-color var(--transition-base);
}

.app-header__auth-entry-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.app-header__auth-entry-label {
  font-weight: var(--font-weight-semibold);
}

.app-header__auth-entry-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: var(--gradient-hero);
  color: var(--color-text-inverse);
}

.app-header__auth-entry-arrow svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.app-header__icon-button,
.app-header__user-button {
  position: relative;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  background: transparent;
}

.app-header__icon-button {
  width: 44px;
  height: 44px;
  padding: 0;
}

.app-header__icon-button--active,
.app-header__user-button--active,
.app-header__icon-button:hover,
.app-header__user-button:hover {
  border-color: var(--color-border-dark);
  background: color-mix(in srgb, var(--color-bg-secondary) 92%, transparent);
}

.app-header__badge {
  position: absolute;
  top: -6px;
  right: -4px;
  min-width: 22px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  background: var(--color-danger);
  color: var(--color-text-inverse);
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.app-header__dropdown {
  position: relative;
}

.app-header__user-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px 8px 8px;
}

.app-header__user-avatar,
.app-header__user-info-avatar {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  object-fit: cover;
  background: var(--color-bg-tertiary);
}

.app-header__user-avatar--placeholder,
.app-header__user-info-avatar--placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text);
  font-weight: var(--font-weight-bold);
}

.app-header__user-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  text-align: left;
}

.app-header__user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.app-header__user-meta {
  font-size: 0.72rem;
  color: var(--color-text-secondary);
}

.app-header__user-arrow {
  display: inline-flex;
  color: var(--color-text-secondary);
}

.app-header__dropdown-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 260px;
  padding: 12px;
  border-radius: var(--radius-lg);
  z-index: 40;
}

.app-header__user-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.app-header__user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 8px 12px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--color-border-light);
}

.app-header__user-details {
  min-width: 0;
}

.app-header__user-details-name {
  font-weight: var(--font-weight-semibold);
}

.app-header__user-details-email {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  word-break: break-all;
}

.app-header__menu-item {
  width: 100%;
  padding: 12px 14px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text);
  text-align: left;
  transition: background-color var(--transition-base);
}

.app-header__menu-item:hover {
  background: var(--color-hover);
}

.app-header__menu-item--danger {
  color: var(--color-danger);
}

.app-header__menu-item--danger:hover {
  background: var(--color-danger-light);
}

@media (max-width: 1279px) {
  .app-header__container {
    grid-template-columns: auto minmax(220px, 1fr) auto;
    width: min(100%, calc(100% - 24px));
  }

  .app-header__nav-link-label {
    display: none;
  }
}

@media (max-width: 1023px) {
  .app-header__container {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 12px;
  }

  .app-header__nav {
    display: none;
  }

  .app-header__search-form {
    max-width: 360px;
    padding-right: 6px;
  }

  .app-header__create-button {
    display: none;
  }
}

@media (max-width: 767px) {
  .app-header {
    transform: translateY(10px);
  }

  .app-header--docked {
    transform: translateY(0);
  }

  .app-header__container {
    width: min(100%, calc(100% - 12px));
    min-height: 76px;
    margin: 0 auto 8px;
    padding: 10px 12px;
    border-radius: var(--radius-xl);
  }

  .app-header__hamburger {
    display: inline-flex;
  }

  .app-header__logo-mark {
    width: 40px;
    height: 40px;
    border-radius: 14px;
  }

  .app-header__search {
    display: none;
  }

  .app-header__user-copy {
    display: none;
  }

  .app-header__user-button {
    padding-right: 8px;
  }

  .app-header__auth-entry-label {
    font-size: 0.82rem;
  }

  .app-header__dropdown-panel {
    right: -8px;
    min-width: 220px;
  }
}
</style>
