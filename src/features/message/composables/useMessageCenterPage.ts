import { computed, ref } from "vue";

import {
  type ListConversationsReq,
  getMessageUnreadCount,
  listConversations,
} from "@/api/message";

import { mapConversationSummary } from "../lib/messageCenterMapper";
import type {
  MessageCenterConversation,
  MessageCenterPageState,
  MessageCenterStatus,
} from "../types";

const conversationPageSize = 20;

function listRequestParams(cursor?: string | null): ListConversationsReq {
  return {
    size: conversationPageSize,
    ...(cursor ? { cursor } : {}),
  };
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "会话列表加载失败";
}

interface UseMessageCenterPageOptions {
  // 会话列表入口（/messages）无路由参数时，加载成功后默认选中第一条会话，
  // 用于桌面端右侧内联展示线程；会话详情入口按路由 id 选中，不启用该默认。
  autoSelectFirst?: boolean;
}

export function useMessageCenterPage(
  options: UseMessageCenterPageOptions = {},
): MessageCenterPageState {
  const status = ref<MessageCenterStatus>("loading");
  const error = ref<string | null>(null);
  const conversations = ref<MessageCenterConversation[]>([]);
  const activeConversationId = ref<string | null>(null);
  const unreadCount = ref<number | null>(null);
  const cursor = ref<string | null>(null);
  const hasMore = ref(false);
  const loadingMore = ref(false);
  // 会话列表请求序列号：切换或重载后丢弃旧响应，避免 stale 列表覆盖新列表。
  let listRequestId = 0;

  const activeConversation = computed<MessageCenterConversation | null>(
    () =>
      conversations.value.find(
        (conversation) => conversation.id === activeConversationId.value,
      ) ?? null,
  );
  const canLoadMore = computed(() => hasMore.value && !loadingMore.value);

  // 未读总数来自 Message 未读摘要，不从会话行数推导；失败时保持 null，UI 用占位而非 0。
  async function refreshUnreadCount(requestId: number): Promise<void> {
    try {
      const result = await getMessageUnreadCount();
      if (requestId !== listRequestId) {
        return;
      }
      unreadCount.value = result.unreadCount;
    } catch {
      if (requestId === listRequestId) {
        unreadCount.value = null;
      }
    }
  }

  async function loadFirstPage(): Promise<void> {
    const requestId = ++listRequestId;
    status.value = "loading";
    error.value = null;
    conversations.value = [];
    cursor.value = null;
    hasMore.value = false;

    try {
      // 未读摘要失败不能拖垮会话列表，二者独立结算。
      const [listResult] = await Promise.all([
        listConversations(listRequestParams()),
        refreshUnreadCount(requestId),
      ]);
      if (requestId !== listRequestId) {
        return;
      }

      conversations.value = listResult.items.map(mapConversationSummary);
      cursor.value = listResult.nextCursor ?? null;
      hasMore.value = listResult.hasMore;
      status.value = conversations.value.length > 0 ? "success" : "empty";

      // 列表入口默认选中第一条会话（仅当尚未选中时），供桌面端内联线程展示。
      if (
        options.autoSelectFirst &&
        activeConversationId.value === null &&
        conversations.value.length > 0
      ) {
        activeConversationId.value = conversations.value[0].id;
      }
    } catch (requestError) {
      if (requestId !== listRequestId) {
        return;
      }

      status.value = "error";
      error.value = toErrorMessage(requestError);
      conversations.value = [];
      cursor.value = null;
      hasMore.value = false;
    }
  }

  async function loadMore(): Promise<void> {
    if (!hasMore.value || loadingMore.value || !cursor.value) {
      return;
    }

    const requestId = listRequestId;
    loadingMore.value = true;

    try {
      const listResult = await listConversations(
        listRequestParams(cursor.value),
      );
      if (requestId !== listRequestId) {
        return;
      }

      conversations.value = [
        ...conversations.value,
        ...listResult.items.map(mapConversationSummary),
      ];
      cursor.value = listResult.nextCursor ?? null;
      hasMore.value = listResult.hasMore;
    } catch {
      // 加载更多失败保留已加载会话，仅停在当前页，用户可再次触发。
    } finally {
      if (requestId === listRequestId) {
        loadingMore.value = false;
      }
    }
  }

  // 选中会话仅切换当前会话 id，线程数据由 useMessageThread 依据该 id 独立加载。
  function selectConversation(conversationId: string | null): void {
    activeConversationId.value = conversationId;
  }

  void loadFirstPage();

  return {
    status,
    error,
    conversations,
    activeConversationId,
    activeConversation,
    unreadCount,
    hasMore,
    loadingMore,
    canLoadMore,
    retry: loadFirstPage,
    loadMore,
    selectConversation,
  };
}
