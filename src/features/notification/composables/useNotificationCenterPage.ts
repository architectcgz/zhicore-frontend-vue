import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { notificationCenterLocalMock } from "../config/notificationCenterLocalMock";
import type { NotificationCenterPageState } from "../types";

interface UseNotificationCenterPageOptions {
  localDemoEnabled?: boolean;
}

const unavailableNotificationCenterState: NotificationCenterPageState = {
  isLocalDemo: false,
  unreadCount: null,
  websocketConnected: false,
  notifications: [],
};

export function useNotificationCenterPage(
  options: UseNotificationCenterPageOptions = {},
): NotificationCenterPageState {
  const localDemoEnabled = options.localDemoEnabled ?? isLocalDemoModeEnabled();

  if (!localDemoEnabled) {
    return unavailableNotificationCenterState;
  }

  return {
    isLocalDemo: true,
    unreadCount: notificationCenterLocalMock.filter((item) => item.unread)
      .length,
    websocketConnected: false,
    notifications: notificationCenterLocalMock,
  };
}
