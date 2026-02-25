/**
 * 多标签页同步工具
 * 使用 BroadcastChannel API 实现跨标签页通信
 */

import type {
  TabSyncMessage as TypedTabSyncMessage,
  TabSyncMessageType,
} from '@/types/tabsync';

/**
 * 标签页同步消息接口（扩展类型化消息）
 *
 * 添加运行时元数据到类型化消息载荷
 */
export type TabSyncMessage = TypedTabSyncMessage & {
  timestamp: number;
  tabId: string;
};

/**
 * 消息处理器类型
 *
 * 泛型处理器，确保处理器接收基于消息类型的正确载荷类型
 */
type MessageHandler<T extends TabSyncMessageType = TabSyncMessageType> = (
  data: Extract<TabSyncMessage, { type: T }>['data']
) => void;

/**
 * 标签页同步管理器
 */
class TabSyncManager {
  private channel: BroadcastChannel | null = null;
  private channelName = 'zhicore-app-sync';
  private handlers = new Map<TabSyncMessageType, Set<MessageHandler>>();
  private tabId: string;
  private isSupported: boolean;

  constructor() {
    // 生成唯一的标签页 ID
    this.tabId = `tab-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // 检查浏览器是否支持 BroadcastChannel
    this.isSupported = typeof BroadcastChannel !== 'undefined';
    
    if (this.isSupported) {
      this.init();
    } else {
      console.warn('BroadcastChannel is not supported in this browser');
    }
  }

  /**
   * 初始化 BroadcastChannel
   */
  private init(): void {
    try {
      this.channel = new BroadcastChannel(this.channelName);
      
      this.channel.onmessage = (event: MessageEvent<TabSyncMessage>) => {
        const message = event.data;
        
        // 忽略来自当前标签页的消息
        if (message.tabId === this.tabId) {
          return;
        }
        
        // 调用注册的处理器
        this.notifyHandlers(message);
      };
      
      this.channel.onmessageerror = (error) => {
        console.error('BroadcastChannel message error:', error);
      };
      
      console.log(`TabSync initialized with ID: ${this.tabId}`);
    } catch (error) {
      console.error('Failed to initialize BroadcastChannel:', error);
      this.isSupported = false;
    }
  }

  /**
   * 通知所有注册的处理器
   * @param message 同步消息
   */
  private notifyHandlers(message: TabSyncMessage): void {
    const handlers = this.handlers.get(message.type);
    
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`Error in tab sync handler for type "${message.type}":`, error);
        }
      });
    }
  }

  /**
   * 注册消息处理器
   *
   * @template T - 消息类型
   * @param type - 消息类型
   * @param handler - 处理器函数
   * @returns 取消订阅函数
   */
  on<T extends TabSyncMessageType>(
    type: T,
    handler: MessageHandler<T>
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    
    // 类型断言是安全的，因为我们使用泛型约束
    this.handlers.get(type)!.add(handler as unknown as MessageHandler);
    
    // 返回取消订阅函数
    return () => {
      this.handlers.get(type)?.delete(handler as unknown as MessageHandler);
    };
  }

  /**
   * 广播消息到其他标签页
   *
   * @template T - 消息类型
   * @param type - 消息类型
   * @param data - 与消息类型匹配的类型化数据
   */
  broadcast<T extends TabSyncMessageType>(
    type: T,
    data: Extract<TypedTabSyncMessage, { type: T }>['data']
  ): void {
    if (!this.isSupported || !this.channel) {
      console.warn('BroadcastChannel is not available, message not sent');
      return;
    }
    
    const message: TabSyncMessage = {
      type,
      data,
      timestamp: Date.now(),
      tabId: this.tabId,
    } as TabSyncMessage;
    
    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }

  /**
   * 关闭 BroadcastChannel
   */
  close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    
    this.handlers.clear();
  }

  /**
   * 获取当前标签页 ID
   * @returns 标签页 ID
   */
  getTabId(): string {
    return this.tabId;
  }

  /**
   * 检查是否支持 BroadcastChannel
   * @returns 是否支持
   */
  isChannelSupported(): boolean {
    return this.isSupported;
  }
}

// 创建全局实例
export const tabSyncManager = new TabSyncManager();

// 在页面卸载时关闭 channel
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    tabSyncManager.close();
  });
}
