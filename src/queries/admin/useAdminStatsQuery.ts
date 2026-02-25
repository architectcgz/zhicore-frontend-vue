/**
 * 管理员统计数据查询 Hook
 * 获取管理后台的统计数据
 */

import { useQuery } from '@tanstack/vue-query';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 获取管理员统计数据
 * 
 * @returns Query 结果，包含统计数据
 * 
 * @example
 * ```ts
 * const { data: stats, isLoading } = useAdminStatsQuery();
 * ```
 */
export function useAdminStatsQuery() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () => adminApi.getStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
