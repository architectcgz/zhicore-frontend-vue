/**
 * Data Transformation (Select) Utilities
 *
 * 本模块提供数据转换功能，使用 TanStack Query 的 select 选项
 * 来高效地转换查询数据，减少不必要的重新渲染。
 *
 * select 选项的优势：
 * 1. 只在数据变化时重新计算
 * 2. 使用结构共享，只在转换结果变化时触发重新渲染
 * 3. 可以提取部分数据，减少组件依赖
 *
 * @module queries/select-utils
 */

import type {
  Post,
  Comment,
  User,
  PaginatedResponse,
} from '@/types';

/**
 * 选择文章标题和摘要
 *
 * 从完整的文章对象中只提取标题和摘要，减少组件依赖。
 *
 * @param post - 完整的文章对象
 * @returns 包含标题和摘要的对象
 *
 * @example
 * ```typescript
 * import { selectPostSummary } from '@/queries/select-utils';
 *
 * export function usePostSummaryQuery(postId: string) {
 *   return useQuery({
 *     queryKey: queryKeys.posts.detail(postId),
 *     queryFn: () => postApi.getPostById(postId),
 *     select: selectPostSummary,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function selectPostSummary(post: Post) {
  return {
    id: post.id,
    title: post.title,
    summary: post.summary,
  };
}

/**
 * 选择文章作者信息
 *
 * 从文章对象中只提取作者信息。
 *
 * @param post - 完整的文章对象
 * @returns 作者信息
 *
 * @example
 * ```typescript
 * import { selectPostAuthor } from '@/queries/select-utils';
 *
 * export function usePostAuthorQuery(postId: string) {
 *   return useQuery({
 *     queryKey: queryKeys.posts.detail(postId),
 *     queryFn: () => postApi.getPostById(postId),
 *     select: selectPostAuthor,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function selectPostAuthor(post: Post) {
  return post.author;
}

/**
 * 选择文章统计信息
 *
 * 从文章对象中提取所有统计数据。
 *
 * @param post - 完整的文章对象
 * @returns 统计信息
 *
 * @example
 * ```typescript
 * import { selectPostStats } from '@/queries/select-utils';
 *
 * export function usePostStatsQuery(postId: string) {
 *   return useQuery({
 *     queryKey: queryKeys.posts.detail(postId),
 *     queryFn: () => postApi.getPostById(postId),
 *     select: selectPostStats,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function selectPostStats(post: Post) {
  return {
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    favoriteCount: post.favoriteCount,
    commentCount: post.commentCount,
    isLiked: post.isLiked,
    isFavorited: post.isFavorited,
  };
}

/**
 * 选择文章 ID 列表
 *
 * 从分页文章列表中只提取 ID 数组。
 *
 * @param response - 分页响应
 * @returns ID 数组
 *
 * @example
 * ```typescript
 * import { selectPostIds } from '@/queries/select-utils';
 *
 * export function usePostIdsQuery(params: PostQueryParams) {
 *   return useQuery({
 *     queryKey: queryKeys.posts.list(params),
 *     queryFn: () => postApi.getPosts(params),
 *     select: selectPostIds,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function selectPostIds(response: PaginatedResponse<Post>): string[] {
  return response.items.map((post) => post.id);
}

/**
 * 选择文章标题列表
 *
 * 从分页文章列表中提取标题数组。
 *
 * @param response - 分页响应
 * @returns 标题数组
 *
 * **Validates: Requirements 12.4**
 */
export function selectPostTitles(response: PaginatedResponse<Post>): string[] {
  return response.items.map((post) => post.title);
}

/**
 * 选择评论内容列表
 *
 * 从分页评论列表中只提取评论内容。
 *
 * @param response - 分页响应
 * @returns 评论内容数组
 *
 * @example
 * ```typescript
 * import { selectCommentContents } from '@/queries/select-utils';
 *
 * export function useCommentContentsQuery(postId: string) {
 *   return useQuery({
 *     queryKey: queryKeys.comments.list(postId),
 *     queryFn: () => commentApi.getCommentsByPostId(postId),
 *     select: selectCommentContents,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function selectCommentContents(response: PaginatedResponse<Comment>): string[] {
  return response.items.map((comment) => comment.content);
}

/**
 * 选择评论作者列表
 *
 * 从评论列表中提取所有作者信息（去重）。
 *
 * @param response - 分页响应
 * @returns 作者数组
 *
 * **Validates: Requirements 12.4**
 */
