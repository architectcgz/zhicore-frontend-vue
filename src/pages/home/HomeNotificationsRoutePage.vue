<template>
  <main class="notifications-route" aria-labelledby="notifications-title">
    <section v-if="page.isLocalDemo" class="notifications-route__layout">
      <aside class="notifications-route__sidebar" aria-label="通知分类">
        <section class="notifications-route__summary" aria-label="未读摘要">
          <div>
            <span>未读摘要</span>
            <strong>{{ page.unreadCount }}</strong>
            <p>未读通知</p>
          </div>
          <span class="notifications-route__summary-icon">
            <Bell aria-hidden="true" />
          </span>
        </section>

        <nav class="notifications-route__nav" aria-label="通知分类">
          <button
            class="notifications-route__nav-item"
            type="button"
            aria-label="全部通知"
            :aria-current="selectedCategory === 'all' ? 'page' : undefined"
            @click="selectCategory('all')"
          >
            <Bell class="notifications-route__nav-icon" aria-hidden="true" />
            <span>全部</span>
            <strong>{{ categoryCounts.all }}</strong>
          </button>
          <button
            class="notifications-route__nav-item"
            type="button"
            aria-label="提及通知"
            :aria-current="selectedCategory === 'content' ? 'page' : undefined"
            @click="selectCategory('content')"
          >
            <AtSign class="notifications-route__nav-icon" aria-hidden="true" />
            <span>提及</span>
            <strong>{{ categoryCounts.content }}</strong>
          </button>
          <button
            class="notifications-route__nav-item"
            type="button"
            aria-label="互动通知"
            :aria-current="
              selectedCategory === 'interaction' ? 'page' : undefined
            "
            @click="selectCategory('interaction')"
          >
            <Heart class="notifications-route__nav-icon" aria-hidden="true" />
            <span>互动</span>
            <strong>{{ categoryCounts.interaction }}</strong>
          </button>
          <button
            class="notifications-route__nav-item"
            type="button"
            aria-label="系统通知"
            :aria-current="selectedCategory === 'system' ? 'page' : undefined"
            @click="selectCategory('system')"
          >
            <Sparkles
              class="notifications-route__nav-icon"
              aria-hidden="true"
            />
            <span>系统</span>
            <strong>{{ categoryCounts.system }}</strong>
          </button>
        </nav>

        <button class="notifications-route__mark-button" type="button" disabled>
          <CheckCircle2 aria-hidden="true" />
          <span>全部已读</span>
        </button>
      </aside>

      <section class="notifications-route__main">
        <header class="notifications-route__header">
          <div>
            <p class="notifications-route__section-label">通知中心</p>
            <h1 id="notifications-title">Notifications</h1>
          </div>
          <div class="notifications-route__toolbar">
            <div class="notifications-route__search" role="search">
              <Search
                class="notifications-route__search-icon"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search notifications"
                aria-label="搜索通知"
                disabled
              />
            </div>
            <button
              class="notifications-route__filter-button"
              type="button"
              disabled
            >
              <Filter aria-hidden="true" />
              <span>筛选</span>
            </button>
          </div>
        </header>

        <div class="notifications-route__list">
          <article
            v-for="notification in paginatedNotifications"
            :key="notification.id"
            class="notifications-route__item"
            :class="{
              'notifications-route__item--unread': notification.unread,
            }"
          >
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

            <div class="notifications-route__item-body">
              <h2>{{ notification.title }}</h2>
              <p>{{ notification.body }}</p>
            </div>

            <time>{{ notification.occurredAt }}</time>
            <span
              v-if="notification.unread"
              class="notifications-route__unread-dot"
              aria-label="未读"
            />
          </article>
        </div>

        <footer
          v-if="totalPages > 1"
          class="notifications-route__pagination"
          aria-label="通知分页"
        >
          <button
            type="button"
            aria-label="上一页通知"
            :disabled="!canGoPrevious"
            @click="goPreviousPage"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <span class="notifications-route__page-number">{{
            currentPage
          }}</span>
          <span class="notifications-route__pagination-status">
            第 {{ currentPage }} / {{ totalPages }} 页
          </span>
          <button
            type="button"
            aria-label="下一页通知"
            :disabled="!canGoNext"
            @click="goNextPage"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </footer>
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
import {
  AtSign,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
  Search,
  Sparkles,
} from "@lucide/vue";
import { computed, ref } from "vue";

