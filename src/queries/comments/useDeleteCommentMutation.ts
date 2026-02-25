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
import type { Comment, PaginatedResponse } from '@/types';

/**
 * 删除评论参数接口
 */
export interface DeleteCommentParams {
  commentId: string;
  postId: string; // 用于失效相关查询
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
    mutationFn: ({ commentId }: DeleteCommentParams) => commentApi.deleteComment(commentId),
    
    // 乐观更新：在请求发送前立即更新 UI
    onMutate: async ({ commentId }: DeleteCommentParams) => {
      // 找到包含该评论的所有查询并乐观更新
      const queries = queryClient.getQueriesData<PaginatedResponse<Comment>>({
        queryKey: queryKeys.comments.lists(),
      });
      
      const previousData: Array<{ queryKey: any; data: any }> = [];
      
      queries.forEach(([queryKey, data]) => {
        if (data) {
          previousData.push({ queryKey, data });
          
          // 从列表中移除评论
          const updatedItems = data.items.filter(c => c.id !== commentId);
          queryClient.setQueryData(queryKey, {
            ...data,
            items: updatedItems,
            total: data.total - 1,
          });
        }
      });
      
      // 返回上下文对象，包含之前的数据用于回滚
      return { previousData };
    },
    
    // 错误处理：回滚乐观更新
    onError: (err: any, _variables: DeleteCommentParams, context: any) => {
      // 如果请求失败，恢复之前的数据
      context?.previousData.forEach(({ queryKey, data }: { queryKey: any; data: any }) => {
        queryClient.setQueryData(queryKey, data);
      });
      
      console.error('删除评论失败:', err);
    },
    
    // 成功后失效查询以确保数据同步
    onSuccess: () => {
      // 使所有评论查询失效
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      
      ElMessage.success('评论删除成功');
    },
  });
}
