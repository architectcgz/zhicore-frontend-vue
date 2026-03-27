<script setup lang="ts">
import type { Notification } from '@/types';
import type { NotificationGroupSection } from '@/types/notification/center';

interface Props {
  sections: NotificationGroupSection[];
  isInitialLoading: boolean;
  hasNotifications: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  formatTime: (dateString: string) => string;
  getNotificationIcon: (type: Notification['type']) => string;
  getNotificationColor: (type: Notification['type']) => string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'notification-click': [notification: Notification];
  'load-more': [];
}>();
</script>

<template>
  <div class="notification-center__content">
    <div
      v-if="props.isInitialLoading"
      class="notification-center__loading"
    >
      <div class="notification-center__spinner" />
      <p>加载中...</p>
    </div>

    <div
      v-else-if="props.hasNotifications"
      class="notification-center__list"
    >
      <div
        v-for="section in props.sections"
        :key="section.key"
        class="notification-group"
      >
        <h2 class="notification-group__title">
          {{ section.title }}
        </h2>

        <div
          v-for="notification in section.items"
          :key="notification.id"
          class="notification-card"
          :class="[
            props.getNotificationColor(notification.type),
            { 'notification-card--unread': !notification.isRead },
          ]"
        >
          <div
            class="notification-card__main"
            @click="emit('notification-click', notification)"
          >
            <div class="notification-card__icon">
              {{ props.getNotificationIcon(notification.type) }}
            </div>

            <div class="notification-card__content">
              <div class="notification-card__title">
                {{ notification.title }}
              </div>
              <div class="notification-card__text">
                {{ notification.content }}
              </div>
              <div
                v-if="notification.totalCount"
                class="notification-card__meta"
              >
                共 {{ notification.totalCount }} 条
                <span v-if="(notification.unreadCount ?? 0) > 0">
                  · {{ notification.unreadCount }} 条未读
                </span>
              </div>
              <div class="notification-card__time">
                {{ props.formatTime(notification.createdAt) }}
              </div>
            </div>

            <div
              v-if="!notification.isRead"
              class="notification-card__unread-dot"
            />
          </div>
        </div>
      </div>

      <div
        v-if="props.hasMore"
        class="notification-center__load-more"
      >
        <button
          class="notification-center__load-more-btn"
          :disabled="props.isLoadingMore"
          @click="emit('load-more')"
        >
          <span v-if="props.isLoadingMore">加载中...</span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </div>

    <div
      v-else
      class="notification-center__empty"
    >
      <div class="notification-center__empty-icon">
        🔔
      </div>
      <p class="notification-center__empty-text">
        暂无通知
      </p>
    </div>
  </div>
</template>

<style scoped>
.notification-center__content {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-bg);
  box-shadow: var(--shadow-sm);
}

.notification-center__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  color: var(--color-text-secondary);
}

.notification-center__spinner {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-lg);
  border: 4px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notification-center__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl);
  text-align: center;
}

.notification-center__empty-icon {
  margin-bottom: var(--space-lg);
  font-size: 64px;
  opacity: 0.5;
}

.notification-center__empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.notification-group {
  padding: var(--space-lg) 0;
}

.notification-group:not(:last-child) {
  border-bottom: 1px solid var(--color-border-light);
}

.notification-group__title {
  margin: 0 var(--space-lg) var(--space-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.notification-card {
  position: relative;
  border-left: 3px solid transparent;
  transition: background-color var(--transition-base);
}

.notification-card:not(:last-child) {
  border-bottom: 1px solid var(--color-border-light);
}

.notification-card:hover {
  background-color: var(--color-hover);
}

.notification-card--unread {
  background-color: var(--color-bg-secondary);
}

.notification-card--like {
  border-left-color: var(--color-danger);
}

.notification-card--comment {
  border-left-color: var(--color-cta);
}

.notification-card--follow {
  border-left-color: var(--color-success);
}

.notification-card--system {
  border-left-color: var(--color-warning);
}

.notification-card__main {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
  padding: var(--space-lg);
  cursor: pointer;
}

.notification-card__icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  font-size: var(--font-size-xl);
}

.notification-card__content {
  flex: 1;
  min-width: 0;
}

.notification-card__title {
  margin-bottom: var(--space-xs);
  color: var(--color-text);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.notification-card__text {
  margin-bottom: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.5;
}

.notification-card__meta {
  margin-bottom: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
}

.notification-card__time {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.notification-card__unread-dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-top: var(--space-sm);
  border-radius: 50%;
  background-color: var(--color-cta);
}

.notification-center__load-more {
  padding: var(--space-lg);
  border-top: 1px solid var(--color-border-light);
  text-align: center;
}

.notification-center__load-more-btn {
  padding: var(--space-sm) var(--space-xl);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
}

.notification-center__load-more-btn:hover:not(:disabled) {
  border-color: var(--color-cta);
  background-color: var(--color-hover);
}

.notification-center__load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 767px) {
  .notification-card__main {
    padding: var(--space-md);
  }

  .notification-card__icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-lg);
  }
}
</style>
