import { useEventListener } from "@vueuse/core";
import { ref } from "vue";

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
