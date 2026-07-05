export type NotificationCenterType = "interaction" | "system" | "content";

export interface NotificationCenterItem {
  id: string;
  type: NotificationCenterType;
  title: string;
  body: string;
  occurredAt: string;
  unread: boolean;
}

export interface NotificationCenterPageState {
  isLocalDemo: boolean;
  unreadCount: number | null;
  websocketConnected: boolean;
  notifications: NotificationCenterItem[];
}
