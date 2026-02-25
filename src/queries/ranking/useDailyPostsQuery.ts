/**
 * 日榜文章查询 Hook
 * 获取日榜文章列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { rankingApi, type RankingQueryParams } from '@/api/ranking';
import { queryKeys } from '../query-keys';

/**
 * 获取日榜文章
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含日榜文章数据
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useDailyPostsQuery(ref({ page: 1, size: 20 }));
 * ```
 */
export function useDailyPostsQuery(params?: Ref<Omit<RankingQueryParams, 'period'>>) {
  return useQuery({
    queryKey: computed(() => queryKeys.ranking.posts.daily(params?.value)),
    queryFn: () => rankingApi.getDailyPosts(params?.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
