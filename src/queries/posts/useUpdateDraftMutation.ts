/**
 * 更新草稿 Mutation Hook
 * 
 * 用于更新已存在的草稿文章
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { postApi, type PostCreateRequest } from '@/api/post';
import { queryKeys } from '@/queries/query-keys';
import { ElMessage } from 'element-plus';

export interface UpdateDraftParams {
  draftId: string;
  postData: Partial<PostCreateRequest>;
}

/**
 * 更新草稿 Mutation Hook
 * 
 * @returns Mutation 对象
 * 
 * @example
 * ```ts
 * const { mutate: updateDraft, isPending } = useUpdateDraftMutation();
 * 
 * updateDraft({
 *   draftId: 'draft-123',
 *   postData: {
 *     title: '更新的标题',
 *     content: '更新的内容'
 *   }
 * });
 * ```
 */
export function useUpdateDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draftId, postData }: UpdateDraftParams) =>
      postApi.updateDraft(draftId, postData),
    onSuccess: (updatedDraft) => {
      // 更新缓存中的文章详情
      queryClient.setQueryData(
        queryKeys.posts.detail(updatedDraft.id),
        updatedDraft
      );

      // 使文章列表查询失效
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });

      ElMessage.success('草稿更新成功');
    },
  });
}
