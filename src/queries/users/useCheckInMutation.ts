/**
 * 用户签到 Mutation Hook
 * 执行每日签到操作
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { userApi } from '@/api/user';
import { queryKeys } from '../query-keys';

/**
 * 用户签到
 * 
 * @returns Mutation 结果，包含签到信息
 * 
 * @example
 * ```ts
 * const { mutate: checkIn, isPending, data } = useCheckInMutation();
 * checkIn('user-id');
 * ```
 */
export function useCheckInMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => userApi.checkIn(userId),
    onSuccess: (checkInInfo, userId) => {
      // 使用户统计信息失效
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.users.detail(userId), 'stats'] 
      });
      
      // 使签到统计失效
      queryClient.invalidateQueries({ 
        queryKey: [...queryKeys.users.detail(userId), 'check-in'] 
      });
      
      ElMessage.success(
        `签到成功！连续签到 ${checkInInfo.consecutiveDays} 天，获得 ${checkInInfo.todayReward} 积分`
      );
    },
  });
}
