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
  const notificationActionTextMap: Record<Notification['type'], string> = {
    LIKE: '赞了你的内容',
    COMMENT: '评论了你的文章',
    FOLLOW: '关注了你',
    SYSTEM: '发送了系统通知',
  };

  // UI 状态
  const isPanelOpen = ref(false);
  const lastViewedTime = ref<number>(Date.now());
  const notifications = ref<Notification[]>([]);
  const isLoadingMore = ref(false);
  const hasMore = ref(false);
  const total = ref(0);
  const currentPage = ref(0);
  const lastQueryParams = ref<NotificationQueryParams>({});
  const unreadCount = ref(0);

  // Query client for cache updates
  const queryClient = useQueryClient();

  const getNotificationListQueryKey = () =>
    ['notifications', 'list', lastQueryParams.value] as const;
  const notificationCountQueryKey = ['notifications', 'count'] as const;

  function buildNotificationGroupId(notification: Notification): string {
    return [
      notification.type,
      notification.relatedType ?? 'UNKNOWN',
      notification.relatedId ?? 'NONE',
    ].join(':');
  }

  function normalizeNotification(notification: Notification): Notification {
    const normalizedUnreadCount = notification.unreadCount ?? (notification.isRead ? 0 : 1);
    const normalizedTotalCount = notification.totalCount ?? 1;

    return {
      ...notification,
      id: buildNotificationGroupId(notification),
      totalCount: normalizedTotalCount,
      unreadCount: normalizedUnreadCount,
      isRead: normalizedUnreadCount === 0,
    };
  }

  function isAggregatedSnapshot(notification: Notification): boolean {
    return notification.totalCount != null || notification.unreadCount != null;
  }

  function buildAggregatedContent(notification: Notification, totalCount: number): string {
    const actionText = notificationActionTextMap[notification.type];
    if (!actionText) {
      return notification.content;
    }

    const actorPrefixSource = notification.content?.endsWith(actionText)
      ? notification.content.slice(0, -actionText.length)
      : '';
    const actorPrefix = actorPrefixSource.replace(/等\d+人$/, '').trim();

    if (!actorPrefix) {
      return totalCount > 1 ? actionText : notification.content;
    }

    if (totalCount <= 1) {
      return `${actorPrefix}${actionText}`;
    }

    return `${actorPrefix}等${totalCount}人${actionText}`;
  }

  function matchesCurrentFilters(notification: Notification): boolean {
    const { type, isRead } = lastQueryParams.value;

    if (type && notification.type !== type) {
      return false;
    }

    if (typeof isRead === 'boolean' && notification.isRead !== isRead) {
      return false;
    }

    return true;
  }

  function setUnreadCount(count: number) {
    unreadCount.value = Math.max(0, count);
    queryClient.setQueryData(notificationCountQueryKey, unreadCount.value);
  }

  function updateNotificationListCache() {
    const size =
      lastQueryParams.value.size ??
      (notifications.value.length > 0 ? notifications.value.length : 20);
    queryClient.setQueryData(getNotificationListQueryKey(), {
      items: notifications.value,
      total: total.value,
      page: currentPage.value,
      size,
      hasMore: hasMore.value,
    });
  }

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
    const normalizedNotification = normalizeNotification(notification);
    const aggregatedSnapshot = isAggregatedSnapshot(notification);
    const targetIndex = notifications.value.findIndex(
      (item) => buildNotificationGroupId(item) === normalizedNotification.id,
    );

    if (targetIndex !== -1) {
      const previous = normalizeNotification(notifications.value[targetIndex]);
      const mergedNotification: Notification = aggregatedSnapshot
        ? {
            ...previous,
            ...normalizedNotification,
            id: previous.id,
            totalCount: normalizedNotification.totalCount ?? previous.totalCount ?? 1,
            unreadCount: normalizedNotification.unreadCount ?? previous.unreadCount ?? 0,
          }
        : {
            ...previous,
            ...normalizedNotification,
            id: previous.id,
            totalCount: (previous.totalCount ?? 1) + (normalizedNotification.totalCount ?? 1),
            unreadCount: (previous.unreadCount ?? (previous.isRead ? 0 : 1)) + (normalizedNotification.unreadCount ?? 0),
          };
      mergedNotification.content = aggregatedSnapshot
        ? normalizedNotification.content || buildAggregatedContent(previous, mergedNotification.totalCount ?? 1)
        : buildAggregatedContent(previous, mergedNotification.totalCount ?? 1);
      mergedNotification.isRead = (mergedNotification.unreadCount ?? 0) === 0;

      if (matchesCurrentFilters(mergedNotification)) {
        const remainingNotifications = notifications.value.filter((_, index) => index !== targetIndex);
        notifications.value = [mergedNotification, ...remainingNotifications];
      } else {
        notifications.value = notifications.value.filter((_, index) => index !== targetIndex);
        total.value = Math.max(0, total.value - 1);
      }

      const unreadDelta = aggregatedSnapshot
        ? (mergedNotification.unreadCount ?? 0) - (previous.unreadCount ?? 0)
        : (normalizedNotification.unreadCount ?? 0);
      if (unreadDelta !== 0) {
        setUnreadCount(unreadCount.value + unreadDelta);
      }
      updateNotificationListCache();
      return;
    }

    if (matchesCurrentFilters(normalizedNotification)) {
      notifications.value = [normalizedNotification, ...notifications.value];
      total.value += 1;
      updateNotificationListCache();
    }

    // 更新未读数量
    if ((normalizedNotification.unreadCount ?? 0) > 0) {
      setUnreadCount(unreadCount.value + (normalizedNotification.unreadCount ?? 0));
    }
  }

  /**
   * 更新通知状态
   * 用于 WebSocket 实时更新
   */
  function updateNotification(notificationId: string, updates: Partial<Notification>) {
    const targetIndex = notifications.value.findIndex((n) => n.id === notificationId);

    // 不在当前列表中时，至少保证未读计数方向正确
    if (targetIndex === -1) {
      if (updates.isRead === true) {
        setUnreadCount(unreadCount.value - 1);
      } else if (updates.isRead === false) {
        setUnreadCount(unreadCount.value + 1);
      }
      return;
    }

    const previous = notifications.value[targetIndex];
    const next = { ...previous, ...updates };
    const matchedBefore = matchesCurrentFilters(previous);
    const matchedAfter = matchesCurrentFilters(next);

    if (matchedBefore && matchedAfter) {
      notifications.value[targetIndex] = next;
    } else if (matchedBefore && !matchedAfter) {
      notifications.value.splice(targetIndex, 1);
      total.value = Math.max(0, total.value - 1);
    } else if (!matchedBefore && matchedAfter) {
      notifications.value.unshift(next);
      total.value += 1;
    }

    if (previous.isRead !== next.isRead) {
      if (!previous.isRead && next.isRead) {
        setUnreadCount(unreadCount.value - 1);
      } else if (previous.isRead && !next.isRead) {
        setUnreadCount(unreadCount.value + 1);
      }
    }

    updateNotificationListCache();
  }

  /**
   * 同步未读数量
   * 从服务器获取最新的未读数量
   */
  async function syncUnreadCount() {
    const latestUnreadCount = await notificationApi.getUnreadCount();
    setUnreadCount(latestUnreadCount);
  }

  async function fetchRecentNotifications(limit: number = 10): Promise<Notification[]> {
    return notificationApi.getRecentNotifications(limit);
  }

  async function fetchNotifications(params: NotificationQueryParams = {}) {
    const requestParams = {
      ...params,
      page: 0,
      size: params.size ?? 20,
    };

    lastQueryParams.value = { ...params, size: requestParams.size };
    const [response, latestUnreadCount] = await Promise.all([
      notificationApi.getNotifications(requestParams),
      notificationApi.getUnreadCount(),
    ]);
    notifications.value = response.items;
    total.value = response.total;
    hasMore.value = response.hasMore;
    currentPage.value = response.page;
    queryClient.setQueryData(getNotificationListQueryKey(), response);
    setUnreadCount(latestUnreadCount);
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

      queryClient.setQueryData(getNotificationListQueryKey(), {
        ...response,
        items: notifications.value,
      });
    } finally {
      isLoadingMore.value = false;
    }
  }

  async function markAllAsRead() {
    await notificationApi.markAllAsRead();
    if (lastQueryParams.value.isRead === false) {
      // 当前视图是“未读”，全部已读后列表应为空
      notifications.value = [];
      total.value = 0;
      hasMore.value = false;
      currentPage.value = 0;
    } else {
      notifications.value = notifications.value.map((item) => ({
        ...item,
        isRead: true,
        unreadCount: 0,
      }));
    }
    setUnreadCount(0);
    updateNotificationListCache();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    setUnreadCount,
    syncUnreadCount,
    markAllAsRead,
    fetchRecentNotifications,
    fetchNotifications,
    loadMoreNotifications,
  };
});