import { useNotificationCenterPage } from "@/features/notification";
import type { NotificationCenterType } from "@/features/notification";

const page = useNotificationCenterPage();
const notificationsPerPage = 3;
type NotificationCategory = "all" | NotificationCenterType;

const selectedCategory = ref<NotificationCategory>("all");
const currentPage = ref(1);

const categoryCounts = computed(() => ({
  all: page.notifications.length,
  content: page.notifications.filter(
    (notification) => notification.type === "content",
  ).length,
  interaction: page.notifications.filter(
    (notification) => notification.type === "interaction",
  ).length,
  system: page.notifications.filter(
    (notification) => notification.type === "system",
  ).length,
}));

const filteredNotifications = computed(() => {
  if (selectedCategory.value === "all") {
    return page.notifications;
  }

  return page.notifications.filter(
    (notification) => notification.type === selectedCategory.value,
  );
});

const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(filteredNotifications.value.length / notificationsPerPage),
  ),
);
const canGoPrevious = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * notificationsPerPage;

  return filteredNotifications.value.slice(start, start + notificationsPerPage);
});

function selectCategory(category: NotificationCategory) {
  selectedCategory.value = category;
  currentPage.value = 1;
}

function goPreviousPage() {
  if (canGoPrevious.value) {
    currentPage.value -= 1;
  }
}

function goNextPage() {
  if (canGoNext.value) {
    currentPage.value += 1;
  }
}
</script>

<style scoped>
.notifications-route {
  --notifications-bg: #080e13;
  --notifications-panel: rgba(18, 25, 31, 0.88);
  --notifications-panel-strong: rgba(22, 30, 37, 0.94);
  --notifications-control: rgba(255, 255, 255, 0.07);
  --notifications-control-hover: rgba(255, 255, 255, 0.11);
  --notifications-line: rgba(255, 255, 255, 0.1);
  --notifications-line-strong: rgba(0, 229, 181, 0.42);
  --notifications-text: #dce4e9;
  --notifications-text-strong: #ffffff;
  --notifications-muted: #8f9aa3;
  --notifications-focus-ring: color-mix(
    in srgb,
    var(--color-primary) 42%,
    transparent
  );

  min-height: calc(100vh - 73px);
  display: grid;
  padding: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 18rem),
    var(--notifications-bg);
  color: var(--notifications-text);
}

.notifications-route__layout {
  display: grid;
  width: 100%;
  min-height: 100%;
  grid-template-columns: minmax(15rem, 20rem) minmax(0, 1fr);
  border-inline: 1px solid var(--notifications-line);
}

.notifications-route__sidebar,
.notifications-route__main {
  background: var(--notifications-panel);
}

.notifications-route__sidebar {
  display: grid;
  min-height: 0;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-6) var(--space-4);
  border-right: 1px solid var(--notifications-line);
}

.notifications-route__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: 0 0 var(--space-5);
  border-bottom: 1px solid var(--notifications-line);
}

.notifications-route__summary span,
.notifications-route__summary p {
  color: var(--notifications-muted);
}

.notifications-route__summary span {
  display: block;
  font-size: var(--font-size-ui-caption);
  font-weight: var(--font-weight-ui-control);
  line-height: 1.3;
}

.notifications-route__summary strong {
  display: block;
  margin-top: var(--space-1);
  color: var(--notifications-text-strong);
  font-size: var(--font-size-ui-data);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-ui-title);
  line-height: 1;
}

