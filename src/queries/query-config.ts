/**
 * TanStack Query 缓存配置
 *
 * 本模块定义了不同数据类型的缓存策略，包括 staleTime 和 gcTime。
 * 所有查询 hooks 应该使用这些预定义的配置以保持一致性。
 *
 * @module queries/query-config
 */

/**
 * 缓存时间常量（毫秒）
 *
 * staleTime: 数据被认为过期的时间，在此时间内不会重新请求
 * gcTime: 数据在缓存中保留的时间（垃圾回收时间）
 */
export const CACHE_TIMES = {
  /**
   * 文章内容缓存配置
   *
   * 文章内容相对稳定，不需要频繁更新
   * - staleTime: 5 分钟
   * - gcTime: 10 分钟
   */
  POST_CONTENT: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 文章列表缓存配置
   *
   * 列表数据更新较频繁，需要较短的 staleTime
   * - staleTime: 开发环境 0 秒（总是重新获取），生产环境 2 分钟
   * - gcTime: 10 分钟
   */
  POST_LIST: {
    staleTime: import.meta.env.DEV ? 0 : 2 * 60 * 1000, // Dev: 0, Prod: 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 评论列表缓存配置
   *
   * 评论更新频繁，需要较短的 staleTime
   * - staleTime: 1 分钟
   * - gcTime: 10 分钟
   */
  COMMENT_LIST: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 通知计数缓存配置
   *
   * 通知计数需要实时性，使用最短的 staleTime
   * - staleTime: 30 秒
   * - gcTime: 10 分钟
   */
  NOTIFICATION_COUNT: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 通知列表缓存配置
   *
   * 通知列表需要较高的实时性
   * - staleTime: 1 分钟
   * - gcTime: 10 分钟
   */
  NOTIFICATION_LIST: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 消息列表缓存配置
   *
   * 消息需要实时性
   * - staleTime: 30 秒
   * - gcTime: 10 分钟
   */
  MESSAGE_LIST: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 用户信息缓存配置
   *
   * 用户信息相对稳定
   * - staleTime: 5 分钟
   * - gcTime: 10 分钟
   */
  USER_INFO: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 标签信息缓存配置
   *
   * 标签信息相对稳定
   * - staleTime: 10 分钟
   * - gcTime: 10 分钟
   */
  TAG_INFO: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 排行榜缓存配置
   *
   * 排行榜数据更新较慢，可以使用较长的 staleTime
   * - staleTime: 5 分钟
   * - gcTime: 10 分钟
   */
  RANKING: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 搜索结果缓存配置
   *
   * 搜索结果需要较新的数据
   * - staleTime: 2 分钟
   * - gcTime: 10 分钟
   */
  SEARCH_RESULTS: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 热门搜索缓存配置
   *
   * 热门搜索更新较慢
   * - staleTime: 10 分钟
   * - gcTime: 10 分钟
   */
  HOT_SEARCHES: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 管理员统计数据缓存配置
   *
   * 管理员数据需要较新
   * - staleTime: 1 分钟
   * - gcTime: 10 分钟
   */
  ADMIN_STATS: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  /**
   * 默认缓存配置
   *
   * 用于没有特殊要求的查询
   * - staleTime: 5 分钟
   * - gcTime: 10 分钟
   */
  DEFAULT: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
} as const;

/**
 * 缓存配置类型
 */
export type CacheConfig = {
  staleTime: number;
  gcTime: number;
};

/**
 * 获取缓存配置的辅助函数
 *
 * @param type - 缓存类型
 * @returns 缓存配置对象
 *
 * @example
 * ```typescript
 * const config = getCacheConfig('POST_CONTENT');
 * // { staleTime: 300000, gcTime: 600000 }
 * ```
 */
export function getCacheConfig(type: keyof typeof CACHE_TIMES): CacheConfig {
  return CACHE_TIMES[type];
}

/**
 * 创建自定义缓存配置
 *
 * @param staleTimeMinutes - staleTime（分钟）
 * @param gcTimeMinutes - gcTime（分钟），默认为 10 分钟
 * @returns 缓存配置对象
 *
 * @example
 * ```typescript
 * const config = createCacheConfig(3, 15);
 * // { staleTime: 180000, gcTime: 900000 }
 * ```
 */
export function createCacheConfig(
  staleTimeMinutes: number,
  gcTimeMinutes: number = 10
): CacheConfig {
  return {
    staleTime: staleTimeMinutes * 60 * 1000,
    gcTime: gcTimeMinutes * 60 * 1000,
  };
}

/**
 * 缓存配置说明
 *
 * ## staleTime vs gcTime
 *
 * - **staleTime**: 数据被认为"新鲜"的时间。在此时间内，相同的查询会直接返回缓存数据，
 *   不会发起新的网络请求。这是优化性能的关键配置。
 *
 * - **gcTime** (Garbage Collection Time): 数据在缓存中保留的时间。即使数据已经"过期"
 *   （超过 staleTime），只要还在 gcTime 内，数据仍然保留在缓存中。当组件重新挂载时，
 *   会先显示缓存数据，然后在后台重新获取。
 *
 * ## 配置原则
 *
 * 1. **实时性要求高的数据**（通知、消息）：使用较短的 staleTime（30秒-1分钟）
 * 2. **相对稳定的数据**（文章内容、用户信息）：使用较长的 staleTime（5-10分钟）
 * 3. **所有数据**：统一使用 10 分钟的 gcTime，确保良好的用户体验
 *
 * ## 使用示例
 *
 * ```typescript
 * import { CACHE_TIMES } from '@/queries/query-config';
 *
 * // 在 query hook 中使用
 * export function usePostQuery(postId: string) {
 *   return useQuery({
 *     queryKey: ['post', postId],
 *     queryFn: () => fetchPost(postId),
 *     ...CACHE_TIMES.POST_CONTENT, // 展开配置
 *   });
 * }
 * ```
 */
