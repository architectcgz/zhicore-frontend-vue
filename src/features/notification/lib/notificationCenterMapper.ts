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

// 从 recentActors（可能是带 id/name 的对象数组）里读取一个可展示名称。
// 契约未接入 User summary 前 recentActors 常为空，字段名也可能是 name/displayName/nickname。
function readActorName(actor: Record<string, unknown>): string | null {
  return (
    readStringField(actor, "name") ||
    readStringField(actor, "displayName") ||
    readStringField(actor, "nickname") ||
    null
  );
}

function readActorId(
  actor: Record<string, unknown>,
  fallbackId: string,
): string {
  return (
    readStringField(actor, "id") ||
    readStringField(actor, "userId") ||
    readStringField(actor, "actorId") ||
    fallbackId
  );
}

// 合并 recentActors（带名字）和 actorIds（内部 ID），保证详情能显式列出触发者。
// recentActors 到位时优先用其名字；否则回退到 actorIds，UI 再决定如何展示。
function resolveActors(item: NotificationGroupResp): NotificationCenterActor[] {
  const summaries = Array.isArray(item.recentActors) ? item.recentActors : [];
  const actorIds = Array.isArray(item.actorIds) ? item.actorIds : [];

  if (summaries.length > 0) {
    return summaries.map((actor, index) => {
      const record =
        actor && typeof actor === "object"
          ? (actor as Record<string, unknown>)
          : {};
      const fallbackId = actorIds[index] ?? `actor-${index}`;

      return {
        id: readActorId(record, fallbackId),
        name: readActorName(record),
      };
    });
  }

  // 仅有内部 ID：名字未知，交给 UI 回退展示 id。
  return actorIds.map((id) => ({ id, name: null }));
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
    actors: resolveActors(item),
  };
}
