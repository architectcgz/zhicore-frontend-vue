/**
 * 标签详情查询 Hook
 * 获取单个标签的详细信息
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi } from '@/api/tag';
import { CACHE_TIMES } from '../query-config';
import { queryKeys } from '../query-keys';

/**
 * 获取标签详情
 *
 * @param tagSlug 标签 slug
 * @returns Query 结果，包含标签详情
 *
 * @example
 * ```ts
 * const { data: tag, isLoading, error } = useTagQuery(ref('frontend'));
 * ```
 */
export function useTagQuery(tagSlug: Ref<string> | string) {
  const slug = computed(() => typeof tagSlug === 'string' ? tagSlug : tagSlug.value);

  return useQuery({
    queryKey: computed(() => queryKeys.tags.bySlug(slug.value)),
    queryFn: () => tagApi.getTagBySlug(slug.value),
    enabled: computed(() => !!slug.value),
    ...CACHE_TIMES.TAG_INFO,
  });
}
