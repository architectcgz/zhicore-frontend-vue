/**
 * 月榜文章查询 Hook
 * 获取月榜文章列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { rankingApi, type RankingQueryParams } from '@/api/ranking';
import { queryKeys } from '../query-keys';

/**
 * 获取月榜文章
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含月榜文章数据
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useMonthlyPostsQuery(ref({ page: 1, size: 20 }));
 * ```
 */
export function useMonthlyPostsQuery(params?: Ref<Omit<RankingQueryParams, 'period'>>) {
  return useQuery({
    queryKey: computed(() => queryKeys.ranking.posts.monthly(params?.value)),
    queryFn: () => rankingApi.getMonthlyPosts(params?.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
