/**
 * WebSocket 消息类型和处理器
 *
 * 本模块使用可辨识联合类型定义类型安全的 WebSocket 消息结构，
 * 确保编译时的类型安全。
 *
 * @module types/websocket
 */

import type { NotificationType } from './index';

/**
 * WebSocket 消息基础结构
 *
 * 所有 WebSocket 消息都包含这些基础属性，用于跟踪和识别。
 */
interface BaseWebSocketMessage {
  /** 消息类型标识符，用于可辨识联合类型 */
  type: string;
  /** 消息创建时的 Unix 时间戳 */
  timestamp: number;
}

/**
 * 聊天消息载荷
 *
 * 表示通过 WebSocket 发送的聊天消息的数据结构。
 *
 * @property conversationId - 会话 ID
 * @property senderId - 消息发送者 ID
 * @property content - 消息内容
 * @property messageType - 消息类型（TEXT、IMAGE 或 FILE）
 */
export interface ChatMessagePayload {
  conversationId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
}

/**
 * 通知消息载荷
 *
 * 表示通知消息的数据结构。
 *
 * @property id - 唯一通知标识符
 * @property type - 通知类型（LIKE、COMMENT、FOLLOW、SYSTEM）
 * @property title - 通知标题
 * @property content - 通知内容
 * @property relatedId - 可选的关联实体 ID
 */
export interface NotificationPayload {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
}

/**
 * 系统消息载荷
 *
 * 表示系统级消息，如维护通知或服务器公告。
 *
 * @property code - 系统消息代码，用于分类
 * @property message - 人类可读的消息
 * @property data - 可选的附加数据
 */
