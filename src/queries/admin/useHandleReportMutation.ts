/**
 * 处理举报 Mutation Hook
 * 管理员处理用户举报
 */

import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ElMessage } from 'element-plus';
import { adminApi } from '@/api/admin';
import { queryKeys } from '../query-keys';

/**
 * 处理举报
 * 
 * @returns Mutation 结果
 * 
 * @example
 * ```ts
 * const { mutate: handleReport, isPending } = useHandleReportMutation();
 * handleReport({
 *   reportId: 'report-id',
 *   action: 'resolve',
 *   reason: '违规内容已删除'
 * });
 * ```
 */
export function useHandleReportMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      reportId, 
      action, 
      reason 
    }: { 
      reportId: string; 
      action: 'resolve' | 'reject'; 
      reason?: string;
    }) => adminApi.handleReport(reportId, action, reason),
    onSuccess: () => {
      // 使举报列表失效
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports.all() });
      ElMessage.success('举报处理成功');
    },
  });
}
