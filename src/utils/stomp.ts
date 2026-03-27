import { Client, type StompSubscription } from '@stomp/stompjs';

const LARGE_INTEGER_TOKEN_PATTERN = /([:[,]\s*)(-?\d{16,})(?=\s*[,}\]])/g;
const DEFAULT_WEBSOCKET_BASE = '/ws';

type MessageHandler<T> = (payload: T) => void;
type SockJsConstructor = typeof import('sockjs-client');

interface PendingSubscription {
  destination: string;
  handler: MessageHandler<any>;
  activeSubscription: StompSubscription | null;
}

export interface StompRealtimeClient {
  connect(token: string): Promise<void>;
  disconnect(): void;
  subscribe<T>(destination: string, handler: MessageHandler<T>): () => void;
  publish(destination: string, payload: unknown): void;
  isConnected(): boolean;
}

let sockJsConstructorPromise: Promise<SockJsConstructor> | null = null;

function joinPath(basePath: string, suffix: string): string {
  const normalizedBase = basePath.replace(/\/+$/, '');
  const normalizedSuffix = suffix.startsWith('/') ? suffix : `/${suffix}`;
  return `${normalizedBase}${normalizedSuffix}`;
}

function resolveSockJsEndpoint(servicePath: string): string {
  const configuredBase = import.meta.env.VITE_WS_URL?.trim();
  if (!configuredBase) {
    return joinPath(DEFAULT_WEBSOCKET_BASE, servicePath);
  }

  if (configuredBase.startsWith('ws://') || configuredBase.startsWith('wss://')) {
    const url = new URL(configuredBase);
    url.protocol = url.protocol === 'wss:' ? 'https:' : 'http:';
    url.pathname = joinPath(url.pathname || DEFAULT_WEBSOCKET_BASE, servicePath);
    url.search = '';
    url.hash = '';
    return url.toString();
  }

  return joinPath(configuredBase, servicePath);
}

function parseFrameBody<T>(body: string): T {
  if (!body.trim()) {
    return undefined as T;
  }

  const normalizedBody = body.replace(LARGE_INTEGER_TOKEN_PATTERN, '$1"$2"');
  return JSON.parse(normalizedBody) as T;
}

async function loadSockJsConstructor(): Promise<SockJsConstructor> {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as Record<string, unknown>).global === 'undefined') {
    Object.defineProperty(globalThis, 'global', {
      value: globalThis,
      configurable: true,
      writable: true,
    });
  }

  if (!sockJsConstructorPromise) {
    sockJsConstructorPromise = import('sockjs-client')
      .then((module) => (module as { default?: SockJsConstructor }).default ?? (module as unknown as SockJsConstructor))
      .catch((error) => {
        sockJsConstructorPromise = null;
        throw error;
      });
  }

  return sockJsConstructorPromise;
}

function createStompRealtimeClient(servicePath: string): StompRealtimeClient {
  let client: Client | null = null;
  let accessToken: string | null = null;
  let connectPromise: Promise<void> | null = null;
  let resolveConnect: (() => void) | null = null;
  let rejectConnect: ((reason?: unknown) => void) | null = null;
  const subscriptions = new Set<PendingSubscription>();

  function attachSubscription(subscription: PendingSubscription) {
    if (!client?.connected) {
      return;
    }

    subscription.activeSubscription?.unsubscribe();
    subscription.activeSubscription = client.subscribe(subscription.destination, (frame) => {
      subscription.handler(parseFrameBody(frame.body));
    });
  }

  return {
    async connect(token: string) {
      if (!token) {
        return Promise.resolve();
      }

      if (client?.connected && accessToken === token) {
        return Promise.resolve();
      }

      if (connectPromise && accessToken === token) {
        return connectPromise;
      }

      accessToken = token;
      const SockJS = await loadSockJsConstructor();
      const nextClient = new Client({
        webSocketFactory: () => new SockJS(resolveSockJsEndpoint(servicePath)),
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 20000,
        heartbeatOutgoing: 20000,
      });

      connectPromise = new Promise<void>((resolve, reject) => {
        resolveConnect = resolve;
        rejectConnect = reject;
      });

      nextClient.onConnect = () => {
        client = nextClient;
        subscriptions.forEach(attachSubscription);
        resolveConnect?.();
        resolveConnect = null;
        rejectConnect = null;
      };

      nextClient.onStompError = (frame) => {
        rejectConnect?.(new Error(frame.headers.message || 'STOMP connection failed'));
        resolveConnect = null;
        rejectConnect = null;
      };

      nextClient.onWebSocketClose = () => {
        subscriptions.forEach((subscription) => {
          subscription.activeSubscription = null;
        });
        client = null;
        connectPromise = null;
      };

      nextClient.activate();
      client = nextClient;

      return connectPromise;
    },

    disconnect() {
      subscriptions.forEach((subscription) => {
        subscription.activeSubscription?.unsubscribe();
        subscription.activeSubscription = null;
      });
      accessToken = null;
      connectPromise = null;
      resolveConnect = null;
      rejectConnect = null;
      client?.deactivate();
      client = null;
    },

    subscribe<T>(destination: string, handler: MessageHandler<T>) {
      const subscription: PendingSubscription = {
        destination,
        handler,
        activeSubscription: null,
      };
      subscriptions.add(subscription);
      attachSubscription(subscription);

      return () => {
        subscription.activeSubscription?.unsubscribe();
        subscriptions.delete(subscription);
      };
    },

    publish(destination: string, payload: unknown) {
      if (!client?.connected) {
        return;
      }

      client.publish({
        destination,
        body: JSON.stringify(payload),
      });
    },

    isConnected() {
      return client?.connected ?? false;
    },
  };
}

export const notificationRealtimeClient = createStompRealtimeClient('/notification');
export const messageRealtimeClient = createStompRealtimeClient('/message');
