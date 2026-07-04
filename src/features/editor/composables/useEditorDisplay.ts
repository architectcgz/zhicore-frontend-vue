import { computed, ref } from "vue";

export type EditorMode = "focus" | "preview";

export type EditorBackgroundId = "paper" | "sage" | "sand" | "ink";

interface EditorDisplayPreference {
  backgroundId: EditorBackgroundId;
}

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

const editorDisplayPreferenceStorageKey = "zhicore:editor:display-preference";
const defaultEditorBackgroundId: EditorBackgroundId = "paper";

function isEditorBackgroundId(value: unknown): value is EditorBackgroundId {
  return backgroundCandidates.some((background) => background.id === value);
}

function readStoredEditorBackgroundId(): EditorBackgroundId {
  try {
    const rawPreference = window.localStorage.getItem(
      editorDisplayPreferenceStorageKey,
    );

    if (!rawPreference) {
      return defaultEditorBackgroundId;
    }

    const parsedPreference = JSON.parse(
      rawPreference,
    ) as Partial<EditorDisplayPreference>;

    return isEditorBackgroundId(parsedPreference.backgroundId)
      ? parsedPreference.backgroundId
      : defaultEditorBackgroundId;
  } catch {
    // 本地显示偏好不是编辑主流程事实，读取失败时回到默认背景，避免配置损坏阻断编辑器打开。
    return defaultEditorBackgroundId;
  }
}

function persistEditorBackgroundId(backgroundId: EditorBackgroundId): void {
  try {
    window.localStorage.setItem(
      editorDisplayPreferenceStorageKey,
      JSON.stringify({ backgroundId } satisfies EditorDisplayPreference),
    );
  } catch {
    // 浏览器禁止写入 localStorage 时仍允许用户临时切换当前会话的编辑器背景。
  }
}

export function useEditorDisplay() {
  const activeMode = ref<EditorMode>("focus");
  const activeBackgroundId = ref<EditorBackgroundId>(
    readStoredEditorBackgroundId(),
  );

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
    persistEditorBackgroundId(backgroundId);
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
