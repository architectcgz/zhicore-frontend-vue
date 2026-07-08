import type { ApiCursorResp } from "@/types/api";

import { getAxiosInstance } from "./request";

export type NotificationCategoryResp =
  | "INTERACTION"
  | "CONTENT"
  | "SOCIAL"
  | "SYSTEM"
  | "SECURITY";

export interface ListNotificationsReq {
  cursor?: string;
  size?: number;
  category?: NotificationCategoryResp;
  unreadOnly?: boolean;
}

export interface NotificationGroupResp {
  groupKey: string;
  latestNotificationId?: string;
  type: string;
  category: NotificationCategoryResp;
  targetType: string;
  targetId: string;
  totalCount: number;
  unreadCount: number;
  latestTime: string;
  latestContent: string;
  recentActors?: unknown[];
  actorIds: string[];
  aggregatedContent: Record<string, unknown>;
}

export type ListNotificationsResp = ApiCursorResp<NotificationGroupResp>;

export interface NotificationUnreadCountResp {
  unreadCount: number;
}

export interface NotificationUnreadBreakdownResp {
  total: number;
  interaction: number;
  content: number;
  social: number;
  system: number;
  security: number;
}

export interface MarkAllNotificationsReadResp {
  readAll: true;
  readAt: string;
  affectedCount: number;
}

export async function listNotifications(
  input?: ListNotificationsReq,
): Promise<ListNotificationsResp> {
  const response = await getAxiosInstance().get<ListNotificationsResp>(
    "/v1/notifications",
    {
      params: input,
    },
  );

  return response.data;
}

export async function getNotificationUnreadCount(): Promise<NotificationUnreadCountResp> {
  const response = await getAxiosInstance().get<NotificationUnreadCountResp>(
    "/v1/notifications/unread-count",
  );

  return response.data;
}

export async function getNotificationUnreadBreakdown(): Promise<NotificationUnreadBreakdownResp> {
  const response =
    await getAxiosInstance().get<NotificationUnreadBreakdownResp>(
      "/v1/notifications/unread/breakdown",
    );

  return response.data;
}

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResp> {
  const response = await getAxiosInstance().post<MarkAllNotificationsReadResp>(
    "/v1/notifications/read-all",
  );

  return response.data;
}
