/**
 * 用户信息查询 Hook
 * 获取用户详细信息
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { userApi } from '@/api/user';
import { queryKeys } from '../query-keys';

/**
 * 获取用户信息
 * 
 * @param userId 用户 ID
 * @returns Query 结果，包含用户信息
 * 
 * @example
 * ```ts
 * const { data: user, isLoading, error } = useUserQuery(ref('user-id'));
 * ```
 */
export function useUserQuery(userId: Ref<string> | string) {
  const id = computed(() => typeof userId === 'string' ? userId : userId.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.users.detail(id.value)),
    queryFn: () => userApi.getUserById(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
