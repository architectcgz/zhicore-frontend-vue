/**
 * usePostQuery Hook
 *
 * 用于获取单个文章详情的 Query Hook。
 * 支持 Ref 和普通 string 参数，配置 5 分钟的 staleTime。
 *
 * @module queries/posts/usePostQuery
 */

import { computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { Ref } from 'vue';
import { postApi } from '@/api/post';
import { queryKeys } from '../query-keys';
import { CACHE_TIMES } from '../query-config';
import type { Post } from '@/types';

/**
 * 获取单个文章详情
 *
 * @param postId - 文章 ID（支持 Ref 或普通 string）
 * @returns Query 结果，包含 data, isLoading, error 等状态
 *
 * @example
 * ```typescript
 * // 使用普通 string
 * const { data: post, isLoading } = usePostQuery('post-123');
 *
 * // 使用 Ref
 * const postId = ref('post-123');
 * const { data: post, isLoading } = usePostQuery(postId);
 * ```
 *
 * **Validates: Requirements 3.1, 3.7**
 */
export function usePostQuery(postId: Ref<string | undefined> | string | undefined) {
  // 将 postId 转换为 computed，统一处理 Ref 和普通 string
  const id = computed(() => (typeof postId === 'string' ? postId : postId?.value));

  return useQuery<Post>({
    // 使用 computed 确保 queryKey 响应式更新
    queryKey: computed(() => queryKeys.posts.detail(id.value || '')),
    // 查询函数
    queryFn: () => postApi.getPostById(id.value as string),
    // 仅在 ID 存在时启用查询
    enabled: computed(() => !!id.value),
    // 使用统一的文章内容缓存配置
    ...CACHE_TIMES.POST_CONTENT,
  });
}
