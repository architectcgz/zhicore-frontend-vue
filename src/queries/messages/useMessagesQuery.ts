/**
 * 消息列表查询 Hook
 * 获取指定会话的消息列表，支持实时轮询
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { messageApi, type MessageQueryParams } from '@/api/message';
import { queryKeys } from '../query-keys';

/**
 * 获取消息列表
 * 
 * @param conversationId 会话 ID
 * @param params 查询参数（可选）
 * @returns Query 结果，包含消息列表数据
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useMessagesQuery(
 *   ref('conversation-id'),
 *   ref({ page: 1, size: 50 })
 * );
 * ```
 */
export function useMessagesQuery(
  conversationId: Ref<string> | string,
  params?: Ref<Omit<MessageQueryParams, 'conversationId'>>
) {
  const id = computed(() => typeof conversationId === 'string' ? conversationId : conversationId.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.messages.messagesList(id.value, params?.value)),
    queryFn: () => messageApi.getMessagesByConversationId(id.value, params?.value),
    enabled: computed(() => !!id.value),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 5 * 1000, // Poll every 5 seconds for real-time chat
  });
}
