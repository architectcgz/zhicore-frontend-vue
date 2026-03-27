/**
 * WebSocket Composable
 * 提供 WebSocket 连接管理和消息处理的组合式函数
 */

import { onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { notificationRealtimeClient } from '@/utils/stomp';
import { mapAggregatedNotificationRecord, type AggregatedNotificationRecord } from '@/utils/notification';
import { isRealtimeEnabled } from '@/utils/realtime';
import { ElNotification } from 'element-plus';
import type { Notification } from '@/types';
import type { WebSocketMessage } from '@/types';

interface UnreadCountRealtimePayload {
  unreadCount?: number;
  count?: number;
}

interface AnnouncementPayload {
  title: string;
  content: string;
}

/**
 * WebSocket 连接状态
 */
export interface WebSocketStatus {
  isConnected: boolean;
  reconnectAttempts: number;
}

/**
 * 使用 WebSocket
 * @returns WebSocket 相关方法和状态
 */
export function useWebSocket() {
  if (!isRealtimeEnabled()) {
    return {
      initWebSocket: () => {},
      disconnectWebSocket: () => {},
      sendMessage: (_message: WebSocketMessage) => {},
      isConnected: () => false,
    };
  }

  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();

  // 取消订阅函数集合
  const unsubscribeFunctions: Array<() => void> = [];

  /**
   * 初始化 WebSocket 连接
   */
  const initWebSocket = () => {
    if (!authStore.isAuthenticated || !authStore.accessToken) {
      console.log('User not authenticated, skipping WebSocket connection');
      return;
    }

    setupMessageHandlers();

    void Promise.resolve(notificationRealtimeClient.connect(authStore.accessToken))
      .then(() => Promise.resolve(notificationStore.syncUnreadCount()).catch(error => {
        console.error('Failed to sync realtime unread count:', error);
      }))
      .catch(error => {
        console.error('Failed to initialize realtime notifications:', error);
      });
  };

  /**
   * 设置消息处理器
   */
  const setupMessageHandlers = () => {
    if (unsubscribeFunctions.length > 0) {
      return;
    }

    // 处理新通知
    const unsubscribeNotification = notificationRealtimeClient.subscribe<AggregatedNotificationRecord>(
      '/user/queue/notifications',
      (data) => {
        console.log('Received new notification:', data);

        const notification = mapNotificationPayload(data);
        notificationStore.addNotification(notification);
        showNotificationToast(notification);
      }
    );
    unsubscribeFunctions.push(unsubscribeNotification);

    // 处理未读数量更新
    const unsubscribeUnreadCount = notificationRealtimeClient.subscribe<UnreadCountRealtimePayload>(
      '/user/queue/unread-count',
      (data) => {
        const unreadCount = data.unreadCount ?? data.count ?? 0;
        console.log('Unread count updated:', unreadCount);
        notificationStore.setUnreadCount(unreadCount);
      }
    );
    unsubscribeFunctions.push(unsubscribeUnreadCount);

    const unsubscribeAnnouncement = notificationRealtimeClient.subscribe<AnnouncementPayload>(
      '/topic/announcements',
      (data) => {
        ElNotification({
          title: data.title,
          message: data.content,
          type: 'warning',
          duration: 5000,
        });
      }
    );
    unsubscribeFunctions.push(unsubscribeAnnouncement);
  };

  const mapNotificationPayload = (data: AggregatedNotificationRecord): Notification =>
    mapAggregatedNotificationRecord(data);

  /**
   * 显示通知提示
   * @param notification 通知对象
   */
  const showNotificationToast = (notification: Notification) => {
    const typeMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
      LIKE: 'success',
      COMMENT: 'info',
      FOLLOW: 'success',
      SYSTEM: 'warning',
    };

    ElNotification({
      title: notification.title,
      message: notification.content,
      type: typeMap[notification.type] || 'info',
      duration: 5000,
    });
  };

  /**
   * 断开 WebSocket 连接
   */
  const disconnectWebSocket = () => {
    console.log('Disconnecting WebSocket');
    
    // 取消所有订阅
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    unsubscribeFunctions.length = 0;
    
    // 断开连接
    notificationRealtimeClient.disconnect();
  };

  /**
   * 发送消息
   * @param message 完整的 WebSocket 消息对象
   */
  const sendMessage = (message: WebSocketMessage) => {
    void message;
  };

  /**
   * 检查连接状态
   * @returns 是否已连接
   */
  const isConnected = () => {
    return notificationRealtimeClient.isConnected();
  };

  // 监听认证状态变化
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        initWebSocket();
      } else {
        disconnectWebSocket();
      }
    }
  );

  // 监听页面可见性变化
  if (typeof document !== 'undefined') {
    const handleVisibilityChange = () => {
      if (!document.hidden && authStore.accessToken) {
        void Promise.resolve(notificationRealtimeClient.connect(authStore.accessToken));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 组件卸载时移除监听器
    onUnmounted(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
  }

  // 组件挂载时初始化
  onMounted(() => {
    if (authStore.isAuthenticated) {
      initWebSocket();
    }
  });

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnectWebSocket();
  });

  return {
    initWebSocket,
    disconnectWebSocket,
    sendMessage,
    isConnected,
  };
}
