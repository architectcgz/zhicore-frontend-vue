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

export interface EditorWorkspaceShellRef
  extends EditorWorkspaceWritingPaneRef, EditorWorkspacePreviewPaneRef {}

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
  const workspaceShellRef = ref<EditorWorkspaceShellRef | null>(null);

  const bodyInputRef = computed(
    () => workspaceShellRef.value?.bodyInputElement ?? null,
  );
  const writingEditorRef = computed(
    () => workspaceShellRef.value?.writingEditorElement ?? null,
  );
  const readerPreviewRef = computed(
    () => workspaceShellRef.value?.readerPreviewElement ?? null,
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
    draft.updateBody(nextBody, workspaceShellRef.value?.getBodySelection());
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
      workspaceShellRef.value?.getBodySelection(),
    );

    await nextTick();
    resizeBodyInput();
    // 工具栏会重写 markdown 标记，恢复选区让作者可以继续在原位置输入。
    workspaceShellRef.value?.setBodySelection(nextSelection);
    workspaceShellRef.value?.focusBody();
    syncPreviewScroll();
  }

  async function restoreEditorHistoryTarget(
    result: EditorDraftHistoryRestoreResult,
  ): Promise<void> {
    await nextTick();

    if (result.activeField === "body") {
      if (result.selection) {
        workspaceShellRef.value?.setBodySelection(result.selection);
      }

      workspaceShellRef.value?.focusBody();
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
    workspaceShellRef,
    () => {
      void syncEditorLayoutOnNextFrame();
    },
    {
      flush: "post",
    },
  );

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
    bodyCharacterCount: draft.bodyCharacterCount,
    bodyMaxLength: draft.bodyMaxLength,
    draftSaveStatus: draft.draftSaveStatus,
    canSaveDraft: draft.canSaveDraft,
    canUndo: draft.canUndo,
    canRedo: draft.canRedo,
    saveStatusLabel,
    saveButtonLabel,
    lastSavedLabel,
    workspaceShellRef,
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
