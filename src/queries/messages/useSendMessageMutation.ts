/**
 * 发送消息 Mutation Hook
 * 发送消息，支持乐观更新和回滚
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { messageApi, type MessageSendRequest } from '@/api/message';
import { queryKeys } from '../query-keys';
import type { Message, PaginatedResponse } from '@/types';

/**
 * 发送消息（乐观更新）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: sendMessage, isPending } = useSendMessageMutation();
 * sendMessage({
 *   receiverId: 'user-id',
 *   content: 'Hello!',
 *   conversationId: 'conversation-id'
 * });
 * ```
 */
export function useSendMessageMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageData: MessageSendRequest) => messageApi.sendMessage(messageData),
    onMutate: async (messageData) => {
      const conversationId = messageData.conversationId;
      if (!conversationId) return;
      
      const queryKey = queryKeys.messages.messagesList(conversationId);
      await queryClient.cancelQueries({ queryKey });
      
      const previousMessages = queryClient.getQueryData<PaginatedResponse<Message>>(queryKey);
      
      // 乐观添加消息
      if (previousMessages) {
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          content: messageData.content,
          conversationId,
          senderId: 'current-user-id', // 从 auth store 获取
          receiverId: messageData.receiverId,
          messageType: messageData.messageType || 'TEXT',
          isRead: false,
          createdAt: new Date().toISOString(),
        } as Message;
        
        queryClient.setQueryData<PaginatedResponse<Message>>(queryKey, {
          ...previousMessages,
          items: [...previousMessages.items, tempMessage],
        });
      }
      
      return { previousMessages };
    },
    onError: (err, messageData, context) => {
      // 回滚乐观更新
      if (context?.previousMessages && messageData.conversationId) {
        queryClient.setQueryData(
          queryKeys.messages.messagesList(messageData.conversationId),
          context.previousMessages
        );
      }
    },
    onSuccess: (_, messageData) => {
      // 使消息列表和会话列表失效
      if (messageData.conversationId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.messages.messagesList(messageData.conversationId) 
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
    },
  });
}
