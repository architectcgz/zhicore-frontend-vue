/**
 * 批量禁用/启用用户 Mutation Hook
 * 管理员批量禁用或启用用户账户
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 批量禁用/启用用户
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: batchToggleUsers, isPending } = useBatchDisableUsersMutation();
 * batchToggleUsers({ userIds: ['id1', 'id2'], disable: true });
 * ```
 */
export function useBatchDisableUsersMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userIds, disable }: { userIds: string[]; disable: boolean }) => {
      return disable ? adminApi.batchDisableUsers(userIds) : adminApi.batchEnableUsers(userIds);
    },
    onSuccess: () => {
      // 使用户列表失效
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      ElMessage.success('批量操作成功');
    },
  });
}
