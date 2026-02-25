/**
 * 用户粉丝列表查询 Hook
 * 获取指定用户的粉丝列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { userApi } from '@/api/user';
import { queryKeys } from '../query-keys';

/**
 * 获取用户粉丝列表
 * 
 * @param userId 用户 ID
 * @param params 查询参数（可选）
 * @returns Query 结果，包含粉丝列表
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useUserFollowersQuery(
 *   ref('user-id'),
 *   ref({ page: 1, size: 20 })
 * );
 * ```
 */
export function useUserFollowersQuery(
  userId: Ref<string> | string,
  params?: Ref<{ page?: number; size?: number }>
) {
  const id = computed(() => typeof userId === 'string' ? userId : userId.value);
  
  return useQuery({
    queryKey: computed(() => [...queryKeys.users.detail(id.value), 'followers', params?.value]),
    queryFn: () => userApi.getUserFollowers(id.value, params?.value),
    enabled: computed(() => !!id.value),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
