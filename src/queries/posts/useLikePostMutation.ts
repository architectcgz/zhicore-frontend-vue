/**
 * 点赞/取消点赞文章 Mutation Hook
 * 
 * 提供文章点赞功能，使用乐观更新提升用户体验
 * 失败时自动回滚到之前的状态
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { postApi } from '@/api/post';
import { queryKeys } from '../query-keys';
import type { Post } from '@/types';

/**
 * 点赞参数接口
 */
export interface LikePostParams {
  postId: string;
  isLiked: boolean;
}

/**
 * 点赞/取消点赞文章 Mutation Hook
 * 
 * 使用乐观更新：
 * - 立即更新 UI，无需等待服务器响应
 * - 如果请求失败，自动回滚到之前的状态
 * - 请求完成后，失效查询以确保数据同步
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const likePost = useLikePostMutation();
 * 
 * const handleLike = (postId: string, isLiked: boolean) => {
 *   likePost.mutate({ postId, isLiked });
 * };
 * ```
 */
export function useLikePostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, isLiked }: LikePostParams) => {
      if (isLiked) {
        return postApi.unlikePost(postId);
      } else {
        return postApi.likePost(postId);
      }
    },
    
    // 乐观更新：在请求发送前立即更新 UI
    onMutate: async ({ postId, isLiked }: LikePostParams) => {
      // 取消正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });
      
      // 保存之前的数据用于回滚
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(postId));
      
      // 乐观更新：立即更新缓存中的文章数据
      if (previousPost) {
        queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), {
          ...previousPost,
          isLiked: !isLiked,
          likeCount: isLiked ? previousPost.likeCount - 1 : previousPost.likeCount + 1,
        });
      }
      
      // 返回上下文对象，包含之前的数据用于回滚
      return { previousPost };
    },
    
    // 错误处理：回滚乐观更新
    onError: (err: any, { postId }: LikePostParams, context: any) => {
      // 如果请求失败，恢复之前的数据
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
      
      console.error('点赞操作失败:', err);
    },
    
    // 无论成功还是失败，都重新获取数据以确保同步
    onSettled: (_, __, { postId }: LikePostParams) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
}
