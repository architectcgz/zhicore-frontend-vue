import { useEventListener } from "@vueuse/core";
import { ref } from "vue";

// 会话操作菜单的 UI-local 行为：开关与外点关闭。
// 纯浮层交互，不承载业务动作；真实的拉黑/举报/删除动作后续接入 thread workflow。
export function useConversationActionMenu() {
  const isConversationActionMenuOpen = ref(false);
  const conversationActionMenuRoot = ref<HTMLElement | null>(null);

  function closeConversationActionMenu(): void {
    isConversationActionMenuOpen.value = false;
  }

  function toggleConversationActionMenu(): void {
    isConversationActionMenuOpen.value = !isConversationActionMenuOpen.value;
  }

  useEventListener(document, "pointerdown", (event) => {
    if (!isConversationActionMenuOpen.value) {
      return;
    }

    const target = event.target;
    if (
      target instanceof Node &&
      conversationActionMenuRoot.value?.contains(target)
    ) {
      return;
    }

    closeConversationActionMenu();
  });

  return {
    conversationActionMenuRoot,
    isConversationActionMenuOpen,
    toggleConversationActionMenu,
  };
}
