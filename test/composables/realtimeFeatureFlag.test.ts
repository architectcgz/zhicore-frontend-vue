import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Realtime feature flag', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_ENABLE_REALTIME', 'false');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('禁用 realtime 时 useWebSocket 不应触发底层连接', async () => {
    const connect = vi.fn();
    const disconnect = vi.fn();
    const send = vi.fn();
    const isConnected = vi.fn(() => false);

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
        syncUnreadCount: vi.fn(),
        markAsRead: vi.fn(),
      })),
    }));

    vi.doMock('@/utils/stomp', () => ({
      notificationRealtimeClient: {
        connect,
        disconnect,
        isConnected,
        subscribe: vi.fn(() => () => {}),
        publish: send,
      },
    }));

    vi.doMock('element-plus', () => ({
      ElNotification: vi.fn(),
    }));

    const { useWebSocket } = await import('@/composables/useWebSocket');
    const realtime = useWebSocket();

    realtime.initWebSocket();
    realtime.sendMessage({
      type: 'notification',
      data: {
        id: 'n1',
        type: 'SYSTEM',
        title: 'title',
        content: 'content',
      },
      timestamp: Date.now(),
    } as any);
    realtime.disconnectWebSocket();

    expect(connect).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(disconnect).not.toHaveBeenCalled();
    expect(realtime.isConnected()).toBe(false);
  });

  it('禁用 realtime 时 useMessageWebSocket 不应触发底层连接和发送', async () => {
    const connect = vi.fn();
    const disconnect = vi.fn();
    const send = vi.fn();

    vi.doMock('@tanstack/vue-query', () => ({
      useQueryClient: vi.fn(() => ({
        setQueryData: vi.fn(),
        invalidateQueries: vi.fn(),
      })),
    }));

    vi.doMock('@/stores/auth', () => ({
      useAuthStore: vi.fn(() => ({
        accessToken: 'access-token',
        user: { id: 'user-1' },
      })),
    }));

    vi.doMock('@/utils/stomp', () => ({
      messageRealtimeClient: {
        connect,
        disconnect,
        publish: send,
        subscribe: vi.fn(() => () => {}),
        isConnected: vi.fn(() => false),
      },
    }));

    const { useMessageWebSocket } = await import('@/composables/useMessageWebSocket');
    const realtime = useMessageWebSocket();

    realtime.initWebSocket();
    realtime.sendMessageViaWebSocket({
      conversationId: 'conversation-1',
      receiverId: 'receiver-1',
      content: 'hello',
    });
    realtime.sendTypingStatus('conversation-1', true);
    realtime.markAsReadViaWebSocket('conversation-1', ['message-1']);
    realtime.cleanup();

    expect(connect).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
    expect(disconnect).not.toHaveBeenCalled();
  });
});