export interface SystemMessagePayload {
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * 心跳载荷
 *
 * 用于客户端和服务器之间的保活消息。
 *
 * @property timestamp - 心跳的 Unix 时间戳
 */
export interface HeartbeatPayload {
  timestamp: number;
}

/**
 * 新消息载荷
 *
 * 用于通知新消息到达。
 */
export interface NewMessagePayload {
  messageId: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: number;
}

/**
 * 消息已读载荷
 *
 * 用于标记消息为已读。
 */
export interface MessageReadPayload {
  messageId?: string;
  messageIds?: string[];
  conversationId: string;
  readAt: number;
}

/**
 * 消息删除载荷
 *
 * 用于通知消息已被删除。
 */
export interface MessageDeletedPayload {
  messageId: string;
  conversationId: string;
}

/**
 * 正在输入载荷
 *
 * 用于显示用户正在输入状态。
 */
export interface TypingPayload {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

/**
 * 在线状态载荷
 *
 * 用于更新用户在线状态。
 */
export interface OnlineStatusPayload {
  userId: string;
  isOnline: boolean;
  lastSeen?: number;
}

/**
 * 通知已读载荷
 *
 * 用于标记通知为已读。
 */
export interface NotificationReadPayload {
  notificationId: string;
}

/**
 * 未读数量载荷
 *
 * 用于更新未读消息或通知数量。
 */
export interface UnreadCountPayload {
  count: number;
}

/**
 * 最大重连尝试载荷
 *
 * 当达到最大重连尝试次数时发送。
 */
export interface MaxReconnectAttemptsPayload {
  attempts: number;
  timestamp: number;
}

/**
 * 发送消息载荷
 *
 * 用于发送新消息。
 */
export interface SendMessagePayload {
  conversationId: string;
  receiverId: string;
  content: string;
}

/**
 * 标记已读载荷（WebSocket）
 *
 * 用于通过 WebSocket 标记消息为已读。
 */
export interface MarkReadWebSocketPayload {
  conversationId: string;
  messageIds: string[];
}

/**
 * 连接事件数据
 *
 * 与连接和断开连接事件相关的数据。
 *
 * @property timestamp - 事件的 Unix 时间戳
 * @property code - 可选的 WebSocket 关闭代码
 * @property reason - 可选的断开连接原因（人类可读）
 */
export interface ConnectionEventData {
  timestamp: number;
  code?: number;
  reason?: string;
}

/**
 * 错误事件数据
 *
 * 与 WebSocket 错误事件相关的数据。
 *
 * @property error - 错误对象
 * @property timestamp - 错误发生时的 Unix 时间戳
 */
export interface ErrorEventData {
  error: Error;
  timestamp: number;
}

/**
 * 所有 WebSocket 消息类型的可辨识联合类型
 *
 * 此联合类型通过使用 'type' 字段作为辨识器来确保类型安全。
 * TypeScript 可以根据 'type' 字段的值来收窄类型。
 *
 * @example
 * ```typescript
 * function handleMessage(message: WebSocketMessage) {
 *   if (message.type === 'chat') {
 *     // TypeScript 知道 message.data 是 ChatMessagePayload
 *     console.log(message.data.conversationId);
 *   }
 * }
 * ```
 */
export type WebSocketMessage =
  | (BaseWebSocketMessage & { type: 'chat'; data: ChatMessagePayload })
  | (BaseWebSocketMessage & { type: 'notification'; data: NotificationPayload })
  | (BaseWebSocketMessage & { type: 'system'; data: SystemMessagePayload })
  | (BaseWebSocketMessage & { type: 'ping' | 'pong'; data: HeartbeatPayload })
  | (BaseWebSocketMessage & { type: 'connected' | 'disconnected'; data: ConnectionEventData })
  | (BaseWebSocketMessage & { type: 'error'; data: ErrorEventData })
  | (BaseWebSocketMessage & { type: 'new_message'; data: NewMessagePayload })
  | (BaseWebSocketMessage & { type: 'message_read'; data: MessageReadPayload })
  | (BaseWebSocketMessage & { type: 'message_deleted'; data: MessageDeletedPayload })
  | (BaseWebSocketMessage & { type: 'typing'; data: TypingPayload })
  | (BaseWebSocketMessage & { type: 'online_status'; data: OnlineStatusPayload })
  | (BaseWebSocketMessage & { type: 'notification_read'; data: NotificationReadPayload })
  | (BaseWebSocketMessage & { type: 'unread_count'; data: UnreadCountPayload })
  | (BaseWebSocketMessage & { type: 'max_reconnect_attempts'; data: MaxReconnectAttemptsPayload })
  | (BaseWebSocketMessage & { type: 'send_message'; data: SendMessagePayload })
  | (BaseWebSocketMessage & { type: 'mark_read'; data: MarkReadWebSocketPayload });

/**
 * 类型安全的消息处理器
 *
 * 泛型处理器类型，确保处理器接收基于消息类型的正确载荷类型。
 *
 * @template T - 消息类型（例如 'chat'、'notification'）
 *
 * @example
 * ```typescript
 * const chatHandler: MessageHandler<'chat'> = (data) => {
 *   // data 的类型是 ChatMessagePayload
 *   console.log(data.conversationId);
 * };
 * ```
 */
export type MessageHandler<T extends WebSocketMessage['type']> = (
  data: Extract<WebSocketMessage, { type: T }>['data']
) => void;

/**
 * 通用消息处理器（用于向后兼容）
 *
 * 当需要在单个处理器中处理多种消息类型时使用。
 * 对于类型安全的处理，建议使用 MessageHandler<T>。
 */
export type GenericMessageHandler = (data: WebSocketMessage['data']) => void;

/**
 * 具有类型安全方法的 WebSocket 管理器接口
 *
 * 定义 WebSocket 连接管理的契约，所有操作都具有编译时类型安全。
 */
export interface IWebSocketManager {
  /**
   * 建立 WebSocket 连接
   * @param token - 认证令牌
   */
  connect(token: string): void;

  /**
   * 关闭 WebSocket 连接
   */
  disconnect(): void;

  /**
   * 通过 WebSocket 发送类型化消息
   *
   * @template T - 消息类型
   * @param type - 消息类型标识符
   * @param data - 与类型匹配的消息载荷
   */
  send<T extends WebSocketMessage['type']>(
    type: T,
    data: Extract<WebSocketMessage, { type: T }>['data']
  ): void;

  /**
   * 注册类型化消息处理器
   *
   * @template T - 要处理的消息类型
   * @param type - 消息类型标识符
   * @param handler - 消息类型的处理器函数
   * @returns 取消订阅函数
   */
  on<T extends WebSocketMessage['type']>(type: T, handler: MessageHandler<T>): () => void;

  /**
   * 检查 WebSocket 是否已连接
   * @returns 如果已连接返回 true，否则返回 false
   */
  isConnected(): boolean;

  /**
   * 获取当前 WebSocket 就绪状态
   * @returns WebSocket 就绪状态常量
   */
  getReadyState(): number;
}
