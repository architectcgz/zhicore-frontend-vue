/**
 * 删除评论 Mutation Hook（管理员）
 * 管理员删除评论
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 删除评论（管理员）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: deleteComment, isPending } = useAdminDeleteCommentMutation();
 * deleteComment('comment-id');
 * ```
 */
export function useAdminDeleteCommentMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (commentId: string) => adminApi.deleteComment(commentId),
    onSuccess: () => {
      // 使管理员评论列表和普通评论列表失效
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.comments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.all });
      ElMessage.success('评论删除成功');
    },
  });
}
