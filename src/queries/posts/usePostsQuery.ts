/**
 * usePostsQuery Hook
 *
 * 用于获取分页文章列表的 Query Hook。
 * 配置 2 分钟的 staleTime。
 *
 * @module queries/posts/usePostsQuery
 */

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { postApi } from '@/api/post';
import type { PostQueryParams } from '@/api/post';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';
import type { PaginatedResponse, Post } from '@/types';

/**
 * 获取分页文章列表
 *
 * @param params - 查询参数（支持 Ref 或普通对象）
 * @returns Query 结果，包含分页数据和状态
 *
 * @example
 * ```typescript
 * // 使用普通对象
 * const { data, isLoading } = usePostsQuery({ page: 1, size: 10, sort: 'latest' });
 *
 * // 使用 Ref
 * const params = ref({ page: 1, size: 10, sort: 'latest' });
 * const { data, isLoading } = usePostsQuery(params);
 * ```
 *
 * **Validates: Requirements 3.2, 3.8**
 */
export function usePostsQuery(params: Ref<PostQueryParams> | PostQueryParams = {}) {
  // 将 params 转换为 computed，统一处理 Ref 和普通对象
  const queryParams = computed(() =>
    typeof params === 'object' && 'value' in params ? params.value : params
  );

  return useQuery<PaginatedResponse<Post>>({
    // 使用 computed 确保 queryKey 响应式更新
    queryKey: computed(() => queryKeys.posts.list(queryParams.value)),
    // 查询函数
    queryFn: () => postApi.getPosts(queryParams.value),
    // 使用统一的文章列表缓存配置
    ...CACHE_TIMES.POST_LIST,
  });
}
