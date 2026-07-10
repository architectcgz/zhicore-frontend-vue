import { computed, ref } from "vue";

import {
  type ListNotificationsReq,
  getNotificationUnreadBreakdown,
  getNotificationUnreadCount,
  listNotificationGroupActors,
  listNotifications,
  markAllNotificationsRead,
  markNotificationGroupRead,
} from "@/api/notification";

import {
  mapNotificationBreakdown,
  mapNotificationCategoryToApi,
  mapNotificationCenterItem,
} from "../lib/notificationCenterMapper";
import type {
  NotificationCenterBreakdown,
  NotificationCenterCategory,
  NotificationCenterItem,
  NotificationCenterPageState,
  NotificationCenterStatus,
} from "../types";

const notificationPageSize = 20;

function listRequestParams(
  selectedCategory: NotificationCenterCategory,
  cursor?: string | null,
): ListNotificationsReq {
  const category = mapNotificationCategoryToApi(selectedCategory);

  return {
    size: notificationPageSize,
    ...(cursor ? { cursor } : {}),
    ...(category ? { category } : {}),
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "通知请求失败";
}

function emptyBreakdown(): NotificationCenterBreakdown {
  return {
    total: 0,
    interaction: 0,
    content: 0,
    social: 0,
    system: 0,
    security: 0,
  };
}

function adjustBreakdown(
  current: NotificationCenterBreakdown | null,
  category: NotificationCenterItem["category"],
  delta: number,
): NotificationCenterBreakdown | null {
  if (!current) {
    return null;
  }

  const key = category;
  return {
    ...current,
    total: Math.max(0, current.total + delta),
    [key]: Math.max(0, current[key] + delta),
  };
}

export function useNotificationCenterPage(): NotificationCenterPageState {
  const status = ref<NotificationCenterStatus>("loading");
  const items = ref<NotificationCenterItem[]>([]);
  const error = ref<string | null>(null);
  const actionError = ref<string | null>(null);
  const selectedCategory = ref<NotificationCenterCategory>("all");
  const cursor = ref<string | null>(null);
  const hasMore = ref(false);
  const loadingMore = ref(false);
  const unreadCount = ref<number | null>(null);
  const breakdown = ref<NotificationCenterBreakdown | null>(null);
  const submittingMarkAll = ref(false);
  const selectedGroupKey = ref<string | null>(null);
  const submittingReadIds = ref<ReadonlySet<string>>(new Set());
  const actorCursor = ref<string | null>(null);
  const actorHasMore = ref(false);
  const loadingMoreActors = ref(false);
  let listRequestId = 0;

  const activeNotification = computed<NotificationCenterItem | null>(
    () =>
      items.value.find((item) => item.id === selectedGroupKey.value) ?? null,
  );

  const categoryCounts = computed<
    Record<NotificationCenterCategory, number | null>
  >(() => ({
    all: breakdown.value?.total ?? unreadCount.value,
    interaction: breakdown.value?.interaction ?? null,
    content: breakdown.value?.content ?? null,
    social: breakdown.value?.social ?? null,
    system: breakdown.value?.system ?? null,
    security: breakdown.value?.security ?? null,
  }));
  const canLoadMore = computed(() => hasMore.value && !loadingMore.value);

  async function refreshUnreadFacts(requestId: number): Promise<void> {
    const [countResult, breakdownResult] = await Promise.allSettled([
      getNotificationUnreadCount(),
      getNotificationUnreadBreakdown(),
    ]);

    if (requestId !== listRequestId) {
      return;
    }

    unreadCount.value =
      countResult.status === "fulfilled" ? countResult.value.unreadCount : null;
    breakdown.value =
      breakdownResult.status === "fulfilled"
        ? mapNotificationBreakdown(breakdownResult.value)
        : null;
  }

  async function loadFirstPage(): Promise<void> {
    const requestId = ++listRequestId;
    status.value = "loading";
    error.value = null;
    actionError.value = null;
    items.value = [];
    cursor.value = null;
    hasMore.value = false;
    // 重新加载或切换分类会替换整个列表，旧的选中项不再有效。
    selectedGroupKey.value = null;
    actorCursor.value = null;
    actorHasMore.value = false;

    try {
      const [listResult] = await Promise.all([
        listNotifications(listRequestParams(selectedCategory.value)),
        refreshUnreadFacts(requestId),
      ]);
      if (requestId !== listRequestId) {
        return;
      }

      items.value = listResult.items.map(mapNotificationCenterItem);
      cursor.value = listResult.nextCursor ?? null;
      hasMore.value = listResult.hasMore;
      status.value = items.value.length > 0 ? "success" : "empty";
    } catch (requestError) {
      if (requestId !== listRequestId) {
        return;
      }

      status.value = "error";
      error.value = toErrorMessage(requestError);
      items.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || loadingMore.value || !cursor.value) {
      return;
    }

    const requestId = listRequestId;
    loadingMore.value = true;
    actionError.value = null;

    try {
      const listResult = await listNotifications(
        listRequestParams(selectedCategory.value, cursor.value),
      );
      if (requestId !== listRequestId) {
        return;
      }

      items.value = [
        ...items.value,
        ...listResult.items.map(mapNotificationCenterItem),
      ];
      cursor.value = listResult.nextCursor ?? null;
      hasMore.value = listResult.hasMore;
    } catch (requestError) {
      if (requestId === listRequestId) {
        actionError.value = toErrorMessage(requestError);
      }
    } finally {
      if (requestId === listRequestId) {
        loadingMore.value = false;
      }
    }
  }

  async function selectCategory(
    category: NotificationCenterCategory,
  ): Promise<void> {
    if (selectedCategory.value === category) {
      return;
    }

    selectedCategory.value = category;
    await loadFirstPage();
  }

  async function markAllRead(): Promise<void> {
    if (submittingMarkAll.value) {
      return;
    }

    submittingMarkAll.value = true;
    actionError.value = null;

    try {
      await markAllNotificationsRead();
      items.value = items.value.map((item) => ({
        ...item,
        unread: false,
        unreadCount: 0,
      }));
      unreadCount.value = 0;
      breakdown.value = emptyBreakdown();
    } catch (requestError) {
      actionError.value = toErrorMessage(requestError);
    } finally {
      submittingMarkAll.value = false;
    }
  }

  async function selectNotification(groupKey: string): Promise<void> {
    // 选中始终生效，即使已读也可反复查看详情。
    selectedGroupKey.value = groupKey;
    void loadGroupActors(groupKey, true);

    const target = items.value.find((item) => item.id === groupKey);
    // 无对应项或已读时，只切换选中，不发组级已读请求。
    if (!target || !target.unread) {
      return;
    }

    // 同一条正在提交时不重复发起，避免抖动式重复请求。
    if (submittingReadIds.value.has(groupKey)) {
      return;
    }

    actionError.value = null;
    const nextSubmitting = new Set(submittingReadIds.value);
    nextSubmitting.add(groupKey);
    submittingReadIds.value = nextSubmitting;

    // 记录乐观更新前的未读事实，用于失败回滚。
    const previousUnreadCount = target.unreadCount;
    const unreadKnown = unreadCount.value !== null;
    const previousTotalUnread = unreadCount.value;
    const previousBreakdown = breakdown.value;

    // 乐观更新：立即清除该分组 unread dot 与计数。
    items.value = items.value.map((item) =>
      item.id === groupKey ? { ...item, unread: false, unreadCount: 0 } : item,
    );
    // 未读总数已知时按该分组未读数递减；未知时不做本地算术，
    // 依据设计文档在成功后触发重拉，避免伪造 0。
    if (unreadKnown && previousTotalUnread !== null) {
      unreadCount.value = Math.max(
        0,
        previousTotalUnread - previousUnreadCount,
      );
    }
    breakdown.value = adjustBreakdown(
      breakdown.value,
      target.category,
      -previousUnreadCount,
    );

    try {
      const readResult = await markNotificationGroupRead(groupKey);
      items.value = items.value.map((item) =>
        item.id === groupKey
          ? {
              ...item,
              unread: readResult.unreadCount > 0,
              unreadCount: readResult.unreadCount,
            }
          : item,
      );
      // The response owns the exact changedCount. Reconcile the optimistic
      // subtraction so category badges remain correct under concurrent events.
      const reconciliation = previousUnreadCount - readResult.changedCount;
      if (unreadKnown && unreadCount.value !== null) {
        unreadCount.value = Math.max(0, unreadCount.value + reconciliation);
      }
      breakdown.value = adjustBreakdown(
        breakdown.value,
        target.category,
        reconciliation,
      );

      if (!unreadKnown) {
        // 之前未读数未知，成功后重拉未读事实而不是本地计算。
        await refreshUnreadFacts(listRequestId);
      }
    } catch (requestError) {
      // 失败回滚：恢复该分组未读状态与未读总数。
      items.value = items.value.map((item) =>
        item.id === groupKey
          ? { ...item, unread: true, unreadCount: previousUnreadCount }
          : item,
      );
      if (unreadKnown) {
        unreadCount.value = previousTotalUnread;
      }
      breakdown.value = previousBreakdown;
      actionError.value = toErrorMessage(requestError);
    } finally {
      const doneSubmitting = new Set(submittingReadIds.value);
      doneSubmitting.delete(groupKey);
      submittingReadIds.value = doneSubmitting;
    }
  }

  async function loadGroupActors(
    groupId: string,
    replace: boolean,
  ): Promise<void> {
    try {
      const page = await listNotificationGroupActors(groupId, {
        size: notificationPageSize,
        ...(replace || !actorCursor.value ? {} : { cursor: actorCursor.value }),
      });
      if (selectedGroupKey.value !== groupId) {
        return;
      }
      items.value = items.value.map((item) =>
        item.id === groupId
          ? {
              ...item,
              actors: (replace ? [] : item.actors)
                .concat(
                  page.items.map((entry) => ({
                    id: entry.actor.publicId,
                    name: entry.actor.displayName,
                    avatarUrl: entry.actor.avatarUrl,
                  })),
                )
                .filter(
                  (actor, index, actors) =>
                    actors.findIndex(
                      (candidate) => candidate.id === actor.id,
                    ) === index,
                ),
            }
          : item,
      );
      actorCursor.value = page.nextCursor ?? null;
      actorHasMore.value = page.hasMore;
    } catch (requestError) {
      if (selectedGroupKey.value === groupId) {
        actionError.value = toErrorMessage(requestError);
      }
    }
  }

  async function loadMoreActors(): Promise<void> {
    if (
      !selectedGroupKey.value ||
      !actorHasMore.value ||
      loadingMoreActors.value
    )
      return;
    loadingMoreActors.value = true;
    try {
      await loadGroupActors(selectedGroupKey.value, false);
    } finally {
      loadingMoreActors.value = false;
    }
  }

  function closeDetail(): void {
    selectedGroupKey.value = null;
    actorCursor.value = null;
    actorHasMore.value = false;
  }

  void loadFirstPage();

  return {
    status,
    items,
    error,
    actionError,
    selectedCategory,
    cursor,
    hasMore,
    loadingMore,
    unreadCount,
    breakdown,
    submittingMarkAll,
    selectedGroupKey,
    activeNotification,
    submittingReadIds,
    actorCursor,
    actorHasMore,
    loadingMoreActors,
    categoryCounts,
    canLoadMore,
    retry: loadFirstPage,
    selectCategory,
    loadMore,
    markAllRead,
    selectNotification,
    closeDetail,
    loadMoreActors,
  };
}
