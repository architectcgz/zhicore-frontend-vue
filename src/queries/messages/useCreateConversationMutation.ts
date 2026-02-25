/**
 * 创建会话 Mutation Hook
 * 
 * 创建或获取与指定用户的会话，成功后自动失效会话列表缓存
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { messageApi } from '@/api/message';
import { queryKeys } from '../query-keys';
import type { Conversation } from '@/types';

/**
 * 创建或获取会话 Mutation Hook
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isPending 等属性
 * 
 * @example
 * ```ts
 * const { mutate: createConversation, isPending } = useCreateConversationMutation();
 * 
 * createConversation('user-id', {
 *   onSuccess: (conversation) => {
 *     router.push(`/messages?conversation=${conversation.id}`);
 *   }
 * });
 * ```
 */
export function useCreateConversationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => messageApi.getOrCreateConversation(userId),
    onSuccess: (newConversation: Conversation) => {
      // 使所有会话列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: queryKeys.messages.conversations() });
      
      // 可选：将新创建的会话添加到缓存中
      queryClient.setQueryData(
        queryKeys.messages.conversation(newConversation.id), 
        newConversation
      );
      
      ElMessage.success('会话创建成功');
    },
    onError: (error: any) => {
      // 错误处理
      console.error('创建会话失败:', error);
      ElMessage.error('创建会话失败，请稍后重试');
    },
  });
}
