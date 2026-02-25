/**
 * 更新用户信息 Mutation Hook
 * 更新用户资料并更新缓存
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { userApi, type UserUpdateRequest } from '@/api/user';
import { queryKeys } from '../query-keys';

/**
 * 更新用户信息
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: updateUser, isPending } = useUpdateUserMutation();
 * updateUser({
 *   userId: 'user-id',
 *   userData: { nickname: 'New Name', bio: 'New bio' }
 * });
 * ```
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: UserUpdateRequest }) =>
      userApi.updateUser(userId, userData),
    onSuccess: (updatedUser) => {
      // 更新缓存中的用户信息
      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        updatedUser
      );
      
      // 使相关查询失效
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      
      ElMessage.success('用户信息更新成功');
    },
  });
}
