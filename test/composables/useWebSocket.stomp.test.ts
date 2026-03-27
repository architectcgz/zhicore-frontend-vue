import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useWebSocket STOMP realtime', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_ENABLE_REALTIME', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('应通过 STOMP 订阅通知与未读数并映射到通知 store', async () => {
    const connect = vi.fn();
    const disconnect = vi.fn();
    const isConnected = vi.fn(() => true);
    const subscriptions = new Map<string, (payload: unknown) => void>();
    const subscribe = vi.fn((destination: string, handler: (payload: unknown) => void) => {
      subscriptions.set(destination, handler);
      return vi.fn();
    });

    const addNotification = vi.fn();
    const updateNotification = vi.fn();
    const setUnreadCount = vi.fn();
    const syncUnreadCount = vi.fn();
    const markAsRead = vi.fn();
    const elNotification = vi.fn();

    vi.doMock('vue', async () => {
      const actual = await vi.importActual<typeof import('vue')>('vue');
      return {
        ...actual,
        onMounted: vi.fn(),
        onUnmounted: vi.fn(),
        watch: vi.fn(),
      };
    });

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: vi.fn(() => ({
        isAuthenticated: true,
        accessToken: 'access-token',
      })),
    }));

    vi.doMock('@/stores/notification', () => ({
      useNotificationStore: vi.fn(() => ({
        addNotification,
        updateNotification,
        setUnreadCount,
        syncUnreadCount,
        markAsRead,
      })),
    }));

    vi.doMock('@/utils/stomp', () => ({
      notificationRealtimeClient: {
        connect,
        disconnect,
        isConnected,
        subscribe,
        publish: vi.fn(),
      },
    }));

    vi.doMock('element-plus', () => ({
      ElNotification: elNotification,
    }));

    const { useWebSocket } = await import('@/composables/useWebSocket');
    const realtime = useWebSocket();

    realtime.initWebSocket();

    expect(connect).toHaveBeenCalledWith('access-token');
    expect(subscribe).toHaveBeenCalledWith('/user/queue/notifications', expect.any(Function));
    expect(subscribe).toHaveBeenCalledWith('/user/queue/unread-count', expect.any(Function));

    subscriptions.get('/user/queue/notifications')!({
      type: 'COMMENT',
      targetType: 'post',
      targetId: '202',
      totalCount: 2,
      unreadCount: 1,
      latestTime: '2026-03-23T10:00:00',
      latestContent: '有人评论了你的文章',
      aggregatedContent: 'alice等2人评论了你的文章',
      recentActors: [{ id: '101' }],
    });

    expect(addNotification).toHaveBeenCalledWith(expect.objectContaining({
      id: 'COMMENT:POST:202',
      userId: '101',
      type: 'COMMENT',
      title: '收到新的评论',
      content: 'alice等2人评论了你的文章',
      relatedId: '202',
      relatedType: 'POST',
      isRead: false,
      totalCount: 2,
      unreadCount: 1,
      createdAt: '2026-03-23T10:00:00',
    }));
    expect(elNotification).toHaveBeenCalledWith(expect.objectContaining({
      title: '收到新的评论',
      message: 'alice等2人评论了你的文章',
    }));

    subscriptions.get('/user/queue/unread-count')!({ unreadCount: 6 });

    expect(setUnreadCount).toHaveBeenCalledWith(6);
  });

  it('连接成功但未读数同步失败时应记录独立错误，不应误报 WS 连接失败', async () => {
    let resolveConnect: (() => void) | undefined;
    const connect = vi.fn(() => new Promise<void>(resolve => {
      resolveConnect = resolve;
    }));
    const disconnect = vi.fn();
    const isConnected = vi.fn(() => true);
    const subscribe = vi.fn(() => vi.fn());
    const syncUnreadCount = vi.fn(() => Promise.reject(new Error('count failed')));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.doMock('vue', async () => {
      const actual = await vi.importActual<typeof import('vue')>('vue');
      return {
        ...actual,
        onMounted: vi.fn(),
        onUnmounted: vi.fn(),
        watch: vi.fn(),
      };
    });

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: vi.fn(() => ({
        isAuthenticated: true,
        accessToken: 'access-token',
      })),
    }));

    vi.doMock('@/stores/notification', () => ({
      useNotificationStore: vi.fn(() => ({
        addNotification: vi.fn(),
        updateNotification: vi.fn(),
        setUnreadCount: vi.fn(),
        syncUnreadCount,
        markAsRead: vi.fn(),
      })),
    }));

    vi.doMock('@/utils/stomp', () => ({
      notificationRealtimeClient: {
        connect,
        disconnect,
        isConnected,
        subscribe,
        publish: vi.fn(),
      },
    }));

    vi.doMock('element-plus', () => ({
      ElNotification: vi.fn(),
    }));

    const { useWebSocket } = await import('@/composables/useWebSocket');
    const realtime = useWebSocket();

    realtime.initWebSocket();

    expect(connect).toHaveBeenCalledWith('access-token');
    expect(syncUnreadCount).not.toHaveBeenCalled();

    resolveConnect?.();
    await flushPromises();

    expect(syncUnreadCount).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith('Failed to sync realtime unread count:', expect.any(Error));
    expect(consoleError).not.toHaveBeenCalledWith('Failed to initialize realtime notifications:', expect.anything());
  });
});
