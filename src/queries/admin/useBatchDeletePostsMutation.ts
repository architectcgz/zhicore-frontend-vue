/**
 * 批量删除文章 Mutation Hook（管理员）
 * 管理员批量删除文章
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 批量删除文章（管理员）
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: batchDeletePosts, isPending } = useBatchDeletePostsMutation();
 * batchDeletePosts(['post-id-1', 'post-id-2']);
 * ```
 */
export function useBatchDeletePostsMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postIds: string[]) => adminApi.batchDeletePosts(postIds),
    onSuccess: () => {
      // 使管理员文章列表和普通文章列表失效
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
      ElMessage.success('批量删除成功');
    },
  });
}
