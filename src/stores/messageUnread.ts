import { defineStore } from "pinia";
import { computed, ref } from "vue";

import {
  getMessageUnreadCount,
  markConversationRead as markConversationReadApi,
} from "@/api/message";

// 消息未读的单一信息源：会话列表徽标、筛选未读数、顶栏红点、会话行徽标都读它。
// store 只持有"未读"这一处共享 UI 状态，会话列表本体和线程历史仍由各自的 composable 拥有，
// 遵循 stores/README 的"共享 UI 状态入 store、服务端列表数据不入 store"约定。
export const useMessageUnreadStore = defineStore("messageUnread", () => {
  // 未读总数：优先采用后端未读摘要；摘要缺失时为 null，UI 用占位而非显示 0。
  const total = ref<number | null>(null);
  // 各会话未读数：由会话列表摘要写入，既读后单条归零，供会话行徽标与差额计算复用。
  const perConversation = ref<Map<string, number>>(new Map());

  const totalDisplay = computed(() => total.value ?? 0);

  function unreadOf(conversationId: string): number {
    return perConversation.value.get(conversationId) ?? 0;
  }

  // 后端未读摘要总数直接覆盖 total，作为跨页一致的总数信息源。
  function setTotal(next: number | null): void {
    total.value = next;
  }

  // 从会话列表摘要写入各会话未读，用于会话行徽标；不在此推导总数（总数以未读摘要为准）。
  function hydrateFromConversations(
    conversations: Array<{ id: string; unreadCount: number }>,
  ): void {
    const next = new Map(perConversation.value);
    for (const conversation of conversations) {
      next.set(conversation.id, conversation.unreadCount);
    }
    perConversation.value = next;
  }

  // 拉取后端未读摘要写入总数；失败保持 null 交给 UI 降级，不抛出打断调用方。
  async function refreshTotal(): Promise<void> {
    try {
      const result = await getMessageUnreadCount();
      total.value = result.unreadCount;
    } catch {
      total.value = null;
    }
  }

  // 将会话标记为已读：乐观地把该会话未读归零、总数扣除对应差额，再请求后端确认。
  // 已经是 0（或未知）时直接跳过，避免重复请求和把总数扣成负数。
  async function markConversationRead(conversationId: string): Promise<void> {
    const current = perConversation.value.get(conversationId) ?? 0;
    if (current <= 0) {
      return;
    }

    const next = new Map(perConversation.value);
    next.set(conversationId, 0);
    perConversation.value = next;
    if (total.value !== null) {
      total.value = Math.max(0, total.value - current);
    }

    try {
      await markConversationReadApi({ conversationId });
    } catch {
      // 后端既读失败：回滚本地乐观归零，未读恢复，用户可再次进入触发。
      const rollback = new Map(perConversation.value);
      rollback.set(conversationId, current);
      perConversation.value = rollback;
      if (total.value !== null) {
        total.value += current;
      }
    }
  }

  return {
    total,
    totalDisplay,
    perConversation,
    unreadOf,
    setTotal,
    hydrateFromConversations,
    refreshTotal,
    markConversationRead,
  };
});
