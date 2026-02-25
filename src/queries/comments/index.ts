/**
 * Comment Query Hooks
 * 
 * 评论相关的 TanStack Query hooks
 * 
 * @module queries/comments
 */

// Query Hooks
export { useCommentsQuery } from './useCommentsQuery';
export { useInfiniteCommentsQuery } from './useInfiniteCommentsQuery';
export { useCommentRepliesQuery } from './useCommentRepliesQuery';
export { useHotCommentsQuery } from './useHotCommentsQuery';

// Mutation Hooks
export { useCreateCommentMutation } from './useCreateCommentMutation';
export { useUpdateCommentMutation } from './useUpdateCommentMutation';
export { useDeleteCommentMutation } from './useDeleteCommentMutation';
export { useLikeCommentMutation } from './useLikeCommentMutation';

// Types
export type { UpdateCommentParams } from './useUpdateCommentMutation';
export type { DeleteCommentParams } from './useDeleteCommentMutation';
export type { LikeCommentParams } from './useLikeCommentMutation';
