/**
 * 热门标签查询 Hook
 * 获取热门标签列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi } from '@/api/tag';
import { queryKeys } from '../query-keys';

/**
 * 获取热门标签
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含热门标签列表
 * 
 * @example
 * ```ts
 * const { data: hotTags, isLoading } = useHotTagsQuery(ref({ limit: 10, period: 'week' }));
 * ```
 */
export function useHotTagsQuery(params?: Ref<{ limit?: number; period?: 'day' | 'week' | 'month' }>) {
  return useQuery({
    queryKey: computed(() => queryKeys.tags.hot()),
    queryFn: () => tagApi.getHotTags(params?.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
