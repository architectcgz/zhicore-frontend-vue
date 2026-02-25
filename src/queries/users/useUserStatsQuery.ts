/**
 * 用户统计信息查询 Hook
 * 获取用户的统计数据（文章数、粉丝数等）
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { userApi } from '@/api/user';
import { queryKeys } from '../query-keys';

/**
 * 获取用户统计信息
 * 
 * @param userId 用户 ID
 * @returns Query 结果，包含用户统计信息
 * 
 * @example
 * ```ts
 * const { data: stats, isLoading } = useUserStatsQuery(ref('user-id'));
 * ```
 */
export function useUserStatsQuery(userId: Ref<string> | string) {
  const id = computed(() => typeof userId === 'string' ? userId : userId.value);
  
  return useQuery({
    queryKey: computed(() => [...queryKeys.users.detail(id.value), 'stats']),
    queryFn: () => userApi.getUserStats(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
