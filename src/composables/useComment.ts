/**
 * 评论功能组合式函数
 * 提供评论相关的业务逻辑和状态管理
 * 
 * 重构说明：
 * - 使用 TanStack Query 管理评论数据
 * - 使用 useInfiniteCommentsQuery 替代手动分页
 * - 使用 mutation hooks 替代手动 API 调用
 * - 移除手动状态管理（loading, error, comments 等）
 * - 乐观更新由 TanStack Query 自动处理
 */

import { ref, computed } from 'vue';
import { commentApi } from '@/api/comment';
import type { Comment } from '@/types';
import { useInfiniteCommentsQuery } from '@/queries/comments/useInfiniteCommentsQuery';
import { useCreateCommentMutation } from '@/queries/comments/useCreateCommentMutation';
import { useDeleteCommentMutation } from '@/queries/comments/useDeleteCommentMutation';
import { useLikeCommentMutation } from '@/queries/comments/useLikeCommentMutation';
import { useCommentRepliesQuery } from '@/queries/comments/useCommentRepliesQuery';

export interface UseCommentOptions {
  postId: string;
  initialSort?: 'latest' | 'hot';
  pageSize?: number;
}

export function useComment(options: UseCommentOptions) {
  const { postId, initialSort = 'latest', pageSize = 20 } = options;

  // 响应式状态（仅保留 UI 状态）
  const currentSort = ref(initialSort);

  // 使用 TanStack Query 管理评论数据
  const queryParams = computed(() => ({
    size: pageSize,
    sort: currentSort.value,
    loadReplies: false,
  }));

  const commentsQuery = useInfiniteCommentsQuery(postId, queryParams);

  // 使用 mutation hooks
  const createCommentMutation = useCreateCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();
  const likeCommentMutation = useLikeCommentMutation();

  // 计算属性 - 从 TanStack Query 数据派生
  const comments = computed(() => {
    if (!commentsQuery.data.value) return [];
    return commentsQuery.data.value.pages.flatMap(page => page.items);
  });

  const totalComments = computed(() => {
    if (!commentsQuery.data.value?.pages[0]) return 0;
    return commentsQuery.data.value.pages[0].total;
  });

  const isEmpty = computed(() => 
    comments.value.length === 0 && !commentsQuery.isLoading.value
  );

  const isFirstLoad = computed(() => 
    !commentsQuery.data.value && commentsQuery.isLoading.value
  );

  /**
   * 加载更多评论
   */
  const loadMore = async (): Promise<void> => {
    if (commentsQuery.hasNextPage.value && !commentsQuery.isFetchingNextPage.value) {
      await commentsQuery.fetchNextPage();
    }
  };

  /**
   * 刷新评论列表
   */
  const refresh = async (): Promise<void> => {
    await commentsQuery.refetch();
  };

  /**
   * 更改排序方式
   */
  const changeSort = async (sort: 'latest' | 'hot'): Promise<void> => {
    if (sort === currentSort.value) return;
    currentSort.value = sort;
    // TanStack Query 会自动重新获取数据，因为 queryParams 变化了
  };

  /**
   * 创建评论
   */
  const createComment = async (content: string, parentId?: string): Promise<Comment> => {
    const commentData = {
      postId,
      content: content.trim(),
      parentId,
    };

    return await createCommentMutation.mutateAsync(commentData);
  };

  /**
   * 删除评论
   */
  const removeComment = async (commentId: string): Promise<void> => {
    await deleteCommentMutation.mutateAsync({
      commentId,
      postId,
    });
  };

  /**
   * 点赞/取消点赞评论
   */
  const toggleLike = async (commentId: string): Promise<void> => {
    const comment = findCommentById(commentId);
    if (!comment) return;

    await likeCommentMutation.mutateAsync({
      commentId,
      isLiked: comment.isLiked,
      postId,
    });
  };

  /**
   * 加载评论回复
   * 注意：这个方法现在返回一个 query 对象，而不是直接修改评论
   */
  const loadReplies = (commentId: string) => {
    return useCommentRepliesQuery(commentId, ref({
      page: 1,
      size: 10,
      sort: 'latest' as const,
    }));
  };

  /**
   * 举报评论
   */
  const reportComment = async (commentId: string, reason: string): Promise<void> => {
    await commentApi.reportComment(commentId, reason);
  };

  /**
   * 根据 ID 查找评论（包括回复）
   */
  const findCommentById = (commentId: string): Comment | null => {
    for (const comment of comments.value) {
      if (comment.id === commentId) {
        return comment;
      }
      
      // 在回复中查找
      const reply = findCommentInReplies(comment.replies, commentId);
      if (reply) {
        return reply;
      }
    }
    return null;
  };

  /**
   * 在回复列表中递归查找评论
   */
  const findCommentInReplies = (replies: Comment[], commentId: string): Comment | null => {
    for (const reply of replies) {
      if (reply.id === commentId) {
        return reply;
      }
      
      // 递归查找子回复
      const subReply = findCommentInReplies(reply.replies, commentId);
      if (subReply) {
        return subReply;
      }
    }
    return null;
  };

  return {
    // TanStack Query 状态 - 直接暴露
    comments,
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    isFetchingNextPage: commentsQuery.isFetchingNextPage,
    hasNextPage: commentsQuery.hasNextPage,
    
    // 派生状态
    currentSort,
    totalComments,
    isEmpty,
    isFirstLoad,
    
    // Mutation 状态
    isCreating: createCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,
    isLiking: likeCommentMutation.isPending,
    
    // 方法
    loadMore,
    refresh,
    changeSort,
    createComment,
    removeComment,
    toggleLike,
    loadReplies,
    reportComment,
    findCommentById,
    
    // 原始 query 对象（用于高级用例）
    commentsQuery,
  };
}

