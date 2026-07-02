import { computed, ref } from "vue";

export type EditorMode = "focus" | "preview";

export type EditorBackgroundId = "paper" | "sage" | "sand" | "ink";

export interface EditorBackground {
  id: EditorBackgroundId;
  name: string;
  className: string;
  swatch: string;
}

const backgroundCandidates: EditorBackground[] = [
  {
    id: "paper",
    name: "纸面",
    className: "editor--paper",
    swatch: "linear-gradient(135deg, #f7f4ee, #edf1f6)",
  },
  {
    id: "sage",
    name: "青绿",
    className: "editor--sage",
    swatch: "linear-gradient(135deg, #eaf3ef, #d9e8e1)",
  },
  {
    id: "sand",
    name: "暖沙",
    className: "editor--sand",
    swatch: "linear-gradient(135deg, #f5f0e8, #ead7bd)",
  },
  {
    id: "ink",
    name: "墨蓝",
    className: "editor--ink",
    swatch: "linear-gradient(135deg, #141a24, #263341)",
  },
];

export function useEditorDisplay() {
  const activeMode = ref<EditorMode>("focus");
  const activeBackgroundId = ref<EditorBackgroundId>("paper");

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

  function selectMode(mode: EditorMode): void {
    activeMode.value = mode;
  }

  function selectBackground(backgroundId: EditorBackgroundId): void {
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
