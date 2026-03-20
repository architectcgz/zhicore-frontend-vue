/**
 * 创建评论 Mutation Hook
 * 
 * 提供评论创建功能，使用乐观更新提升用户体验
 * 失败时自动回滚到之前的状态
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { commentApi, type CommentCreateRequest } from '@/api/comment';
import { queryKeys } from '../query-keys';
import { useAuthStore } from '@/stores/auth';
import type { Comment, PaginatedResponse } from '@/types';

/**
 * 创建评论 Mutation Hook
 * 
 * 使用乐观更新：
 * - 立即添加临时评论到列表，无需等待服务器响应
 * - 如果请求失败，自动回滚到之前的状态
 * - 请求成功后，失效查询以获取真实数据
 * 
 * @returns Mutation 对象，包含 mutate, mutateAsync, isLoading 等属性
 * 
 * @example
 * ```ts
 * const createComment = useCreateCommentMutation();
 * 
 * const handleSubmit = async () => {
 *   await createComment.mutateAsync({
 *     postId: '123',
 *     content: '这是一条评论',
 *     parentId: undefined // 可选，回复评论时提供
 *   });
 * };
 * ```
 */
export function useCreateCommentMutation() {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  
  return useMutation({
    mutationFn: (commentData: CommentCreateRequest) => commentApi.createComment(commentData),
    
    // 乐观更新：在请求发送前立即更新 UI
    onMutate: async (commentData: CommentCreateRequest) => {
      const queryKey = queryKeys.comments.list(commentData.postId);
      
      // 取消正在进行的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey });
      
      // 保存之前的数据用于回滚
      const previousComments = queryClient.getQueryData<PaginatedResponse<Comment>>(queryKey);
      
      // 乐观更新：添加临时评论到列表
      if (previousComments && authStore.user) {
        const tempComment: Comment = {
          id: `temp-${Date.now()}`,
          content: commentData.content,
          postId: commentData.postId,
          userId: authStore.user.id,
          parentId: commentData.parentId,
          user: {
            id: authStore.user.id,
            username: authStore.user.username,
            nickname: authStore.user.nickname,
            avatar: authStore.user.avatar,
            email: authStore.user.email,
            bio: authStore.user.bio,
            role: authStore.user.role,
            followersCount: authStore.user.followersCount,
            followingCount: authStore.user.followingCount,
            postsCount: authStore.user.postsCount,
            createdAt: authStore.user.createdAt,
            updatedAt: authStore.user.updatedAt,
          },
          likeCount: 0,
          isLiked: false,
          repliesCount: 0,
          replies: [],
          hasMore: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        queryClient.setQueryData<PaginatedResponse<Comment>>(queryKey, {
          ...previousComments,
          items: [tempComment, ...previousComments.items],
          total: previousComments.total + 1,
        });
      }
      
      // 返回上下文对象，包含之前的数据用于回滚
      return { previousComments };
    },
    
    // 错误处理：回滚乐观更新
    onError: (err: any, commentData: CommentCreateRequest, context: any) => {
      // 如果请求失败，恢复之前的数据
      if (context?.previousComments) {
        queryClient.setQueryData(
          queryKeys.comments.list(commentData.postId),
          context.previousComments
        );
      }
      
      console.error('创建评论失败:', err);
    },
    
    // 成功后失效查询以获取真实数据
    onSuccess: (_newComment: Comment, commentData: CommentCreateRequest) => {
      // 使评论列表失效以获取真实数据
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.list(commentData.postId) 
      });
      
      // 如果是回复评论，也失效父评论的回复列表
      if (commentData.parentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.comments.replies(commentData.parentId)
        });
      }
      
      ElMessage.success('评论发表成功');
    },
  });
}
