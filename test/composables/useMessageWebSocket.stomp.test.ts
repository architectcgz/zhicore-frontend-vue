import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useMessageWebSocket STOMP realtime', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_ENABLE_REALTIME', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('应订阅用户消息队列并把新消息写入查询缓存', async () => {
    const connect = vi.fn();
    const disconnect = vi.fn();
    const publish = vi.fn();
    const subscriptions = new Map<string, (payload: unknown) => void>();
    const subscribe = vi.fn((destination: string, handler: (payload: unknown) => void) => {
      subscriptions.set(destination, handler);
      return vi.fn();
    });

    const setQueryData = vi.fn();
    const invalidateQueries = vi.fn();

    vi.doMock('vue', async () => {
      const actual = await vi.importActual<typeof import('vue')>('vue');
      return {
        ...actual,
        onMounted: vi.fn(),
        onUnmounted: vi.fn(),
      };
    });

    vi.doMock('@tanstack/vue-query', () => ({
      useQueryClient: vi.fn(() => ({
        setQueryData,
        invalidateQueries,
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
        subscribe,
        publish,
        isConnected: vi.fn(() => true),
      },
    }));

    const { useMessageWebSocket } = await import('@/composables/useMessageWebSocket');
    const { queryKeys } = await import('@/queries/query-keys');
    const realtime = useMessageWebSocket();

    realtime.initWebSocket();

    expect(connect).toHaveBeenCalledWith('access-token');
    expect(subscribe).toHaveBeenCalledWith('/user/queue/messages', expect.any(Function));

    subscriptions.get('/user/queue/messages')!({
      messageId: '9007199254740993',
      conversationId: 'conversation-1',
      senderId: 'sender-1',
      senderNickName: 'alice',
      senderAvatarUrl: 'https://cdn.example.com/avatar.png',
      type: 'TEXT',
      contentPreview: 'hello from stomp',
      sentAt: '2026-03-23T10:00:00',
      pushType: 'NEW_MESSAGE',
    });

    const cacheWrite = setQueryData.mock.calls.find(([queryKey]) =>
      JSON.stringify(queryKey) === JSON.stringify(queryKeys.messages.messagesList('conversation-1'))
    );

    expect(cacheWrite).toBeDefined();

    const updater = cacheWrite![1] as (old: any) => any;
    const next = updater({
      items: [
        {
          id: 'message-0',
          conversationId: 'conversation-1',
          senderId: 'sender-0',
          receiverId: 'receiver-0',
          content: 'existing',
          messageType: 'TEXT',
          isRead: true,
          sequence: 1,
          createdAt: '2026-03-23T09:59:00',
        },
      ],
      total: 1,
      page: 1,
      size: 20,
      hasMore: false,
    });

    expect(next.items).toHaveLength(2);
    expect(next.items[1]).toEqual(expect.objectContaining({
      id: '9007199254740993',
      conversationId: 'conversation-1',
      senderId: 'sender-1',
      content: 'hello from stomp',
      messageType: 'TEXT',
      isRead: false,
    }));
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.messages.conversations(),
    });
  });
});
