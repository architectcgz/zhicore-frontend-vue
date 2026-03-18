/**
 * 文章搜索查询 Hook
 * 搜索文章，支持高级搜索参数
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { searchApi, type AdvancedSearchParams } from '@/api/search';
import { queryKeys } from '../query-keys';

/**
 * 搜索文章
 * 
 * @param query 搜索关键词
 * @param params 高级搜索参数（可选）
 * @returns Query 结果，包含文章搜索结果
 * 
 * @example
 * ```ts
 * const searchQuery = ref('TypeScript');
 * const { data, isLoading } = useSearchPostsQuery(
 *   searchQuery,
 *   ref({ page: 1, size: 20, sort: 'relevance' })
 * );
 * ```
 */
export function useSearchPostsQuery(
  query: Ref<string> | string,
  params?: Ref<AdvancedSearchParams>
) {
  const searchQuery = computed(() => typeof query === 'string' ? query : query.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.search.posts(searchQuery.value, params?.value)),
    queryFn: () => searchApi.searchPosts({ query: searchQuery.value, ...params?.value }),
    enabled: computed(() => searchQuery.value.length >= 2),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
