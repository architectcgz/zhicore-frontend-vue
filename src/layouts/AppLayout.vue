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
        <RouterLink class="app-layout__nav-link" to="/explore" aria-label="发现">
          <span>发现</span>
        </RouterLink>
        <RouterLink class="app-layout__nav-link" to="/structure" aria-label="社区">
          <span>社区</span>
        </RouterLink>
        <RouterLink class="app-layout__nav-link" to="/resources" aria-label="资源">
          <span>资源</span>
        </RouterLink>
        <RouterLink class="app-layout__nav-link" to="/about" aria-label="关于">
          <span>关于</span>
        </RouterLink>
      </nav>

      <div class="app-layout__search-area">
        <form class="app-layout__search" role="search" @submit.prevent>
          <Search class="app-layout__search-icon" aria-hidden="true" />
          <input
            type="search"
            placeholder="搜索知识、社区、内容..."
            aria-label="搜索"
          />
        </form>
      </div>

      <div class="app-layout__actions">
        <div class="app-layout__dropdown-wrapper" ref="messageRef">
          <button class="app-layout__icon-btn" aria-label="消息" @click="toggleMessage">
            <Mail class="app-layout__icon" aria-hidden="true" />
            <span class="app-layout__badge">2</span>
          </button>
          <Transition name="popover-fade">
            <div v-if="isMessageOpen" class="app-layout__popover glass-panel">
              <div class="popover-header">
                <h3>私信</h3>
                <RouterLink to="/messages" class="popover-link" @click="isMessageOpen = false">查看全部</RouterLink>
              </div>
              <div class="popover-body">
                <RouterLink to="/messages" class="message-item unread" @click="isMessageOpen = false">
                  <div class="message-avatar">AI</div>
                  <div class="message-content">
                    <p class="message-name">Antigravity</p>
                    <p class="message-text">新版透明度已经调整好了，看看合适吗？</p>
                    <span class="message-time">刚刚</span>
                  </div>
                </RouterLink>
                <RouterLink to="/messages" class="message-item" @click="isMessageOpen = false">
                  <div class="message-avatar">L</div>
                  <div class="message-content">
                    <p class="message-name">Li Lei</p>
                    <p class="message-text">期待你的下一篇架构分享。</p>
                    <span class="message-time">2小时前</span>
                  </div>
                </RouterLink>
              </div>
            </div>
          </Transition>
        </div>

        <div class="app-layout__dropdown-wrapper" ref="notificationRef">
          <button class="app-layout__icon-btn" aria-label="通知" @click="toggleNotification">
            <Bell class="app-layout__icon" aria-hidden="true" />
            <span class="app-layout__badge">3</span>
          </button>
          <Transition name="popover-fade">
            <div v-if="isNotificationOpen" class="app-layout__popover glass-panel">
              <div class="popover-header">
                <h3>通知</h3>
                <RouterLink to="/notifications" class="popover-link" @click="isNotificationOpen = false">查看全部</RouterLink>
              </div>
              <div class="popover-body">
                <RouterLink to="/notifications" class="notification-item unread" @click="isNotificationOpen = false">
                  <div class="notification-indicator"></div>
                  <div class="notification-content">
                    <p><strong>Han Meimei</strong> 赞了你的草稿《2026 前端趋势》</p>
                    <span class="notification-time">10 分钟前</span>
                  </div>
                </RouterLink>
                <RouterLink to="/notifications" class="notification-item" @click="isNotificationOpen = false">
                  <div class="notification-indicator"></div>
                  <div class="notification-content">
                    <p><strong>System</strong> 欢迎加入知构 (ZhiCore) 平台！</p>
                    <span class="notification-time">1 天前</span>
                  </div>
                </RouterLink>
              </div>
            </div>
          </Transition>
        </div>

        <button class="app-layout__icon-btn app-layout__profile-btn" aria-label="个人主页">
          <User class="app-layout__icon" aria-hidden="true" />
        </button>
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
  </div>
</template>

<script setup lang="ts">
import { Search, Mail, Bell, User, Plus } from "@lucide/vue";
import { computed, ref } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { onClickOutside } from "@vueuse/core";

defineProps<{
  isLoggedIn: boolean;
  logout: () => void | Promise<void>;
}>();

const route = useRoute();
const isShellFlush = computed(() => route.meta.appShellFlush === true);

const isNotificationOpen = ref(false);
const isMessageOpen = ref(false);

const notificationRef = ref<HTMLElement | null>(null);
const messageRef = ref<HTMLElement | null>(null);

onClickOutside(notificationRef, () => {
  isNotificationOpen.value = false;
});

onClickOutside(messageRef, () => {
  isMessageOpen.value = false;
});

function toggleNotification() {
  isNotificationOpen.value = !isNotificationOpen.value;
  if (isNotificationOpen.value) isMessageOpen.value = false;
}

function toggleMessage() {
  isMessageOpen.value = !isMessageOpen.value;
  if (isMessageOpen.value) isNotificationOpen.value = false;
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
  font-family: 'Outfit', sans-serif;
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

.app-layout__dropdown-wrapper {
  position: relative;
}

.app-layout__badge {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--color-primary);
  color: #000;
  font-size: 10px;
  font-weight: 800;
  padding: 0 4px;
  border-radius: 8px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(25%, -25%);
  border: 2px solid var(--color-bg);
}

.app-layout__popover {
  position: absolute;
  top: calc(100% + 12px);
  right: -10px;
  width: 320px;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform-origin: top right;
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.02);
}

.popover-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.popover-link {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.popover-link:hover {
  color: var(--color-primary-soft);
}

.popover-body {
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Message Styles */
.message-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
}

.message-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 229, 181, 0.2), rgba(0, 168, 255, 0.2));
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 229, 181, 0.3);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.message-text {
  margin: 0 0 6px;
  font-size: 13px;
  color: var(--color-text-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.message-item.unread .message-name {
  color: var(--color-primary);
}
.message-item.unread .message-text {
  color: var(--color-text);
  font-weight: 500;
}

/* Notification Styles */
.notification-item {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.notification-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  margin-top: 6px;
  flex-shrink: 0;
}

.notification-item.unread .notification-indicator {
  background: var(--color-primary);
  box-shadow: 0 0 8px rgba(0, 229, 181, 0.5);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content p {
  margin: 0 0 6px;
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.notification-content strong {
  color: var(--color-text-strong);
}

.notification-time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.notification-item.unread .notification-content p {
  color: var(--color-text-strong);
}

/* Popover Transitions */
.popover-fade-enter-active,
.popover-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.popover-fade-enter-from,
.popover-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-8px);
}

.app-layout__main {
  padding: 0; /* Resetting padding here as layout handles its own spacing */
}

.app-layout__main--flush {
  padding: 0;
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
  .app-layout__nav, .app-layout__search-area {
    display: none;
  }
}
</style>
