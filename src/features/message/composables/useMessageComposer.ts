import { useEventListener } from "@vueuse/core";
import { ref, type Ref } from "vue";

const emojiOptions = ["😊", "👍", "🔥", "🎉", "🙏", "💡", "❤️", "😂"];

// 消息输入区的 UI-local 行为：表情选择器开关与插入。
// 草稿真相源是 thread workflow 的 draft，这里只负责把表情追加进去，不自持草稿状态。
export function useMessageComposer(draft: Ref<string>) {
  const composerInputRoot = ref<HTMLElement | null>(null);
  const isEmojiPickerOpen = ref(false);

  function closeEmojiPicker(): void {
    isEmojiPickerOpen.value = false;
  }

  function toggleEmojiPicker(): void {
    isEmojiPickerOpen.value = !isEmojiPickerOpen.value;
  }

  function insertEmoji(emoji: string): void {
    draft.value = `${draft.value}${emoji}`;
    closeEmojiPicker();
  }

  // 点击输入区之外关闭表情选择器。
  useEventListener(document, "pointerdown", (event) => {
    if (!isEmojiPickerOpen.value) {
      return;
    }

    const target = event.target;
    if (target instanceof Node && composerInputRoot.value?.contains(target)) {
      return;
    }

    closeEmojiPicker();
  });

  return {
    composerInputRoot,
    emojiOptions,
    isEmojiPickerOpen,
    insertEmoji,
    toggleEmojiPicker,
  };
}
