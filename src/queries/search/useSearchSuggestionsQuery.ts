/**
 * 搜索建议查询 Hook
 * 获取搜索建议，支持防抖
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref, ref, watch } from 'vue';
import { searchApi } from '@/api/search';
import { queryKeys } from '../query-keys';

/**
 * 获取搜索建议（带防抖）
 * 
 * @param query 搜索关键词
 * @param type 搜索类型（可选）
 * @param debounceMs 防抖延迟（毫秒，默认 300ms）
 * @returns Query 结果，包含搜索建议
 * 
 * @example
 * ```ts
 * const searchQuery = ref('');
 * const { data: suggestions, isLoading } = useSearchSuggestionsQuery(searchQuery, ref('POST'));
 * ```
 */
export function useSearchSuggestionsQuery(
  query: Ref<string> | string,
  type?: Ref<'POST' | 'USER' | 'TAG'>,
  debounceMs: number = 300
) {
  const searchQuery = computed(() => typeof query === 'string' ? query : query.value);
  const debouncedQuery = ref(searchQuery.value);
  
  // 防抖处理
  let timeoutId: NodeJS.Timeout | null = null;
  watch(searchQuery, (newQuery) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      debouncedQuery.value = newQuery;
    }, debounceMs);
  });
  
  return useQuery({
    queryKey: computed(() => queryKeys.search.suggestions(debouncedQuery.value, type?.value)),
    queryFn: () => searchApi.getSuggestions(debouncedQuery.value, type?.value),
    enabled: computed(() => debouncedQuery.value.length >= 1),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