export function selectCommentAuthors(response: PaginatedResponse<Comment>): User[] {
  const authorsMap = new Map<string, User>();
  
  response.items.forEach((comment) => {
    if (!authorsMap.has(comment.user.id)) {
      authorsMap.set(comment.user.id, comment.user);
    }
  });
  
  return Array.from(authorsMap.values());
}

/**
 * 选择分页元数据
 *
 * 从分页响应中只提取分页信息，不包含数据项。
 *
 * @param response - 分页响应
 * @returns 分页元数据
 *
 * @example
 * ```typescript
 * import { selectPaginationMeta } from '@/queries/select-utils';
 *
 * export function usePostsPaginationQuery(params: PostQueryParams) {
 *   return useQuery({
 *     queryKey: queryKeys.posts.list(params),
 *     queryFn: () => postApi.getPosts(params),
 *     select: selectPaginationMeta,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function selectPaginationMeta<T>(response: PaginatedResponse<T>) {
  return {
    total: response.total,
    page: response.page,
    size: response.size,
    hasMore: response.hasMore,
  };
}

/**
 * 创建自定义选择器
 *
 * 创建一个自定义的数据选择器函数。
 *
 * @param selector - 选择器函数
 * @returns 选择器函数
 *
 * @example
 * ```typescript
 * import { createSelector } from '@/queries/select-utils';
 *
 * // 创建自定义选择器
 * const selectActivePosts = createSelector((response: PaginatedResponse<Post>) =>
 *   response.items.filter(post => post.status === 'PUBLISHED')
 * );
 *
 * // 在 query hook 中使用
 * export function useActivePostsQuery(params: PostQueryParams) {
 *   return useQuery({
 *     queryKey: queryKeys.posts.list(params),
 *     queryFn: () => postApi.getPosts(params),
 *     select: selectActivePosts,
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function createSelector<TInput, TOutput>(
  selector: (data: TInput) => TOutput
): (data: TInput) => TOutput {
  return selector;
}

/**
 * 组合多个选择器
 *
 * 将多个选择器组合成一个，按顺序应用。
 *
 * @param selectors - 选择器数组
 * @returns 组合后的选择器
 *
 * @example
 * ```typescript
 * import { composeSelectors } from '@/queries/select-utils';
 *
 * // 组合选择器：先过滤，再映射
 * const selectPublishedPostTitles = composeSelectors(
 *   (response: PaginatedResponse<Post>) => ({
 *     ...response,
 *     items: response.items.filter(post => post.status === 'PUBLISHED')
 *   }),
 *   (response: PaginatedResponse<Post>) => response.items.map(post => post.title)
 * );
 * ```
 *
 * **Validates: Requirements 12.4**
 */
export function composeSelectors<T>(...selectors: Array<(data: any) => any>) {
  return (data: T) => {
    return selectors.reduce((result, selector) => selector(result), data);
  };
}

/**
 * 选择器工厂
 *
 * 提供常用的选择器工厂函数。
 */