.notifications-route__summary p {
  margin: var(--space-2) 0 0;
  font-size: var(--font-size-ui-meta);
  line-height: var(--line-height-ui-meta);
}

.notifications-route__summary-icon {
  display: inline-flex;
  width: 3.5rem;
  height: 3.5rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary);
}

.notifications-route__summary-icon svg {
  width: var(--space-6);
  height: var(--space-6);
}

.notifications-route__nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.notifications-route__nav-item {
  display: grid;
  min-height: 3.75rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--notifications-text);
  cursor: pointer;
  font-size: var(--font-size-ui-body);
  font-weight: var(--font-weight-ui-control);
  line-height: 1.25;
  text-align: left;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.notifications-route__nav-item:hover,
.notifications-route__nav-item:focus-visible {
  background: var(--notifications-control);
  color: var(--notifications-text-strong);
}

.notifications-route__nav-item[aria-current="page"] {
  border-color: transparent;
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  color: var(--color-primary);
}

.notifications-route__nav-icon {
  width: var(--space-5);
  height: var(--space-5);
}

.notifications-route__mark-button,
.notifications-route__filter-button,
.notifications-route__pagination button {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid var(--notifications-line);
  border-radius: var(--radius-md);
  background: var(--notifications-control);
  color: var(--notifications-text-strong);
  cursor: pointer;
  font-size: var(--font-size-ui-body);
  font-weight: var(--font-weight-ui-control);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.notifications-route__mark-button {
  align-self: end;
  width: 100%;
}

.notifications-route__mark-button svg,
.notifications-route__filter-button svg,
.notifications-route__pagination svg {
  width: var(--space-5);
  height: var(--space-5);
}

.notifications-route__mark-button:hover,
.notifications-route__filter-button:hover,
.notifications-route__pagination button:hover:not(:disabled) {
  border-color: var(--notifications-line-strong);
  background: var(--notifications-control-hover);
  color: var(--color-primary);
}

.notifications-route__mark-button:disabled,
.notifications-route__filter-button:disabled,
.notifications-route__search input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.notifications-route__mark-button:hover:disabled,
.notifications-route__filter-button:hover:disabled {
  border-color: var(--notifications-line);
  background: var(--notifications-control);
  color: var(--notifications-text-strong);
}

.notifications-route__main {
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: var(--space-6) var(--space-8);
}

.notifications-route__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--notifications-line);
}

.notifications-route__header h1,
.notifications-route__empty h1 {
  margin: 0;
  color: var(--notifications-text-strong);
  font-size: var(--font-size-ui-page-title);
  font-weight: var(--font-weight-ui-title);
  line-height: var(--line-height-ui-title);
}

.notifications-route__section-label {
  margin: 0 0 var(--space-1);
  color: var(--notifications-muted);
  font-size: var(--font-size-ui-meta);
  font-weight: 800;
  line-height: 1.3;
}

.notifications-route__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.notifications-route__search {
  display: flex;
  width: min(100%, 28rem);
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  border: 1px solid var(--notifications-line);
  border-radius: var(--radius-md);
  background: var(--notifications-control);
}

.notifications-route__search:focus-within {
  border-color: var(--notifications-line-strong);
  box-shadow: 0 0 0 3px var(--notifications-focus-ring);
}

.notifications-route__search-icon {
  width: var(--space-5);
  height: var(--space-5);
  color: var(--notifications-muted);
}

.notifications-route__search input {
  min-width: 0;
  min-height: 3rem;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--notifications-text-strong);
  font-size: var(--font-size-ui-body);
}

.notifications-route__search input::placeholder {
  color: var(--notifications-muted);
}

.notifications-route__filter-button {
  padding: 0 var(--space-4);
}

.notifications-route__list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.notifications-route__item {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  gap: var(--space-4);
  align-items: center;
  min-height: 5.25rem;
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--notifications-line);
}

