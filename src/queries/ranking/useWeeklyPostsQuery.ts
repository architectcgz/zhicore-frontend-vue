/**
 * 周榜文章查询 Hook
 * 获取周榜文章列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import type { RankingQueryParams } from '@/api/ranking';
import { legacyRankingApi } from '@/api/ranking-legacy';
import { queryKeys } from '../query-keys';

/**
 * 获取周榜文章
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含周榜文章数据
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useWeeklyPostsQuery(ref({ page: 1, size: 20 }));
 * ```
 */
export function useWeeklyPostsQuery(params?: Ref<Omit<RankingQueryParams, 'period'>>) {
  return useQuery({
    queryKey: computed(() => queryKeys.ranking.posts.weekly(params?.value)),
    queryFn: () => legacyRankingApi.getWeeklyPosts(params?.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
