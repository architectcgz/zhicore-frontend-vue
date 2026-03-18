/**
 * 文章搜索查询 Hook
 * 搜索文章，使用 backend-confirmed 的 keyword/page/size 参数
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { searchApi, type SearchPostsParams } from '@/api/search';
import { queryKeys } from '../query-keys';

/**
 * 搜索文章
 * 
 * @param query 搜索关键词
 * @param params 分页参数（可选）
 * @returns Query 结果，包含文章搜索结果
 * 
 * @example
 * ```ts
 * const searchQuery = ref('TypeScript');
 * const { data, isLoading } = useSearchPostsQuery(
 *   searchQuery,
 *   ref({ page: 1, size: 20 })
 * );
 * ```
 */
export function useSearchPostsQuery(
  query: Ref<string> | string,
  params?: Ref<Omit<SearchPostsParams, 'keyword'> | undefined> | Omit<SearchPostsParams, 'keyword'>
) {
  const searchQuery = computed(() => typeof query === 'string' ? query : query.value);
  const queryParams = computed(() => {
    if (!params) {
      return undefined;
    }

    return typeof params === 'object' && 'value' in params ? params.value : params;
  });

  return useQuery({
    queryKey: computed(() => queryKeys.search.posts(searchQuery.value, queryParams.value)),
    queryFn: () => searchApi.searchPosts({
      keyword: searchQuery.value,
      page: queryParams.value?.page,
      size: queryParams.value?.size,
    }),
    enabled: computed(() => searchQuery.value.trim().length >= 1),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
