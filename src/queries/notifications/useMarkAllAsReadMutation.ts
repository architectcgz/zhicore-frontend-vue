/**
 * 标记所有通知为已读 Mutation Hook
 * 标记所有通知为已读，并更新缓存
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { notificationApi } from '@/api/notification';
import { queryKeys } from '../query-keys';

/**
 * 标记所有通知为已读
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: markAllAsRead, isPending } = useMarkAllAsReadMutation();
 * markAllAsRead();
 * ```
 */
export function useMarkAllAsReadMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      // 使所有通知相关查询失效
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      ElMessage.success('所有通知已标记为已读');
    },
  });
}
