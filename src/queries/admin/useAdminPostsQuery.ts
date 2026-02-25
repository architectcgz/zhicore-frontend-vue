/**
 * 管理员文章列表查询 Hook
 * 获取文章列表（管理员视图）
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { adminApi, type PageParams } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 获取文章列表（管理员）
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含文章列表
 * 
 * @example
 * ```ts
 * const { data, isLoading } = useAdminPostsQuery(ref({ page: 1, size: 20, status: 'PUBLISHED' }));
 * ```
 */
export function useAdminPostsQuery(params?: Ref<PageParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.admin.posts.list(params?.value)),
    queryFn: () => adminApi.getPosts(params?.value || {}),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
