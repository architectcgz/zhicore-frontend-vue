import type { ComputedRef, Ref } from "vue";

// 会话列表 / 历史消息各自独立的异步状态：列表失败不隐藏已有会话，
// 历史 provider 降级也只影响线程区域，二者不能混成一个布尔。
export type MessageCenterStatus = "loading" | "success" | "empty" | "error";

export type MessageThreadStatus =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error";

// 单条消息的发送生命周期：本地追加为 sending，成功转 sent，失败转 failed 可重试。
export type MessageDeliveryState = "sending" | "sent" | "read" | "failed";

export interface MessageCenterConversation {
  id: string;
  participantId: string;
  participantName: string;
  // 头像首字母；后端摘要缺失时由 mapper 回退到昵称首字。
  participantInitial: string;
  lastMessage: string;
  // 已格式化的相对/绝对展示时间。
  lastMessageAt: string;
  unreadCount: number;
  online: boolean;
}

export interface MessageCenterMessage {
  id: string;
  author: "me" | "other";
  // 仅本人消息有发送态；对方消息该字段为 undefined。
  deliveryState?: MessageDeliveryState;
  text: string;
  sentAt: string;
}

export interface MessageCenterPageState {
  status: Ref<MessageCenterStatus>;
  error: Ref<string | null>;
  conversations: Ref<MessageCenterConversation[]>;
  activeConversationId: Ref<string | null>;
  activeConversation: ComputedRef<MessageCenterConversation | null>;
  // 会话列表未读总数；加载失败时为 null，UI 用占位而非显示 0。
  unreadCount: Ref<number | null>;
  hasMore: Ref<boolean>;
  loadingMore: Ref<boolean>;
  canLoadMore: ComputedRef<boolean>;
  retry: () => Promise<void>;
  loadMore: () => Promise<void>;
  selectConversation: (conversationId: string | null) => void;
}

export interface MessageThreadState {
  status: Ref<MessageThreadStatus>;
  error: Ref<string | null>;
  messages: Ref<MessageCenterMessage[]>;
  draft: Ref<string>;
  canSend: ComputedRef<boolean>;
  sending: Ref<boolean>;
  hasMore: Ref<boolean>;
  loadingMore: Ref<boolean>;
  canLoadMore: ComputedRef<boolean>;
  loadMore: () => Promise<void>;
  send: () => Promise<void>;
  // 重试单条发送失败的消息。
  retryMessage: (messageId: string) => Promise<void>;
  retry: () => Promise<void>;
}
