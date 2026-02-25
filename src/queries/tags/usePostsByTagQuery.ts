/**
 * 标签文章列表查询 Hook
 * 获取指定标签下的文章列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi } from '@/api/tag';
import { queryKeys } from '../query-keys';

/**
 * 根据标签获取文章列表
 * 
 * @param tagId 标签 ID
 * @param params 查询参数（可选）
 * @returns Query 结果，包含文章列表
 * 
 * @example
 * ```ts
 * const { data, isLoading } = usePostsByTagQuery(
 *   ref('tag-id'),
 *   ref({ page: 1, size: 20, sort: 'latest' })
 * );
 * ```
 */
export function usePostsByTagQuery(
  tagId: Ref<string> | string,
  params?: Ref<{ page?: number; size?: number; sort?: 'latest' | 'popular' | 'hot' }>
) {
  const id = computed(() => typeof tagId === 'string' ? tagId : tagId.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.tags.posts(id.value, params?.value)),
    queryFn: () => tagApi.getPostsByTag(id.value, params?.value),
    enabled: computed(() => !!id.value),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
