import type { ComputedRef, Ref } from "vue";

export type NotificationCenterCategory =
  | "all"
  | "interaction"
  | "content"
  | "social"
  | "system"
  | "security";

export type NotificationCenterType =
  | "interaction"
  | "content"
  | "social"
  | "system"
  | "security";

export type NotificationCenterStatus =
  | "loading"
  | "success"
  | "empty"
  | "error";

export interface NotificationCenterBreakdown {
  total: number;
  interaction: number;
  content: number;
  social: number;
  system: number;
  security: number;
}

export interface NotificationCenterItem {
  id: string;
  latestNotificationId?: string;
  type: string;
  category: NotificationCenterType;
  title: string;
  body: string;
  occurredAt: string;
  unread: boolean;
  unreadCount: number;
  totalCount: number;
  targetType: string;
  targetId: string;
  targetPath: string | null;
}

export interface NotificationCenterPageState {
  status: Ref<NotificationCenterStatus>;
  items: Ref<NotificationCenterItem[]>;
  error: Ref<string | null>;
  actionError: Ref<string | null>;
  selectedCategory: Ref<NotificationCenterCategory>;
  cursor: Ref<string | null>;
  hasMore: Ref<boolean>;
  loadingMore: Ref<boolean>;
  unreadCount: Ref<number | null>;
  breakdown: Ref<NotificationCenterBreakdown | null>;
  submittingMarkAll: Ref<boolean>;
  categoryCounts: ComputedRef<Record<NotificationCenterCategory, number | null>>;
  canLoadMore: ComputedRef<boolean>;
  retry: () => Promise<void>;
  selectCategory: (category: NotificationCenterCategory) => Promise<void>;
  loadMore: () => Promise<void>;
  markAllRead: () => Promise<void>;
}
