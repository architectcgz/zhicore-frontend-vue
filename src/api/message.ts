import type { ApiCursorResp } from "@/types/api";
import { isLocalDemoModeEnabled } from "@/runtime/localDemoMode";

import { getAxiosInstance } from "./request";

// Message provider 的稳定 HTTP adapter：会话摘要、历史消息、未读摘要和发送命令。
// 字段、path 与错误码以 services/zhicore-message/api/http/ 为准；本文只固定前端消费的 DTO 形状。

export interface ListConversationsReq {
  cursor?: string;
  size?: number;
  unreadOnly?: boolean;
}

export interface ConversationSummaryResp {
  conversationId: string;
  participantId: string;
  participantName: string;
  // 头像首字母来自 User 摘要，摘要缺失时可能为空，由前端回退到昵称首字。
  participantAvatarInitial?: string;
  lastMessagePreview: string;
  // ISO-8601 时间戳，展示格式由前端 mapper 决定。
  lastMessageAt: string;
  unreadCount: number;
  participantOnline: boolean;
}

export type ListConversationsResp = ApiCursorResp<ConversationSummaryResp>;

export interface ListMessagesReq {
  conversationId: string;
  cursor?: string;
  size?: number;
}

export interface MessageResp {
  messageId: string;
  // 方向由后端相对当前登录用户计算，前端不自行比对 senderId。
  direction: "incoming" | "outgoing";
  content: string;
  // ISO-8601 时间戳。
  sentAt: string;
  // 仅 outgoing 有意义：对方是否已读。
  read: boolean;
}

export type ListMessagesResp = ApiCursorResp<MessageResp>;

export interface ConversationUnreadCountResp {
  unreadCount: number;
}

export interface SendMessageReq {
  conversationId: string;
  content: string;
}

export interface SendMessageResp {
  messageId: string;
  conversationId: string;
  direction: "outgoing";
  content: string;
  sentAt: string;
  read: boolean;
}

// ---- 本地 demo fixture：仅在 demo 模式下返回，形状与真实 Resp 完全一致 ----

const localDemoConversations: ConversationSummaryResp[] = [
  {
    conversationId: "conv-antigravity",
    participantId: "user-antigravity",
    participantName: "Antigravity",
    participantAvatarInitial: "AI",
    lastMessagePreview: "编辑器保存冲突那篇我看完了，有一个问题想请教。",
    lastMessageAt: "2026-07-07T16:02:00.000Z",
    unreadCount: 2,
    participantOnline: true,
  },
  {
    conversationId: "conv-lin",
    participantId: "user-lin",
    participantName: "Lin",
    participantAvatarInitial: "林",
    lastMessagePreview: "你的编辑器体验笔记我收藏了。",
    lastMessageAt: "2026-07-07T14:12:00.000Z",
    unreadCount: 0,
    participantOnline: false,
  },
];

const localDemoMessages: Record<string, MessageResp[]> = {
  "conv-antigravity": [
    {
      messageId: "msg-1",
      direction: "incoming",
      content: "编辑器保存冲突那篇我看完了，有一个问题想请教。",
      sentAt: "2026-07-07T16:00:00.000Z",
      read: true,
    },
    {
      messageId: "msg-2",
      direction: "outgoing",
      content: "可以，我们把冲突提示放在正文保存状态旁边。",
      sentAt: "2026-07-07T16:02:00.000Z",
      read: true,
    },
  ],
  "conv-lin": [
    {
      messageId: "msg-3",
      direction: "incoming",
      content: "你的编辑器体验笔记我收藏了。",
      sentAt: "2026-07-07T14:12:00.000Z",
      read: true,
    },
  ],
};

function cloneDto<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function localDemoUnreadTotal(): number {
  return localDemoConversations.reduce(
    (total, conversation) => total + conversation.unreadCount,
    0,
  );
}

export async function listConversations(
  input?: ListConversationsReq,
): Promise<ListConversationsResp> {
  if (isLocalDemoModeEnabled()) {
    const params = input ?? {};
    const filtered = params.unreadOnly
      ? localDemoConversations.filter((item) => item.unreadCount > 0)
      : localDemoConversations;
    const start = params.cursor ? Number.parseInt(params.cursor, 10) || 0 : 0;
    const size = Math.min(Math.max(params.size ?? 20, 1), 50);
    const items = filtered.slice(start, start + size);
    const nextOffset = start + size;

    return {
      items: cloneDto(items),
      hasMore: nextOffset < filtered.length,
      ...(nextOffset < filtered.length ? { nextCursor: String(nextOffset) } : {}),
    };
  }

  const response = await getAxiosInstance().get<ListConversationsResp>(
    "/v1/conversations",
    { params: input },
  );

  return response.data;
}

export async function listConversationMessages(
  input: ListMessagesReq,
): Promise<ListMessagesResp> {
  if (isLocalDemoModeEnabled()) {
    const thread = localDemoMessages[input.conversationId] ?? [];
    const start = input.cursor ? Number.parseInt(input.cursor, 10) || 0 : 0;
    const size = Math.min(Math.max(input.size ?? 30, 1), 50);
    const items = thread.slice(start, start + size);
    const nextOffset = start + size;

    return {
      items: cloneDto(items),
      hasMore: nextOffset < thread.length,
      ...(nextOffset < thread.length ? { nextCursor: String(nextOffset) } : {}),
    };
  }

  // path 段转义，防止 conversationId 中的特殊字符破坏 URL 结构。
  const response = await getAxiosInstance().get<ListMessagesResp>(
    `/v1/conversations/${encodeURIComponent(input.conversationId)}/messages`,
    { params: { cursor: input.cursor, size: input.size } },
  );

  return response.data;
}

export async function getMessageUnreadCount(): Promise<ConversationUnreadCountResp> {
  if (isLocalDemoModeEnabled()) {
    return { unreadCount: localDemoUnreadTotal() };
  }

  const response = await getAxiosInstance().get<ConversationUnreadCountResp>(
    "/v1/conversations/unread-count",
  );

  return response.data;
}

export async function sendConversationMessage(
  input: SendMessageReq,
): Promise<SendMessageResp> {
  if (isLocalDemoModeEnabled()) {
    // demo 模式回显一条已发送消息，形状与真实发送 Resp 一致；不修改共享 fixture。
    return {
      messageId: `local-demo-message-${Date.now()}`,
      conversationId: input.conversationId,
      direction: "outgoing",
      content: input.content,
      sentAt: new Date(0).toISOString(),
      read: false,
    };
  }

  const response = await getAxiosInstance().post<SendMessageResp>(
    `/v1/conversations/${encodeURIComponent(input.conversationId)}/messages`,
    { content: input.content },
  );

  return response.data;
}
