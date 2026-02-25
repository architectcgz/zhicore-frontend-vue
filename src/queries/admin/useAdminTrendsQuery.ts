/**
 * 管理员访问趋势查询 Hook
 * 获取访问趋势数据
 */

import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 获取访问趋势数据
 * 
 * @param days 天数（可选，默认 7 天）
 * @returns Query 结果，包含趋势数据
 * 
 * @example
 * ```ts
 * const { data: trends, isLoading } = useAdminTrendsQuery(30);
 * ```
 */
export function useAdminTrendsQuery(days?: number) {
  return useQuery({
    queryKey: computed(() => queryKeys.admin.trends(days)),
    queryFn: () => adminApi.getTrends(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
