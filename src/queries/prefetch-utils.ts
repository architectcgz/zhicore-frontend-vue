/**
 * Query Prefetch Utilities
 *
 * 本模块提供查询预取功能，用于在用户导航前预先加载数据，
 * 提升页面加载速度和用户体验。
 *
 * @module queries/prefetch-utils
 */

import { useQueryClient } from '@tanstack/vue-query';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';
import { queryKeys } from './query-keys';
import { CACHE_TIMES } from './query-config';
import type { PostQueryParams, CommentQueryParams } from '@/types';

/**
 * 预取单个文章详情
 *
 * 在文章列表页，当用户悬停在文章链接上时，预取文章详情。
 * 这样当用户点击进入详情页时，数据已经在缓存中，可以立即显示。
 *
 * @param postId - 文章 ID
 *
 * @example
 * ```vue
 * <template>
 *   <a
 *     :href="`/post/${post.id}`"
 *     @mouseenter="prefetchPost(post.id)"
 *   >
 *     {{ post.title }}
 *   </a>
 * </template>
 *
 * <script setup lang="ts">
 * import { usePrefetchPost } from '@/queries/prefetch-utils';
 *
 * const prefetchPost = usePrefetchPost();
 * </script>
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function usePrefetchPost() {
  const queryClient = useQueryClient();

  return async (postId: string) => {
    // 检查缓存中是否已有数据
    const cachedData = queryClient.getQueryData(queryKeys.posts.detail(postId));
    
    // 如果缓存中没有数据，则预取
    if (!cachedData) {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.posts.detail(postId),
        queryFn: () => postApi.getPostById(postId),
        ...CACHE_TIMES.POST_CONTENT,
      });
    }
  };
}

/**
 * 预取文章列表
 *
 * 在导航到文章列表页之前预取数据。
 *
 * @param params - 查询参数
 *
 * @example
 * ```typescript
 * import { usePrefetchPosts } from '@/queries/prefetch-utils';
 *
 * const prefetchPosts = usePrefetchPosts();
 *
 * // 在路由守卫中使用
 * router.beforeEach(async (to, from, next) => {
 *   if (to.name === 'PostList') {
 *     await prefetchPosts({ page: 1, size: 20 });
 *   }
 *   next();
 * });
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function usePrefetchPosts() {
  const queryClient = useQueryClient();

  return async (params: PostQueryParams = { page: 1, size: 20 }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.list(params),
      queryFn: () => postApi.getPosts(params),
      ...CACHE_TIMES.POST_LIST,
    });
  };
}

/**
 * 预取评论列表
 *
 * 在文章详情页加载时，预取评论列表。
 *
 * @param postId - 文章 ID
 * @param params - 查询参数
 *
 * @example
 * ```typescript
 * import { usePrefetchComments } from '@/queries/prefetch-utils';
 *
 * const prefetchComments = usePrefetchComments();
 *
 * // 在文章详情页加载时预取评论
 * onMounted(async () => {
 *   await prefetchComments(postId.value);
 * });
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function usePrefetchComments() {
  const queryClient = useQueryClient();

  return async (
    postId: string,
    params: Omit<CommentQueryParams, 'postId'> = { page: 1, size: 20 }
  ) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.comments.list(postId, params),
      queryFn: () => commentApi.getCommentsByPostId(postId, params),
      ...CACHE_TIMES.COMMENT_LIST,
    });
  };
}

/**
 * 预取热门文章
 *
 * 在首页或其他页面预取热门文章列表。
 *
 * @example
 * ```typescript
 * import { usePrefetchHotPosts } from '@/queries/prefetch-utils';
 *
 * const prefetchHotPosts = usePrefetchHotPosts();
 *
 * // 在应用启动时预取
 * onMounted(async () => {
 *   await prefetchHotPosts();
 * });
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function usePrefetchHotPosts() {
  const queryClient = useQueryClient();

  return async (params?: { page?: number; size?: number }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.hot(),
      queryFn: () => postApi.getHotPosts(params),
      ...CACHE_TIMES.POST_LIST,
    });
  };
}

/**
 * 预取推荐文章
 *
 * 在首页或其他页面预取推荐文章列表。
 *
 * @example
 * ```typescript
 * import { usePrefetchRecommendedPosts } from '@/queries/prefetch-utils';
 *
 * const prefetchRecommendedPosts = usePrefetchRecommendedPosts();
 *
 * // 在应用启动时预取
 * onMounted(async () => {
 *   await prefetchRecommendedPosts();
 * });
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function usePrefetchRecommendedPosts() {
  const queryClient = useQueryClient();

  return async (params?: { page?: number; size?: number }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.recommended(),
      queryFn: () => postApi.getRecommendedPosts(params),
      ...CACHE_TIMES.POST_LIST,
    });
  };
}

/**
 * 批量预取文章详情
 *
 * 在文章列表页，批量预取可见文章的详情。
 * 适用于无限滚动场景，当新的文章进入视口时预取。
 *
 * @param postIds - 文章 ID 数组
 *
 * @example
 * ```typescript
 * import { usePrefetchPostsBatch } from '@/queries/prefetch-utils';
 *
 * const prefetchPostsBatch = usePrefetchPostsBatch();
 *
 * // 当文章进入视口时预取
 * const observer = new IntersectionObserver((entries) => {
 *   const visiblePostIds = entries
 *     .filter(entry => entry.isIntersecting)
 *     .map(entry => entry.target.dataset.postId);
 *   
 *   if (visiblePostIds.length > 0) {
 *     prefetchPostsBatch(visiblePostIds);
 *   }
 * });
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function usePrefetchPostsBatch() {
  const queryClient = useQueryClient();

  return async (postIds: string[]) => {
    // 并行预取所有文章
    await Promise.all(
      postIds.map((postId) => {
        const cachedData = queryClient.getQueryData(queryKeys.posts.detail(postId));
        
        // 只预取缓存中没有的数据
        if (!cachedData) {
          return queryClient.prefetchQuery({
            queryKey: queryKeys.posts.detail(postId),
            queryFn: () => postApi.getPostById(postId),
            ...CACHE_TIMES.POST_CONTENT,
          });
        }
        return Promise.resolve();
      })
    );
  };
}

/**
 * 预取相关文章
 *
 * 在文章详情页，预取相关文章列表。
 *
 * @param postId - 文章 ID
 *
 * @example
 * ```typescript
 * import { usePrefetchRelatedPosts } from '@/queries/prefetch-utils';
 *
 * const prefetchRelatedPosts = usePrefetchRelatedPosts();
 *
 * // 在文章详情页加载后预取相关文章
 * onMounted(async () => {
 *   await prefetchRelatedPosts(postId.value);
 * });
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function usePrefetchRelatedPosts() {
  const queryClient = useQueryClient();

  return async (postId: string, params?: { size?: number }) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.related(postId),
      queryFn: () => postApi.getRelatedPosts(postId, params),
      ...CACHE_TIMES.POST_LIST,
    });
  };
}

/**
 * 路由预取配置
 *
 * 定义不同路由的预取策略。
 * 可以在路由守卫中使用这些配置来自动预取数据。
 *
 * @example
 * ```typescript
 * import { routePrefetchConfig } from '@/queries/prefetch-utils';
 *
 * router.beforeEach(async (to, from, next) => {
 *   const prefetchFn = routePrefetchConfig[to.name as string];
 *   if (prefetchFn) {
 *     await prefetchFn(to.params);
 *   }
 *   next();
 * });
 * ```
 */
