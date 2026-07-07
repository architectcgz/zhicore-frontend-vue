import { computed } from "vue";
import { useRoute } from "vue-router";

import { useMessageCenterPage } from "./useMessageCenterPage";

export function useMessageCenterRoutePage() {
  const route = useRoute();
  const conversationId = computed(() => {
    const param = route.params.conversationId;
    return Array.isArray(param) ? param[0] : param;
  });

  // 未知会话 id 保持空详情，不回退默认会话，避免用户看到错误私信内容。
  const page = computed(() =>
    useMessageCenterPage({ activeConversationId: conversationId.value }),
  );
  const conversation = computed(() => page.value.activeConversation);

  return {
    page,
    conversation,
  };
}
