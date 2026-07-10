import type { ApiCursorResp } from "@/types/api";
import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { getAxiosInstance } from "./request";

export type NotificationCategoryResp =
  "INTERACTION" | "CONTENT" | "SOCIAL" | "SYSTEM" | "SECURITY";

export interface ListNotificationsReq {
  cursor?: string;
  size?: number;
  category?: NotificationCategoryResp;
  unreadOnly?: boolean;
}

export interface NotificationGroupResp {
  groupId: string;
  type: string;
  category: NotificationCategoryResp;
  totalCount: number;
  unreadCount: number;
  actorTotalCount: number;
  latestOccurredAt: string;
  content: { title: string; body: string };
  recentActors: Array<{
    publicId: string;
    displayName: string;
    avatarUrl?: string | null;
  }>;
  target?: {
    resource: { type: string; id: string };
    anchor?: { type: string; id: string };
    snapshot: Record<string, unknown>;
  } | null;
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

export interface MarkNotificationReadResp {
  notificationId: string;
  read: true;
  readAt: string;
}

export interface MarkNotificationGroupReadResp {
  groupId: string;
  read: true;
  changedCount: number;
  unreadCount: number;
  readAt: string;
}

export interface ListNotificationGroupActorsReq {
  cursor?: string;
  size?: number;
}
export interface NotificationGroupActorResp {
  actor: { publicId: string; displayName: string; avatarUrl: string | null };
  eventCount: number;
  latestOccurredAt: string;
}
export type ListNotificationGroupActorsResp =
  ApiCursorResp<NotificationGroupActorResp>;

const localDemoNotifications: NotificationGroupResp[] = [
  {
    groupId: "ng_local_like_post_design_ia",
    type: "POST_LIKED",
    category: "INTERACTION",
    totalCount: 3,
    unreadCount: 2,
    actorTotalCount: 3,
    latestOccurredAt: "2026-07-07T08:00:00.000Z",
    content: { title: "新的互动", body: "陈立等 3 人赞了你的文章" },
    recentActors: [
      { publicId: "user_liam_chen", displayName: "陈立" },
      { publicId: "user_yuxi_wang", displayName: "王雨溪" },
      { publicId: "user_mei_lin", displayName: "林美" },
    ],
    target: {
      resource: { type: "POST", id: "post-design-ia" },
      snapshot: { title: "信息架构的边界" },
    },
  },
  {
    groupId: "ng_local_post_component_library",
    type: "POST_PUBLISHED",
    category: "CONTENT",
    totalCount: 1,
    unreadCount: 1,
    actorTotalCount: 1,
    latestOccurredAt: "2026-07-07T07:30:00.000Z",
    content: {
      title: "组件库的边界：设计系统的可维护实践",
      body: "你关注的作者发布了新文章",
    },
    recentActors: [{ publicId: "user_ethan_park", displayName: "朴以森" }],
    target: {
      resource: { type: "POST", id: "post-component-library" },
      snapshot: { title: "组件库的边界：设计系统的可维护实践" },
    },
  },
  {
    groupId: "ng_local_system_welcome",
    type: "WELCOME",
    category: "SYSTEM",
    totalCount: 1,
    unreadCount: 0,
    actorTotalCount: 0,
    latestOccurredAt: "2026-07-06T09:00:00.000Z",
    content: { title: "欢迎使用 ZhiCore", body: "欢迎使用 ZhiCore" },
    recentActors: [],
    target: null,
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

// 单条已读：契约 POST /v1/notifications/{notificationId}/read，幂等。
// path 段需转义，防止 notificationId 中的特殊字符破坏 URL 结构。
export async function markNotificationRead(
  notificationId: string,
): Promise<MarkNotificationReadResp> {
  if (isLocalDemoModeEnabled()) {
    return {
      notificationId,
      read: true,
      readAt: new Date(0).toISOString(),
    };
  }

  const response = await getAxiosInstance().post<MarkNotificationReadResp>(
    `/v1/notifications/${encodeURIComponent(notificationId)}/read`,
  );

  return response.data;
}

export async function markNotificationGroupRead(
  groupId: string,
): Promise<MarkNotificationGroupReadResp> {
  if (isLocalDemoModeEnabled()) {
    const item = localDemoNotifications.find(
      (candidate) => candidate.groupId === groupId,
    );
    const changedCount = item?.unreadCount ?? 0;
    return {
      groupId,
      read: true,
      changedCount,
      unreadCount: 0,
      readAt: new Date(0).toISOString(),
    };
  }
  const response = await getAxiosInstance().post<MarkNotificationGroupReadResp>(
    `/v1/notification-groups/${encodeURIComponent(groupId)}/read`,
  );
  return response.data;
}

export async function listNotificationGroupActors(
  groupId: string,
  input?: ListNotificationGroupActorsReq,
): Promise<ListNotificationGroupActorsResp> {
  if (isLocalDemoModeEnabled()) {
    const item = localDemoNotifications.find(
      (candidate) => candidate.groupId === groupId,
    );
    const actors = (item?.recentActors ?? []).map((actor) => {
      return {
        actor: {
          publicId: actor.publicId,
          displayName: actor.displayName,
          avatarUrl: actor.avatarUrl ?? null,
        },
        eventCount: 1,
        latestOccurredAt: item?.latestOccurredAt ?? new Date(0).toISOString(),
      };
    });
    return { items: actors, hasMore: false };
  }
  const response =
    await getAxiosInstance().get<ListNotificationGroupActorsResp>(
      `/v1/notification-groups/${encodeURIComponent(groupId)}/actors`,
      { params: input },
    );
  return response.data;
}
