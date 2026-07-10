import type {
  ConversationSummaryResp,
  MessageResp,
  SendMessageResp,
} from "@/api/message";

import type {
  MessageCenterConversation,
  MessageCenterMessage,
} from "../types";

// 会话时间戳格式化：优先展示当天时分，非当天回退到月-日。
// 后端给的是 ISO-8601，展示格式由前端拥有，不让 API 层决定。
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  if (sameDay) {
    return `${hours}:${minutes}`;
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

// 头像首字母：后端摘要缺失时回退到昵称首字，保证列表不出现空头像。
function resolveInitial(summary: ConversationSummaryResp): string {
  const initial = summary.participantAvatarInitial?.trim();
  if (initial) {
    return initial;
  }

  const name = summary.participantName.trim();
  return name ? Array.from(name)[0] : "?";
}

export function mapConversationSummary(
  summary: ConversationSummaryResp,
): MessageCenterConversation {
  return {
    id: summary.conversationId,
    participantId: summary.participantId,
    participantName: summary.participantName,
    participantInitial: resolveInitial(summary),
    lastMessage: summary.lastMessagePreview,
    lastMessageAt: formatTimestamp(summary.lastMessageAt),
    unreadCount: summary.unreadCount,
    online: summary.participantOnline,
  };
}

export function mapMessage(message: MessageResp): MessageCenterMessage {
  return {
    id: message.messageId,
    author: message.direction === "outgoing" ? "me" : "other",
    // 仅本人消息展示发送态；已读优先于已发送。
    ...(message.direction === "outgoing"
      ? { deliveryState: message.read ? ("read" as const) : ("sent" as const) }
      : {}),
    text: message.content,
    sentAt: formatTimestamp(message.sentAt),
  };
}

// 发送成功后的回执映射为本地已发送消息，接入当前线程。
export function mapSentMessage(
  response: SendMessageResp,
): MessageCenterMessage {
  return {
    id: response.messageId,
    author: "me",
    deliveryState: response.read ? "read" : "sent",
    text: response.content,
    sentAt: formatTimestamp(response.sentAt),
  };
}
