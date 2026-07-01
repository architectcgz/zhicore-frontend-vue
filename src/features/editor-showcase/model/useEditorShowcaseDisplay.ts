import { computed, ref } from "vue";

export type EditorShowcaseMode = "focus" | "preview";

export type EditorShowcaseBackgroundId = "paper" | "sage" | "sand" | "ink";

export interface EditorShowcaseBackground {
  id: EditorShowcaseBackgroundId;
  name: string;
  className: string;
  swatch: string;
}

const backgroundCandidates: EditorShowcaseBackground[] = [
  {
    id: "paper",
    name: "纸面",
    className: "editor-showcase--paper",
    swatch: "linear-gradient(135deg, #f7f4ee, #edf1f6)",
  },
  {
    id: "sage",
    name: "青绿",
    className: "editor-showcase--sage",
    swatch: "linear-gradient(135deg, #eaf3ef, #d9e8e1)",
  },
  {
    id: "sand",
    name: "暖沙",
    className: "editor-showcase--sand",
    swatch: "linear-gradient(135deg, #f5f0e8, #ead7bd)",
  },
  {
    id: "ink",
    name: "墨蓝",
    className: "editor-showcase--ink",
    swatch: "linear-gradient(135deg, #141a24, #263341)",
  },
];

export function useEditorShowcaseDisplay() {
  const activeMode = ref<EditorShowcaseMode>("focus");
  const activeBackgroundId = ref<EditorShowcaseBackgroundId>("paper");

  const activeBackground = computed(() => {
    return (
      backgroundCandidates.find(
        (item) => item.id === activeBackgroundId.value,
      ) ?? backgroundCandidates[0]
    );
  });

  const activeBackgroundClass = computed(
    () => activeBackground.value.className,
  );
  const isPreviewMode = computed(() => activeMode.value === "preview");

  function selectMode(mode: EditorShowcaseMode): void {
    activeMode.value = mode;
  }

  function selectBackground(backgroundId: EditorShowcaseBackgroundId): void {
    activeBackgroundId.value = backgroundId;
  }

  return {
    activeMode,
    activeBackground,
    activeBackgroundClass,
    backgroundCandidates,
    isPreviewMode,
    selectMode,
    selectBackground,
  };
}
