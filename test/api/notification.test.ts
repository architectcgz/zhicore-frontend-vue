import { beforeEach, describe, expect, it, vi } from 'vitest';

const get = vi.fn();

vi.mock('@/utils/request', () => ({
  httpClient: {
    get,
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('notification api adapters', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('maps aggregated notification page into center-friendly page result', async () => {
    get.mockResolvedValue({
      current: 0,
      size: 20,
      total: 2,
      pages: 1,
      hasNext: false,
      records: [
        {
          type: 'COMMENT',
          targetType: 'post',
          targetId: '301',
          totalCount: 2,
          unreadCount: 1,
          latestTime: '2026-03-24T10:00:00',
          latestContent: '有人评论了你的文章',
          aggregatedContent: 'bob等2人评论了你的文章',
          recentActors: [
            { id: '401' },
          ],
        },
      ],
    });

    const { notificationApi } = await import('@/api/notification');
    const page = await notificationApi.getNotifications({ page: 0, size: 20, type: 'COMMENT', isRead: false });

    expect(get).toHaveBeenCalledWith('/notifications', { page: 0, size: 20 });
    expect(page).toEqual({
      items: [
        {
          id: 'COMMENT:POST:301',
          userId: '401',
          type: 'COMMENT',
          title: '收到新的评论',
          content: 'bob等2人评论了你的文章',
          relatedId: '301',
          relatedType: 'POST',
          isRead: false,
          createdAt: '2026-03-24T10:00:00',
          totalCount: 2,
          unreadCount: 1,
        },
      ],
      total: 2,
      page: 0,
      size: 20,
      hasMore: false,
    });
  });

  it('maps aggregated notification page into dropdown-friendly items', async () => {
    get.mockResolvedValue({
      current: 0,
      size: 5,
      total: 1,
      pages: 1,
      hasNext: false,
      records: [
        {
          type: 'FOLLOW',
          targetType: 'user',
          targetId: '101',
          totalCount: 5,
          unreadCount: 3,
          latestTime: '2026-03-24T06:51:48.288041',
          latestContent: '关注了你',
          aggregatedContent: 'alice等5人关注了你',
          recentActors: [
            {
              id: '201',
            },
          ],
        },
      ],
    });

    const { notificationApi } = await import('@/api/notification');
    const notifications = await notificationApi.getRecentNotifications(5);

    expect(get).toHaveBeenCalledWith('/notifications', { page: 0, size: 5 });
    expect(notifications).toEqual([
      {
        id: 'FOLLOW:USER:101',
        userId: '201',
        type: 'FOLLOW',
        title: '收到新的关注',
        content: 'alice等5人关注了你',
        relatedId: '101',
        relatedType: 'USER',
        isRead: false,
        createdAt: '2026-03-24T06:51:48.288041',
        totalCount: 5,
        unreadCount: 3,
      },
    ]);
  });
});
