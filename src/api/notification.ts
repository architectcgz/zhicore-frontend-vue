import type { ApiCursorResp } from "@/types/api";
import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

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

const localDemoNotifications: NotificationGroupResp[] = [
  {
    groupKey: "local-demo:INTERACTION:POST_LIKED:POST:post-design-ia",
    latestNotificationId: "local-demo-notification-like-1",
    type: "POST_LIKED",
    category: "INTERACTION",
    targetType: "POST",
    targetId: "post-design-ia",
    totalCount: 3,
    unreadCount: 2,
    latestTime: "2026-07-07T08:00:00.000Z",
    latestContent: "陈立等 3 人赞了你的文章",
    actorIds: ["user_liam_chen", "user_yuxi_wang"],
    aggregatedContent: {
      title: "新的互动",
      summary: "你的信息架构文章获得了新的点赞。",
    },
  },
  {
    groupKey: "local-demo:CONTENT:POST_PUBLISHED:POST:post-component-library",
    latestNotificationId: "local-demo-notification-content-1",
    type: "POST_PUBLISHED",
    category: "CONTENT",
    targetType: "POST",
    targetId: "post-component-library",
    totalCount: 1,
    unreadCount: 1,
    latestTime: "2026-07-07T07:30:00.000Z",
    latestContent: "你关注的作者发布了新文章",
    actorIds: ["user_ethan_park"],
    aggregatedContent: {
      title: "组件库的边界：设计系统的可维护实践",
    },
  },
  {
    groupKey: "local-demo:SYSTEM:WELCOME:USER:local-demo-user",
    latestNotificationId: "local-demo-notification-system-1",
    type: "WELCOME",
    category: "SYSTEM",
    targetType: "USER",
    targetId: "local-demo-user",
    totalCount: 1,
    unreadCount: 0,
    latestTime: "2026-07-06T09:00:00.000Z",
    latestContent: "欢迎使用 ZhiCore",
    actorIds: [],
    aggregatedContent: {
      title: "欢迎使用 ZhiCore",
    },
  },
];

function cloneDto<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function localDemoNotificationItems(
  input: ListNotificationsReq = {},
): NotificationGroupResp[] {
  const filtered = localDemoNotifications.filter((item) => {
    if (input.category && item.category !== input.category) {
      return false;
    }
    if (input.unreadOnly && item.unreadCount <= 0) {
      return false;
    }
    return true;
  });
  const start = input.cursor ? Number.parseInt(input.cursor, 10) || 0 : 0;
  const size = Math.min(Math.max(input.size ?? 20, 1), 50);

  return filtered.slice(start, start + size);
}

function localDemoUnreadBreakdown(): NotificationUnreadBreakdownResp {
  const breakdown: NotificationUnreadBreakdownResp = {
    total: 0,
    interaction: 0,
    content: 0,
    social: 0,
    system: 0,
    security: 0,
  };

  for (const item of localDemoNotifications) {
    breakdown.total += item.unreadCount;
    switch (item.category) {
      case "INTERACTION":
        breakdown.interaction += item.unreadCount;
        break;
      case "CONTENT":
        breakdown.content += item.unreadCount;
        break;
      case "SOCIAL":
        breakdown.social += item.unreadCount;
        break;
      case "SYSTEM":
        breakdown.system += item.unreadCount;
        break;
      case "SECURITY":
        breakdown.security += item.unreadCount;
        break;
    }
  }

  return breakdown;
}

export async function listNotifications(
  input?: ListNotificationsReq,
): Promise<ListNotificationsResp> {
  if (isLocalDemoModeEnabled()) {
    const params = input ?? {};
    const items = localDemoNotificationItems(params);
    const start = params.cursor ? Number.parseInt(params.cursor, 10) || 0 : 0;
    const size = Math.min(Math.max(params.size ?? 20, 1), 50);
    const filteredTotal = localDemoNotifications.filter((item) => {
      if (params.category && item.category !== params.category) {
        return false;
      }
      if (params.unreadOnly && item.unreadCount <= 0) {
        return false;
      }
      return true;
    }).length;
    const nextOffset = start + size;

    return {
      items: cloneDto(items),
      hasMore: nextOffset < filteredTotal,
      ...(nextOffset < filteredTotal ? { nextCursor: String(nextOffset) } : {}),
    };
  }

  const response = await getAxiosInstance().get<ListNotificationsResp>(
    "/v1/notifications",
    {
      params: input,
    },
  );

  return response.data;
}

export async function getNotificationUnreadCount(): Promise<NotificationUnreadCountResp> {
  if (isLocalDemoModeEnabled()) {
    return { unreadCount: localDemoUnreadBreakdown().total };
  }

  const response = await getAxiosInstance().get<NotificationUnreadCountResp>(
    "/v1/notifications/unread-count",
  );

  return response.data;
}

export async function getNotificationUnreadBreakdown(): Promise<NotificationUnreadBreakdownResp> {
  if (isLocalDemoModeEnabled()) {
    return localDemoUnreadBreakdown();
  }

  const response =
    await getAxiosInstance().get<NotificationUnreadBreakdownResp>(
      "/v1/notifications/unread/breakdown",
    );

  return response.data;
}

export async function markAllNotificationsRead(): Promise<MarkAllNotificationsReadResp> {
  if (isLocalDemoModeEnabled()) {
    return {
      readAll: true,
      readAt: new Date(0).toISOString(),
      affectedCount: localDemoUnreadBreakdown().total,
    };
  }

  const response = await getAxiosInstance().post<MarkAllNotificationsReadResp>(
    "/v1/notifications/read-all",
  );

  return response.data;
}
