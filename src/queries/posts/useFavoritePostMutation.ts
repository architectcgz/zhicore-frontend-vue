/**
 * 收藏/取消收藏文章 Mutation Hook
 * 
 * 提供文章收藏功能，使用乐观更新提升用户体验
 * 失败时自动回滚到之前的状态
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { postApi } from '@/api/post';
import { queryKeys } from '../query-keys';
import type { Post } from '@/types';

/**
 * 收藏参数接口
 */
export interface FavoritePostParams {
  postId: string;
  isFavorited: boolean;
}

/**
 * 收藏/取消收藏文章 Mutation Hook
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
 * const favoritePost = useFavoritePostMutation();
 * 
 * const handleFavorite = (postId: string, isFavorited: boolean) => {
 *   favoritePost.mutate({ postId, isFavorited });
 * };
 * ```
 */
export function useFavoritePostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ postId, isFavorited }: FavoritePostParams) => {
      if (isFavorited) {
        return postApi.unfavoritePost(postId);
      } else {
        return postApi.favoritePost(postId);
      }
    },
    
    // 乐观更新：在请求发送前立即更新 UI
    onMutate: async ({ postId, isFavorited }: FavoritePostParams) => {
      // 取消正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.detail(postId) });
      
      // 保存之前的数据用于回滚
      const previousPost = queryClient.getQueryData<Post>(queryKeys.posts.detail(postId));
      
      // 乐观更新：立即更新缓存中的文章数据
      if (previousPost) {
        queryClient.setQueryData<Post>(queryKeys.posts.detail(postId), {
          ...previousPost,
          isFavorited: !isFavorited,
          favoriteCount: isFavorited 
            ? previousPost.favoriteCount - 1 
            : previousPost.favoriteCount + 1,
        });
      }
      
      // 返回上下文对象，包含之前的数据用于回滚
      return { previousPost };
    },
    
    // 错误处理：回滚乐观更新
    onError: (err: any, { postId }: FavoritePostParams, context: any) => {
      // 如果请求失败，恢复之前的数据
      if (context?.previousPost) {
        queryClient.setQueryData(queryKeys.posts.detail(postId), context.previousPost);
      }
      
      console.error('收藏操作失败:', err);
    },
    
    // 无论成功还是失败，都重新获取数据以确保同步
    onSettled: (_, __, { postId }: FavoritePostParams) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
}