.notifications-route__item:hover {
  background: color-mix(in srgb, var(--notifications-control) 52%, transparent);
}

.notifications-route__item-icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-pill);
  background: var(--notifications-control);
  color: var(--color-primary);
  place-items: center;
}

.notifications-route__item-icon svg {
  width: var(--space-5);
  height: var(--space-5);
}

.notifications-route__item-icon--interaction {
  color: var(--color-danger);
}

.notifications-route__item-icon--content {
  color: var(--color-primary-soft);
}

.notifications-route__item-body {
  min-width: 0;
}

.notifications-route__item-body h2 {
  margin: 0;
  color: var(--notifications-text-strong);
  font-size: var(--font-size-ui-row-title);
  font-weight: var(--font-weight-ui-strong);
  line-height: var(--line-height-ui-row-title);
}

.notifications-route__item-body p {
  overflow: hidden;
  margin: var(--space-1) 0 0;
  color: var(--notifications-muted);
  font-size: var(--font-size-ui-body);
  line-height: var(--line-height-ui-body);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notifications-route__item time {
  color: var(--notifications-muted);
  font-size: var(--font-size-ui-meta);
  font-variant-numeric: tabular-nums;
  line-height: 1.3;
  white-space: nowrap;
}

.notifications-route__unread-dot {
  display: block;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
}

.notifications-route__pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding-top: var(--space-5);
}

.notifications-route__pagination button {
  width: 2.75rem;
  min-height: 2.75rem;
}

.notifications-route__pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.notifications-route__page-number {
  display: inline-flex;
  width: 2.75rem;
  height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 16%, transparent);
  color: var(--color-primary);
  font-size: var(--font-size-ui-body);
  font-variant-numeric: tabular-nums;
  font-weight: 900;
}

.notifications-route__pagination-status {
  color: var(--notifications-muted);
  font-size: var(--font-size-ui-meta);
  line-height: var(--line-height-ui-meta);
}

.notifications-route__eyebrow {
  margin: 0 0 var(--space-1);
  color: var(--color-primary);
  font-size: var(--font-size-ui-caption);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.notifications-route__empty {
  display: grid;
  width: min(100%, 48rem);
  margin: var(--space-10) auto 0;
  gap: var(--space-3);
  padding: var(--space-10);
  border-block: 1px solid var(--notifications-line);
  background: color-mix(in srgb, var(--notifications-panel) 72%, transparent);
  place-items: center;
  text-align: center;
}

.notifications-route__empty p:last-child {
  max-width: 35rem;
  margin: 0;
  color: var(--notifications-muted);
}

.notifications-route__nav-item:focus-visible,
.notifications-route__mark-button:focus-visible,
.notifications-route__filter-button:focus-visible,
.notifications-route__pagination button:focus-visible {
  outline: 2px solid var(--notifications-focus-ring);
  outline-offset: 2px;
}

@media (max-width: 900px) {
  .notifications-route__layout {
    min-height: auto;
    grid-template-columns: 1fr;
    border-inline: 1px solid var(--notifications-line);
  }

  .notifications-route__sidebar {
    grid-template-rows: auto auto auto;
    border-right: 0;
    border-bottom: 1px solid var(--notifications-line);
  }

  .notifications-route__main {
    padding: var(--space-5);
  }
}

@media (max-width: 640px) {
  .notifications-route {
    min-height: calc(100vh - 61px);
    padding: var(--space-2);
  }

  .notifications-route__header,
  .notifications-route__toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .notifications-route__search {
    width: 100%;
  }

  .notifications-route__item {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .notifications-route__item time {
    grid-column: 2;
    font-size: var(--font-size-ui-meta);
  }

  .notifications-route__unread-dot {
    grid-column: 3;
    grid-row: 1;
  }

  .notifications-route__pagination {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .notifications-route__nav-item,
  .notifications-route__mark-button,
  .notifications-route__filter-button,
  .notifications-route__pagination button {
    transition: none;
  }
}
</style>
