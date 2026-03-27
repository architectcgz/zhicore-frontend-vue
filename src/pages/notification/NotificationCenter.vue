<!--
  通知中心页面
  显示聚合后的通知列表，支持按时间分组、分页加载
  提供全部已读和按目标跳转能力
-->

<script setup lang="ts">
import NotificationCenterFilters from '@/components/notification/NotificationCenterFilters.vue';
import NotificationCenterGroupList from '@/components/notification/NotificationCenterGroupList.vue';
import NotificationCenterHeader from '@/components/notification/NotificationCenterHeader.vue';
import { useNotificationCenterContent } from '@/composables/useNotificationCenterContent';

const {
  notifications,
  groupedSections,
  total,
  unreadCount,
  hasMore,
  isLoadingMore,
  isInitialLoading,
  formatTime,
  getNotificationIcon,
  getNotificationColor,
  handleNotificationClick,
  handleMarkAllAsRead,
  loadMore,
} = useNotificationCenterContent();
</script>

<template>
  <div class="notification-center">
    <div class="notification-center__container">
      <NotificationCenterHeader
        :total="total"
        :unread-count="unreadCount"
      />

      <NotificationCenterFilters
        :unread-count="unreadCount"
        :total="total"
        @mark-all-read="handleMarkAllAsRead"
      />

      <NotificationCenterGroupList
        :sections="groupedSections"
        :is-initial-loading="isInitialLoading"
        :has-notifications="notifications.length > 0"
        :has-more="hasMore"
        :is-loading-more="isLoadingMore"
        :format-time="formatTime"
        :get-notification-icon="getNotificationIcon"
        :get-notification-color="getNotificationColor"
        @notification-click="handleNotificationClick"
        @load-more="loadMore"
      />
    </div>
  </div>
</template>

<style scoped>
.notification-center {
  min-height: calc(100vh - 80px);
  padding: var(--space-xl) 0;
  background-color: var(--color-bg-secondary);
}

.notification-center__container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

@media (max-width: 767px) {
  .notification-center {
    padding: var(--space-lg) 0;
  }

  .notification-center__container {
    padding: 0 var(--space-md);
  }
}
</style>
