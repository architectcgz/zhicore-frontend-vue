/**
 * 通知相关 API 接口
 * 当前仅封装聚合通知列表、未读数与全部已读能力
 */

import { httpClient } from '@/utils/request';
import { mapAggregatedNotificationRecord, type AggregatedNotificationRecord } from '@/utils/notification';
import type { 
  Notification, 
  PaginatedResponse 
} from '@/types';

interface BackendNotificationPage<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
  hasNext: boolean;
}

function toBackendQueryParams(params?: NotificationQueryParams): Pick<NotificationQueryParams, 'page' | 'size'> {
  return {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
  };
}

export function buildNotificationPage(
  response: BackendNotificationPage<AggregatedNotificationRecord>,
): PaginatedResponse<Notification> {
  return {
    items: response.records.map(mapAggregatedNotificationRecord),
    total: response.total,
    page: response.current,
    size: response.size,
    hasMore: response.hasNext,
  };
}

/**
 * 通知查询参数接口
 */
export interface NotificationQueryParams {
  page?: number;
  size?: number;
  type?: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  isRead?: boolean;
  sort?: 'latest' | 'oldest';
}

/**
 * 通知 API 服务类
 */
export class NotificationApi {
  /**
   * 获取通知列表
   * @param params 查询参数
   * @returns 分页通知列表
   */
  async getNotifications(params?: NotificationQueryParams): Promise<PaginatedResponse<Notification>> {
    const response = await httpClient.get<BackendNotificationPage<AggregatedNotificationRecord>>(
      '/notifications',
      toBackendQueryParams(params),
    );
    return buildNotificationPage(response);
  }

  /**
   * 获取未读通知数量
   * @returns 未读通知数量
   */
  async getUnreadCount(): Promise<number> {
    return httpClient.get<number>('/notifications/unread/count');
  }

  /**
   * 标记所有通知为已读
   * @returns 操作结果
   */
  async markAllAsRead(): Promise<void> {
    return httpClient.post<void>('/notifications/mark-all-read');
  }

  /**
   * 获取最近通知（用于下拉菜单）
   * @param limit 数量限制
   * @returns 最近通知列表
   */
  async getRecentNotifications(limit: number = 10): Promise<Notification[]> {
    const response = await this.getNotifications({ page: 0, size: limit });
    return response.items;
  }

}

// 创建 API 实例
export const notificationApi = new NotificationApi();