/**
 * 评论表单组合式函数
 * 
 * 重构说明：
 * - 使用 useCreateCommentMutation 替代手动 API 调用
 * - 移除手动状态管理（submitting, error）
 * - 错误处理由 TanStack Query 自动处理
 */
export function useCommentForm(postId: string) {
  const content = ref('');
  const replyTo = ref<Comment | null>(null);
  const error = ref<string | null>(null);

  // 使用 mutation hook
  const createCommentMutation = useCreateCommentMutation();

  // 计算属性
  const canSubmit = computed(() => {
    return content.value.trim().length > 0 && 
           content.value.length <= 1000 && 
           !createCommentMutation.isPending.value;
  });

  const placeholder = computed(() => {
    return replyTo.value 
      ? `回复 @${replyTo.value.user.nickname}...`
      : '写下你的评论...';
  });

  /**
   * 验证评论内容
   */
  const validateContent = (): boolean => {
    const trimmedContent = content.value.trim();
    
    if (!trimmedContent) {
      error.value = '评论内容不能为空';
      return false;
    }
    
    if (trimmedContent.length < 2) {
      error.value = '评论内容至少需要2个字符';
      return false;
    }
    
    if (trimmedContent.length > 1000) {
      error.value = '评论内容不能超过1000个字符';
      return false;
    }
    
    return true;
  };

  /**
   * 提交评论
   */
  const submitComment = async (): Promise<Comment> => {
    if (!validateContent()) {
      throw new Error(error.value || '验证失败');
    }

    try {
      error.value = null;

      const commentData = {
        postId,
        content: content.value.trim(),
        parentId: replyTo.value?.id,
      };

      const newComment = await createCommentMutation.mutateAsync(commentData);
      
      // 清空表单
      reset();
      
      return newComment;
    } catch (err: unknown) {
      console.error('提交评论失败:', err);
      error.value = err instanceof Error ? err.message : '发表评论失败，请稍后重试';
      throw err;
    }
  };

  /**
   * 设置回复目标
   */
  const setReplyTo = (comment: Comment | null): void => {
    replyTo.value = comment;
    error.value = null;
  };

  /**
   * 重置表单
   */
  const reset = (): void => {
    content.value = '';
    error.value = null;
    replyTo.value = null;
  };

  return {
    // 状态
    content,
    submitting: createCommentMutation.isPending,
    error,
    replyTo,
    
    // 计算属性
    canSubmit,
    placeholder,
    
    // 方法
    validateContent,
    submitComment,
    setReplyTo,
    reset,
  };
}