<template>
  <main class="notifications-route" aria-labelledby="notifications-title">
    <section v-if="page.isLocalDemo" class="notifications-route__layout">
      <aside class="notifications-route__sidebar">
        <div>
          <h1 id="notifications-title">通知中心</h1>
        </div>

        <section class="notifications-route__stats" aria-label="未读摘要">
          <h2>未读通知</h2>
          <p>{{ page.unreadCount }}</p>
          <span>站内通知</span>
        </section>

        <nav class="notifications-route__nav" aria-label="通知分类">
          <button
            class="notifications-route__nav-item"
            type="button"
            aria-current="page"
          >
            <Bell class="notifications-route__nav-icon" aria-hidden="true" />
            <span>全部</span>
          </button>
          <button class="notifications-route__nav-item" type="button">
            <AtSign class="notifications-route__nav-icon" aria-hidden="true" />
            <span>提及</span>
          </button>
          <button class="notifications-route__nav-item" type="button">
            <Heart class="notifications-route__nav-icon" aria-hidden="true" />
            <span>互动</span>
          </button>
          <button class="notifications-route__nav-item" type="button">
            <Sparkles
              class="notifications-route__nav-icon"
              aria-hidden="true"
            />
            <span>系统</span>
          </button>
        </nav>
      </aside>

      <section class="notifications-route__main">
        <header class="notifications-route__toolbar">
          <div class="notifications-route__search" role="search">
            <Search
              class="notifications-route__search-icon"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="搜索通知..."
              aria-label="搜索通知"
            />
          </div>
          <button class="notifications-route__mark-button" type="button">
            全部已读
          </button>
        </header>

        <div class="notifications-route__list">
          <article
            v-for="notification in page.notifications"
            :key="notification.id"
            class="notifications-route__item"
            :class="{
              'notifications-route__item--unread': notification.unread,
            }"
          >
            <div class="notifications-route__item-header">
              <span
                class="notifications-route__item-icon"
                :class="`notifications-route__item-icon--${notification.type}`"
              >
                <Heart
                  v-if="notification.type === 'interaction'"
                  aria-hidden="true"
                />
                <AtSign
                  v-else-if="notification.type === 'content'"
                  aria-hidden="true"
                />
                <Sparkles v-else aria-hidden="true" />
              </span>
              <h2>{{ notification.title }}</h2>
              <time>{{ notification.occurredAt }}</time>
            </div>

            <div class="notifications-route__item-body">
              <p>{{ notification.body }}</p>
            </div>

            <footer class="notifications-route__item-footer">
              <button type="button">查看详情</button>
            </footer>
          </article>
        </div>
      </section>
    </section>

    <section v-else class="notifications-route__empty">
      <p class="notifications-route__eyebrow">Notification</p>
      <h1 id="notifications-title">通知暂不可用</h1>
      <p>通知服务接入后会显示收件箱、未读状态和通知动作。</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { AtSign, Bell, Heart, Search, Sparkles } from "@lucide/vue";

import { useNotificationCenterPage } from "@/features/notification";

const page = useNotificationCenterPage();
</script>

<style scoped>
.notifications-route {
  --notifications-bg: #0f1115;
  --notifications-surface: rgba(255, 255, 255, 0.03);
  --notifications-surface-hover: rgba(255, 255, 255, 0.06);
  --notifications-line: rgba(255, 255, 255, 0.08);
  --notifications-line-strong: color-mix(
    in srgb,
    var(--color-text-strong) 14%,
    transparent
  );
  --notifications-text: #d7dce2;
  --notifications-text-strong: #ffffff;
  --notifications-muted: #8b929c;
  --notifications-sidebar-bg: color-mix(
    in srgb,
    var(--notifications-bg) 88%,
    var(--color-text-strong) 4%
  );
  --notifications-icon-interaction: var(--color-danger);
  --notifications-icon-content: var(--color-primary-soft);
  --notifications-focus-ring: color-mix(
    in srgb,
    var(--color-primary) 42%,
    transparent
  );

  min-height: calc(100vh - 72px);
  background: var(--notifications-bg);
  color: var(--notifications-text);
}

.notifications-route__layout {
  display: grid;
  grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  width: 100%;
  min-height: calc(100vh - 72px);
}

.notifications-route__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6);
  border-right: 1px solid var(--notifications-line);
  background: var(--notifications-sidebar-bg);
}

.notifications-route__eyebrow {
  margin: 0 0 var(--space-1);
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notifications-route__sidebar h1,
.notifications-route__empty h1 {
  margin: 0;
  color: var(--notifications-text-strong);
  font-size: 1.5rem;
}

.notifications-route__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.notifications-route__nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-height: 44px;
  padding: 0 var(--space-4);
  border: 0;
  border-radius: var(--radius-lg);
  background: transparent;
  color: var(--notifications-muted);
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s ease,
    color 0.2s ease;
}

.notifications-route__nav-item:hover {
  background: var(--notifications-surface-hover);
  color: var(--notifications-text-strong);
}

.notifications-route__nav-item:active {
  background: color-mix(
    in srgb,
    var(--color-primary) 10%,
    var(--notifications-surface-hover)
  );
}

.notifications-route__nav-item[aria-current="page"] {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  font-weight: 800;
}

