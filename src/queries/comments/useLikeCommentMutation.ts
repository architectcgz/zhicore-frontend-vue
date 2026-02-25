/**
 * 点赞/取消点赞评论 Mutation Hook
 * 
 * 提供评论点赞功能，使用乐观更新提升用户体验
 * 失败时自动回滚到之前的状态
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { commentApi } from '@/api/comment';
import { queryKeys } from '../query-keys';
import type { Comment, PaginatedResponse } from '@/types';

/**
 * 点赞评论参数接口
 */
export interface LikeCommentParams {
  commentId: string;
  isLiked: boolean;
  postId: string; // 用于失效相关查询
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
    
    // 乐观更新：在请求发送前立即更新 UI
    onMutate: async ({ commentId, isLiked }: LikeCommentParams) => {
      // 找到包含该评论的所有查询并乐观更新
      const queries = queryClient.getQueriesData<PaginatedResponse<Comment>>({
        queryKey: queryKeys.comments.lists(),
      });
      
      const previousData: Array<{ queryKey: any; data: any }> = [];
      
      queries.forEach(([queryKey, data]) => {
        if (data) {
          previousData.push({ queryKey, data });
          
          // 更新评论的点赞状态
          const updatedItems = data.items.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                isLiked: !isLiked,
                likeCount: isLiked ? comment.likeCount - 1 : comment.likeCount + 1,
              };
            }
            return comment;
          });
          
          queryClient.setQueryData(queryKey, {
            ...data,
            items: updatedItems,
          });
        }
      });
      
      // 返回上下文对象，包含之前的数据用于回滚
      return { previousData };
    },
    
    // 错误处理：回滚乐观更新
    onError: (err: any, _variables: LikeCommentParams, context: any) => {
      // 如果请求失败，恢复之前的数据
      context?.previousData.forEach(({ queryKey, data }: { queryKey: any; data: any }) => {
        queryClient.setQueryData(queryKey, data);
      });
      
      console.error('点赞评论失败:', err);
    },
    
    // 无论成功还是失败，都失效查询以确保数据同步
    onSettled: () => {
      // 使所有评论查询失效以确保同步
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
}