export const selectorFactory = {
  /**
   * 创建字段选择器
   *
   * 从对象中选择指定字段。
   *
   * @example
   * ```typescript
   * const selectTitle = selectorFactory.pickFields<Post>(['title', 'summary']);
   * ```
   */
  pickFields: <T extends Record<string, any>>(fields: Array<keyof T>) => {
    return (data: T): Partial<T> => {
      const result: Partial<T> = {};
      fields.forEach((field) => {
        result[field] = data[field];
      });
      return result;
    };
  },

  /**
   * 创建数组映射选择器
   *
   * 映射数组中的每个元素。
   *
   * @example
   * ```typescript
   * const selectPostTitles = selectorFactory.mapArray<Post, string>(
   *   (post) => post.title
   * );
   * ```
   */
  mapArray: <TInput, TOutput>(mapper: (item: TInput) => TOutput) => {
    return (response: PaginatedResponse<TInput>): TOutput[] => {
      return response.items.map(mapper);
    };
  },

  /**
   * 创建数组过滤选择器
   *
   * 过滤数组中的元素。
   *
   * @example
   * ```typescript
   * const selectPublishedPosts = selectorFactory.filterArray<Post>(
   *   (post) => post.status === 'PUBLISHED'
   * );
   * ```
   */
  filterArray: <T>(predicate: (item: T) => boolean) => {
    return (response: PaginatedResponse<T>): PaginatedResponse<T> => {
      const filteredItems = response.items.filter(predicate);
      return {
        ...response,
        items: filteredItems,
        total: filteredItems.length,
      };
    };
  },

  /**
   * 创建数组排序选择器
   *
   * 对数组进行排序。
   *
   * @example
   * ```typescript
   * const selectSortedPosts = selectorFactory.sortArray<Post>(
   *   (a, b) => b.likeCount - a.likeCount
   * );
   * ```
   */
  sortArray: <T>(compareFn: (a: T, b: T) => number) => {
    return (response: PaginatedResponse<T>): PaginatedResponse<T> => {
      return {
        ...response,
        items: [...response.items].sort(compareFn),
      };
    };
  },

  /**
   * 创建数组切片选择器
   *
   * 获取数组的一部分。
   *
   * @example
   * ```typescript
   * const selectFirstFivePosts = selectorFactory.sliceArray<Post>(0, 5);
   * ```
   */
  sliceArray: <T>(start: number, end?: number) => {
    return (response: PaginatedResponse<T>): PaginatedResponse<T> => {
      const slicedItems = response.items.slice(start, end);
      return {
        ...response,
        items: slicedItems,
        total: slicedItems.length,
      };
    };
  },

  /**
   * 创建条件选择器
   *
   * 根据条件选择不同的数据。
   *
   * @example
   * ```typescript
   * const selectConditional = selectorFactory.conditional<Post>(
   *   (post) => post.status === 'PUBLISHED',
   *   (post) => ({ ...post, badge: 'Published' }),
   *   (post) => ({ ...post, badge: 'Draft' })
   * );
   * ```
   */
  conditional: <T>(
    condition: (data: T) => boolean,
    trueSelector: (data: T) => any,
    falseSelector: (data: T) => any
  ) => {
    return (data: T) => {
      return condition(data) ? trueSelector(data) : falseSelector(data);
    };
  },
};

/**
 * 性能优化的选择器
 *
 * 使用 memoization 优化选择器性能。
 */
export const optimizedSelectors = {
  /**
   * 记忆化选择器
   *
   * 缓存选择器结果，避免重复计算。
   *
   * @example
   * ```typescript
   * const selectExpensiveComputation = optimizedSelectors.memoize(
   *   (response: PaginatedResponse<Post>) => {
   *     // 昂贵的计算
   *     return response.items.map(post => ({
   *       ...post,
   *       computed: expensiveFunction(post)
   *     }));
   *   }
   * );
   * ```
   */
  memoize: <TInput, TOutput>(selector: (data: TInput) => TOutput) => {
    let lastInput: TInput | undefined;
    let lastOutput: TOutput | undefined;

    return (data: TInput): TOutput => {
      if (data === lastInput && lastOutput !== undefined) {
        return lastOutput;
      }

      lastInput = data;
      lastOutput = selector(data);
      return lastOutput;
    };
  },

  /**
   * 深度比较选择器
   *
   * 使用深度比较来决定是否重新计算。
   *
   * 注意：TanStack Query 默认使用结构共享，通常不需要此功能。
   */
  deepCompare: <TInput, TOutput>(selector: (data: TInput) => TOutput) => {
    let lastInput: TInput | undefined;
    let lastOutput: TOutput | undefined;

    return (data: TInput): TOutput => {
      if (JSON.stringify(data) === JSON.stringify(lastInput) && lastOutput !== undefined) {
        return lastOutput;
      }

      lastInput = data;
      lastOutput = selector(data);
      return lastOutput;
    };
  },
};

/**
 * 常用选择器预设
 *
 * 提供一些常用的预设选择器。
 */
export const commonSelectors = {
  /**
   * 选择第一项
   */
  first: <T>(response: PaginatedResponse<T>): T | undefined => {
    return response.items[0];
  },

  /**
   * 选择最后一项
   */
  last: <T>(response: PaginatedResponse<T>): T | undefined => {
    return response.items[response.items.length - 1];
  },

  /**
   * 选择项数量
   */
  count: <T>(response: PaginatedResponse<T>): number => {
    return response.items.length;
  },

  /**
   * 检查是否为空
   */
  isEmpty: <T>(response: PaginatedResponse<T>): boolean => {
    return response.items.length === 0;
  },

  /**
   * 检查是否有更多
   */
  hasMore: <T>(response: PaginatedResponse<T>): boolean => {
    return response.hasMore;
  },
};
