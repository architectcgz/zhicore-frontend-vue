/**
 * 删除文章 Mutation Hook（管理员）
 * 管理员删除文章
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 删除文章（管理员）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: deletePost, isPending } = useAdminDeletePostMutation();
 * deletePost('post-id');
 * ```
 */
export function useAdminDeletePostMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: string) => adminApi.deletePost(postId),
    onSuccess: () => {
      // 使管理员文章列表和普通文章列表失效
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      ElMessage.success('文章删除成功');
    },
  });
}
