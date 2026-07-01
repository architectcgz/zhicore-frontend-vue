import { computed, nextTick, onMounted, ref, watch } from "vue";

import { isEditorDebugMode } from "./editorDebug";
import {
  type EditorShowcaseTextSelection,
  type EditorShowcaseToolbarAction,
} from "./editorToolbarTransforms";
import {
  type EditorShowcaseMode,
  useEditorShowcaseDisplay,
} from "./useEditorShowcaseDisplay";
import { useEditorPreviewScrollSync } from "./useEditorPreviewScrollSync";
import { useEditorShowcaseDraft } from "./useEditorShowcaseDraft";

export interface EditorWorkspaceWritingPaneRef {
  bodyInputElement: HTMLTextAreaElement | null;
  writingEditorElement: HTMLElement | null;
  focusBody: () => void;
  getBodySelection: () => EditorShowcaseTextSelection | undefined;
  setBodySelection: (selection: EditorShowcaseTextSelection) => void;
}

export interface EditorWorkspacePreviewPaneRef {
  readerPreviewElement: HTMLElement | null;
}

export function useEditorWorkspaceController() {
  const {
    activeMode,
    activeBackground,
    activeBackgroundClass,
    backgroundCandidates,
    isPreviewMode,
    selectMode,
    selectBackground,
  } = useEditorShowcaseDisplay();
  const draft = useEditorShowcaseDraft();
  const writingPaneRef = ref<EditorWorkspaceWritingPaneRef | null>(null);
  const previewPaneRef = ref<EditorWorkspacePreviewPaneRef | null>(null);

  const bodyInputRef = computed(
    () => writingPaneRef.value?.bodyInputElement ?? null,
  );
  const writingEditorRef = computed(
    () => writingPaneRef.value?.writingEditorElement ?? null,
  );
  const readerPreviewRef = computed(
    () => previewPaneRef.value?.readerPreviewElement ?? null,
  );

  const { resizeBodyInput, syncPreviewScroll, syncEditorLayoutOnNextFrame } =
    useEditorPreviewScrollSync({
      bodyInputRef,
      writingEditorRef,
      readerPreviewRef,
      previewBlockAnchors: draft.previewBlockAnchors,
      isPreviewMode,
    });

  function handleBodyInput(): void {
    void syncEditorLayoutOnNextFrame();
  }

  function handleModeSelect(mode: EditorShowcaseMode): void {
    selectMode(mode);
    void syncEditorLayoutOnNextFrame();
  }

  async function handleToolbarAction(
    action: EditorShowcaseToolbarAction,
  ): Promise<void> {
    const nextSelection = draft.applyToolbarAction(
      action,
      writingPaneRef.value?.getBodySelection(),
    );

    await nextTick();
    resizeBodyInput();
    writingPaneRef.value?.focusBody();
    // 工具栏会重写 markdown 标记，恢复选区让作者可以继续在原位置输入。
    writingPaneRef.value?.setBodySelection(nextSelection);
    syncPreviewScroll();
  }

  onMounted(() => {
    resizeBodyInput();
  });

  watch(
    draft.readerPreviewBlocks,
    () => {
      void syncEditorLayoutOnNextFrame();
    },
    {
      flush: "post",
    },
  );

  return {
    activeMode,
    activeBackground,
    activeBackgroundClass,
    backgroundCandidates,
    isEditorDebugMode,
    isPreviewMode,
    title: draft.title,
    body: draft.body,
    previewTitle: draft.previewTitle,
    readerBlocks: draft.readerBlocks,
    readerPreviewBlocks: draft.readerPreviewBlocks,
    wordCount: draft.wordCount,
    writingPaneRef,
    previewPaneRef,
    handleBodyInput,
    handleModeSelect,
    handleToolbarAction,
    selectBackground,
    syncPreviewScroll,
  };
}
