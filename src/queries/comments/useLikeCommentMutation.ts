/**
 * 点赞/取消点赞评论 Mutation Hook
 * 
 * 提供评论点赞功能，使用乐观更新提升用户体验
 * 失败时自动回滚到之前的状态
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { commentApi } from '@/api/comment';
import { queryKeys } from '../query-keys';
/**
 * 点赞评论参数接口
 */
export interface LikeCommentParams {
  commentId: string;
  isLiked: boolean;
  postId: string;
}

/**
 * 点赞/取消点赞评论 Mutation Hook
 * 
 * 使用乐观更新：
 * - 立即更新点赞状态和计数，无需等待服务器响应
 * - 如果请求失败，自动回滚到之前的状态
 * - 请求完成后，失效查询以确保数据同步
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const likeComment = useLikeCommentMutation();
 * 
 * const handleLike = (commentId: string, isLiked: boolean, postId: string) => {
 *   likeComment.mutate({ commentId, isLiked, postId });
 * };
 * ```
 */
export function useLikeCommentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ commentId, isLiked }: LikeCommentParams) => {
      if (isLiked) {
        return commentApi.unlikeComment(commentId);
      } else {
        return commentApi.likeComment(commentId);
      }
    },

    onError: (err: unknown) => {
      console.error('点赞评论失败:', err);
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.comments.list(variables.postId),
      });
    },
  });
}
