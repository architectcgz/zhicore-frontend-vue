import { ref, type Ref } from "vue";

import { getNotificationUnreadCount } from "@/api/notification";

interface NotificationUnreadBadgeState {
  unreadCount: Ref<number | null>;
  loadError: Ref<string | null>;
  refresh: () => Promise<void>;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "通知未读数加载失败";
}

export function useNotificationUnreadBadge(): NotificationUnreadBadgeState {
  const unreadCount = ref<number | null>(null);
  const loadError = ref<string | null>(null);
  let requestId = 0;

  async function refresh(): Promise<void> {
    const currentRequestId = ++requestId;
    loadError.value = null;

    try {
      const response = await getNotificationUnreadCount();
      if (currentRequestId !== requestId) {
        return;
      }

      unreadCount.value = response.unreadCount;
    } catch (error) {
      if (currentRequestId !== requestId) {
        return;
      }

      unreadCount.value = null;
      loadError.value = toErrorMessage(error);
    }
  }

  void refresh();

  return {
    unreadCount,
    loadError,
    refresh,
  };
}
