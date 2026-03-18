/**
 * 热门文章排行榜查询 Hook
 * 获取热门文章排行榜
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { rankingApi, type RankingQueryParams } from '@/api/ranking';
import { queryKeys } from '../query-keys';

/**
 * 获取热门文章排行榜
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含热门文章排行榜数据
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useHotPostsRankingQuery(ref({ page: 1, size: 20, period: 'weekly' }));
 * ```
 */
export function useHotPostsRankingQuery(params?: Ref<RankingQueryParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.ranking.posts.hot(params?.value)),
    queryFn: () => rankingApi.getHotPosts(params?.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
