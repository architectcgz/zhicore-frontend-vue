<template>
  <main class="notifications-route" aria-labelledby="notifications-title">
    <section class="notifications-route__layout">
      <aside class="notifications-route__sidebar" aria-label="通知分类">
        <section class="notifications-route__summary" aria-label="未读摘要">
          <div>
            <span>未读摘要</span>
            <strong>{{ page.unreadCount.value ?? "—" }}</strong>
            <p>未读通知</p>
          </div>
          <span class="notifications-route__summary-icon">
            <Bell aria-hidden="true" />
          </span>
        </section>

        <nav class="notifications-route__nav" aria-label="通知分类">
          <button
            v-for="category in categories"
            :key="category.value"
            class="notifications-route__nav-item"
            type="button"
            :aria-label="category.ariaLabel"
            :aria-current="
              page.selectedCategory.value === category.value ? 'page' : undefined
            "
            @click="page.selectCategory(category.value)"
          >
            <component
              :is="category.icon"
              class="notifications-route__nav-icon"
              aria-hidden="true"
            />
            <span>{{ category.label }}</span>
            <strong>{{ page.categoryCounts.value[category.value] ?? "—" }}</strong>
          </button>
        </nav>

        <button
          class="notifications-route__mark-button"
          type="button"
          aria-label="全部已读"
          :disabled="page.submittingMarkAll.value || page.items.value.length === 0"
          @click="page.markAllRead"
        >
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
        </header>

        <div
          v-if="page.status.value === 'loading'"
          class="notifications-route__empty"
        >
          <p class="notifications-route__eyebrow">Loading</p>
          <h2>通知加载中</h2>
          <p>正在读取通知列表和未读摘要。</p>
        </div>

        <div
          v-else-if="page.status.value === 'error'"
          class="notifications-route__empty"
        >
          <p class="notifications-route__eyebrow">Error</p>
          <h2>{{ page.error.value || "通知加载失败" }}</h2>
          <p>可以稍后重试，已读状态不会被本地伪造。</p>
          <button
            class="notifications-route__mark-button"
            type="button"
            aria-label="重新加载通知"
            @click="page.retry"
          >
            重新加载
          </button>
        </div>

        <div
          v-else-if="page.status.value === 'empty'"
          class="notifications-route__empty"
        >
          <p class="notifications-route__eyebrow">Empty</p>
          <h2>暂无通知</h2>
          <p>新的互动、内容、系统或安全通知会显示在这里。</p>
        </div>

        <div v-else class="notifications-route__list">
          <article
            v-for="notification in page.items.value"
            :key="notification.id"
            class="notifications-route__item"
            :class="{
              'notifications-route__item--unread': notification.unread,
            }"
          >
            <span
              class="notifications-route__item-icon"
              :class="`notifications-route__item-icon--${notification.category}`"
            >
              <Heart
                v-if="notification.category === 'interaction'"
                aria-hidden="true"
              />
              <AtSign
                v-else-if="notification.category === 'content'"
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
            <a
              v-if="notification.targetPath"
              class="notifications-route__target-link"
              :href="notification.targetPath"
            >
              查看
            </a>
          </article>
        </div>

        <p v-if="page.actionError.value" class="notifications-route__error">
          {{ page.actionError.value }}
        </p>

        <footer
          v-if="page.hasMore.value"
          class="notifications-route__pagination"
          aria-label="通知分页"
        >
          <button
            type="button"
            aria-label="加载更多通知"
            :disabled="!page.canLoadMore.value"
            @click="page.loadMore"
          >
            <ChevronRight aria-hidden="true" />
            <span>{{
              page.loadingMore.value ? "加载中" : "加载更多"
            }}</span>
          </button>
        </footer>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  AtSign,
  Bell,
  CheckCircle2,
  ChevronRight,
  Heart,
  Sparkles,
} from "@lucide/vue";

import {
  useNotificationCenterPage,
  type NotificationCenterCategory,
} from "@/features/notification";

interface NotificationCategoryOption {
  value: NotificationCenterCategory;
  label: string;
  ariaLabel: string;
  icon: typeof Bell;
}

const categories: NotificationCategoryOption[] = [
  { value: "all", label: "全部", ariaLabel: "全部通知", icon: Bell },
  {
    value: "content",
    label: "内容",
    ariaLabel: "内容通知",
    icon: AtSign,
  },
  {
    value: "interaction",
    label: "互动",
    ariaLabel: "互动通知",
    icon: Heart,
  },
  { value: "social", label: "社交", ariaLabel: "社交通知", icon: Heart },
  { value: "system", label: "系统", ariaLabel: "系统通知", icon: Sparkles },
  { value: "security", label: "安全", ariaLabel: "安全通知", icon: Sparkles },
];

const page = useNotificationCenterPage();
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
