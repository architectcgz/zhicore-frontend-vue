/**
 * 通知相关 API 接口
 * 包含通知的获取、标记已读等功能
 */

import { httpClient } from '@/utils/request';
import type { 
  Notification, 
  PaginatedResponse 
} from '@/types';

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
 * 通知统计信息接口
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: {
    LIKE: number;
    COMMENT: number;
    FOLLOW: number;
    SYSTEM: number;
  };
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
    return httpClient.get<PaginatedResponse<Notification>>('/notifications', params);
  }

  /**
   * 根据 ID 获取通知详情
   * @param notificationId 通知 ID
   * @returns 通知详情
   */
  async getNotificationById(notificationId: string): Promise<Notification> {
    return httpClient.get<Notification>(`/notifications/${notificationId}`);
  }

  /**
   * 获取未读通知列表
   * @param params 查询参数
   * @returns 未读通知列表
   */
  async getUnreadNotifications(params?: Omit<NotificationQueryParams, 'isRead'>): Promise<PaginatedResponse<Notification>> {
    return httpClient.get<PaginatedResponse<Notification>>('/notifications/unread', params);
  }

  /**
   * 获取未读通知数量
   * @returns 未读通知数量
   */
  async getUnreadCount(): Promise<number> {
    const response = await httpClient.get<{ count: number }>('/notifications/unread/count');
    return response.count;
  }

  /**
   * 获取通知统计信息
   * @returns 通知统计信息
   */
  async getNotificationStats(): Promise<NotificationStats> {
    return httpClient.get<NotificationStats>('/notifications/stats');
  }

  /**
   * 标记通知为已读
   * @param notificationId 通知 ID
   * @returns 更新后的通知
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    return httpClient.post<Notification>(`/notifications/${notificationId}/read`);
  }

  /**
   * 标记通知为未读
   * @param notificationId 通知 ID
   * @returns 更新后的通知
   */
  async markAsUnread(notificationId: string): Promise<Notification> {
    return httpClient.post<Notification>(`/notifications/${notificationId}/unread`);
  }

  /**
   * 标记所有通知为已读
   * @returns 操作结果
   */
  async markAllAsRead(): Promise<{ count: number }> {
    return httpClient.post<{ count: number }>('/notifications/mark-all-read');
  }

  /**
   * 批量标记通知为已读
   * @param notificationIds 通知 ID 列表
   * @returns 操作结果
   */
  async batchMarkAsRead(notificationIds: string[]): Promise<{ count: number }> {
    return httpClient.post<{ count: number }>('/notifications/batch-read', { notificationIds });
  }

  /**
   * 删除通知
   * @param notificationId 通知 ID
   */
  async deleteNotification(notificationId: string): Promise<void> {
    return httpClient.delete<void>(`/notifications/${notificationId}`);
  }

  /**
   * 批量删除通知
   * @param notificationIds 通知 ID 列表
   * @returns 操作结果
   */
  async batchDeleteNotifications(notificationIds: string[]): Promise<{ count: number }> {
    return httpClient.post<{ count: number }>('/notifications/batch-delete', { notificationIds });
  }

  /**
   * 清空所有通知
   * @returns 操作结果
   */
  async clearAllNotifications(): Promise<{ count: number }> {
    return httpClient.post<{ count: number }>('/notifications/clear-all');
  }

  /**
   * 获取通知设置
   * @returns 通知设置
   */
  async getNotificationSettings(): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    likeNotifications: boolean;
    commentNotifications: boolean;
    followNotifications: boolean;
    systemNotifications: boolean;
  }> {
    return httpClient.get('/notifications/settings');
  }

  /**
   * 更新通知设置
   * @param settings 通知设置
   * @returns 更新后的设置
   */
  async updateNotificationSettings(settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    likeNotifications?: boolean;
    commentNotifications?: boolean;
    followNotifications?: boolean;
    systemNotifications?: boolean;
  }): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
    likeNotifications: boolean;
    commentNotifications: boolean;
    followNotifications: boolean;
    systemNotifications: boolean;
  }> {
    return httpClient.put('/notifications/settings', settings);
  }

  /**
   * 获取最近通知（用于下拉菜单）
   * @param limit 数量限制
   * @returns 最近通知列表
   */
  async getRecentNotifications(limit: number = 10): Promise<Notification[]> {
    return httpClient.get<Notification[]>('/notifications/recent', { limit });
  }

  /**
   * 订阅通知（WebSocket 相关）
   * @param types 订阅的通知类型
   */
  async subscribeNotifications(types: string[]): Promise<void> {
    return httpClient.post<void>('/notifications/subscribe', { types });
  }

  /**
   * 取消订阅通知
   * @param types 取消订阅的通知类型
   */
  async unsubscribeNotifications(types: string[]): Promise<void> {
    return httpClient.post<void>('/notifications/unsubscribe', { types });
  }
}

// 创建 API 实例
export const notificationApi = new NotificationApi();