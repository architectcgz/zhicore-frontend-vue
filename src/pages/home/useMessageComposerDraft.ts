import { computed, ref, watch } from "vue";

import type { MessageCenterMessage } from "@/features/message";

type MessageSource = () => MessageCenterMessage[] | undefined;

export function useMessageComposerDraft(getInitialMessages: MessageSource) {
  const messageDraft = ref("");
  const messages = ref<MessageCenterMessage[]>([]);
  const sentMessageCount = ref(0);

  watch(
    getInitialMessages,
    (initialMessages) => {
      messages.value = [...(initialMessages ?? [])];
      messageDraft.value = "";
    },
    { immediate: true },
  );

  const canSendMessage = computed(() => messageDraft.value.trim().length > 0);

  function sendMessage(): void {
    const text = messageDraft.value.trim();

    if (!text) {
      return;
    }

    // 当前消息中心还没有接入发送 API，先把用户动作落在页面本地状态里，避免污染共享 demo 数据。
    sentMessageCount.value += 1;
    messages.value = [
      ...messages.value,
      {
        id: `local-message-${sentMessageCount.value}`,
        author: "me",
        deliveryStatus: "sent",
        text,
        sentAt: "刚刚",
      },
    ];
    messageDraft.value = "";
  }

  return {
    canSendMessage,
    messageDraft,
    messages,
    sendMessage,
  };
}
