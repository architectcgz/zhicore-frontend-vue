import { computed, nextTick, onMounted, ref, watch } from "vue";

import {
  type EditorTextSelection,
  type EditorToolbarAction,
} from "./editorToolbarTypes";
import type { EditorTiptapDocumentJson } from "./editorTiptapEngine";
import { type EditorMode, useEditorDisplay } from "./useEditorDisplay";
import { useEditorPreviewScrollSync } from "./useEditorPreviewScrollSync";
import {
  type EditorDraftHistoryRestoreResult,
  useEditorDraft,
} from "./useEditorDraft";

export interface EditorWorkspaceWritingPaneRef {
  bodyInputElement: HTMLElement | null;
  writingEditorElement: HTMLElement | null;
  focusBody: () => void;
  getBodySelection: () => EditorTextSelection | undefined;
  setBodySelection: (selection: EditorTextSelection) => void;
  applyBodyToolbarAction: (action: EditorToolbarAction) => void;
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
  } = useEditorDisplay();
  const draft = useEditorDraft();
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
    isPreviewMode,
  });

  function handleTitleInput(nextTitle: string): void {
    draft.updateTitle(nextTitle);
    void syncEditorLayoutOnNextFrame();
  }

  function handleBodyDocumentInput(
    nextBodyDocumentJson: EditorTiptapDocumentJson,
  ): void {
    draft.updateBodyDocument(
      nextBodyDocumentJson,
      workspaceShellRef.value?.getBodySelection(),
    );
    void syncEditorLayoutOnNextFrame();
  }

  function handleModeSelect(mode: EditorMode): void {
    selectMode(mode);
    void syncEditorLayoutOnNextFrame();
  }

  async function handleToolbarAction(
    action: EditorToolbarAction,
  ): Promise<void> {
    workspaceShellRef.value?.applyBodyToolbarAction(action);
    const nextSelection = workspaceShellRef.value?.getBodySelection();

    await nextTick();
    resizeBodyInput();
    if (nextSelection) {
      workspaceShellRef.value?.setBodySelection(nextSelection);
    }
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
    bodyDocumentJson: draft.bodyDocumentJson,
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
    handleBodyDocumentInput,
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
