import type { ComputedRef, Ref } from "vue";

export type NotificationCenterCategory =
  "all" | "interaction" | "content" | "social" | "system" | "security";

export type NotificationCenterType =
  "interaction" | "content" | "social" | "system" | "security";

export type NotificationCenterStatus =
  "loading" | "success" | "empty" | "error";

export interface NotificationCenterBreakdown {
  total: number;
  interaction: number;
  content: number;
  social: number;
  system: number;
  security: number;
}

export interface NotificationCenterActor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface NotificationCenterTarget {
  resource: { type: string; id: string };
  anchor?: { type: string; id: string };
}

export interface NotificationCenterItem {
  id: string;
  type: string;
  category: NotificationCenterType;
  title: string;
  body: string;
  occurredAt: string;
  unread: boolean;
  unreadCount: number;
  totalCount: number;
  actorTotalCount: number;
  target: NotificationCenterTarget | null;
  targetPath: string | null;
  // 参与聚合的触发者列表；空数组表示系统类通知或后端未返回触发者。
  actors: NotificationCenterActor[];
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
  // 当前在主区详情面板展开的通知分组 key；null 表示未选中任何通知。
  selectedGroupKey: Ref<string | null>;
  // 由 selectedGroupKey 解析出的选中项；列表变化后自动失效。
  activeNotification: ComputedRef<NotificationCenterItem | null>;
  // 正在提交单条已读的分组 key 集合，用于防止重复点击同一条。
  submittingReadIds: Ref<ReadonlySet<string>>;
  actorCursor: Ref<string | null>;
  actorHasMore: Ref<boolean>;
  loadingMoreActors: Ref<boolean>;
  categoryCounts: ComputedRef<
    Record<NotificationCenterCategory, number | null>
  >;
  canLoadMore: ComputedRef<boolean>;
  retry: () => Promise<void>;
  selectCategory: (category: NotificationCenterCategory) => Promise<void>;
  loadMore: () => Promise<void>;
  markAllRead: () => Promise<void>;
  // 选中一条通知并在其未读时乐观标记已读；失败回滚该条未读状态。
  selectNotification: (groupKey: string) => Promise<void>;
  // 关闭详情面板，清空选中态。
  closeDetail: () => void;
  loadMoreActors: () => Promise<void>;
}
