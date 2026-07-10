import { computed, watch } from "vue";
import { useRoute } from "vue-router";

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

  return {
    center,
    thread,
    conversationId,
    conversation,
  };
}
