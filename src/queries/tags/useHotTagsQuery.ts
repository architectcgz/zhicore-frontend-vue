/**
 * 热门标签查询 Hook
 * 获取热门标签列表
 */

import { useQuery } from '@tanstack/vue-query';
import { computed, type Ref } from 'vue';
import { tagApi } from '@/api/tag';
import { CACHE_TIMES } from '../query-config';
import { queryKeys } from '../query-keys';

/**
 * 获取热门标签
 * 
 * @param params 查询参数（可选）
 * @returns Query 结果，包含热门标签列表
 * 
 * @example
 * ```ts
 * const { data: hotTags, isLoading } = useHotTagsQuery(ref({ limit: 10 }));
 * ```
 */
export function useHotTagsQuery(params?: Ref<{ limit?: number }> | { limit?: number }) {
  const queryParams = computed(() => {
    if (!params) {
      return undefined;
    }

    return typeof params === 'object' && 'value' in params ? params.value : params;
  });

  return useQuery({
    queryKey: computed(() => queryKeys.tags.hot(queryParams.value?.limit)),
    queryFn: () => tagApi.getHotTags({ limit: queryParams.value?.limit }),
    ...CACHE_TIMES.TAG_INFO,
  });
}
