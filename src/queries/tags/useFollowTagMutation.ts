/**
 * 关注/取消关注标签 Mutation Hook
 * 支持乐观更新和回滚
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { legacyTagApi } from '@/api/tag-legacy';
import { queryKeys } from '../query-keys';
import type { Tag } from '@/types';

type FollowableTag = Tag & {
  isFollowing: boolean;
  followersCount: number;
};

/**
 * 关注/取消关注标签（乐观更新）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: toggleFollow, isPending } = useFollowTagMutation();
 * toggleFollow({ tagId: 'tag-id', isFollowing: false }); // 关注
 * toggleFollow({ tagId: 'tag-id', isFollowing: true });  // 取消关注
 * ```
 */
export function useFollowTagMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tagId, isFollowing }: { tagId: string; isFollowing: boolean }) => {
      if (isFollowing) {
        return legacyTagApi.unfollowTag(tagId);
      } else {
        return legacyTagApi.followTag(tagId);
      }
    },
    onMutate: async ({ tagId, isFollowing }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tags.detail(tagId) });

      const previousTag = queryClient.getQueryData<FollowableTag>(queryKeys.tags.detail(tagId));

      // 乐观更新标签信息
      if (previousTag) {
        queryClient.setQueryData<FollowableTag>(queryKeys.tags.detail(tagId), {
          ...previousTag,
          isFollowing: !isFollowing,
          followersCount: isFollowing ? previousTag.followersCount - 1 : previousTag.followersCount + 1,
        });
      }
      
      return { previousTag };
    },
    onError: (err, { tagId }, context) => {
      // 回滚乐观更新
      if (context?.previousTag) {
        queryClient.setQueryData(queryKeys.tags.detail(tagId), context.previousTag);
      }
    },
    onSettled: (_, __, { tagId }) => {
      // 使标签信息失效以确保同步
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.detail(tagId) });
    },
  });
}
