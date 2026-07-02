import { computed, nextTick, onMounted, ref, watch } from "vue";

import {
  type EditorShowcaseTextSelection,
  type EditorShowcaseToolbarAction,
} from "./editorToolbarTransforms";
import {
  type EditorShowcaseMode,
  useEditorShowcaseDisplay,
} from "./useEditorShowcaseDisplay";
import { useEditorPreviewScrollSync } from "./useEditorPreviewScrollSync";
import {
  type EditorDraftHistoryRestoreResult,
  useEditorShowcaseDraft,
} from "./useEditorShowcaseDraft";

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

function formatDraftSavedTime(savedAt: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(savedAt);
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
  const lastSavedLabel = computed(() =>
    formatDraftSavedTime(draft.savedDraftSnapshot.value.savedAt),
  );
  const saveStatusLabel = computed(() => {
    if (draft.draftSaveStatus.value === "saving") {
      return "正在保存本地草稿";
    }

    if (draft.draftSaveStatus.value === "dirty") {
      return "有未保存更改";
    }

    return `本地草稿已保存 ${lastSavedLabel.value}`;
  });
  const saveButtonLabel = computed(() =>
    draft.draftSaveStatus.value === "saving" ? "保存中" : "保存草稿",
  );
  const savedContentHash = computed(
    () => draft.savedDraftSnapshot.value.contentHash,
  );

  const {
    resizeBodyInput,
    syncEditorScroll,
    syncPreviewScroll,
    syncEditorLayoutOnNextFrame,
  } = useEditorPreviewScrollSync({
    bodyInputRef,
    writingEditorRef,
    readerPreviewRef,
    previewBlockAnchors: draft.previewBlockAnchors,
    isPreviewMode,
  });

  function handleTitleInput(nextTitle: string): void {
    draft.updateTitle(nextTitle);
    void syncEditorLayoutOnNextFrame();
  }

  function handleBodyInput(nextBody: string): void {
    draft.updateBody(nextBody, writingPaneRef.value?.getBodySelection());
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

  async function restoreEditorHistoryTarget(
    result: EditorDraftHistoryRestoreResult,
  ): Promise<void> {
    await nextTick();

    if (result.activeField === "body") {
      writingPaneRef.value?.focusBody();

      if (result.selection) {
        writingPaneRef.value?.setBodySelection(result.selection);
      }
    }

    await nextTick();
    resizeBodyInput();
    syncPreviewScroll();
  }

  async function handleUndoDraft(): Promise<void> {
    const result = draft.undoDraft();

    if (!result) {
      return;
    }

    await restoreEditorHistoryTarget(result);
  }

  async function handleRedoDraft(): Promise<void> {
    const result = draft.redoDraft();

    if (!result) {
      return;
    }

    await restoreEditorHistoryTarget(result);
  }

  async function handleSaveDraft(): Promise<void> {
    await draft.saveDraft();
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
    isPreviewMode,
    title: draft.title,
    body: draft.body,
    previewTitle: draft.previewTitle,
    readerBlocks: draft.readerBlocks,
    readerPreviewBlocks: draft.readerPreviewBlocks,
    wordCount: draft.wordCount,
    draftSaveStatus: draft.draftSaveStatus,
    canSaveDraft: draft.canSaveDraft,
    canUndo: draft.canUndo,
    canRedo: draft.canRedo,
    saveStatusLabel,
    saveButtonLabel,
    lastSavedLabel,
    savedContentHash,
    writingPaneRef,
    previewPaneRef,
    handleBodyInput,
    handleTitleInput,
    handleModeSelect,
    handleSaveDraft,
    handleToolbarAction,
    handleUndoDraft,
    handleRedoDraft,
    selectBackground,
    syncEditorScroll,
    syncPreviewScroll,
  };
}
