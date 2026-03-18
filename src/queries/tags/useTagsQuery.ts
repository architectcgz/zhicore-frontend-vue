/**
 * 标签列表查询 Hook
 * 获取标签列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi, type TagQueryParams } from '@/api/tag';
import type { PaginatedResponse, Tag } from '@/types';
import { CACHE_TIMES } from '../query-config';
import { queryKeys } from '../query-keys';

function normalizeSearchResult(tags: Tag[], pageSize: number): PaginatedResponse<Tag> {
  return {
    items: tags,
    total: tags.length,
    page: 0,
    size: pageSize,
    hasMore: false,
  };
}

/**
 * 获取标签列表
 *
 * @param params 查询参数（可选）
 * @returns Query 结果，包含标签列表数据
 *
 * @example
 * ```ts
 * const { data, isLoading, error } = useTagsQuery(ref({ page: 0, size: 20, keyword: 'front' }));
 * ```
 */
export function useTagsQuery(params?: Ref<TagQueryParams | undefined> | TagQueryParams) {
  const queryParams = computed(() => {
    if (!params) {
      return undefined;
    }

    return typeof params === 'object' && 'value' in params ? params.value : params;
  });
  const keyword = computed(() => queryParams.value?.keyword?.trim() || undefined);

  return useQuery({
    queryKey: computed(() => queryKeys.tags.list({
      page: queryParams.value?.page,
      size: queryParams.value?.size,
      keyword: keyword.value,
    })),
    queryFn: async () => {
      const size = queryParams.value?.size ?? 20;

      if (keyword.value) {
        const tags = await tagApi.searchTags(keyword.value, { limit: size });
        return normalizeSearchResult(tags, size);
      }

      return tagApi.getTags({
        page: queryParams.value?.page,
        size,
      });
    },
    ...CACHE_TIMES.TAG_INFO,
  });
}
