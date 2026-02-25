/**
 * useCommentsQuery Hook
 * 
 * 获取评论列表（分页）
 * 
 * Features:
 * - 支持按文章 ID 查询评论
 * - 支持分页和排序
 * - 配置 1 分钟 stale time
 * - 自动缓存管理
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useCommentsQuery('post-123', {
 *   page: 1,
 *   size: 20,
 *   sort: 'latest'
 * });
 * ```
 */

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { commentApi } from '@/api/comment';
import type { CommentQueryParams } from '@/api/comment';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';

/**
 * 获取评论列表（分页）
 * 
 * @param postId - 文章 ID（支持 Ref 或普通 string）
 * @param params - 查询参数（可选）
 * @returns TanStack Query 结果
 * 
 * @remarks
 * - staleTime: 1 分钟
 * - 只有当 postId 存在时才会执行查询
 * - 查询参数变化时会自动重新获取
 */
export function useCommentsQuery(
  postId: Ref<string> | string,
  params?: Ref<Omit<CommentQueryParams, 'postId'>>
) {
  const id = computed(() => typeof postId === 'string' ? postId : postId.value);
  const queryParams = computed(() => params?.value || {});
  
  return useQuery({
    queryKey: computed(() => queryKeys.comments.list(id.value, queryParams.value)),
    queryFn: () => commentApi.getCommentsByPostId(id.value, queryParams.value),
    enabled: computed(() => !!id.value),
    ...CACHE_TIMES.COMMENT_LIST, // 使用统一的评论列表缓存配置
  });
}
