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
    // 更新 TanStack Query 缓存
    queryClient.setQueryData(['notifications'], (oldData: any) => {
      if (!oldData) return { notifications: [notification], total: 1 };
      
      return {
        notifications: [notification, ...oldData.notifications],
        total: oldData.total + 1,
      };
    });

    // 更新未读数量
    queryClient.setQueryData(['notifications', 'unread-count'], (oldCount: number = 0) => {
      return oldCount + 1;
    });
  }

  /**
   * 更新通知状态
   * 用于 WebSocket 实时更新
   */
  function updateNotification(notificationId: string, updates: Partial<Notification>) {
    queryClient.setQueryData(['notifications'], (oldData: any) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        notifications: oldData.notifications.map((n: Notification) =>
          n.id === notificationId ? { ...n, ...updates } : n
        ),
      };
    });

    // 如果标记为已读，更新未读数量
    if (updates.isRead === true) {
      queryClient.setQueryData(['notifications', 'unread-count'], (oldCount: number = 0) => {
        return Math.max(0, oldCount - 1);
      });
    }
  }

  /**
   * 同步未读数量
   * 从服务器获取最新的未读数量
   */
  async function syncUnreadCount() {
    // 触发 TanStack Query 重新获取未读数量
    await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }

  /**
   * 标记通知为已读
   * 用于 WebSocket 或用户操作
   */
  async function markAsRead(notificationId: string) {
    // 乐观更新
    updateNotification(notificationId, { isRead: true });

    // 实际的 API 调用应该通过 TanStack Query mutation 完成
    // 这里只是更新缓存，实际的网络请求由 mutation 处理
  }

  // 未读数量的 getter（从 TanStack Query 缓存读取）
  const unreadCount = ref(0);

  return {
    // UI 状态
    isPanelOpen,
    lastViewedTime,
    unreadCount,

    // UI 操作
    openPanel,
    closePanel,
    togglePanel,

    // WebSocket 实时更新辅助方法
    addNotification,
    updateNotification,
    syncUnreadCount,
    markAsRead,
  };
});
