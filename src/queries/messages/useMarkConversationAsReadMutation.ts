/**
 * 标记会话为已读 Mutation Hook
 * 标记会话中的所有消息为已读，并更新缓存
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { messageApi } from '@/api/message';
import { queryKeys } from '../query-keys';

/**
 * 标记会话为已读
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: markAsRead, isPending } = useMarkConversationAsReadMutation();
 * markAsRead('conversation-id');
 * ```
 */
export function useMarkConversationAsReadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (conversationId: string) => messageApi.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      // 使消息列表和会话列表失效
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.messages.messagesList(conversationId) 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.unreadCount() });
    },
  });
}
