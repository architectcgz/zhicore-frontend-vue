/**
 * 更新评论 Mutation Hook
 * 
 * 提供评论更新功能，使用乐观更新提升用户体验
 * 失败时自动回滚到之前的状态
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { commentApi, type CommentUpdateRequest } from '@/api/comment';
import { queryKeys } from '../query-keys';
import type { Comment, PaginatedResponse } from '@/types';

/**
 * 更新评论参数接口
 */
export interface UpdateCommentParams {
  commentId: string;
  commentData: CommentUpdateRequest;
  postId: string; // 用于失效相关查询
}

/**
 * 更新评论 Mutation Hook
 * 
 * 使用乐观更新：
 * - 立即更新评论内容，无需等待服务器响应
 * - 如果请求失败，自动回滚到之前的状态
 * - 请求成功后，失效查询以确保数据同步
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const updateComment = useUpdateCommentMutation();
 * 
 * const handleUpdate = async () => {
 *   await updateComment.mutateAsync({
 *     commentId: '123',
 *     commentData: { content: '更新后的内容' },
 *     postId: '456'
 *   });
 * };
 * ```
 */
export function useUpdateCommentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, commentData }: UpdateCommentParams) => 
      commentApi.updateComment(commentId, commentData),
    
    // 乐观更新：在请求发送前立即更新 UI
    onMutate: async ({ commentId, commentData, postId }: UpdateCommentParams) => {
      // 找到包含该评论的所有查询并乐观更新
      const queries = queryClient.getQueriesData<PaginatedResponse<Comment>>({
        queryKey: queryKeys.comments.lists(),
      });
      
      const previousData: Array<{ queryKey: any; data: any }> = [];
      
      queries.forEach(([queryKey, data]) => {
        if (data) {
          previousData.push({ queryKey, data });
          
          // 更新评论内容
          const updatedItems = data.items.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                content: commentData.content,
                updatedAt: new Date().toISOString(),
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
    onError: (err: any, variables: UpdateCommentParams, context: any) => {
      // 如果请求失败，恢复之前的数据
      context?.previousData.forEach(({ queryKey, data }: { queryKey: any; data: any }) => {
        queryClient.setQueryData(queryKey, data);
      });
      
      console.error('更新评论失败:', err);
    },
    
    // 成功后失效查询以确保数据同步
    onSuccess: (updatedComment: Comment, { postId }: UpdateCommentParams) => {
      // 使评论列表失效
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.list(postId) 
      });
      
      ElMessage.success('评论更新成功');
    },
  });
}
