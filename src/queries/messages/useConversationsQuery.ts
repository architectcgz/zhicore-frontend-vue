/**
 * 会话列表查询 Hook
 * 获取会话列表，支持实时轮询
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { messageApi, type ConversationQueryParams } from '@/api/message';
import { queryKeys } from '../query-keys';

/**
 * 获取会话列表
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含会话列表数据
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useConversationsQuery(ref({ page: 1, size: 20 }));
 * ```
 */
export function useConversationsQuery(params?: Ref<ConversationQueryParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.messages.conversationsList(params?.value)),
    queryFn: () => messageApi.getConversations(params?.value),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10 * 1000, // Poll every 10 seconds for real-time
  });
}
