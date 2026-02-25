/**
 * 保存草稿 Mutation Hook
 * 
 * 用于保存新的草稿文章
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { postApi, type PostCreateRequest } from '@/api/post';
import { queryKeys } from '@/queries/query-keys';
import { ElMessage } from 'element-plus';

/**
 * 保存草稿 Mutation Hook
 * 
 * @returns Mutation 对象
 * 
 * @example
 * ```ts
 * const { mutate: saveDraft, isPending } = useSaveDraftMutation();
 * 
 * saveDraft({
 *   title: '草稿标题',
 *   content: '草稿内容',
 *   tags: ['tag1'],
 *   status: 'DRAFT'
 * });
 * ```
 */
export function useSaveDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: PostCreateRequest) => 
      postApi.saveDraft({
        ...postData,
        status: 'DRAFT',
      }),
    onSuccess: () => {
      // 使所有文章列表查询失效（包括草稿列表）
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.lists() });
      ElMessage.success('草稿保存成功');
    },
  });
}
