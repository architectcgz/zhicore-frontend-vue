/**
 * 标签页同步消息类型
 *
 * 本模块定义用于跨标签页通信的类型安全消息结构，
 * 使用 BroadcastChannel API 或 localStorage 事件。
 *
 * @module types/tabsync
 */

import type { Message, Notification } from './index';

/**
 * 标签页同步消息类型
 *
 * 可以在浏览器标签页之间广播的所有可能消息类型的枚举。
 */
export type TabSyncMessageType =
  | 'auth_changed'
  | 'logout'
  | 'mark_read'
  | 'new_message'
  | 'notification_received'
  | 'notification_read'
  | 'notification_all_read'
  | 'user_update'
  | 'theme_change';

/**
 * 认证状态变更载荷
 *
 * 当用户认证状态变更时广播（登录/令牌刷新）。
 *
 * @property userId - 已认证用户的 ID
 * @property accessToken - 新的访问令牌
 */
export interface AuthChangedPayload {
  userId: string;
  accessToken: string;
}

/**
 * 登出载荷
 *
 * 当用户登出时广播，以在所有标签页之间同步登出。
 *
 * @property reason - 可选的登出原因（例如 'user_action'、'token_expired'）
 */
export interface LogoutPayload {
  reason?: string;
}

/**
 * 标记已读载荷
 *
 * 当会话被标记为已读时广播，以在所有标签页中更新未读计数。
 *
 * @property conversationId - 被标记为已读的会话 ID
 */
export interface MarkReadPayload {
  conversationId: string;
}

/**
 * 新消息载荷
 *
 * 当收到新消息时广播，以在所有标签页中更新消息列表。
 *
 * @property message - 完整的消息对象
 */
export interface NewMessagePayload {
  message: Message;
}

/**
 * 收到通知载荷
 *
 * 当收到新通知时广播，以在所有标签页中更新通知列表和徽章。
 *
 * @property notification - 完整的通知对象
 */
export interface NotificationReceivedPayload {
  notification: Notification;
}

/**
 * 通知已读载荷
 *
 * 当通知被标记为已读时广播。
 *
 * @property notificationId - 被标记为已读的通知 ID
 */
export interface NotificationReadPayload {
  notificationId: string;
}

/**
 * 全部通知已读载荷
 *
 * 当所有通知被标记为已读时广播。
 */
export interface NotificationAllReadPayload {
  // 空对象，仅用于触发事件
}

/**
 * 用户信息更新载荷
 *
 * 当用户信息更新时广播。
 *
 * @property userId - 用户 ID
 * @property username - 可选的用户名
 * @property avatar - 可选的头像 URL
 * @property nickname - 可选的昵称
 */
export interface UserUpdatePayload {
  userId: string;
  username?: string;
  avatar?: string;
  nickname?: string;
  [key: string]: any; // 允许其他用户字段
}

/**
 * 主题变更载荷
 *
 * 当主题变更时广播。
 *
 * @property theme - 新的主题名称
 */
export interface ThemeChangePayload {
  theme: string;
}

/**
 * 标签页同步消息可辨识联合类型
 *
 * 此联合类型通过使用 'type' 字段作为辨识器来确保类型安全。
 * TypeScript 可以根据 'type' 字段的值来收窄类型。
 *
 * @example
 * ```typescript
 * function handleTabSyncMessage(message: TabSyncMessage) {
 *   if (message.type === 'new_message') {
 *     // TypeScript 知道 message.data 是 NewMessagePayload
 *     console.log(message.data.message.content);
 *   }
 * }
 * ```
 */
export type TabSyncMessage =
  | { type: 'auth_changed'; data: AuthChangedPayload }
  | { type: 'logout'; data: LogoutPayload }
  | { type: 'mark_read'; data: MarkReadPayload }
  | { type: 'new_message'; data: NewMessagePayload }
  | { type: 'notification_received'; data: NotificationReceivedPayload }
  | { type: 'notification_read'; data: NotificationReadPayload }
  | { type: 'notification_all_read'; data: NotificationAllReadPayload }
  | { type: 'user_update'; data: UserUpdatePayload }
  | { type: 'theme_change'; data: ThemeChangePayload };

/**
 * 标签页同步消息处理器
 *
 * 泛型处理器类型，确保处理器接收基于消息类型的正确载荷类型。
 *
 * @template T - 消息类型（例如 'auth_changed'、'logout'）
 *
 * @example
 * ```typescript
 * const authHandler: TabSyncHandler<'auth_changed'> = (data) => {
 *   // data 的类型是 AuthChangedPayload
 *   console.log(data.userId, data.accessToken);
 * };
 * ```
 */
export type TabSyncHandler<T extends TabSyncMessageType> = (
  data: Extract<TabSyncMessage, { type: T }>['data']
) => void;

/**
 * 通用标签页同步处理器（用于向后兼容）
 *
 * 当需要在单个处理器中处理多种消息类型时使用。
 * 对于类型安全的处理，建议使用 TabSyncHandler<T>。
 */
export type GenericTabSyncHandler = (data: TabSyncMessage['data']) => void;

/**
 * 标签页同步管理器接口
 *
 * 定义跨标签页通信管理的契约，所有操作都具有编译时类型安全。
 */
export interface ITabSyncManager {
  /**
   * 向所有其他标签页广播类型化消息
   *
   * @template T - 消息类型
   * @param type - 消息类型标识符
   * @param data - 与类型匹配的消息载荷
   */
  broadcast<T extends TabSyncMessageType>(
    type: T,
    data: Extract<TabSyncMessage, { type: T }>['data']
  ): void;

  /**
   * 注册类型化消息处理器
   *
   * @template T - 要处理的消息类型
   * @param type - 消息类型标识符
   * @param handler - 消息类型的处理器函数
   * @returns 取消订阅函数
   */
  on<T extends TabSyncMessageType>(type: T, handler: TabSyncHandler<T>): () => void;

  /**
   * 移除消息处理器
   *
   * @template T - 消息类型
   * @param type - 消息类型标识符
   * @param handler - 要移除的处理器函数
   */
  off<T extends TabSyncMessageType>(type: T, handler: TabSyncHandler<T>): void;

  /**
   * 移除特定消息类型的所有处理器
   *
   * @param type - 消息类型标识符
   */
  offAll(type: TabSyncMessageType): void;

  /**
   * 销毁标签页同步管理器并清理资源
   */
  destroy(): void;
}
