<template>
  <div class="app-layout">
    <header class="app-layout__header">
      <div class="app-layout__brand-area">
        <RouterLink class="app-layout__brand" to="/">
          <span class="app-layout__brand-mark">Z</span>
          <span>ZhiCore</span>
        </RouterLink>
      </div>

      <nav class="app-layout__nav" aria-label="知构主导航">
        <RouterLink class="app-layout__nav-link" to="/" aria-label="首页">
          <span>首页</span>
        </RouterLink>
        <RouterLink
          class="app-layout__nav-link"
          to="/explore"
          aria-label="发现"
        >
          <span>发现</span>
        </RouterLink>
        <RouterLink
          class="app-layout__nav-link"
          to="/community"
          aria-label="社区"
        >
          <span>社区</span>
        </RouterLink>
        <RouterLink
          class="app-layout__nav-link"
          to="/resources"
          aria-label="资源"
        >
          <span>资源</span>
        </RouterLink>
        <RouterLink class="app-layout__nav-link" to="/about" aria-label="关于">
          <span>关于</span>
        </RouterLink>
      </nav>

      <div class="app-layout__search-area">
        <form
          class="app-layout__search"
          role="search"
          @submit.prevent="submitGlobalSearch"
        >
          <Search class="app-layout__search-icon" aria-hidden="true" />
          <input
            v-model="globalSearchQuery"
            type="search"
            placeholder="搜索知识、社区、内容..."
            aria-label="搜索"
          />
        </form>
      </div>

      <div class="app-layout__actions">
        <RouterLink
          v-if="props.isLoggedIn"
          class="app-layout__icon-btn"
          to="/messages"
          aria-label="消息"
        >
          <Mail class="app-layout__icon" aria-hidden="true" />
          <span v-if="messageUnreadCount > 0" class="app-layout__badge">
            {{ messageUnreadCount }}
          </span>
        </RouterLink>

        <RouterLink
          v-if="props.isLoggedIn"
          class="app-layout__icon-btn"
          to="/notifications"
          aria-label="通知"
        >
          <Bell class="app-layout__icon" aria-hidden="true" />
          <span v-if="notificationUnreadCount > 0" class="app-layout__badge">
            {{ notificationUnreadCount }}
          </span>
        </RouterLink>

        <button
          v-if="props.isLoggedIn"
          class="app-layout__icon-btn app-layout__profile-btn"
          type="button"
          aria-label="退出登录"
          @click="props.logout"
        >
          <User class="app-layout__icon" aria-hidden="true" />
        </button>
        <RouterLink
          v-else
          class="app-layout__icon-btn app-layout__profile-btn"
          to="/auth/login"
          aria-label="登录"
        >
          <User class="app-layout__icon" aria-hidden="true" />
        </RouterLink>
        <RouterLink class="app-layout__post-btn" to="/editor">
          <Plus class="app-layout__post-icon" aria-hidden="true" />
          <span>写作</span>
        </RouterLink>
      </div>
    </header>

    <main
      class="app-layout__main"
      :class="{ 'app-layout__main--flush': isShellFlush }"
    >
      <RouterView />
    </main>

    <nav
      v-if="!isShellFlush"
      class="app-layout__mobile-nav"
      aria-label="移动端主导航"
    >
      <RouterLink class="app-layout__mobile-nav-link" to="/" aria-label="首页">
        <HomeIcon class="app-layout__icon" aria-hidden="true" />
        <span>首页</span>
      </RouterLink>
      <RouterLink
        class="app-layout__mobile-nav-link"
        to="/explore"
        aria-label="发现"
      >
        <Compass class="app-layout__icon" aria-hidden="true" />
        <span>发现</span>
      </RouterLink>
      <div class="app-layout__mobile-nav-center">
        <RouterLink
          class="app-layout__post-btn-mobile"
          to="/editor"
          aria-label="写作"
        >
          <Plus class="app-layout__post-icon-mobile" aria-hidden="true" />
        </RouterLink>
      </div>
      <RouterLink
        v-if="props.isLoggedIn"
        class="app-layout__mobile-nav-link"
        to="/messages"
        aria-label="消息"
      >
        <div class="app-layout__mobile-nav-icon-wrapper">
          <Mail class="app-layout__icon" aria-hidden="true" />
          <span v-if="messageUnreadCount > 0" class="app-layout__badge">
            {{ messageUnreadCount }}
          </span>
        </div>
        <span>消息</span>
      </RouterLink>
      <button
        v-if="props.isLoggedIn"
        class="app-layout__mobile-nav-link"
        type="button"
        aria-label="退出登录"
        @click="props.logout"
      >
        <User class="app-layout__icon" aria-hidden="true" />
        <span>退出</span>
      </button>
      <RouterLink
        v-else
        class="app-layout__mobile-nav-link"
        to="/auth/login"
        aria-label="登录"
      >
        <User class="app-layout__icon" aria-hidden="true" />
        <span>登录</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import {
  Search,
  Mail,
  Bell,
  User,
  Plus,
  Home as HomeIcon,
  Compass,
} from "@lucide/vue";
import { computed, ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";

import { useMessageCenterPage } from "@/features/message";
import { useNotificationCenterPage } from "@/features/notification";

const props = defineProps<{
  isLoggedIn: boolean;
  logout: () => void | Promise<void>;
}>();

const route = useRoute();
const router = useRouter();
const isShellFlush = computed(() => route.meta.appShellFlush === true);
const globalSearchQuery = ref("");
const messageCenter = useMessageCenterPage();
const notificationCenter = useNotificationCenterPage();
const messageUnreadCount = computed(() => messageCenter.unreadCount ?? 0);
const notificationUnreadCount = computed(
  () => notificationCenter.unreadCount ?? 0,
);

async function submitGlobalSearch(): Promise<void> {
  const query = globalSearchQuery.value.trim();

  if (!query) {
    return;
  }

  await router.push({
    path: "/search",
    query: { q: query },
  });
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-layout__header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
}

.app-layout__brand-area {
  display: flex;
  align-items: center;
}

.app-layout__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.app-layout__brand:focus {
  outline: none;
}

.app-layout__brand-mark {
  color: var(--color-primary);
  font-weight: 800;
  font-size: 24px;
  font-family: "Outfit", sans-serif;
  letter-spacing: -1px;
}

.app-layout__brand span:last-child {
  color: var(--color-text-strong);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: -0.5px;
}

.app-layout__nav {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-left: 40px;
}

.app-layout__nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding-bottom: 4px;
  position: relative;
  transition: color 0.2s ease;
}

