/**
 * 关注/取消关注用户 Mutation Hook
 * 支持乐观更新和回滚
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { userApi } from '@/api/user';
import { queryKeys } from '../query-keys';
import type { User } from '@/types';

/**
 * 关注/取消关注用户（乐观更新）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: toggleFollow, isPending } = useFollowUserMutation();
 * toggleFollow({ userId: 'user-id', isFollowing: false }); // 关注
 * toggleFollow({ userId: 'user-id', isFollowing: true });  // 取消关注
 * ```
 */
export function useFollowUserMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (isFollowing) {
        return userApi.unfollowUser(userId);
      } else {
        return userApi.followUser(userId);
      }
    },
    onMutate: async ({ userId, isFollowing }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });
      
      const previousUser = queryClient.getQueryData<User>(queryKeys.users.detail(userId));
      
      // 乐观更新用户信息
      if (previousUser) {
        queryClient.setQueryData<User>(queryKeys.users.detail(userId), {
          ...previousUser,
          isFollowing: !isFollowing,
          followersCount: isFollowing ? previousUser.followersCount - 1 : previousUser.followersCount + 1,
        });
      }
      
      return { previousUser };
    },
    onError: (_err, { userId }, context) => {
      // 回滚乐观更新
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(userId), context.previousUser);
      }
    },
    onSettled: (_, __, { userId }) => {
      // 使用户信息失效以确保同步
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
    },
  });
}
