/**
 * 删除文章 Mutation Hook
 * 
 * 提供文章删除功能，成功后自动从缓存中移除文章并失效相关查询
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { postApi } from '@/api/post';
import { queryKeys } from '../query-keys';

/**
 * 删除文章 Mutation Hook
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const deletePost = useDeletePostMutation();
 * 
 * const handleDelete = async (postId: string) => {
 *   await deletePost.mutateAsync(postId);
 * };
 * ```
 */
export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => postApi.deletePost(postId),
    onSuccess: (_, postId: string) => {
      // 从缓存中移除文章详情
      queryClient.removeQueries({ queryKey: queryKeys.posts.detail(postId) });
      
      // 使文章列表查询失效，确保列表中不再显示已删除的文章
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      
      // 同时失效热门文章、推荐文章等相关查询
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.hot() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.recommended() });
      
      ElMessage.success('文章删除成功');
    },
    onError: (error: any) => {
      // 错误处理由全局错误处理器处理
      console.error('删除文章失败:', error);
    },
  });
}
