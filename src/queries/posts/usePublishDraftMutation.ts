/**
 * 发布草稿 Mutation Hook
 * 
 * 用于将草稿文章发布为正式文章
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { postApi } from '@/api/post';
import { queryKeys } from '@/queries/query-keys';
import { ElMessage } from 'element-plus';

/**
 * 发布草稿 Mutation Hook
 * 
 * @returns Mutation 对象
 * 
 * @example
 * ```ts
 * const { mutate: publishDraft, isPending } = usePublishDraftMutation();
 * 
 * publishDraft('draft-123');
 * ```
 */
export function usePublishDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => postApi.publishDraft(draftId),
    onSuccess: (publishedPost) => {
      // 更新缓存中的文章详情
      queryClient.setQueryData(
        queryKeys.posts.detail(publishedPost.id),
        publishedPost
      );

      // 使文章列表查询失效（草稿列表和已发布列表都需要更新）
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });

      ElMessage.success('文章发布成功');
    },
  });
}
