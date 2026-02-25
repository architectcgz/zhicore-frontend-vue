/**
 * 全局搜索查询 Hook
 * 执行全局搜索，返回文章、用户、标签等综合结果
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { searchApi, type SearchRequest } from '@/api/search';
import { queryKeys } from '../query-keys';

/**
 * 全局搜索
 * 
 * @param query 搜索关键词
 * @param params 搜索参数（可选）
 * @returns Query 结果，包含综合搜索结果
 * 
 * @example
 * ```ts
 * const searchQuery = ref('Vue.js');
 * const { data, isLoading } = useSearchQuery(searchQuery, ref({ page: 1, size: 20 }));
 * ```
 */
export function useSearchQuery(
  query: Ref<string> | string,
  params?: Ref<SearchRequest>
) {
  const searchQuery = computed(() => typeof query === 'string' ? query : query.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.search.global(searchQuery.value, params?.value)),
    queryFn: () => searchApi.search({ query: searchQuery.value, ...params?.value }),
    enabled: computed(() => searchQuery.value.length >= 2), // 只在查询长度 >= 2 时搜索
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
