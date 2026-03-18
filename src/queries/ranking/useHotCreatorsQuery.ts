/**
 * 热门创作者排行榜查询 Hook
 * 获取热门创作者排行榜
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { rankingApi, type RankingQueryParams } from '@/api/ranking';
import { queryKeys } from '../query-keys';

/**
 * 获取热门创作者排行榜
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含热门创作者排行榜数据
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useHotCreatorsQuery(ref({ page: 1, size: 20, period: 'monthly' }));
 * ```
 */
export function useHotCreatorsQuery(params?: Ref<RankingQueryParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.ranking.creators.hot(params?.value)),
    queryFn: () => rankingApi.getHotCreators(params?.value),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
