/**
 * Query Cancellation Utilities
 *
 * 本模块提供查询取消功能，确保组件卸载时取消正在进行的查询，
 * 避免内存泄漏和不必要的网络请求。
 *
 * TanStack Query 默认会在组件卸载时自动取消查询，
 * 但本模块提供了额外的工具和测试辅助函数。
 *
 * @module queries/cancellation-utils
 */

import { useQueryClient } from '@tanstack/vue-query';
import { onUnmounted } from 'vue';
import type { QueryKey } from '@tanstack/vue-query';

/**
 * 取消指定查询
 *
 * 手动取消一个或多个查询。
 *
 * @param queryKey - 查询键
 *
 * @example
 * ```typescript
 * import { useCancelQuery } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * const cancelQuery = useCancelQuery();
 *
 * // 取消单个查询
 * const handleCancel = () => {
 *   cancelQuery(queryKeys.posts.detail('123'));
 * };
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useCancelQuery() {
  const queryClient = useQueryClient();

  return async (queryKey: QueryKey) => {
    await queryClient.cancelQueries({ queryKey });
  };
}

/**
 * 取消所有匹配的查询
 *
 * 取消所有匹配指定前缀的查询。
 *
 * @param queryKeyPrefix - 查询键前缀
 *
 * @example
 * ```typescript
 * import { useCancelQueries } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * const cancelQueries = useCancelQueries();
 *
 * // 取消所有文章相关的查询
 * const handleCancelAll = () => {
 *   cancelQueries(queryKeys.posts.all);
 * };
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useCancelQueries() {
  const queryClient = useQueryClient();

  return async (queryKeyPrefix: QueryKey) => {
    await queryClient.cancelQueries({ queryKey: queryKeyPrefix });
  };
}

/**
 * 组件卸载时自动取消查询
 *
 * 在组件卸载时自动取消指定的查询。
 * 注意：TanStack Query 默认会自动取消查询，此函数用于特殊场景。
 *
 * @param queryKey - 查询键或查询键数组
 *
 * @example
 * ```typescript
 * import { useCancelOnUnmount } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * // 在 setup 中使用
 * useCancelOnUnmount(queryKeys.posts.detail(postId.value));
 *
 * // 或取消多个查询
 * useCancelOnUnmount([
 *   queryKeys.posts.detail(postId.value),
 *   queryKeys.comments.list(postId.value),
 * ]);
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useCancelOnUnmount(queryKey: QueryKey | QueryKey[]) {
  const queryClient = useQueryClient();

  onUnmounted(async () => {
    if (Array.isArray(queryKey[0])) {
      // 多个查询键
      await Promise.all(
        (queryKey as QueryKey[]).map((key) =>
          queryClient.cancelQueries({ queryKey: key })
        )
      );
    } else {
      // 单个查询键
      await queryClient.cancelQueries({ queryKey: queryKey as QueryKey });
    }
  });
}

/**
 * 创建可取消的查询函数
 *
 * 包装查询函数，使其支持 AbortSignal。
 * 这允许 TanStack Query 在需要时取消网络请求。
 *
 * @param queryFn - 原始查询函数
 * @returns 支持取消的查询函数
 *
 * @example
 * ```typescript
 * import { createCancellableQuery } from '@/queries/cancellation-utils';
 * import axios from 'axios';
 *
 * // 在 API 层使用
 * export const postApi = {
 *   getPostById: createCancellableQuery(async (postId: string, signal?: AbortSignal) => {
 *     const response = await axios.get(`/api/posts/${postId}`, { signal });
 *     return response.data;
 *   }),
 * };
 *
 * // 在 query hook 中使用
 * export function usePostQuery(postId: string) {
 *   return useQuery({
 *     queryKey: queryKeys.posts.detail(postId),
 *     queryFn: ({ signal }) => postApi.getPostById(postId, signal),
 *   });
 * }
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function createCancellableQuery<TArgs extends any[], TResult>(
  queryFn: (...args: [...TArgs, AbortSignal?]) => Promise<TResult>
) {
  return async (...args: [...TArgs, AbortSignal?]): Promise<TResult> => {
    const signal = args[args.length - 1] as AbortSignal | undefined;
    return queryFn(...args);
  };
}

/**
 * 检查查询是否正在运行
 *
 * 检查指定查询是否正在进行中。
 *
 * @param queryKey - 查询键
 * @returns 是否正在运行
 *
 * @example
 * ```typescript
 * import { useIsQueryRunning } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * const isRunning = useIsQueryRunning();
 *
 * const checkStatus = () => {
 *   const running = isRunning(queryKeys.posts.detail('123'));
 *   console.log('Query is running:', running);
 * };
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useIsQueryRunning() {
  const queryClient = useQueryClient();

  return (queryKey: QueryKey): boolean => {
    const query = queryClient.getQueryState(queryKey);
    return query?.fetchStatus === 'fetching';
  };
}

/**
 * 等待查询完成或取消
 *
 * 等待指定查询完成或被取消。
 *
 * @param queryKey - 查询键
 * @param timeout - 超时时间（毫秒），默认 30 秒
 * @returns Promise，在查询完成或超时时 resolve
 *
 * @example
 * ```typescript
 * import { useWaitForQuery } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * const waitForQuery = useWaitForQuery();
 *
 * const handleWait = async () => {
 *   try {
 *     await waitForQuery(queryKeys.posts.detail('123'), 5000);
 *     console.log('Query completed');
 *   } catch (error) {
 *     console.log('Query timeout or cancelled');
 *   }
 * };
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useWaitForQuery() {
  const queryClient = useQueryClient();

  return async (queryKey: QueryKey, timeout: number = 30000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();

      const checkQuery = () => {
        const query = queryClient.getQueryState(queryKey);

        if (!query || query.fetchStatus !== 'fetching') {
          resolve();
          return;
        }

        if (Date.now() - startTime > timeout) {
          reject(new Error('Query timeout'));
          return;
        }

        setTimeout(checkQuery, 100);
      };

      checkQuery();
    });
  };
}

/**
 * 查询取消监听器
 *
 * 监听查询取消事件，用于调试和测试。
 *
 * @param onCancel - 取消回调函数
 *
 * @example
 * ```typescript
 * import { useQueryCancellationListener } from '@/queries/cancellation-utils';
 *
 * // 在测试或调试中使用
 * useQueryCancellationListener((queryKey) => {
 *   console.log('Query cancelled:', queryKey);
 * });
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useQueryCancellationListener(
  onCancel: (queryKey: QueryKey) => void
) {
  const queryClient = useQueryClient();

  // 监听查询缓存变化
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'observerRemoved') {
      // 查询被移除，可能是因为取消
      const query = event.query;
      if (query.state.fetchStatus === 'idle' && query.state.status === 'pending') {
        onCancel(query.queryKey);
      }
    }
  });

  onUnmounted(() => {
    unsubscribe();
  });
}

/**
 * 批量取消查询工具
 *
 * 提供批量取消查询的便捷方法。
 *
 * @example
 * ```typescript
 * import { useBatchCancellation } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * const { addQuery, cancelAll, clear } = useBatchCancellation();
 *
 * // 添加需要取消的查询
 * addQuery(queryKeys.posts.detail('1'));
 * addQuery(queryKeys.posts.detail('2'));
 * addQuery(queryKeys.comments.list('1'));
 *
 * // 取消所有添加的查询
 * await cancelAll();
 *
 * // 清空列表
 * clear();
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useBatchCancellation() {
  const queryClient = useQueryClient();
  const queryKeys = new Set<QueryKey>();

  return {
    /**
     * 添加查询到取消列表
     */
    addQuery: (queryKey: QueryKey) => {
      queryKeys.add(queryKey);
    },

    /**
     * 从取消列表移除查询
     */
    removeQuery: (queryKey: QueryKey) => {
      queryKeys.delete(queryKey);
    },

    /**
     * 取消所有添加的查询
     */
    cancelAll: async () => {
      await Promise.all(
        Array.from(queryKeys).map((key) =>
          queryClient.cancelQueries({ queryKey: key })
        )
      );
    },

    /**
     * 清空取消列表
     */
    clear: () => {
      queryKeys.clear();
    },

    /**
     * 获取当前列表中的查询数量
     */
    size: () => queryKeys.size,
  };
}

