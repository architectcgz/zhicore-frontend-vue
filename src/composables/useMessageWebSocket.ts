/**
 * 消息 WebSocket Composable
 * 集成 WebSocket 实时消息功能
 */

import { onMounted, onUnmounted } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import { messageRealtimeClient } from '@/utils/stomp';
import { useAuthStore } from '@/stores/auth';
import { isRealtimeEnabled } from '@/utils/realtime';
import { queryKeys } from '@/queries/query-keys';
import type { Message, PaginatedResponse } from '@/types';

type MessagePushType = 'NEW_MESSAGE' | 'MESSAGE_READ' | 'MESSAGE_RECALLED';

interface MessageRealtimePayload {
  messageId: string | number;
  conversationId: string | number;
  senderId: string | number;
  senderNickName?: string;
  senderAvatarUrl?: string | null;
  type?: Message['messageType'];
  contentPreview?: string;
  sentAt?: string;
  pushType: MessagePushType;
}

/**
 * 使用消息 WebSocket
 */
export function useMessageWebSocket() {
  if (!isRealtimeEnabled()) {
    return {
      sendMessageViaWebSocket: (_message: { conversationId: string; receiverId: string; content: string }) => {},
      sendTypingStatus: (_conversationId: string, _isTyping: boolean) => {},
      markAsReadViaWebSocket: (_conversationId: string, _messageIds: string[]) => {},
      initWebSocket: () => {},
      cleanup: () => {},
    };
  }

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

    if (unsubscribeFunctions.length === 0) {
      const unsubscribeMessages = messageRealtimeClient.subscribe<MessageRealtimePayload>(
        '/user/queue/messages',
        handleMessagePush
      );
      unsubscribeFunctions.push(unsubscribeMessages);
    }

    void Promise.resolve(messageRealtimeClient.connect(authStore.accessToken))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.messages.all });
      })
      .catch(error => {
        console.error('Failed to initialize realtime messages:', error);
      });
  }

  /**
   * 处理消息推送
   */
  function handleMessagePush(data: MessageRealtimePayload) {
    console.log('Received message push:', data);

    if (data.pushType === 'MESSAGE_READ') {
      handleMessageRead(data);
      return;
    }

    if (data.pushType === 'MESSAGE_RECALLED') {
      handleMessageDeleted(data);
      return;
    }

    handleNewMessage(data);
  }

  /**
   * 处理新消息
   */
  function handleNewMessage(data: MessageRealtimePayload) {
    const message = mapMessagePayload(data);
    const messagesQueryKey = queryKeys.messages.messagesList(message.conversationId);

    queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
      if (!old) {
        return old;
      }

      if (old.items.some(item => item.id === message.id)) {
        return old;
      }

      return {
        ...old,
        items: [...old.items, message],
        total: old.total + 1,
      };
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
  }

  /**
   * 处理消息已读
   */
  function handleMessageRead(data: MessageRealtimePayload) {
    const conversationId = String(data.conversationId);
    const messageId = String(data.messageId);
    const messagesQueryKey = queryKeys.messages.messagesList(conversationId);

    queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
      if (!old) {
        return old;
      }

      return {
        ...old,
        items: old.items.map(message =>
          message.id === messageId ? { ...message, isRead: true } : message
        ),
      };
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
  }

  /**
   * 处理消息撤回
   */
  function handleMessageDeleted(data: MessageRealtimePayload) {
    const conversationId = String(data.conversationId);
    const messageId = String(data.messageId);
    const messagesQueryKey = queryKeys.messages.messagesList(conversationId);

    queryClient.setQueryData<PaginatedResponse<Message>>(messagesQueryKey, (old) => {
      if (!old) {
        return old;
      }

      return {
        ...old,
        items: old.items.filter(message => message.id !== messageId),
        total: Math.max(0, old.total - 1),
      };
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
  }

  function mapMessagePayload(data: MessageRealtimePayload): Message {
    return {
      id: String(data.messageId),
      conversationId: String(data.conversationId),
      senderId: String(data.senderId),
      receiverId: '',
      content: data.contentPreview || '',
      messageType: data.type || 'TEXT',
      isRead: false,
      sequence: 0,
      createdAt: data.sentAt || new Date().toISOString(),
    };
  }

  /**
   * 发送消息（通过 WebSocket）
   */
  function sendMessageViaWebSocket(message: {
    conversationId: string;
    receiverId: string;
    content: string;
  }) {
    void message;
  }

  /**
   * 发送正在输入状态
   */
  function sendTypingStatus(conversationId: string, isTyping: boolean) {
    void conversationId;
    void isTyping;
  }

  /**
   * 标记消息为已读（通过 WebSocket）
   */
  function markAsReadViaWebSocket(conversationId: string, messageIds: string[]) {
    const lastReadMessageId = messageIds.at(-1);
    if (!lastReadMessageId) {
      return;
    }

    messageRealtimeClient.publish('/app/read', {
      conversationId,
      lastReadMessageId,
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
    messageRealtimeClient.disconnect();
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
