/**
 * 管理员最近活动查询 Hook
 * 获取最近的系统活动记录
 */

import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 获取最近活动
 * 
 * @param limit 数量限制（可选，默认 10）
 * @returns Query 结果，包含最近活动列表
 * 
 * @example
 * ```ts
 * const { data: activities, isLoading } = useAdminActivitiesQuery(20);
 * ```
 */
export function useAdminActivitiesQuery(limit?: number) {
  return useQuery({
    queryKey: computed(() => queryKeys.admin.activities(limit)),
    queryFn: () => adminApi.getRecentActivities(limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
