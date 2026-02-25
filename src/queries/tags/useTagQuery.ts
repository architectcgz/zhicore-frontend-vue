/**
 * 标签详情查询 Hook
 * 获取单个标签的详细信息
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi } from '@/api/tag';
import { queryKeys } from '../query-keys';

/**
 * 获取标签详情
 * 
 * @param tagId 标签 ID
 * @returns Query 结果，包含标签详情
 * 
 * @example
 * ```ts
 * const { data: tag, isLoading, error } = useTagQuery(ref('tag-id'));
 * ```
 */
export function useTagQuery(tagId: Ref<string> | string) {
  const id = computed(() => typeof tagId === 'string' ? tagId : tagId.value);
  
  return useQuery({
    queryKey: computed(() => queryKeys.tags.detail(id.value)),
    queryFn: () => tagApi.getTagById(id.value),
    enabled: computed(() => !!id.value),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
