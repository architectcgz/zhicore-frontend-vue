/**
 * 管理员用户列表查询 Hook
 * 获取用户列表（管理员视图）
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { adminApi, type PageParams } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 获取用户列表（管理员）
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含用户列表
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useAdminUsersQuery(ref({ page: 1, size: 20, keyword: 'john' }));
 * ```
 */
export function useAdminUsersQuery(params?: Ref<PageParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.admin.users.list(params?.value)),
    queryFn: () => adminApi.getUsers(params?.value || {}),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
