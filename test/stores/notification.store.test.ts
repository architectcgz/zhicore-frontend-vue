import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestPinia } from '@/test/utils';
import { useNotificationStore } from '@/stores/notification';

const setQueryData = vi.fn();
const invalidateQueries = vi.fn();

vi.mock('@tanstack/vue-query', () => ({
  useQueryClient: vi.fn(() => ({
    setQueryData,
    invalidateQueries,
  })),
}));

vi.mock('@/api/notification', () => ({
  notificationApi: {
    getUnreadCount: vi.fn(),
    getRecentNotifications: vi.fn(),
    getNotifications: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

describe('notification store realtime aggregation', () => {
  beforeEach(() => {
    createTestPinia();
    vi.clearAllMocks();
  });

  it('应将同组聚合快照 upsert 到现有通知组并更新计数', () => {
    const store = useNotificationStore();

    store.notifications = [
      {
        id: 'FOLLOW:USER:501',
        userId: '901',
        type: 'FOLLOW',
        title: '收到新的关注',
        content: 'alice关注了你',
        relatedId: '501',
        relatedType: 'USER',
        isRead: false,
        totalCount: 1,
        unreadCount: 1,
        createdAt: '2026-03-24T10:00:00',
      },
      {
        id: 'COMMENT:POST:202',
        userId: '301',
        type: 'COMMENT',
        title: '收到新的评论',
        content: 'alice等2人评论了你的文章',
        relatedId: '202',
        relatedType: 'POST',
        isRead: false,
        totalCount: 2,
        unreadCount: 2,
        createdAt: '2026-03-24T09:00:00',
      },
    ];
    store.total = 2;
    store.setUnreadCount(3);

    store.addNotification({
      id: 'COMMENT:POST:202',
      userId: '302',
      type: 'COMMENT',
      title: '收到新的评论',
      content: 'bob等3人评论了你的文章',
      relatedId: '202',
      relatedType: 'POST',
      isRead: false,
      totalCount: 3,
      unreadCount: 2,
      createdAt: '2026-03-24T11:00:00',
    });

    expect(store.notifications).toHaveLength(2);
    expect(store.total).toBe(2);
    expect(store.unreadCount).toBe(3);
    expect(store.notifications[0]).toEqual({
      id: 'COMMENT:POST:202',
      userId: '302',
      type: 'COMMENT',
      title: '收到新的评论',
      content: 'bob等3人评论了你的文章',
      relatedId: '202',
      relatedType: 'POST',
      isRead: false,
      totalCount: 3,
      unreadCount: 2,
      createdAt: '2026-03-24T11:00:00',
    });
  });

  it('应将新的聚合快照标准化为聚合列表项后插入', () => {
    const store = useNotificationStore();

    store.setUnreadCount(0);

    store.addNotification({
      id: 'LIKE:POST:303',
      userId: '401',
      type: 'LIKE',
      title: '收到新的点赞',
      content: 'alice等2人赞了你的内容',
      relatedId: '303',
      relatedType: 'POST',
      isRead: false,
      totalCount: 2,
      unreadCount: 1,
      createdAt: '2026-03-24T12:00:00',
    });

    expect(store.notifications).toEqual([
      {
        id: 'LIKE:POST:303',
        userId: '401',
        type: 'LIKE',
        title: '收到新的点赞',
        content: 'alice等2人赞了你的内容',
        relatedId: '303',
        relatedType: 'POST',
        isRead: false,
        totalCount: 2,
        unreadCount: 1,
        createdAt: '2026-03-24T12:00:00',
      },
    ]);
    expect(store.total).toBe(1);
    expect(store.unreadCount).toBe(1);
  });

  it('应在 follow 实时归并后延续聚合文案格式', () => {
    const store = useNotificationStore();

    store.notifications = [
      {
        id: 'FOLLOW:UNKNOWN:NONE',
        userId: '901',
        type: 'FOLLOW',
        title: '收到新的关注',
        content: 'alice关注了你',
        isRead: true,
        totalCount: 1,
        unreadCount: 0,
        createdAt: '2026-03-24T10:00:00',
      },
    ];
    store.total = 1;
    store.setUnreadCount(0);

    store.addNotification({
      id: '9007199254740995',
      userId: '902',
      type: 'FOLLOW',
      title: '收到新的关注',
      content: '关注了你',
      isRead: false,
      createdAt: '2026-03-24T12:30:00',
    });

    expect(store.notifications[0]).toEqual({
      id: 'FOLLOW:UNKNOWN:NONE',
      userId: '902',
      type: 'FOLLOW',
      title: '收到新的关注',
      content: 'alice等2人关注了你',
      isRead: false,
      totalCount: 2,
      unreadCount: 1,
      createdAt: '2026-03-24T12:30:00',
    });
    expect(store.unreadCount).toBe(1);
  });
});
