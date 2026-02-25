/**
 * useCommentRepliesQuery Hook
 * 
 * 获取评论的回复列表
 * 
 * Features:
 * - 支持获取指定评论的回复
 * - 支持分页和排序
 * - 配置 1 分钟 stale time
 * - 自动缓存管理
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useCommentRepliesQuery('comment-123', {
 *   page: 1,
 *   size: 10,
 *   sort: 'latest'
 * });
 * ```
 */

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { commentApi } from '@/api/comment';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';

/**
 * 获取评论回复列表
 * 
 * @param commentId - 评论 ID（支持 Ref 或普通 string）
 * @param params - 查询参数（可选）
 * @returns TanStack Query 结果
 * 
 * @remarks
 * - staleTime: 1 分钟
 * - 只有当 commentId 存在时才会执行查询
 * - 查询参数变化时会自动重新获取
 */
export function useCommentRepliesQuery(
  commentId: Ref<string> | string,
  params?: Ref<{ page?: number; size?: number; sort?: 'latest' | 'oldest' }>
) {
  const id = computed(() => typeof commentId === 'string' ? commentId : commentId.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.comments.replies(id.value)),
    queryFn: () => commentApi.getCommentReplies(id.value, params?.value),
    enabled: computed(() => !!id.value),
    ...CACHE_TIMES.COMMENT_LIST, // 使用统一的评论列表缓存配置
  });
}
