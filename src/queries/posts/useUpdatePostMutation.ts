/**
 * 更新文章 Mutation Hook
 * 
 * 提供文章更新功能，成功后自动更新缓存中的文章数据
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { postApi, type PostCreateRequest } from '@/api/post';
import { queryKeys } from '../query-keys';
import type { Post } from '@/types';

/**
 * 更新文章参数接口
 */
export interface UpdatePostParams {
  postId: string;
  postData: Partial<PostCreateRequest>;
}

/**
 * 更新文章 Mutation Hook
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const updatePost = useUpdatePostMutation();
 * 
 * const handleUpdate = async () => {
 *   await updatePost.mutateAsync({
 *     postId: '123',
 *     postData: {
 *       title: '更新后的标题',
 *       content: '更新后的内容'
 *     }
 *   });
 * };
 * ```
 */
export function useUpdatePostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, postData }: UpdatePostParams) =>
      postApi.updatePost(postId, postData),
    onSuccess: (updatedPost: Post) => {
      // 更新缓存中的文章详情
      queryClient.setQueryData(
        queryKeys.posts.detail(updatedPost.id),
        updatedPost
      );
      
      // 使文章列表查询失效，确保列表中的数据也是最新的
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      
      ElMessage.success('文章更新成功');
    },
    onError: (error: any) => {
      // 错误处理由全局错误处理器处理
      console.error('更新文章失败:', error);
    },
  });
}
