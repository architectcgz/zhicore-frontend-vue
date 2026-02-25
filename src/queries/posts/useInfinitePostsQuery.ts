/**
 * useInfinitePostsQuery Hook
 *
 * 用于无限滚动文章列表的 Infinite Query Hook。
 * 自动处理分页逻辑，配置 getNextPageParam。
 *
 * @module queries/posts/useInfinitePostsQuery
 */

import { computed } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { postApi } from '@/api/post';
import type { PostQueryParams } from '@/api/post';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';
import type { PaginatedResponse, Post } from '@/types';

/**
 * 获取无限滚动文章列表
 *
 * @param params - 查询参数（不包含 page，由 TanStack Query 自动管理）
 * @returns Infinite Query 结果，包含 data.pages, hasNextPage, fetchNextPage 等
 *
 * @example
 * ```typescript
 * // 使用普通对象
 * const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfinitePostsQuery({
 *   size: 10,
 *   sort: 'latest'
 * });
 *
 * // 使用 Ref
 * const params = ref({ size: 10, sort: 'latest' });
 * const { data, hasNextPage, fetchNextPage } = useInfinitePostsQuery(params);
 *
 * // 加载下一页
 * if (hasNextPage.value) {
 *   await fetchNextPage();
 * }
 * ```
 *
 * **Validates: Requirements 3.3**
 */
export function useInfinitePostsQuery(
  params: Ref<Omit<PostQueryParams, 'page'>> | Omit<PostQueryParams, 'page'> = {}
) {
  // 将 params 转换为 computed，统一处理 Ref 和普通对象
  const queryParams = computed(() =>
    typeof params === 'object' && 'value' in params ? params.value : params
  );

  return useInfiniteQuery<PaginatedResponse<Post>>({
    // 使用 computed 确保 queryKey 响应式更新
    queryKey: computed(() => queryKeys.posts.list(queryParams.value)),
    // 查询函数，pageParam 由 TanStack Query 管理
    queryFn: ({ pageParam = 1 }) =>
      postApi.getPosts({ ...queryParams.value, page: pageParam as number }),
    // 获取下一页参数的函数
    getNextPageParam: (lastPage) => {
      // 如果还有更多数据，返回下一页页码；否则返回 undefined
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    // 获取上一页参数的函数（可选，用于双向滚动）
    getPreviousPageParam: (firstPage) => {
      // 如果不是第一页，返回上一页页码；否则返回 undefined
      return firstPage.page > 1 ? firstPage.page - 1 : undefined;
    },
    // 使用统一的文章列表缓存配置
    ...CACHE_TIMES.POST_LIST,
    // 初始页码参数
    initialPageParam: 1,
  });
}
