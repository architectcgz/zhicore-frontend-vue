/**
 * 事件处理器类型
 *
 * 本模块定义各种应用程序事件的类型安全事件处理器签名，
 * 包括上传、WebSocket 事件和自定义事件。
 *
 * @module types/events
 */

import type { AxiosProgressEvent } from 'axios';
import type {
  WebSocketMessage,
  ConnectionEventData,
  ErrorEventData,
} from './websocket';

/**
 * 上传进度事件类型
 *
 * 用于文件上传进度跟踪的 Axios 进度事件类型。
 */
export type UploadProgressEvent = AxiosProgressEvent;

/**
 * 上传进度处理器
 *
 * 文件上传进度事件的处理器函数。
 * 接收包含已加载字节数和总字节数的进度信息。
 *
 * @param event - 包含上传信息的进度事件
 *
 * @example
 * ```typescript
 * const handleProgress: UploadProgressHandler = (event) => {
 *   if (event.total) {
 *     const percentComplete = (event.loaded / event.total) * 100;
 *     console.log(`上传进度: ${percentComplete}%`);
 *   }
 * };
 * ```
 */
export type UploadProgressHandler = (event: UploadProgressEvent) => void;

/**
 * WebSocket 事件类型
 *
 * 所有可以触发的 WebSocket 事件类型。
 */
export type WebSocketEventType = 'connected' | 'disconnected' | 'error' | 'message';

/**
 * WebSocket 事件数据映射
 *
 * 将每个 WebSocket 事件类型映射到其对应的数据类型。
 * 这使得能够进行类型安全的事件处理，并具有适当的类型推断。
 */
export interface WebSocketEventDataMap {
  connected: ConnectionEventData;
  disconnected: ConnectionEventData;
  error: ErrorEventData;
  message: WebSocketMessage;
}

/**
 * 类型安全的 WebSocket 事件处理器
 *
 * 泛型处理器类型，确保处理器接收基于事件类型的正确数据类型。
 *
 * @template T - 事件类型（例如 'connected'、'message'）
 *
 * @example
 * ```typescript
 * const messageHandler: WebSocketEventHandler<'message'> = (data) => {
 *   // data 的类型是 WebSocketMessage
 *   console.log(data.type, data.timestamp);
 * };
 *
 * const errorHandler: WebSocketEventHandler<'error'> = (data) => {
 *   // data 的类型是 ErrorEventData
 *   console.error(data.error.message);
 * };
 * ```
 */
export type WebSocketEventHandler<T extends WebSocketEventType> = (
  data: WebSocketEventDataMap[T]
) => void;

/**
 * 通用 WebSocket 事件处理器（用于向后兼容）
 *
 * 当需要在单个处理器中处理多种事件类型时使用。
 * 对于类型安全的处理，建议使用 WebSocketEventHandler<T>。
 */
export type GenericWebSocketEventHandler = (data: WebSocketEventDataMap[WebSocketEventType]) => void;

/**
 * 表单提交事件处理器
 *
 * 表单提交事件的处理器。
 *
 * @param event - 表单提交事件
 */
export type FormSubmitHandler = (event: Event) => void | Promise<void>;

/**
 * 输入变更事件处理器
 *
 * 带有类型化值的输入变更事件处理器。
 *
 * @template T - 值类型
 * @param value - 新的输入值
 * @param event - 可选的原生输入事件
 */
export type InputChangeHandler<T = string> = (value: T, event?: Event) => void;

/**
 * 点击事件处理器
 *
 * 点击事件的处理器。
 *
 * @param event - 鼠标点击事件
 */
export type ClickHandler = (event: MouseEvent) => void;

/**
 * 键盘事件处理器
 *
 * 键盘事件的处理器。
 *
 * @param event - 键盘事件
 */
export type KeyboardHandler = (event: KeyboardEvent) => void;

/**
 * 滚动事件处理器
 *
 * 滚动事件的处理器。
 *
 * @param event - 滚动事件
 */
export type ScrollHandler = (event: Event) => void;

/**
 * 调整大小事件处理器
 *
 * 窗口/元素调整大小事件的处理器。
 *
 * @param event - 调整大小事件
 */
export type ResizeHandler = (event: UIEvent) => void;

/**
 * 拖拽事件处理器
 *
 * 拖放事件的处理器。
 *
 * @param event - 拖拽事件
 */
export type DragHandler = (event: DragEvent) => void;

/**
 * 文件选择处理器
 *
 * 文件输入选择事件的处理器。
 *
 * @param files - 选中的文件
 */
export type FileSelectionHandler = (files: File[]) => void;

/**
 * 可见性变更处理器
 *
 * 元素可见性变更的处理器（例如 intersection observer）。
 *
 * @param isVisible - 元素是否可见
 * @param entry - 可选的 intersection observer 条目
 */
export type VisibilityChangeHandler = (
  isVisible: boolean,
  entry?: IntersectionObserverEntry
) => void;

/**
 * 自定义事件数据
 *
 * 自定义应用程序事件的通用结构。
 *
 * @template T - 事件数据类型
 */
export interface CustomEventData<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}

/**
 * 自定义事件处理器
 *
 * 自定义应用程序事件的处理器。
 *
 * @template T - 事件数据类型
 * @param event - 自定义事件数据
 */
export type CustomEventHandler<T = unknown> = (event: CustomEventData<T>) => void;

/**
 * 事件发射器接口
 *
 * 用于类型安全事件处理的通用事件发射器接口。
 *
 * @template EventMap - 事件名称到其数据类型的映射
 */
export interface EventEmitter<EventMap extends Record<string, unknown>> {
  /**
   * 注册事件处理器
   *
   * @template K - 事件名称
   * @param event - 事件名称
   * @param handler - 事件处理器函数
   * @returns 取消订阅函数
   */
  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): () => void;

  /**
   * 注册一次性事件处理器
   *
   * @template K - 事件名称
   * @param event - 事件名称
   * @param handler - 事件处理器函数
   */
  once<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void;

  /**
   * 移除事件处理器
   *
   * @template K - 事件名称
   * @param event - 事件名称
   * @param handler - 要移除的事件处理器函数
   */
  off<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void;

  /**
   * 触发事件
   *
   * @template K - 事件名称
   * @param event - 事件名称
   * @param data - 事件数据
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void;
}
