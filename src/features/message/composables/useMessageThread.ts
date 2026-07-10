import { computed, ref, watch, type MaybeRefOrGetter, toValue } from "vue";

import {
  listConversationMessages,
  sendConversationMessage,
} from "@/api/message";

import { mapMessage, mapSentMessage } from "../lib/messageCenterMapper";
import type {
  MessageCenterMessage,
  MessageThreadState,
  MessageThreadStatus,
} from "../types";

const threadPageSize = 30;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "消息请求失败";
}

// 线程 workflow 拥有单个会话的历史加载、分页和发送状态机。
// conversationId 以 getter 传入，切换会话时自动重载并丢弃旧响应。
export function useMessageThread(
  conversationId: MaybeRefOrGetter<string | null>,
): MessageThreadState {
  const status = ref<MessageThreadStatus>("idle");
  const error = ref<string | null>(null);
  const messages = ref<MessageCenterMessage[]>([]);
  const draft = ref("");
  const sending = ref(false);
  const cursor = ref<string | null>(null);
  const hasMore = ref(false);
  const loadingMore = ref(false);
  // 待发送/失败消息保留原始文本，供失败重试复用，不依赖已清空的 draft。
  const pendingText = ref<Map<string, string>>(new Map());
  let threadRequestId = 0;

  const canSend = computed(
    () => draft.value.trim().length > 0 && !sending.value,
  );
  const canLoadMore = computed(() => hasMore.value && !loadingMore.value);

  async function loadFirstPage(id: string): Promise<void> {
    const requestId = ++threadRequestId;
    status.value = "loading";
    error.value = null;
    // 切换会话先清空旧线程，避免用户短暂看到上一个会话的历史。
    messages.value = [];
    cursor.value = null;
    hasMore.value = false;

    try {
      const result = await listConversationMessages({
        conversationId: id,
        size: threadPageSize,
      });
      if (requestId !== threadRequestId) {
        return;
      }

      messages.value = result.items.map(mapMessage);
      cursor.value = result.nextCursor ?? null;
      hasMore.value = result.hasMore;
      status.value = messages.value.length > 0 ? "success" : "empty";
    } catch (requestError) {
      if (requestId !== threadRequestId) {
        return;
      }

      status.value = "error";
      error.value = toErrorMessage(requestError);
      messages.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    const id = toValue(conversationId);
    if (!id || !hasMore.value || loadingMore.value || !cursor.value) {
      return;
    }

    const requestId = threadRequestId;
    loadingMore.value = true;
    error.value = null;

    try {
      const result = await listConversationMessages({
        conversationId: id,
        cursor: cursor.value,
        size: threadPageSize,
      });
      if (requestId !== threadRequestId) {
        return;
      }

      // 分页向上加载更早历史，早于当前已加载的消息，插入到列表前部。
      messages.value = [...result.items.map(mapMessage), ...messages.value];
      cursor.value = result.nextCursor ?? null;
      hasMore.value = result.hasMore;
    } catch (requestError) {
      if (requestId === threadRequestId) {
        error.value = toErrorMessage(requestError);
      }
    } finally {
      if (requestId === threadRequestId) {
        loadingMore.value = false;
      }
    }
  }

  // 本地生成待发送消息 id：仅用于乐观追加期间定位该条，成功后由回执 id 替换。
  function nextLocalMessageId(): string {
    return `local-pending-${threadRequestId}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
  }

  async function deliver(localId: string, id: string, text: string): Promise<void> {
    try {
      const response = await sendConversationMessage({
        conversationId: id,
        content: text,
      });

      // 成功：用回执替换本地待发送消息，转为 sent/read 状态。
      const sent = mapSentMessage(response);
      messages.value = messages.value.map((message) =>
        message.id === localId ? sent : message,
      );
      pendingText.value.delete(localId);
    } catch (requestError) {
      // 失败：保留本地消息并标记 failed，允许重试；不清空用户输入内容。
      messages.value = messages.value.map((message) =>
        message.id === localId
          ? { ...message, deliveryState: "failed" as const }
          : message,
      );
      error.value = toErrorMessage(requestError);
    }
  }

  async function send(): Promise<void> {
    const id = toValue(conversationId);
    const text = draft.value.trim();
    if (!id || !text || sending.value) {
      return;
    }

    sending.value = true;
    error.value = null;

    const localId = nextLocalMessageId();
    pendingText.value.set(localId, text);
    // 乐观追加为 sending；成功转 sent，失败转 failed。
    messages.value = [
      ...messages.value,
      {
        id: localId,
        author: "me",
        deliveryState: "sending",
        text,
        sentAt: "",
      },
    ];
    draft.value = "";

    try {
      await deliver(localId, id, text);
    } finally {
      sending.value = false;
    }
  }

  async function retryMessage(messageId: string): Promise<void> {
    const id = toValue(conversationId);
    const text = pendingText.value.get(messageId);
    const target = messages.value.find((message) => message.id === messageId);
    // 仅重试仍处于 failed 的本地消息，且 conversation 未切走。
    if (!id || !text || !target || target.deliveryState !== "failed") {
      return;
    }

    messages.value = messages.value.map((message) =>
      message.id === messageId
        ? { ...message, deliveryState: "sending" as const }
        : message,
    );
    error.value = null;

    await deliver(messageId, id, text);
  }

  // conversationId 变化时重载线程；null 时回到 idle 空态。
  watch(
    () => toValue(conversationId),
    (id) => {
      if (!id) {
        threadRequestId += 1;
        status.value = "idle";
        messages.value = [];
        cursor.value = null;
        hasMore.value = false;
        error.value = null;
        draft.value = "";
        pendingText.value.clear();
        return;
      }

      draft.value = "";
      pendingText.value.clear();
      void loadFirstPage(id);
    },
    { immediate: true },
  );

  return {
    status,
    error,
    messages,
    draft,
    canSend,
    sending,
    hasMore,
    loadingMore,
    canLoadMore,
    loadMore,
    send,
    retryMessage,
    retry: async () => {
      const id = toValue(conversationId);
      if (id) {
        await loadFirstPage(id);
      }
    },
  };
}