export const routePrefetchConfig = {
  /**
   * 文章列表页预取
   */
  PostList: async (_params: any) => {
    const queryClient = useQueryClient();
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.list({ page: 1, size: 20 }),
      queryFn: () => postApi.getPosts({ page: 1, size: 20 }),
      ...CACHE_TIMES.POST_LIST,
    });
  },

  /**
   * 文章详情页预取
   */
  PostDetail: async (params: any) => {
    const queryClient = useQueryClient();
    const postId = params.id as string;
    
    // 预取文章详情
    await queryClient.prefetchQuery({
      queryKey: queryKeys.posts.detail(postId),
      queryFn: () => postApi.getPostById(postId),
      ...CACHE_TIMES.POST_CONTENT,
    });
    
    // 预取评论列表
    await queryClient.prefetchQuery({
      queryKey: queryKeys.comments.list(postId, { page: 1, size: 20 }),
      queryFn: () => commentApi.getCommentsByPostId(postId, { page: 1, size: 20 }),
      ...CACHE_TIMES.COMMENT_LIST,
    });
  },

  /**
   * 首页预取
   */
  Home: async () => {
    const queryClient = useQueryClient();
    
    // 并行预取热门文章和推荐文章
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.posts.hot(),
        queryFn: () => postApi.getHotPosts(),
        ...CACHE_TIMES.POST_LIST,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.posts.recommended(),
        queryFn: () => postApi.getRecommendedPosts(),
        ...CACHE_TIMES.POST_LIST,
      }),
    ]);
  },
};

/**
 * 使用路由预取
 *
 * 提供一个便捷的 composable 来在路由守卫中使用预取功能。
 *
 * @example
 * ```typescript
 * import { useRoutePrefetch } from '@/queries/prefetch-utils';
 *
 * // 在 router/index.ts 中
 * const { prefetchForRoute } = useRoutePrefetch();
 *
 * router.beforeEach(async (to, from, next) => {
 *   await prefetchForRoute(to);
 *   next();
 * });
 * ```
 *
 * **Validates: Requirements 12.1**
 */
export function useRoutePrefetch() {
  return {
    /**
     * 为指定路由预取数据
     */
    prefetchForRoute: async (route: { name?: string | symbol | null; params: any }) => {
      const routeName = route.name as string;
      const prefetchFn = routePrefetchConfig[routeName];
      
      if (prefetchFn) {
        try {
          await prefetchFn(route.params);
        } catch (error) {
          // 预取失败不应该阻止导航
          console.warn(`Failed to prefetch data for route ${routeName}:`, error);
        }
      }
    },
  };
}
