/**
 * 管理员评论列表查询 Hook
 * 获取评论列表（管理员视图）
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { adminApi, type PageParams } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 获取评论列表（管理员）
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含评论列表
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useAdminCommentsQuery(ref({ page: 1, size: 20 }));
 * ```
 */
export function useAdminCommentsQuery(params?: Ref<PageParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.admin.comments.list(params?.value)),
    queryFn: () => adminApi.getComments(params?.value || {}),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
