import { computed, ref } from "vue";

import {
  type ListNotificationsReq,
  getNotificationUnreadBreakdown,
  getNotificationUnreadCount,
  listNotifications,
  markAllNotificationsRead,
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
  let listRequestId = 0;

  const categoryCounts = computed<Record<NotificationCenterCategory, number | null>>(
    () => ({
      all: breakdown.value?.total ?? unreadCount.value,
      interaction: breakdown.value?.interaction ?? null,
      content: breakdown.value?.content ?? null,
      social: breakdown.value?.social ?? null,
      system: breakdown.value?.system ?? null,
      security: breakdown.value?.security ?? null,
    }),
  );
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
    categoryCounts,
    canLoadMore,
    retry: loadFirstPage,
    selectCategory,
    loadMore,
    markAllRead,
  };
}
