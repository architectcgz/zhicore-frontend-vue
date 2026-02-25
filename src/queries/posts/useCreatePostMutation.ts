/**
 * 创建文章 Mutation Hook
 * 
 * 提供文章创建功能，成功后自动失效文章列表查询
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { postApi, type PostCreateRequest } from '@/api/post';
import { queryKeys } from '../query-keys';
import type { Post } from '@/types';

/**
 * 创建文章 Mutation Hook
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const createPost = useCreatePostMutation();
 * 
 * const handleCreate = async () => {
 *   await createPost.mutateAsync({
 *     title: '文章标题',
 *     content: '文章内容',
 *     tags: ['tag1', 'tag2'],
 *     status: 'PUBLISHED'
 *   });
 * };
 * ```
 */
export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postData: PostCreateRequest) => postApi.createPost(postData),
    onSuccess: (newPost: Post) => {
      // 使所有文章列表查询失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      
      // 可选：将新创建的文章添加到缓存中
      queryClient.setQueryData(queryKeys.posts.detail(newPost.id), newPost);
      
      ElMessage.success('文章创建成功');
    },
    onError: (error: any) => {
      // 错误处理由全局错误处理器处理
      console.error('创建文章失败:', error);
    },
  });
}
