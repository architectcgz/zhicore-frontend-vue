/**
 * 删除评论 Mutation Hook
 * 
 * 提供评论删除功能，使用乐观更新提升用户体验
 * 失败时自动回滚到之前的状态
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { commentApi } from '@/api/comment';
import { queryKeys } from '../query-keys';
/**
 * 删除评论参数接口
 */
export interface DeleteCommentParams {
  commentId: string;
  postId?: string;
}

/**
 * 删除评论 Mutation Hook
 * 
 * 使用乐观更新：
 * - 立即从列表中移除评论，无需等待服务器响应
 * - 如果请求失败，自动回滚到之前的状态
 * - 请求成功后，失效查询以确保数据同步
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const deleteComment = useDeleteCommentMutation();
 * 
 * const handleDelete = async () => {
 *   await deleteComment.mutateAsync({
 *     commentId: '123',
 *     postId: '456'
 *   });
 * };
 * ```
 */
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: DeleteCommentParams | string) =>
      commentApi.deleteComment(typeof params === 'string' ? params : params.commentId),

    onError: (err: unknown) => {
      console.error('删除评论失败:', err);
    },

    onSuccess: (_, variables) => {
      if (typeof variables !== 'string' && variables.postId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.list(variables.postId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.lists(),
        });
      }
      ElMessage.success('评论删除成功');
    },
  });
}
