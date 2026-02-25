/**
 * 标记通知为已读 Mutation Hook
 * 标记单个通知为已读，并更新缓存
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { notificationApi } from '@/api/notification';
import { queryKeys } from '../query-keys';

/**
 * 标记通知为已读
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: markAsRead, isPending } = useMarkAsReadMutation();
 * markAsRead(notificationId);
 * ```
 */
export function useMarkAsReadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      // 使所有通知相关查询失效
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
