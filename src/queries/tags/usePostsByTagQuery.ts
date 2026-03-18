/**
 * 标签文章列表查询 Hook
 * 获取指定标签下的文章列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi } from '@/api/tag';
import { CACHE_TIMES } from '../query-config';
import { queryKeys } from '../query-keys';

/**
 * 根据标签获取文章列表
 *
 * @param tagSlug 标签 slug
 * @param params 查询参数（可选）
 * @returns Query 结果，包含文章列表
 *
 * @example
 * ```ts
 * const { data, isLoading } = usePostsByTagQuery(
 *   ref('frontend'),
 *   ref({ page: 0, size: 20 })
 * );
 * ```
 */
export function usePostsByTagQuery(
  tagSlug: Ref<string> | string,
  params?: Ref<{ page?: number; size?: number } | undefined> | { page?: number; size?: number }
) {
  const slug = computed(() => typeof tagSlug === 'string' ? tagSlug : tagSlug.value);
  const queryParams = computed(() => {
    if (!params) {
      return undefined;
    }

    return typeof params === 'object' && 'value' in params ? params.value : params;
  });

  return useQuery({
    queryKey: computed(() => queryKeys.tags.posts(slug.value, queryParams.value)),
    queryFn: () => tagApi.getPostsByTagSlug(slug.value, queryParams.value),
    enabled: computed(() => !!slug.value),
    ...CACHE_TIMES.POST_LIST,
  });
}
