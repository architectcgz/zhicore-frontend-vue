/**
 * 批量删除评论 Mutation Hook（管理员）
 * 管理员批量删除评论
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 批量删除评论（管理员）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: batchDeleteComments, isPending } = useBatchDeleteCommentsMutation();
 * batchDeleteComments(['comment-id-1', 'comment-id-2']);
 * ```
 */
export function useBatchDeleteCommentsMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentIds: string[]) => adminApi.batchDeleteComments(commentIds),
    onSuccess: () => {
      // 使管理员评论列表和普通评论列表失效
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      ElMessage.success('批量删除成功');
    },
  });
}