.notifications-route__nav-item:focus-visible,
.notifications-route__mark-button:focus-visible,
.notifications-route__item-footer button:focus-visible {
  outline: 2px solid var(--notifications-focus-ring);
  outline-offset: 2px;
}

.notifications-route__nav-icon {
  width: var(--space-4);
  height: var(--space-4);
}

.notifications-route__stats {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--notifications-line);
  border-radius: var(--radius-lg);
  background: var(--notifications-surface);
}

.notifications-route__stats h2 {
  margin: 0 0 var(--space-1);
  color: var(--notifications-muted);
  font-size: 0.8125rem;
}

.notifications-route__stats p {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1;
}

.notifications-route__stats span {
  color: var(--notifications-muted);
  font-size: 0.75rem;
}

.notifications-route__main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-8) var(--space-8);
}

.notifications-route__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.notifications-route__search {
  display: flex;
  align-items: center;
  width: min(100%, 340px);
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--notifications-line);
  border-radius: var(--radius-pill);
  background: var(--notifications-surface);
}

.notifications-route__search:focus-within {
  border-color: var(--notifications-focus-ring);
  background: var(--notifications-surface-hover);
  box-shadow: 0 0 0 3px
    color-mix(in srgb, var(--color-primary) 10%, transparent);
}

.notifications-route__search-icon {
  width: var(--space-4);
  height: var(--space-4);
  color: var(--notifications-muted);
}

.notifications-route__search input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--notifications-text-strong);
}

.notifications-route__search input::placeholder {
  color: var(--notifications-muted);
}

.notifications-route__mark-button {
  min-height: 44px;
  padding: 0 var(--space-5);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 700;
}

.notifications-route__mark-button:hover {
  background: var(--color-primary);
  color: #000;
}

.notifications-route__mark-button:active {
  background: var(--color-primary-strong);
}

.notifications-route__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
  padding-bottom: var(--space-8);
}

.notifications-route__item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  column-gap: var(--space-2);
  row-gap: var(--space-1);
  align-items: start;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--notifications-line);
  border-radius: var(--radius-lg);
  background: var(--notifications-surface);
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}

.notifications-route__item:hover {
  background: var(--notifications-surface-hover);
  border-color: var(--notifications-line-strong);
}

.notifications-route__item--unread {
  border-color: color-mix(in srgb, var(--color-primary) 34%, transparent);
  background: color-mix(
    in srgb,
    var(--color-primary) 4%,
    var(--notifications-surface)
  );
}

.notifications-route__item-header {
  display: contents;
}

.notifications-route__item-icon {
  display: grid;
  width: var(--space-8);
  height: var(--space-8);
  border: 1px solid var(--notifications-line);
  border-radius: var(--radius-pill);
  place-items: center;
}

.notifications-route__item-icon svg {
  width: var(--space-4);
  height: var(--space-4);
}

.notifications-route__item-icon--interaction {
  color: var(--notifications-icon-interaction);
}

.notifications-route__item-icon--content {
  color: var(--notifications-icon-content);
}

.notifications-route__item-icon--system {
  color: var(--color-primary);
}

.notifications-route__item-header time {
  grid-column: 3;
  color: var(--notifications-muted);
  font-size: 0.75rem;
  white-space: nowrap;
}

.notifications-route__item-header h2 {
  margin: 0;
  color: var(--notifications-text-strong);
  font-size: 1rem;
  line-height: 1.25;
}

.notifications-route__item-body {
  display: grid;
  grid-column: 2;
  gap: var(--space-2);
  min-width: 0;
}

.notifications-route__item-body p {
  margin: 0;
  color: var(--notifications-text);
  line-height: 1.35;
}

.notifications-route__item-footer {
  grid-column: 3;
  grid-row: 2;
  align-self: start;
}

.notifications-route__item-footer button {
  min-height: var(--space-8);
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--notifications-surface-hover);
  color: var(--notifications-text-strong);
  cursor: pointer;
  font-size: 0.8125rem;
}

.notifications-route__item-footer button:hover {
  background: color-mix(
    in srgb,
    var(--color-primary) 12%,
    var(--notifications-surface-hover)
  );
}

.notifications-route__item-footer button:active {
  background: color-mix(
    in srgb,
    var(--color-primary) 18%,
    var(--notifications-surface-hover)
  );
}

.notifications-route__empty {
  display: grid;
  gap: var(--space-3);
  width: min(100%, 760px);
  margin: var(--space-10) auto 0;
  padding: var(--space-10);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-panel);
  place-items: center;
  text-align: center;
}

.notifications-route__empty p:last-child {
  max-width: 560px;
  margin: 0;
  color: var(--color-text-soft);
}

@media (max-width: 900px) {
  .notifications-route__layout {
    grid-template-columns: 1fr;
  }

  .notifications-route__sidebar {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--notifications-line);
  }

  .notifications-route__stats {
    margin-top: 0;
  }

  .notifications-route__main {
    padding: var(--space-5);
  }
}

@media (max-width: 640px) {
  .notifications-route__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .notifications-route__search {
    width: 100%;
  }

  .notifications-route__item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .notifications-route__item-header time {
    grid-column: 2;
  }

  .notifications-route__item-footer {
    grid-column: 2;
    grid-row: auto;
  }

  .notifications-route__item-footer button {
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notifications-route__nav-item,
  .notifications-route__item,
  .notifications-route__mark-button {
    transition: none;
  }
}
</style>
