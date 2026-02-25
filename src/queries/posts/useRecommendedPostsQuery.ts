/**
 * useRecommendedPostsQuery Hook
 *
 * 用于获取推荐文章列表的 Query Hook。
 * 配置 10 分钟的 staleTime（推荐算法更新频率较低）。
 *
 * @module queries/posts/useRecommendedPostsQuery
 */

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { postApi } from '@/api/post';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';
import type { PaginatedResponse, Post } from '@/types';

/**
 * 推荐文章查询参数
 */
export interface RecommendedPostsParams {
  page?: number;
  size?: number;
}

/**
 * 获取推荐文章列表
 *
 * @param params - 查询参数（可选）
 * @returns Query 结果，包含推荐文章数据和状态
 *
 * @example
 * ```typescript
 * // 使用默认参数
 * const { data: recommendedPosts, isLoading } = useRecommendedPostsQuery();
 *
 * // 使用自定义参数
 * const { data: recommendedPosts } = useRecommendedPostsQuery({ page: 1, size: 20 });
 *
 * // 使用 Ref
 * const params = ref({ page: 1, size: 10 });
 * const { data: recommendedPosts } = useRecommendedPostsQuery(params);
 * ```
 *
 * **Validates: Requirements 3.5**
 */
export function useRecommendedPostsQuery(params?: Ref<RecommendedPostsParams> | RecommendedPostsParams) {
  // 将 params 转换为 computed，统一处理 Ref 和普通对象
  const queryParams = computed(() => {
    if (!params) return undefined;
    return typeof params === 'object' && 'value' in params ? params.value : params;
  });

  return useQuery<PaginatedResponse<Post>>({
    // 使用固定的 recommended key
    queryKey: queryKeys.posts.recommended(),
    // 查询函数
    queryFn: () => postApi.getRecommendedPosts(queryParams.value),
    // 使用统一的标签信息缓存配置（推荐算法更新频率较低）
    ...CACHE_TIMES.TAG_INFO,
  });
}
