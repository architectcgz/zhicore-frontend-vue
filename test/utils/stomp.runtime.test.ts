import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('stomp runtime loading', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('应在 connect 时才加载 sockjs-client，而不是模块初始化阶段', async () => {
    const sockJsCtor = vi.fn();
    const sockJsModuleFactory = vi.fn(() => ({
      default: sockJsCtor,
    }));

    vi.doMock('@stomp/stompjs', () => ({
      Client: class MockClient {
        public connected = false;
        public onConnect?: () => void;
        public onStompError?: (frame: { headers: Record<string, string> }) => void;
        public onWebSocketClose?: () => void;
        private readonly config: Record<string, unknown>;

        constructor(config: Record<string, unknown>) {
          this.config = config;
        }

        activate() {
          const webSocketFactory = this.config.webSocketFactory as (() => unknown) | undefined;
          webSocketFactory?.();
          this.connected = true;
          this.onConnect?.();
        }

        deactivate() {
          this.connected = false;
          this.onWebSocketClose?.();
        }

        subscribe() {
          return {
            unsubscribe: vi.fn(),
          };
        }

        publish() {}
      },
    }));

    vi.doMock('sockjs-client', sockJsModuleFactory);

    const { notificationRealtimeClient } = await import('@/utils/stomp');

    expect(sockJsModuleFactory).not.toHaveBeenCalled();

    await notificationRealtimeClient.connect('access-token');

    expect(sockJsModuleFactory).toHaveBeenCalledTimes(1);
    expect(sockJsCtor).toHaveBeenCalledTimes(1);
    expect(sockJsCtor).toHaveBeenCalledWith('/ws/notification');
  });

  it('配置相对路径 VITE_WS_URL=/ws 时应走同源 SockJS 端点', async () => {
    vi.stubEnv('VITE_WS_URL', '/ws');

    const sockJsCtor = vi.fn();
    const sockJsModuleFactory = vi.fn(() => ({
      default: sockJsCtor,
    }));

    vi.doMock('@stomp/stompjs', () => ({
      Client: class MockClient {
        public connected = false;
        public onConnect?: () => void;
        public onWebSocketClose?: () => void;
        private readonly config: Record<string, unknown>;

        constructor(config: Record<string, unknown>) {
          this.config = config;
        }

        activate() {
          const webSocketFactory = this.config.webSocketFactory as (() => unknown) | undefined;
          webSocketFactory?.();
          this.connected = true;
          this.onConnect?.();
        }

        deactivate() {
          this.connected = false;
          this.onWebSocketClose?.();
        }

        subscribe() {
          return {
            unsubscribe: vi.fn(),
          };
        }

        publish() {}
      },
    }));

    vi.doMock('sockjs-client', sockJsModuleFactory);

    const { notificationRealtimeClient } = await import('@/utils/stomp');

    await notificationRealtimeClient.connect('access-token');

    expect(sockJsCtor).toHaveBeenCalledWith('/ws/notification');
  });
});
