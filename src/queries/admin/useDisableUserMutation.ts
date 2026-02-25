/**
 * 禁用/启用用户 Mutation Hook
 * 管理员禁用或启用用户账户
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 禁用/启用用户
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: toggleUserStatus, isPending } = useDisableUserMutation();
 * toggleUserStatus({ userId: 'user-id', disable: true });  // 禁用
 * toggleUserStatus({ userId: 'user-id', disable: false }); // 启用
 * ```
 */
export function useDisableUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, disable }: { userId: string; disable: boolean }) => {
      return disable ? adminApi.disableUser(userId) : adminApi.enableUser(userId);
    },
    onSuccess: () => {
      // 使用户列表失效
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all() });
      ElMessage.success('操作成功');
    },
  });
}
