/**
 * 消息 WebSocket Composable
 * 集成 WebSocket 实时消息功能
 */

import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { wsManager } from '@/utils/websocket';
import { useAuthStore } from '@/stores/auth';
import { queryKeys } from '@/queries/query-keys';
import type { Message, PaginatedResponse } from '@/types';
import type { ConnectionEventData, NewMessagePayload, MessageReadPayload } from '@/types/websocket';

/**
 * 使用消息 WebSocket
 */
export function useMessageWebSocket() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();

  // 取消订阅函数列表
  const unsubscribeFunctions: Array<() => void> = [];

  /**
   * 初始化 WebSocket 连接
   */
  function initWebSocket() {
    if (!authStore.accessToken) {
      console.warn('No access token, cannot connect WebSocket');
      return;
    }

    // 连接 WebSocket
    wsManager.connect(authStore.accessToken);

    // 监听新消息
    const unsubscribeNewMessage = wsManager.on('new_message', handleNewMessage);
    unsubscribeFunctions.push(unsubscribeNewMessage);

    // 监听消息已读
    const unsubscribeMessageRead = wsManager.on('message_read', handleMessageRead);
    unsubscribeFunctions.push(unsubscribeMessageRead);

    // 监听消息删除
    const unsubscribeMessageDeleted = wsManager.on('message_deleted', handleMessageDeleted);
    unsubscribeFunctions.push(unsubscribeMessageDeleted);

    // 监听正在输入
    const unsubscribeTyping = wsManager.on('typing', handleTyping);
    unsubscribeFunctions.push(unsubscribeTyping);

    // 监听在线状态
    const unsubscribeOnlineStatus = wsManager.on('online_status', handleOnlineStatus);
    unsubscribeFunctions.push(unsubscribeOnlineStatus);

    // 监听连接状态
    const unsubscribeConnected = wsManager.on('connected', handleConnected);
    unsubscribeFunctions.push(unsubscribeConnected);

    const unsubscribeDisconnected = wsManager.on('disconnected', handleDisconnected);
    unsubscribeFunctions.push(unsubscribeDisconnected);
  }

  /**
   * 处理新消息
   */
  function handleNewMessage(data: NewMessagePayload) {
    console.log('Received new message:', data);
    
    // 将 NewMessagePayload 转换为 Message 类型
    const message: Message = {
      id: data.messageId,
      conversationId: data.conversationId,
      senderId: data.senderId,
      receiverId: '', // 需要从会话信息中获取
      content: data.content,
      messageType: 'TEXT', // 默认为文本消息
      isRead: false,
      sequence: 0, // 需要从服务器获取
      createdAt: new Date(data.timestamp).toISOString(),
    };
    
    // 添加消息到 TanStack Query 缓存
    const messagesQueryKey = queryKeys.messages.messagesList(message.conversationId);
    queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        items: [...old.items, message],
        total: old.total + 1,
      };
    });
    
    // 失效会话列表（更新最后消息和未读数）
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
  }

  /**
   * 处理消息已读
   */
  function handleMessageRead(data: MessageReadPayload) {
    console.log('Messages marked as read:', data);
    
    // 更新消息缓存中的已读状态
    const messagesQueryKey = queryKeys.messages.messagesList(data.conversationId);
    const messageIds = data.messageIds || (data.messageId ? [data.messageId] : []);
    
    queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        ),
      };
    });
    
    // 失效会话列表（更新未读数）
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
  }

  /**
   * 处理消息删除
   */
  function handleMessageDeleted(data: { messageId: string; conversationId: string }) {
    console.log('Message deleted:', data);
    
    // 从 TanStack Query 缓存中删除消息
    const messagesQueryKey = queryKeys.messages.messagesList(data.conversationId);
    queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        items: old.items.filter(msg => msg.id !== data.messageId),
        total: old.total - 1,
      };
    });
  }

  /**
   * 处理正在输入
   */
  function handleTyping(data: { userId: string; conversationId: string; isTyping: boolean }) {
    console.log('User typing:', data);
    
    // TODO: 显示正在输入指示器
  }

  /**
   * 处理在线状态
   */
  function handleOnlineStatus(data: { userId: string; isOnline: boolean }) {
    console.log('User online status:', data);
    
    // TODO: 更新用户在线状态
  }

  /**
   * 处理连接成功
   */
  function handleConnected(data: ConnectionEventData) {
    console.log('WebSocket connected:', data);
    
    // 失效所有消息相关查询，触发重新获取
    queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
  }

  /**
   * 处理断开连接
   */
  function handleDisconnected(data: ConnectionEventData) {
    console.log('WebSocket disconnected:', data);
  }

  /**
   * 发送消息（通过 WebSocket）
   */
  function sendMessageViaWebSocket(message: {
    conversationId: string;
    receiverId: string;
    content: string;
  }) {
    wsManager.send('send_message', message);
  }

  /**
   * 发送正在输入状态
   */
  function sendTypingStatus(conversationId: string, isTyping: boolean) {
    const authStore = useAuthStore();
    wsManager.send('typing', {
      userId: authStore.user?.id || '',
      conversationId,
      isTyping,
    });
  }

  /**
   * 标记消息为已读（通过 WebSocket）
   */
  function markAsReadViaWebSocket(conversationId: string, messageIds: string[]) {
    wsManager.send('mark_read', {
      conversationId,
      messageIds,
    });
  }

  /**
   * 清理 WebSocket 连接
   */
  function cleanup() {
    // 取消所有订阅
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    unsubscribeFunctions.length = 0;

    // 断开 WebSocket 连接
    wsManager.disconnect();
  }

  // 生命周期钩子
  onMounted(() => {
    initWebSocket();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    sendMessageViaWebSocket,
    sendTypingStatus,
    markAsReadViaWebSocket,
    initWebSocket,
    cleanup,
  };
}
