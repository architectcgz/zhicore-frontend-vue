/**
 * 文章相关 Query 和 Mutation Hooks
 * 
 * 统一导出所有文章相关的 TanStack Query hooks
 */

// Query Hooks
export { usePostQuery } from './usePostQuery';
export { usePostsQuery } from './usePostsQuery';
export { useInfinitePostsQuery } from './useInfinitePostsQuery';
export { useHotPostsQuery } from './useHotPostsQuery';
export { useRecommendedPostsQuery } from './useRecommendedPostsQuery';
export { useRelatedPostsQuery } from './useRelatedPostsQuery';

// Mutation Hooks
export { useCreatePostMutation } from './useCreatePostMutation';
export { useUpdatePostMutation } from './useUpdatePostMutation';
export { useDeletePostMutation } from './useDeletePostMutation';
export { useLikePostMutation } from './useLikePostMutation';
export { useFavoritePostMutation } from './useFavoritePostMutation';
export { useSaveDraftMutation } from './useSaveDraftMutation';
export { useUpdateDraftMutation } from './useUpdateDraftMutation';
export { usePublishDraftMutation } from './usePublishDraftMutation';

// Re-export types
export type { LikePostParams } from './useLikePostMutation';
export type { FavoritePostParams } from './useFavoritePostMutation';
export type { UpdatePostParams } from './useUpdatePostMutation';
export type { UpdateDraftParams } from './useUpdateDraftMutation';
