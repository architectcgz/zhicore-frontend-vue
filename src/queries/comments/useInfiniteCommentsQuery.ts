/**
 * useInfiniteCommentsQuery Hook
 * 
 * 获取评论列表（无限滚动）
 * 
 * Features:
 * - 支持无限滚动加载更多评论
 * - 自动管理分页状态
 * - 配置 1 分钟 stale time
 * - 自动缓存管理
 * 
 * @example
 * ```ts
 * const { 
 *   data, 
 *   fetchNextPage, 
 *   hasNextPage, 
 *   isFetchingNextPage 
 * } = useInfiniteCommentsQuery('post-123', {
 *   size: 20,
 *   sort: 'latest'
 * });
 * ```
 */

import { computed } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { commentApi } from '@/api/comment';
import type { CommentQueryParams } from '@/api/comment';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';
import type { PaginatedResponse, Comment } from '@/types';

/**
 * 获取评论列表（无限滚动）
 * 
 * @param postId - 文章 ID（支持 Ref 或普通 string）
 * @param params - 查询参数（可选，不包含 page）
 * @returns TanStack Query 无限查询结果
 * 
 * @remarks
 * - staleTime: 1 分钟
 * - 只有当 postId 存在时才会执行查询
 * - 自动处理分页逻辑
 * - 使用 hasMore 字段判断是否有下一页
 */
export function useInfiniteCommentsQuery(
  postId: Ref<string> | string,
  params?: Ref<Omit<CommentQueryParams, 'postId' | 'page'>>
) {
  const id = computed(() => typeof postId === 'string' ? postId : postId.value);
  const queryParams = computed(() => params?.value || {});
  
  return useInfiniteQuery<PaginatedResponse<Comment>>({
    queryKey: computed(() => queryKeys.comments.list(id.value, queryParams.value)),
    queryFn: ({ pageParam = 1 }) =>
      commentApi.getCommentsByPostId(id.value, { ...queryParams.value, page: pageParam as number }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage.page > 1 ? firstPage.page - 1 : undefined,
    enabled: computed(() => !!id.value),
    ...CACHE_TIMES.COMMENT_LIST, // 使用统一的评论列表缓存配置
    initialPageParam: 1,
  });
}
