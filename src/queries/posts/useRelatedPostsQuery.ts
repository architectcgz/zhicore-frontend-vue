/**
 * useRelatedPostsQuery Hook
 *
 * 用于获取相关文章列表的 Query Hook。
 * 配置 10 分钟的 staleTime。
 *
 * @module queries/posts/useRelatedPostsQuery
 */

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { postApi } from '@/api/post';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';
import type { Post } from '@/types';

/**
 * 相关文章查询参数
 */
export interface RelatedPostsParams {
  size?: number;
}

/**
 * 获取相关文章列表
 *
 * @param postId - 文章 ID
 * @param params - 查询参数（可选）
 * @returns Query 结果，包含相关文章数据和状态
 *
 * @example
 * ```typescript
 * // 使用字符串 ID
 * const { data: relatedPosts, isLoading } = useRelatedPostsQuery('123');
 *
 * // 使用 Ref ID
 * const postId = ref('123');
 * const { data: relatedPosts } = useRelatedPostsQuery(postId);
 *
 * // 使用自定义参数
 * const { data: relatedPosts } = useRelatedPostsQuery('123', { size: 5 });
 * ```
 *
 * **Validates: Requirements 3.6**
 */
export function useRelatedPostsQuery(
  postId: Ref<string> | string,
  params?: Ref<RelatedPostsParams> | RelatedPostsParams
) {
  // 将 postId 转换为 computed
  const id = computed(() => (typeof postId === 'string' ? postId : postId.value));

  // 将 params 转换为 computed
  const queryParams = computed(() => {
    if (!params) return undefined;
    return typeof params === 'object' && 'value' in params ? params.value : params;
  });

  return useQuery<Post[]>({
    // 使用 related key，包含 postId
    queryKey: computed(() => queryKeys.posts.related(id.value)),
    // 查询函数
    queryFn: () => postApi.getRelatedPosts(id.value, queryParams.value),
    // 只有当 postId 存在时才启用查询
    enabled: computed(() => !!id.value),
    // 使用统一的标签信息缓存配置（相关文章更新频率较低）
    ...CACHE_TIMES.TAG_INFO,
  });
}
