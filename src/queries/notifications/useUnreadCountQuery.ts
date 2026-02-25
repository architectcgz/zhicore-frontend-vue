/**
 * 未读通知数量查询 Hook
 * 获取未读通知数量，支持实时轮询
 */

import { useQuery } from '@tanstack/vue-query';
import { notificationApi } from '@/api/notification';
import { queryKeys } from '../query-keys';

/**
 * 获取未读通知数量
 * 
 * @returns Query 结果，包含未读通知数量
 * 
 * @example
 * ```ts
 * const { data: unreadCount, isLoading } = useUnreadCountQuery();
 * ```
 */
export function useUnreadCountQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.count(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}
