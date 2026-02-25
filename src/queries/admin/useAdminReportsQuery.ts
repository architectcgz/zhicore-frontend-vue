/**
 * 管理员举报列表查询 Hook
 * 获取举报列表（管理员视图）
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { adminApi, type PageParams } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 获取举报列表（管理员）
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含举报列表
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useAdminReportsQuery(ref({ page: 1, size: 20, status: 'PENDING' }));
 * ```
 */
export function useAdminReportsQuery(params?: Ref<PageParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.admin.reports.list(params?.value)),
    queryFn: () => adminApi.getReports(params?.value || {}),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
