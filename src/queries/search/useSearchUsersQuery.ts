/**
 * 用户搜索查询 Hook
 * 搜索用户
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { searchApi, type AdvancedSearchParams } from '@/api/search';
import { queryKeys } from '../query-keys';

/**
 * 搜索用户
 * 
 * @param query 搜索关键词
 * @param params 搜索参数（可选）
 * @returns Query 结果，包含用户搜索结果
 * 
 * @example
 * ```ts
 * const searchQuery = ref('John');
 * const { data, isLoading } = useSearchUsersQuery(
 *   searchQuery,
 *   ref({ page: 1, size: 20 })
 * );
 * ```
 */
export function useSearchUsersQuery(
  query: Ref<string> | string,
  params?: Ref<AdvancedSearchParams>
) {
  const searchQuery = computed(() => typeof query === 'string' ? query : query.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.search.users(searchQuery.value, params?.value)),
    queryFn: () => searchApi.searchUsers({ query: searchQuery.value, ...params?.value }),
    enabled: computed(() => searchQuery.value.length >= 2),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
