import type {
  NotificationCategoryResp,
  NotificationGroupResp,
  NotificationUnreadBreakdownResp,
} from "@/api/notification";

import type {
  NotificationCenterBreakdown,
  NotificationCenterCategory,
  NotificationCenterItem,
  NotificationCenterType,
} from "../types";

const categoryToApi: Partial<
  Record<NotificationCenterCategory, NotificationCategoryResp>
> = {
  interaction: "INTERACTION",
  content: "CONTENT",
  social: "SOCIAL",
  system: "SYSTEM",
  security: "SECURITY",
};

const categoryFromApi: Record<NotificationCategoryResp, NotificationCenterType> =
  {
    INTERACTION: "interaction",
    CONTENT: "content",
    SOCIAL: "social",
    SYSTEM: "system",
    SECURITY: "security",
  };

const fallbackTitleByCategory: Record<NotificationCenterType, string> = {
  interaction: "新的互动",
  content: "内容通知",
  social: "社交通知",
  system: "系统通知",
  security: "安全通知",
};

export function mapNotificationCategoryToApi(
  category: NotificationCenterCategory,
): NotificationCategoryResp | undefined {
  return categoryToApi[category];
}

export function mapNotificationBreakdown(
  response: NotificationUnreadBreakdownResp,
): NotificationCenterBreakdown {
  return {
    total: response.total,
    interaction: response.interaction,
    content: response.content,
    social: response.social,
    system: response.system,
    security: response.security,
  };
}

function readStringField(
  source: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = source[key];

  return typeof value === "string" && value.trim() ? value : undefined;
}

function resolveTitle(item: NotificationGroupResp): string {
  const snapshotTitle =
    readStringField(item.aggregatedContent, "title") ||
    readStringField(item.aggregatedContent, "subject");

  return snapshotTitle || fallbackTitleByCategory[categoryFromApi[item.category]];
}

function resolveTargetPath(item: NotificationGroupResp): string | null {
  void item;
  // targetId 当前是后端内部目标标识，不等同于前端可路由的公开 post id。
  // 在契约明确提供 public route target 前，聚合通知不生成跳转链接。
  return null;
}

export function mapNotificationCenterItem(
  item: NotificationGroupResp,
): NotificationCenterItem {
  const category = categoryFromApi[item.category];

  return {
    id: item.groupKey,
    latestNotificationId: item.latestNotificationId,
    type: item.type,
    category,
    title: resolveTitle(item),
    body: item.latestContent,
    occurredAt: item.latestTime,
    unread: item.unreadCount > 0,
    unreadCount: item.unreadCount,
    totalCount: item.totalCount,
    targetType: item.targetType,
    targetId: item.targetId,
    targetPath: resolveTargetPath(item),
  };
}
