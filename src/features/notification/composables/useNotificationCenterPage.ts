import { computed, ref, type ComputedRef, type Ref } from "vue";

import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { notificationCenterLocalMock } from "../config/notificationCenterLocalMock";
import type {
  NotificationCenterCategory,
  NotificationCenterItem,
  NotificationCenterPageState,
} from "../types";

interface UseNotificationCenterPageOptions {
  localDemoEnabled?: boolean;
}

type NotificationCategoryCounts = Record<NotificationCenterCategory, number>;

interface NotificationCenterPageController {
  selectedCategory: Ref<NotificationCenterCategory>;
  currentPage: Ref<number>;
  categoryCounts: ComputedRef<NotificationCategoryCounts>;
  paginatedNotifications: ComputedRef<NotificationCenterItem[]>;
  totalPages: ComputedRef<number>;
  canGoPrevious: ComputedRef<boolean>;
  canGoNext: ComputedRef<boolean>;
  selectCategory: (category: NotificationCenterCategory) => void;
  goPreviousPage: () => void;
  goNextPage: () => void;
}

const unavailableNotificationCenterState: NotificationCenterPageState = {
  isLocalDemo: false,
  unreadCount: null,
  websocketConnected: false,
  notifications: [],
};

const notificationsPerPage = 3;

export function useNotificationCenterPage(
  options: UseNotificationCenterPageOptions = {},
): NotificationCenterPageState & NotificationCenterPageController {
  const localDemoEnabled = options.localDemoEnabled ?? isLocalDemoModeEnabled();
  const pageState = localDemoEnabled
    ? {
        isLocalDemo: true,
        unreadCount: notificationCenterLocalMock.filter((item) => item.unread)
          .length,
        websocketConnected: false,
        notifications: notificationCenterLocalMock,
      }
    : unavailableNotificationCenterState;

  const selectedCategory = ref<NotificationCenterCategory>("all");
  const currentPage = ref(1);
  const categoryCounts = computed<NotificationCategoryCounts>(
    () => ({
      all: pageState.notifications.length,
      content: pageState.notifications.filter(
        (notification) => notification.type === "content",
      ).length,
      interaction: pageState.notifications.filter(
        (notification) => notification.type === "interaction",
      ).length,
      system: pageState.notifications.filter(
        (notification) => notification.type === "system",
      ).length,
    }),
  );
  const filteredNotifications = computed(() => {
    if (selectedCategory.value === "all") {
      return pageState.notifications;
    }

    return pageState.notifications.filter(
      (notification) => notification.type === selectedCategory.value,
    );
  });
  const totalPages = computed(() =>
    Math.max(
      1,
      Math.ceil(filteredNotifications.value.length / notificationsPerPage),
    ),
  );
  const canGoPrevious = computed(() => currentPage.value > 1);
  const canGoNext = computed(() => currentPage.value < totalPages.value);
  const paginatedNotifications = computed(() => {
    const start = (currentPage.value - 1) * notificationsPerPage;

    return filteredNotifications.value.slice(start, start + notificationsPerPage);
  });

  return {
    ...pageState,
    selectedCategory,
    currentPage,
    categoryCounts,
    paginatedNotifications,
    totalPages,
    canGoPrevious,
    canGoNext,
    selectCategory(category: NotificationCenterCategory) {
      selectedCategory.value = category;
      currentPage.value = 1;
    },
    goPreviousPage() {
      if (canGoPrevious.value) {
        currentPage.value -= 1;
      }
    },
    goNextPage() {
      if (canGoNext.value) {
        currentPage.value += 1;
      }
    },
  };
}
