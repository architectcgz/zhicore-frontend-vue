/**
 * PlaceholderData Utilities
 *
 * 本模块提供 placeholderData 功能，用于在数据加载时显示占位数据，
 * 提供即时加载状态，改善用户体验。
 *
 * @module queries/placeholder-utils
 */

import { useQueryClient } from '@tanstack/vue-query';
import { queryKeys } from './query-keys';
import type {
  Post,
  Comment,
  User,
  PaginatedResponse,
  PostQueryParams,
  CommentQueryParams,
} from '@/types';

/**
 * 生成文章占位数据
 *
 * 创建一个包含基本结构的占位文章对象，用于在实际数据加载时显示。
 *
 * @param id - 文章 ID
 * @returns 占位文章对象
 *
 * **Validates: Requirements 12.2**
 */
export function createPostPlaceholder(id: string): Post {
  return {
    id,
    title: '加载中...',
    content: '',
    summary: '正在加载文章内容...',
    authorId: '',
    author: {
      id: '',
      username: '',
      nickname: '加载中...',
      avatar: null,
      email: '',
      bio: null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isFollowing: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    tags: [],
    coverImage: null,
    viewCount: 0,
    likeCount: 0,
    favoriteCount: 0,
    commentCount: 0,
    isLiked: false,
    isFavorited: false,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
}

/**
 * 生成评论占位数据
 *
 * 创建一个包含基本结构的占位评论对象。
 *
 * @param id - 评论 ID
 * @returns 占位评论对象
 *
 * **Validates: Requirements 12.2**
 */
export function createCommentPlaceholder(id: string): Comment {
  return {
    id,
    content: '加载中...',
    postId: '',
    parentId: null,
    user: {
      id: '',
      username: '',
      nickname: '加载中...',
      avatar: null,
      email: '',
      bio: null,
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      isFollowing: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    likeCount: 0,
    isLiked: false,
    repliesCount: 0,
    replies: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 生成用户占位数据
 *
 * 创建一个包含基本结构的占位用户对象。
 *
 * @param id - 用户 ID
 * @returns 占位用户对象
 *
 * **Validates: Requirements 12.2**
 */
export function createUserPlaceholder(id: string): User {
  return {
    id,
    username: '',
    nickname: '加载中...',
    avatar: null,
    email: '',
    bio: null,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    isFollowing: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 生成分页列表占位数据
 *
 * 创建一个包含占位项的分页响应对象。
 *
 * @param createItemPlaceholder - 创建单个占位项的函数
 * @param count - 占位项数量
 * @returns 分页占位数据
 *
 * **Validates: Requirements 12.2**
 */
export function createPaginatedPlaceholder<T>(
  createItemPlaceholder: (index: number) => T,
  count: number = 5
): PaginatedResponse<T> {
  return {
    items: Array.from({ length: count }, (_, i) => createItemPlaceholder(i)),
    total: count,
    page: 1,
    size: count,
    hasMore: false,
  };
}

/**
 * 从缓存获取占位数据
 *
 * 尝试从缓存中获取相似查询的数据作为占位数据。
 * 例如，当请求第 2 页时，可以使用第 1 页的数据作为占位。
 *
 * @example
 * ```typescript
 * // 在 query hook 中使用
 * export function usePostsQuery(params: PostQueryParams) {
 *   const placeholderData = usePlaceholderFromCache(
 *     () => queryKeys.posts.list({ ...params, page: 1 })
 *   );
 *
 *   return useQuery({
 *     queryKey: queryKeys.posts.list(params),
 *     queryFn: () => postApi.getPosts(params),
 *     placeholderData,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.2**
 */
export function usePlaceholderFromCache<T>(
  getCacheKey: () => readonly unknown[]
): (() => T | undefined) {
  const queryClient = useQueryClient();

  return () => {
    try {
      const cacheKey = getCacheKey();
      return queryClient.getQueryData<T>(cacheKey);
    } catch {
      return undefined;
    }
  };
}

/**
 * 为文章列表提供占位数据
 *
 * 当请求新页面时，使用前一页的数据作为占位。
 * 如果没有缓存数据，则生成占位数据。
 *
 * @param params - 查询参数
 * @returns 占位数据函数
 *
 * @example
 * ```typescript
 * import { usePostsPlaceholder } from '@/queries/placeholder-utils';
 *
 * export function usePostsQuery(params: PostQueryParams) {
 *   const placeholderData = usePostsPlaceholder(params);
 *
 *   return useQuery({
 *     queryKey: queryKeys.posts.list(params),
 *     queryFn: () => postApi.getPosts(params),
 *     placeholderData,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.2**
 */
export function usePostsPlaceholder(params: PostQueryParams) {
  const queryClient = useQueryClient();

  return (): PaginatedResponse<Post> | undefined => {
    // 尝试获取前一页的数据
    if (params.page && params.page > 1) {
      const previousPageData = queryClient.getQueryData<PaginatedResponse<Post>>(
        queryKeys.posts.list({ ...params, page: params.page - 1 })
      );
      if (previousPageData) {
        return previousPageData;
      }
    }

    // 尝试获取第一页的数据
    const firstPageData = queryClient.getQueryData<PaginatedResponse<Post>>(
      queryKeys.posts.list({ ...params, page: 1 })
    );
    if (firstPageData) {
      return firstPageData;
    }

    // 如果没有缓存数据，生成占位数据
    return createPaginatedPlaceholder(
      (i) => createPostPlaceholder(`placeholder-${i}`),
      params.size || 20
    );
  };
}

/**
 * 为评论列表提供占位数据
 *
 * 当请求新页面时，使用前一页的数据作为占位。
 *
 * @param postId - 文章 ID
 * @param params - 查询参数
 * @returns 占位数据函数
 *
 * @example
 * ```typescript
 * import { useCommentsPlaceholder } from '@/queries/placeholder-utils';
 *
 * export function useCommentsQuery(postId: string, params: CommentQueryParams) {
 *   const placeholderData = useCommentsPlaceholder(postId, params);
 *
 *   return useQuery({
 *     queryKey: queryKeys.comments.list(postId, params),
 *     queryFn: () => commentApi.getCommentsByPostId(postId, params),
 *     placeholderData,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.2**
 */
export function useCommentsPlaceholder(
  postId: string,
  params: Omit<CommentQueryParams, 'postId'>
) {
  const queryClient = useQueryClient();

  return (): PaginatedResponse<Comment> | undefined => {
    // 尝试获取前一页的数据
    if (params.page && params.page > 1) {
      const previousPageData = queryClient.getQueryData<PaginatedResponse<Comment>>(
        queryKeys.comments.list(postId, { ...params, page: params.page - 1 })
      );
      if (previousPageData) {
        return previousPageData;
      }
    }

    // 尝试获取第一页的数据
    const firstPageData = queryClient.getQueryData<PaginatedResponse<Comment>>(
      queryKeys.comments.list(postId, { ...params, page: 1 })
    );
    if (firstPageData) {
      return firstPageData;
    }

    // 生成占位数据
    return createPaginatedPlaceholder(
      (i) => createCommentPlaceholder(`placeholder-${i}`),
      params.size || 20
    );
  };
}

/**
 * 为单个文章提供占位数据
 *
 * 尝试从列表缓存中查找文章数据作为占位。
 *
 * @param postId - 文章 ID
 * @returns 占位数据函数
 *
 * @example
 * ```typescript
 * import { usePostPlaceholder } from '@/queries/placeholder-utils';
 *
 * export function usePostQuery(postId: string) {
 *   const placeholderData = usePostPlaceholder(postId);
 *
 *   return useQuery({
 *     queryKey: queryKeys.posts.detail(postId),
 *     queryFn: () => postApi.getPostById(postId),
 *     placeholderData,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.2**
 */
export function usePostPlaceholder(postId: string) {
  const queryClient = useQueryClient();

  return (): Post | undefined => {
    // 尝试从所有文章列表查询中查找该文章
    const queries = queryClient.getQueriesData<PaginatedResponse<Post>>({
      queryKey: queryKeys.posts.lists(),
    });

    for (const [, data] of queries) {
      if (data?.items) {
        const post = data.items.find((p) => p.id === postId);
        if (post) {
          return post;
        }
      }
    }

    // 如果找不到，生成占位数据
    return createPostPlaceholder(postId);
  };
}

/**
 * 为无限查询提供占位数据
 *
 * 使用 keepPreviousData 的替代方案，为无限查询提供占位数据。
 *
 * @example
 * ```typescript
 * import { useInfiniteQueryPlaceholder } from '@/queries/placeholder-utils';
 *
 * export function useInfinitePostsQuery(params: Omit<PostQueryParams, 'page'>) {
 *   const placeholderData = useInfiniteQueryPlaceholder(
 *     () => queryKeys.posts.list(params)
 *   );
 *
 *   return useInfiniteQuery({
 *     queryKey: queryKeys.posts.list(params),
 *     queryFn: ({ pageParam = 1 }) => postApi.getPosts({ ...params, page: pageParam }),
 *     getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
 *     placeholderData,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.2**
 */
export function useInfiniteQueryPlaceholder<T>(
  getCacheKey: () => readonly unknown[]
) {
  const queryClient = useQueryClient();

  return () => {
    try {
      const cacheKey = getCacheKey();
      return queryClient.getQueryData<{ pages: T[]; pageParams: unknown[] }>(cacheKey);
    } catch {
      return undefined;
    }
  };
}

/**
 * 占位数据配置选项
 *
 * 提供统一的占位数据配置，可以在 query hooks 中直接使用。
 */
export const placeholderConfig = {
  /**
   * 使用前一页数据作为占位
   */
  usePreviousData: {
    placeholderData: (previousData: any) => previousData,
  },

  /**
   * 使用缓存数据作为占位
   */
  useCache: <T>(getCacheKey: () => readonly unknown[]) => ({
    placeholderData: usePlaceholderFromCache<T>(getCacheKey),
  }),

  /**
   * 使用生成的占位数据
   */
  useGenerated: <T>(generator: () => T) => ({
    placeholderData: generator,
  }),
};
