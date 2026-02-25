/**
 * useHotCommentsQuery Hook
 * 
 * 获取热门评论列表
 * 
 * Features:
 * - 支持获取指定文章的热门评论
 * - 支持分页
 * - 配置 2 分钟 stale time（热门评论更新较慢）
 * - 自动缓存管理
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useHotCommentsQuery('post-123', {
 *   page: 1,
 *   size: 10
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
 * 获取热门评论列表
 * 
 * @param postId - 文章 ID（支持 Ref 或普通 string）
 * @param params - 查询参数（可选）
 * @returns TanStack Query 结果
 * 
 * @remarks
 * - staleTime: 2 分钟（热门评论更新较慢）
 * - 只有当 postId 存在时才会执行查询
 * - 查询参数变化时会自动重新获取
 */
export function useHotCommentsQuery(
  postId: Ref<string> | string,
  params?: Ref<{ page?: number; size?: number }>
) {
  const id = computed(() => typeof postId === 'string' ? postId : postId.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.comments.hot(id.value)),
    queryFn: () => commentApi.getHotComments(id.value, params?.value),
    enabled: computed(() => !!id.value),
    ...CACHE_TIMES.POST_LIST, // 使用文章列表缓存配置（热门评论更新较慢）
  });
}
