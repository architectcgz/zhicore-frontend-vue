/**
 * WebSocket 管理器
 * 提供 WebSocket 连接管理、自动重连、心跳机制、消息处理等功能
 */

import type {
  WebSocketMessage,
  MessageHandler,
  ConnectionEventData,
  ErrorEventData,
  HeartbeatPayload
} from '@/types/websocket';

/**
 * WebSocket 配置接口
 */
interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

/**
 * WebSocket 管理器类
 */
class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private messageHandlers = new Map<string, Set<(data: any) => void>>();
  private isIntentionallyClosed = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  constructor(config: WebSocketConfig) {
    this.config = config;
    this.setupVisibilityHandler();
  }

  /**
   * 连接 WebSocket
   * @param token 认证令牌
   */
  connect(token: string): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket is already connecting or connected');
      return;
    }

    this.isIntentionallyClosed = false;
    this.isConnecting = true;
    const wsUrl = `${this.config.url}?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        const connectionData: ConnectionEventData = { timestamp: Date.now() };
        this.notifyHandlers('connected', connectionData);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        const errorData: ErrorEventData = { 
          error: new Error('WebSocket error occurred'), 
          timestamp: Date.now() 
        };
        this.notifyHandlers('error', errorData as any);
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        const disconnectData: ConnectionEventData = { 
          code: event.code, 
          reason: event.reason,
          timestamp: Date.now() 
        };
        this.notifyHandlers('disconnected', disconnectData);

        if (!this.isIntentionallyClosed) {
          this.reconnect(token);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.reconnect(token);
    }
  }

  /**
   * 重新连接
   * @param token 认证令牌
   */
  private reconnect(token: string): void {
    if (this.isIntentionallyClosed || this.reconnectTimer) {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.notifyHandlers('max_reconnect_attempts', { 
        attempts: this.reconnectAttempts,
        timestamp: Date.now() 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect(token);
    }, delay);
  }

  /**
   * 开始心跳
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        const heartbeatData: HeartbeatPayload = { timestamp: Date.now() };
        this.send('ping', heartbeatData as Extract<WebSocketMessage, { type: 'ping' }>['data']);
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 处理消息
   * @param message WebSocket 消息
   */
  private handleMessage(message: WebSocketMessage): void {
    const { type, data } = message;

    // 处理 pong 响应
    if (type === 'pong') {
      return;
    }

    // 通知注册的处理器
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for type "${type}":`, error);
        }
      });
    }
  }

  /**
   * 通知所有处理器
   * @param type 消息类型
   * @param data 消息数据
   */
  private notifyHandlers(
    type: WebSocketMessage['type'],
    data: any
  ): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for type "${type}":`, error);
        }
      });
    }
  }

  /**
   * 注册消息处理器
   * @param type 消息类型
   * @param handler 处理器函数
   * @returns 取消订阅函数
   */
  on<T extends WebSocketMessage['type']>(type: T, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)!.add(handler);

    // 返回取消订阅函数
    return () => {
      this.messageHandlers.get(type)?.delete(handler);
    };
  }

  /**
   * 发送消息
   * @param type 消息类型
   * @param data 消息数据
   */
  send<T extends WebSocketMessage['type']>(
    type: T,
    data: Extract<WebSocketMessage, { type: T }>['data']
  ): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const message: WebSocketMessage = {
          type,
          data,
          timestamp: Date.now()
        } as WebSocketMessage;
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket is not open, message not sent:', { type, data });
    }
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 处理页面可见性变化
   * @param token 认证令牌
   */
  handleVisibilityChange(token: string): void {
    if (document.hidden) {
      // 页面隐藏，减少心跳频率或断开连接
      this.stopHeartbeat();
    } else {
      // 页面可见，恢复心跳
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.startHeartbeat();
      } else if (!this.isIntentionallyClosed) {
        // 如果断开连接，重新连接
        this.connect(token);
      }
    }
  }

  /**
   * 设置页面可见性处理器
   */
  private setupVisibilityHandler(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        // 这里需要从外部传入 token，所以实际处理在外部调用
        // 这个方法只是占位，实际的处理在 handleVisibilityChange 中
      });
    }
  }

  /**
   * 获取连接状态
   * @returns 连接状态
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * 检查是否已连接
   * @returns 是否已连接
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

function getDefaultWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:3000/ws';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

// 创建 WebSocket 实例
export const wsManager = new WebSocketManager({
  url: import.meta.env.VITE_WS_URL || getDefaultWebSocketUrl(),
  reconnectInterval: 1000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000, // 30 秒
});

// 导出类型
export type { WebSocketConfig };
export { WebSocketManager };
