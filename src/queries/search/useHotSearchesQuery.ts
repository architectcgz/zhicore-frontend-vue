/**
 * 热门搜索查询 Hook
 * 获取热门搜索关键词列表
 */

import { useQuery } from '@tanstack/vue-query';
import { searchApi } from '@/api/search';
import { queryKeys } from '../query-keys';

/**
 * 获取热门搜索
 * 
 * @param limit 数量限制（可选，默认 10）
 * @returns Query 结果，包含热门搜索列表
 * 
 * @example
 * ```ts
 * const { data: hotSearches, isLoading } = useHotSearchesQuery(20);
 * ```
 */
export function useHotSearchesQuery(limit?: number) {
  return useQuery({
    queryKey: queryKeys.search.hot(),
    queryFn: () => searchApi.getHotSearches(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
