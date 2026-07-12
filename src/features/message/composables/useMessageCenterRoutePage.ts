import { computed, watch } from "vue";
import { useRoute } from "vue-router";

import { useMessageUnreadStore } from "@/stores/messageUnread";

import { useMessageCenterPage } from "./useMessageCenterPage";
import { useMessageThread } from "./useMessageThread";

// 会话详情路由入口：解析 conversationId，装配会话列表与线程两个 workflow。
// composable 只在 setup 期调用一次，路由参数变化通过 watch 同步，
// 不在 computed getter 里重建 composable（那会脱离 setup 作用域并反复重建状态）。
export function useMessageCenterRoutePage() {
  const route = useRoute();
  const conversationId = computed(() => {
    const param = route.params.conversationId;
    const value = Array.isArray(param) ? param[0] : param;
    return value ?? null;
  });

  const center = useMessageCenterPage();
  const thread = useMessageThread(conversationId);
  const unreadStore = useMessageUnreadStore();
  const activeUnreadCount = computed(() => {
    const id = conversationId.value;
    return id ? unreadStore.unreadOf(id) : 0;
  });

  // 路由 conversationId 变化时同步选中态，让列表高亮跟随 URL。
  // 未知 id 保持空详情，不回退默认会话，避免展示错误私信内容。
  watch(
    conversationId,
    (nextId) => {
      center.selectConversation(nextId);
    },
    { immediate: true },
  );

  const conversation = center.activeConversation;

  // 只有线程成功进入可见状态后才消费未读；同时监听会话摘要，消除线程先于列表返回的竞态。
  watch(
    [conversationId, thread.status, activeUnreadCount],
    ([id, status, unreadCount]) => {
      if (id && unreadCount > 0 && (status === "success" || status === "empty")) {
        void unreadStore.markConversationRead(id);
      }
    },
    { immediate: true },
  );

  return {
    center,
    thread,
    conversationId,
    conversation,
  };
}
