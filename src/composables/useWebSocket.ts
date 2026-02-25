/**
 * WebSocket Composable
 * 提供 WebSocket 连接管理和消息处理的组合式函数
 */

import { onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { wsManager } from '@/utils/websocket';
import { ElNotification } from 'element-plus';
import type { Notification } from '@/types';
import type {
  WebSocketMessage,
  NotificationPayload,
  ConnectionEventData,
  ErrorEventData,
} from '@/types/websocket';

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

    console.log('Initializing WebSocket connection');
    wsManager.connect(authStore.accessToken);

    // 注册消息处理器
    setupMessageHandlers();
  };

  /**
   * 设置消息处理器
   */
  const setupMessageHandlers = () => {
    // 处理新通知
    const unsubscribeNotification = wsManager.on('notification', (data: NotificationPayload) => {
      console.log('Received new notification:', data);
      
      // 将 NotificationPayload 转换为 Notification 类型
      const notification: Notification = {
        id: data.id,
        userId: '', // WebSocket 通知不包含 userId，使用空字符串
        type: data.type,
        title: data.title,
        content: data.content,
        relatedId: data.relatedId,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      
      // 添加到通知 store
      notificationStore.addNotification(notification);
      
      // 显示通知提示
      showNotificationToast(notification);
    });
    unsubscribeFunctions.push(unsubscribeNotification);

    // 处理通知已读
    const unsubscribeNotificationRead = wsManager.on('notification_read', (data: { notificationId: string }) => {
      console.log('Notification marked as read:', data.notificationId);
      notificationStore.updateNotification(data.notificationId, { isRead: true });
    });
    unsubscribeFunctions.push(unsubscribeNotificationRead);

    // 处理未读数量更新
    const unsubscribeUnreadCount = wsManager.on('unread_count', (data: { count: number }) => {
      console.log('Unread count updated:', data.count);
      notificationStore.unreadCount = data.count;
    });
    unsubscribeFunctions.push(unsubscribeUnreadCount);

    // 处理连接成功
    const unsubscribeConnected = wsManager.on('connected', (_data: ConnectionEventData) => {
      console.log('WebSocket connected successfully');
      // 同步未读数量
      notificationStore.syncUnreadCount().catch(error => {
        console.error('Failed to sync unread count:', error);
      });
    });
    unsubscribeFunctions.push(unsubscribeConnected);

    // 处理连接断开
    const unsubscribeDisconnected = wsManager.on('disconnected', (data: ConnectionEventData) => {
      console.log('WebSocket disconnected:', data);
    });
    unsubscribeFunctions.push(unsubscribeDisconnected);

    // 处理连接错误
    const unsubscribeError = wsManager.on('error', (data: ErrorEventData) => {
      console.error('WebSocket error:', data);
    });
    unsubscribeFunctions.push(unsubscribeError);

    // 处理最大重连次数
    const unsubscribeMaxReconnect = wsManager.on('max_reconnect_attempts', (_data: { attempts: number; timestamp: number }) => {
      console.error('Max reconnect attempts reached');
      ElNotification({
        title: '连接失败',
        message: '无法连接到服务器，请刷新页面重试',
        type: 'error',
        duration: 0,
      });
    });
    unsubscribeFunctions.push(unsubscribeMaxReconnect);
  };

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
      onClick: () => {
        // 点击通知时标记为已读
        if (!notification.isRead) {
          notificationStore.markAsRead(notification.id).catch(error => {
            console.error('Failed to mark notification as read:', error);
          });
        }
      },
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
    wsManager.disconnect();
  };

  /**
   * 发送消息
   * @param message 完整的 WebSocket 消息对象
   */
  const sendMessage = (message: WebSocketMessage) => {
    wsManager.send(message.type, message.data);
  };

  /**
   * 检查连接状态
   * @returns 是否已连接
   */
  const isConnected = () => {
    return wsManager.isConnected();
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
      if (authStore.accessToken) {
        wsManager.handleVisibilityChange(authStore.accessToken);
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
