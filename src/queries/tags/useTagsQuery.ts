/**
 * 标签列表查询 Hook
 * 获取标签列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi, type TagQueryParams } from '@/api/tag';
import { queryKeys } from '../query-keys';

/**
 * 获取标签列表
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含标签列表数据
 * 
 * @example
 * ```ts
 * const { data, isLoading, error } = useTagsQuery(ref({ page: 1, size: 20, sort: 'popular' }));
 * ```
 */
export function useTagsQuery(params?: Ref<TagQueryParams>) {
  return useQuery({
    queryKey: computed(() => queryKeys.tags.list(params?.value)),
    queryFn: () => tagApi.getTags(params?.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
