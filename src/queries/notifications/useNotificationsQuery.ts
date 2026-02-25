/**
 * 通知查询 Hook
 * 获取通知列表，支持实时轮询
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { notificationApi, type NotificationQueryParams } from '@/api/notification';
import { queryKeys } from '../query-keys';

/**
 * 获取通知列表
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含通知列表数据
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useNotificationsQuery(ref({ page: 1, size: 20 }));
 * ```
 */
export function useNotificationsQuery(params?: Ref<NotificationQueryParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.notifications.list(params?.value)),
    queryFn: () => notificationApi.getNotifications(params?.value),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // 30 seconds for real-time updates
  });
}
