import type {
  NotificationCategoryResp,
  NotificationGroupResp,
  NotificationUnreadBreakdownResp,
} from "@/api/notification";

import type {
  NotificationCenterActor,
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

const categoryFromApi: Record<
  NotificationCategoryResp,
  NotificationCenterType
> = {
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

function resolveTitle(item: NotificationGroupResp): string {
  return (
    item.content.title ||
    fallbackTitleByCategory[categoryFromApi[item.category]]
  );
}

function resolveTargetPath(item: NotificationGroupResp): string | null {
  if (item.target?.resource.type === "POST" && item.target.resource.id) {
    const path = `/posts/${encodeURIComponent(item.target.resource.id)}`;
    return item.target.anchor?.type === "COMMENT"
      ? `${path}#comment-${encodeURIComponent(item.target.anchor.id)}`
      : path;
  }
  return null;
}

function resolveActors(item: NotificationGroupResp): NotificationCenterActor[] {
  return item.recentActors.map((actor) => ({
    id: actor.publicId,
    name: actor.displayName,
    avatarUrl: actor.avatarUrl ?? null,
  }));
}

export function mapNotificationCenterItem(
  item: NotificationGroupResp,
): NotificationCenterItem {
  const category = categoryFromApi[item.category];

  return {
    id: item.groupId,
    type: item.type,
    category,
    title: resolveTitle(item),
    body: item.content.body,
    occurredAt: item.latestOccurredAt,
    unread: item.unreadCount > 0,
    unreadCount: item.unreadCount,
    totalCount: item.totalCount,
    actorTotalCount: item.actorTotalCount,
    target: item.target ?? null,
    targetPath: resolveTargetPath(item),
    actors: resolveActors(item),
  };
}
