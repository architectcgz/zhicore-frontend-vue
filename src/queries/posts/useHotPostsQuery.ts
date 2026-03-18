/**
 * useHotPostsQuery Hook
 *
 * 用于获取热门文章列表的 Query Hook。
 * 配置 5 分钟的 staleTime。
 *
 * @module queries/posts/useHotPostsQuery
 */

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { rankingApi } from '@/api/ranking';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';
import type { PaginatedResponse, Post } from '@/types';

/**
 * 热门文章查询参数
 */
export interface HotPostsParams {
  page?: number;
  size?: number;
}

/**
 * 获取热门文章列表
 *
 * @param params - 查询参数（可选）
 * @returns Query 结果，包含热门文章数据和状态
 *
 * @example
 * ```typescript
 * // 使用默认参数
 * const { data: hotPosts, isLoading } = useHotPostsQuery();
 *
 * // 使用自定义参数
 * const { data: hotPosts } = useHotPostsQuery({ page: 1, size: 20 });
 *
 * // 使用 Ref
 * const params = ref({ page: 1, size: 10 });
 * const { data: hotPosts } = useHotPostsQuery(params);
 * ```
 *
 * **Validates: Requirements 3.4**
 */
export function useHotPostsQuery(params?: Ref<HotPostsParams> | HotPostsParams) {
  // 将 params 转换为 computed,统一处理 Ref 和普通对象
  const queryParams = computed(() => {
    if (!params) return undefined;
    return typeof params === 'object' && 'value' in params ? params.value : params;
  });

  return useQuery<PaginatedResponse<Post>>({
    queryKey: computed(() => queryKeys.posts.hot(queryParams.value)),
    queryFn: async () => {
      const page = queryParams.value?.page ?? 0;
      const size = queryParams.value?.size || 20;

      const posts = await rankingApi.getHotPostDetails({ page, size });

      return {
        items: posts,
        total: posts.length,
        page,
        size,
        hasMore: posts.length >= size,
      };
    },
    // 使用统一的文章内容缓存配置（热门文章更新频率较低）
    ...CACHE_TIMES.POST_CONTENT,
  });
}