/**
 * 测试辅助函数：模拟查询取消
 *
 * 用于测试查询取消行为。
 *
 * @param queryKey - 查询键
 * @param delay - 延迟时间（毫秒）
 *
 * @example
 * ```typescript
 * import { simulateQueryCancellation } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * // 在测试中使用
 * test('should handle query cancellation', async () => {
 *   const { result } = renderHook(() => usePostQuery('123'));
 *
 *   // 模拟取消
 *   await simulateQueryCancellation(queryKeys.posts.detail('123'), 100);
 *
 *   // 验证取消行为
 *   expect(result.current.isFetching).toBe(false);
 * });
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export async function simulateQueryCancellation(
  queryKey: QueryKey,
  delay: number = 0
): Promise<void> {
  const queryClient = useQueryClient();

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  await queryClient.cancelQueries({ queryKey });
}

/**
 * 查询取消状态
 *
 * 提供查询取消相关的状态信息。
 */
export interface QueryCancellationStatus {
  /**
   * 查询是否正在运行
   */
  isRunning: boolean;

  /**
   * 查询是否已被取消
   */
  isCancelled: boolean;

  /**
   * 查询是否已完成
   */
  isCompleted: boolean;
}

/**
 * 获取查询取消状态
 *
 * 获取指定查询的取消状态信息。
 *
 * @param queryKey - 查询键
 * @returns 查询取消状态
 *
 * @example
 * ```typescript
 * import { useQueryCancellationStatus } from '@/queries/cancellation-utils';
 * import { queryKeys } from '@/queries/query-keys';
 *
 * const getStatus = useQueryCancellationStatus();
 *
 * const status = getStatus(queryKeys.posts.detail('123'));
 * console.log('Is running:', status.isRunning);
 * console.log('Is cancelled:', status.isCancelled);
 * console.log('Is completed:', status.isCompleted);
 * ```
 *
 * **Validates: Requirements 12.3**
 */
export function useQueryCancellationStatus() {
  const queryClient = useQueryClient();

  return (queryKey: QueryKey): QueryCancellationStatus => {
    const query = queryClient.getQueryState(queryKey);

    if (!query) {
      return {
        isRunning: false,
        isCancelled: false,
        isCompleted: false,
      };
    }

    return {
      isRunning: query.fetchStatus === 'fetching',
      isCancelled: query.fetchStatus === 'idle' && query.status === 'pending',
      isCompleted: query.fetchStatus === 'idle' && query.status === 'success',
    };
  };
}
