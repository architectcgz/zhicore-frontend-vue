/**
 * Notification Store
 * 管理通知相关的客户端状态（UI 状态）
 * 
 * 注意：通知数据（列表、未读数量）由 TanStack Query 管理
 * 此 Store 仅负责 UI 状态，如面板开关状态
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Notification } from '@/types';
import { useQueryClient } from '@tanstack/vue-query';
import { notificationApi, type NotificationQueryParams } from '@/api/notification';

/**
 * 通知客户端状态接口
 */
export interface NotificationClientState {
  isPanelOpen: boolean;
  lastViewedTime: number;
  unreadCount: number;
}

export const useNotificationStore = defineStore('notification', () => {
  // UI 状态
  const isPanelOpen = ref(false);
  const lastViewedTime = ref<number>(Date.now());
  const notifications = ref<Notification[]>([]);
  const isLoadingMore = ref(false);
  const hasMore = ref(false);
  const total = ref(0);
  const currentPage = ref(1);
  const lastQueryParams = ref<NotificationQueryParams>({});

  // Query client for cache updates
  const queryClient = useQueryClient();

  /**
   * 打开通知面板
   */
  function openPanel() {
    isPanelOpen.value = true;
    lastViewedTime.value = Date.now();
  }

  /**
   * 关闭通知面板
   */
  function closePanel() {
    isPanelOpen.value = false;
  }

  /**
   * 切换通知面板
   */
  function togglePanel() {
    if (isPanelOpen.value) {
      closePanel();
    } else {
      openPanel();
    }
  }

  /**
   * 添加新通知到缓存
   * 用于 WebSocket 实时更新
   */
  function addNotification(notification: Notification) {
    notifications.value = [notification, ...notifications.value];
    total.value += 1;
    queryClient.setQueryData(['notifications', 'list', lastQueryParams.value], {
      items: notifications.value,
      total: total.value,
      page: currentPage.value,
      size: lastQueryParams.value.size ?? notifications.value.length,
      hasMore: hasMore.value,
    });

    // 更新未读数量
    unreadCount.value += 1;
    queryClient.setQueryData(['notifications', 'count'], unreadCount.value);
  }

  /**
   * 更新通知状态
   * 用于 WebSocket 实时更新
   */
  function updateNotification(notificationId: string, updates: Partial<Notification>) {
    notifications.value = notifications.value.map((n) =>
      n.id === notificationId ? { ...n, ...updates } : n
    );
    queryClient.setQueryData(['notifications', 'list', lastQueryParams.value], {
      items: notifications.value,
      total: total.value,
      page: currentPage.value,
      size: lastQueryParams.value.size ?? notifications.value.length,
      hasMore: hasMore.value,
    });

    // 如果标记为已读，更新未读数量
    if (updates.isRead === true) {
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      queryClient.setQueryData(['notifications', 'count'], unreadCount.value);
    }
  }

  /**
   * 同步未读数量
   * 从服务器获取最新的未读数量
   */
  async function syncUnreadCount() {
    unreadCount.value = await notificationApi.getUnreadCount();
    queryClient.setQueryData(['notifications', 'count'], unreadCount.value);
  }

  /**
   * 标记通知为已读
   * 用于 WebSocket 或用户操作
   */
  async function markAsRead(notificationId: string) {
    await notificationApi.markAsRead(notificationId);
    updateNotification(notificationId, { isRead: true });
  }

  // 未读数量的 getter（从 TanStack Query 缓存读取）
  const unreadCount = ref(0);

  async function fetchRecentNotifications(limit: number = 10): Promise<Notification[]> {
    return notificationApi.getRecentNotifications(limit);
  }

  async function fetchNotifications(params: NotificationQueryParams = {}) {
    const requestParams = {
      ...params,
      page: 1,
      size: params.size ?? 20,
    };

    lastQueryParams.value = { ...params };
    const response = await notificationApi.getNotifications(requestParams);
    notifications.value = response.items;
    total.value = response.total;
    hasMore.value = response.hasMore;
    currentPage.value = response.page;
    unreadCount.value = response.items.filter((item) => !item.isRead).length;

    queryClient.setQueryData(['notifications', 'list', lastQueryParams.value], response);
    queryClient.setQueryData(['notifications', 'count'], unreadCount.value);
  }

  async function loadMoreNotifications(params: NotificationQueryParams = lastQueryParams.value) {
    if (isLoadingMore.value || !hasMore.value) {
      return;
    }

    isLoadingMore.value = true;
    try {
      const nextPage = currentPage.value + 1;
      const response = await notificationApi.getNotifications({
        ...params,
        page: nextPage,
        size: params.size ?? lastQueryParams.value.size ?? 20,
      });

      notifications.value = [...notifications.value, ...response.items];
      total.value = response.total;
      hasMore.value = response.hasMore;
      currentPage.value = response.page;

      queryClient.setQueryData(['notifications', 'list', lastQueryParams.value], {
        ...response,
        items: notifications.value,
      });
    } finally {
      isLoadingMore.value = false;
    }
  }

  async function markAllAsRead() {
    await notificationApi.markAllAsRead();
    notifications.value = notifications.value.map((item) => ({ ...item, isRead: true }));
    unreadCount.value = 0;
    queryClient.setQueryData(['notifications', 'count'], 0);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function deleteNotification(notificationId: string) {
    await notificationApi.deleteNotification(notificationId);
    const target = notifications.value.find((item) => item.id === notificationId);
    notifications.value = notifications.value.filter((item) => item.id !== notificationId);
    total.value = Math.max(0, total.value - 1);
    if (target && !target.isRead) {
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      queryClient.setQueryData(['notifications', 'count'], unreadCount.value);
    }
    queryClient.setQueryData(['notifications', 'list', lastQueryParams.value], {
      items: notifications.value,
      total: total.value,
      page: currentPage.value,
      size: lastQueryParams.value.size ?? notifications.value.length,
      hasMore: hasMore.value,
    });
  }

  async function clearAllNotifications() {
    await notificationApi.clearAllNotifications();
    notifications.value = [];
    total.value = 0;
    hasMore.value = false;
    unreadCount.value = 0;
    queryClient.setQueryData(['notifications', 'count'], 0);
    queryClient.setQueryData(['notifications', 'list', lastQueryParams.value], {
      items: [],
      total: 0,
      page: 1,
      size: lastQueryParams.value.size ?? 20,
      hasMore: false,
    });
  }

  return {
    // UI 状态
    isPanelOpen,
    lastViewedTime,
    unreadCount,
    notifications,
    isLoadingMore,
    hasMore,
    total,

    // UI 操作
    openPanel,
    closePanel,
    togglePanel,

    // WebSocket 实时更新辅助方法
    addNotification,
    updateNotification,
    syncUnreadCount,
    markAsRead,
    markAllAsRead,
    fetchRecentNotifications,
    fetchNotifications,
    loadMoreNotifications,
    deleteNotification,
    clearAllNotifications,
  };
});