.app-layout__nav-link:hover {
  color: var(--color-text-strong);
}

.app-layout__nav-link.router-link-exact-active {
  color: var(--color-text-strong);
}

.app-layout__nav-link.router-link-exact-active::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--color-primary);
  border-radius: 2px;
}

.app-layout__search-area {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  margin-right: 40px;
}

.app-layout__search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 16px;
  width: 360px;
  transition: all 0.2s ease;
}

.app-layout__search:focus-within {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.app-layout__search-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-soft);
}

.app-layout__search input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-strong);
  font-size: 14px;
}

.app-layout__search input::placeholder {
  color: var(--color-text-soft);
}

.app-layout__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-layout__icon-btn {
  position: relative;
  background: transparent;
  border: none;
  color: var(--color-text-soft);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.app-layout__icon-btn:hover {
  color: var(--color-text-strong);
}

.app-layout__icon {
  width: 20px;
  height: 20px;
}

.app-layout__badge {
  position: absolute;
  top: 0;
  right: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 var(--space-1);
  border: 2px solid var(--color-bg);
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  color: #000;
  font-size: 0.625rem;
  font-weight: 800;
  transform: translate(35%, -35%);
}

.app-layout__profile-btn {
  color: var(--color-primary);
  background: rgba(0, 229, 181, 0.1);
  border-radius: 50%;
  padding: 6px;
}

.app-layout__profile-btn .app-layout__icon {
  width: 18px;
  height: 18px;
}

.app-layout__post-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary);
  color: #000;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
}

.app-layout__post-btn:hover {
  background: var(--color-primary-soft);
  transform: translateY(-1px);
}

.app-layout__post-icon {
  width: 16px;
  height: 16px;
}

.app-layout__main {
  padding: 0; /* Resetting padding here as layout handles its own spacing */
}

.app-layout__main--flush {
  padding: 0;
}

.app-layout__mobile-nav {
  display: none;
}

@media (max-width: 1024px) {
  .app-layout__header {
    padding: 16px 20px;
  }
  .app-layout__search {
    width: 240px;
  }
  .app-layout__nav {
    margin-left: 20px;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .app-layout__nav,
  .app-layout__search-area,
  .app-layout__actions {
    display: none;
  }

  .app-layout__header {
    padding: 12px 16px;
    justify-content: center;
  }

  .app-layout__main {
    padding-bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  }

  .app-layout__main--flush {
    padding-bottom: 0;
  }

  .app-layout__mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: calc(60px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--color-bg);
    border-top: 1px solid var(--color-border);
    z-index: 50;
    justify-content: space-around;
    align-items: center;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  }

  .app-layout__mobile-nav-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 44px;
    min-height: 44px;
    color: var(--color-text-soft);
    text-decoration: none;
    font-size: 10px;
    font-weight: 600;
    background: none;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
  }

  .app-layout__mobile-nav-link.router-link-exact-active {
    color: var(--color-primary);
  }

  .app-layout__mobile-nav-link:focus-visible,
  .app-layout__post-btn-mobile:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }

  .app-layout__mobile-nav-icon-wrapper {
    position: relative;
  }

  .app-layout__mobile-nav-center {
    position: relative;
    top: -16px;
  }

  .app-layout__post-btn-mobile {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--color-primary);
    color: #000;
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(0, 229, 181, 0.4);
    text-decoration: none;
  }

  .app-layout__post-icon-mobile {
    width: 24px;
    height: 24px;
  }
}
</style>
