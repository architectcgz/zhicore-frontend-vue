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

interface UseInfinitePostsQueryOptions {
  enabled?: Ref<boolean> | boolean;
}

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
  params: Ref<Omit<PostQueryParams, 'page'>> | Omit<PostQueryParams, 'page'> = {},
  options: UseInfinitePostsQueryOptions = {},
) {
  // 将 params 转换为 computed，统一处理 Ref 和普通对象
  const queryParams = computed(() =>
    typeof params === 'object' && 'value' in params ? params.value : params
  );
  const isEnabled = computed(() =>
    typeof options.enabled === 'object' && options.enabled && 'value' in options.enabled
      ? options.enabled.value
      : options.enabled ?? true
  );

  return useInfiniteQuery<PaginatedResponse<Post>>({
    // 使用 computed 确保 queryKey 响应式更新
    queryKey: computed(() => queryKeys.posts.infiniteList(queryParams.value)),
    // 查询函数，pageParam 由 TanStack Query 管理
    queryFn: ({ pageParam = 1 }) => {
      const isLatestSort = queryParams.value.sort === 'latest';

      if (isLatestSort) {
        const cursor = typeof pageParam === 'string' ? pageParam : undefined;
        return postApi.getPosts({ ...queryParams.value, cursor });
      }

      return postApi.getPosts({ ...queryParams.value, page: pageParam as number });
    },
    // 获取下一页参数的函数
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) {
        return undefined;
      }

      if (queryParams.value.sort === 'latest') {
        return lastPage.cursor ?? undefined;
      }

      return lastPage.page + 1;
    },
    // 获取上一页参数的函数（可选，用于双向滚动）
    getPreviousPageParam: (firstPage) => {
      if (queryParams.value.sort === 'latest') {
        return undefined;
      }

      // 如果不是第一页，返回上一页页码；否则返回 undefined
      return firstPage.page > 1 ? firstPage.page - 1 : undefined;
    },
    enabled: isEnabled,
    // 使用统一的文章列表缓存配置
    ...CACHE_TIMES.POST_LIST,
    // 初始页码参数
    initialPageParam: 1,
  });
}
