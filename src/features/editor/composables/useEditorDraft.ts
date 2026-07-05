import {
  computed,
  getCurrentScope,
  onScopeDispose,
  readonly,
  ref,
  shallowReadonly,
  watch,
} from "vue";

import type { PostBodyBlock, PostBodyInlineNode } from "@/entities/post-body";

import type { EditorPreviewReaderBlock } from "../lib/editorPreviewTypes";
import {
  canRedoEditorDraftHistory,
  canUndoEditorDraftHistory,
  createEditorDraftHistory,
  recordEditorDraftHistoryChange,
  redoEditorDraftHistory,
  undoEditorDraftHistory,
  type EditorDraftHistoryField,
  type EditorDraftHistorySnapshot,
} from "../lib/editorDraftHistory";
import {
  loadRestoredEditorLocalDraft,
  persistEditorCurrentDraftToLocal,
} from "../lib/editorDraftRecovery";
import {
  createEditorPreviewParagraphs,
  createEditorReaderPreviewBlocks,
} from "../lib/editorDraftPreview";
import type {
  EditorDraftServerSaveClient,
  EditorServerDraftBaseline,
} from "../lib/editorDraftSavePayload";
import type { EditorPostWorkflowClient } from "../lib/editorPostWorkflowClient";
import {
  createEditorSavedDraftSnapshot,
  createEditorSourceHash,
  type EditorSavedDraftSnapshot,
} from "../lib/editorDraftSnapshot";
import {
  useEditorDraftSaveWorkflow,
  type EditorDraftSaveStatus,
} from "./useEditorDraftSaveWorkflow";
import { createEditorLogger } from "../lib/editorDebug";
import {
  createDefaultEditorDocumentJson,
  defaultEditorTitle,
} from "../config/editorFixtures";
import {
  EditorPostBodyMappingError,
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
  type EditorTiptapDocumentJson,
} from "../tiptap/editorTiptapEngine";
import {
  type EditorTextSelection,
  type EditorToolbarAction,
} from "../lib/editorToolbarTypes";

export type EditorDraftBlockType = PostBodyBlock["type"];
export type EditorDraftBlock = PostBodyBlock;
export type EditorInlineNode = PostBodyInlineNode;
export type EditorReaderPreviewBlock = EditorPreviewReaderBlock;

export interface UseEditorDraftOptions {
  previewCompileDebounceMs?: number;
  historyMergeWindowMs?: number;
  now?: () => Date;
  serverDraftBaseline?: EditorServerDraftBaseline;
  serverSaveClient?: EditorDraftServerSaveClient;
  serverPostClient?: EditorPostWorkflowClient;
}

export interface EditorDraftHistoryRestoreResult {
  activeField: EditorDraftHistoryField;
  selection?: EditorTextSelection;
}

export type {
  EditorDraftServerSaveClient,
  EditorDraftSaveStatus,
  EditorSavedDraftSnapshot,
  EditorServerDraftBaseline,
};

export const editorDraftBodyMaxLength = 20000;

const defaultPreviewCompileDebounceMs = 160;
const defaultHistoryMergeWindowMs = 500;
const tiptapLogger = createEditorLogger("compiler");

function clampSelectionToBody(
  selection: EditorTextSelection | undefined,
  bodyLength: number,
): EditorTextSelection | undefined {
  if (!selection) {
    return undefined;
  }

  const start = Math.min(selection.start, bodyLength);
  const end = Math.min(selection.end, bodyLength);

  return {
    start,
    end,
  };
}

export function useEditorDraft(options: UseEditorDraftOptions = {}) {
  const now = options.now ?? (() => new Date());
  const previewCompileDebounceMs =
    options.previewCompileDebounceMs ?? defaultPreviewCompileDebounceMs;
  const historyMergeWindowMs =
    options.historyMergeWindowMs ?? defaultHistoryMergeWindowMs;
  const defaultBodyDocumentJson = createDefaultEditorDocumentJson();
  const restoredLocalDraft = loadRestoredEditorLocalDraft(
    editorDraftBodyMaxLength,
  );
  const title = ref(restoredLocalDraft?.title ?? defaultEditorTitle);
  const bodyDocumentJson = ref<EditorTiptapDocumentJson>(
    restoredLocalDraft?.bodyDocumentJson ?? defaultBodyDocumentJson,
  );
  let latestServerDraftBaseline =
    options.serverDraftBaseline ?? restoredLocalDraft?.serverDraftBaseline;
  let previewCompileTimer: number | undefined;
  const history = ref(
    createEditorDraftHistory(
      createCurrentHistorySnapshot("body", { start: 0, end: 0 }),
    ),
  );

  const previewTitle = computed(() => {
    const trimmedTitle = title.value.trim();
    return trimmedTitle || "未命名草稿";
  });

  const body = computed(() => getTiptapPlainText(bodyDocumentJson.value));

  const postBodyWriteInput = computed(() =>
    mapTiptapJsonToPostBodyWriteInput(bodyDocumentJson.value),
  );
  const currentSourceHash = computed(() =>
    createEditorSourceHash(title.value, bodyDocumentJson.value),
  );

  function createSavedDraftSnapshot(savedAt: Date): EditorSavedDraftSnapshot {
    return createEditorSavedDraftSnapshot(
      title.value,
      bodyDocumentJson.value,
      savedAt,
    );
  }

  const savedDraftSnapshot = ref<EditorSavedDraftSnapshot>(
    restoredLocalDraft?.savedSnapshot ??
      createEditorSavedDraftSnapshot(
        defaultEditorTitle,
        defaultBodyDocumentJson,
        now(),
      ),
  );
  const hasUnsavedChanges = computed(
    () => currentSourceHash.value !== savedDraftSnapshot.value.sourceHash,
  );
  const canUndo = computed(() => canUndoEditorDraftHistory(history.value));
  const canRedo = computed(() => canRedoEditorDraftHistory(history.value));

  function persistCurrentDraftToLocal(
    snapshot = savedDraftSnapshot.value,
    serverDraftBaseline = latestServerDraftBaseline,
  ): void {
    persistEditorCurrentDraftToLocal({
      title: title.value,
      bodyDocumentJson: bodyDocumentJson.value,
      updatedAt: now(),
      savedSnapshot: snapshot,
      serverDraftBaseline,
    });
  }

  const readerPreviewBlocks = computed<EditorPreviewReaderBlock[]>(() => {
    return createEditorReaderPreviewBlocks(postBodyWriteInput.value);
  });

  const readerBlocks = computed<PostBodyBlock[]>(() => {
    return readerPreviewBlocks.value.map((previewBlock) => previewBlock.block);
  });

  const previewParagraphs = computed(() => {
    return createEditorPreviewParagraphs(readerPreviewBlocks.value);
  });

  const wordCount = computed(() => {
    const contentChars = body.value.match(/\p{Script=Han}|[A-Za-z0-9]+/gu);
    return contentChars?.length ?? 0;
  });
  const bodyCharacterCount = computed(() => body.value.length);

  function createCurrentHistorySnapshot(
    activeField: EditorDraftHistoryField,
    selection?: EditorTextSelection,
  ): EditorDraftHistorySnapshot {
    return {
      title: title.value,
      bodyDocumentJson: bodyDocumentJson.value,
      activeField,
      selection,
      changedAt: now().getTime(),
    };
  }

  function applyHistorySnapshot(snapshot: EditorDraftHistorySnapshot): void {
    title.value = snapshot.title;
    bodyDocumentJson.value = snapshot.bodyDocumentJson;
    persistCurrentDraftToLocal();
  }

  function createHistoryRestoreResult(
    activeField: EditorDraftHistoryField,
    restoredSnapshot: EditorDraftHistorySnapshot,
  ): EditorDraftHistoryRestoreResult {
    return {
      activeField,
      selection:
        activeField === "body" ? restoredSnapshot.selection : undefined,
    };
  }

  function updateTitle(nextTitle: string): void {
    if (nextTitle === title.value) {
      return;
    }

    // History snapshots describe user edit boundaries only; saved/dirty status
    // remains derived from the source hash against the last saved snapshot.
    history.value = recordEditorDraftHistoryChange(
      history.value,
      {
        ...createCurrentHistorySnapshot("title"),
        title: nextTitle,
      },
      {
        kind: "typing",
        mergeWindowMs: historyMergeWindowMs,
      },
    );
    title.value = nextTitle;
    persistCurrentDraftToLocal();
  }

  function compilePreviewNow(): void {
    tiptapLogger.debug(() => [
      "mapped Tiptap preview",
      {
        blockCount: postBodyWriteInput.value.blocks.length,
      },
    ]);
  }

  const {
    serverDraftBaseline,
    draftSaveStatus,
    canSaveDraft,
    saveDraft,
    ensureServerDraft,
    replaceServerDraftBaseline,
  } = useEditorDraftSaveWorkflow({
    now,
    hasUnsavedChanges,
    getDraftTitle: () => title.value,
    getPostBodyWriteInput: () => postBodyWriteInput.value,
    createSavedDraftSnapshot,
    savedDraftSnapshot,
    persistCurrentDraftToLocal,
    compilePreviewNow,
    serverDraftBaseline: latestServerDraftBaseline,
    serverSaveClient: options.serverSaveClient,
    serverPostClient: options.serverPostClient,
    onServerDraftBaselineChange: (nextServerDraftBaseline) => {
      latestServerDraftBaseline = nextServerDraftBaseline;
      persistCurrentDraftToLocal(
        savedDraftSnapshot.value,
        nextServerDraftBaseline,
      );
    },
  });

  function schedulePreviewCompilation(): void {
    window.clearTimeout(previewCompileTimer);

    if (previewCompileDebounceMs <= 0) {
      compilePreviewNow();
      return;
    }

    // 正文输入可能连续触发，预览编译延迟到用户短暂停顿后执行，减少同步解析压力。
    previewCompileTimer = window.setTimeout(() => {
      compilePreviewNow();
    }, previewCompileDebounceMs);
  }

  function updateBodyDocument(
    nextBodyDocumentJson: EditorTiptapDocumentJson,
    selection?: EditorTextSelection,
  ): void {
    const nextPlainText = getTiptapPlainText(nextBodyDocumentJson);

    if (nextPlainText.length > editorDraftBodyMaxLength) {
      return;
    }

    try {
      // 保存契约在 mapper 层 enforce；草稿入口也先试映射，避免预览和保存状态接收超过 Content V1 边界的文档树。
      mapTiptapJsonToPostBodyWriteInput(nextBodyDocumentJson);
    } catch (error) {
      if (error instanceof EditorPostBodyMappingError) {
        return;
      }

      throw error;
    }

    const limitedSelection = clampSelectionToBody(
      selection,
      nextPlainText.length + 1,
    );

    if (
      JSON.stringify(nextBodyDocumentJson) ===
      JSON.stringify(bodyDocumentJson.value)
    ) {
      return;
    }

    history.value = recordEditorDraftHistoryChange(
      history.value,
      {
        ...createCurrentHistorySnapshot("body", limitedSelection),
        bodyDocumentJson: nextBodyDocumentJson,
      },
      {
        kind: "typing",
        mergeWindowMs: historyMergeWindowMs,
      },
    );
    bodyDocumentJson.value = nextBodyDocumentJson;
    persistCurrentDraftToLocal();
  }

  function undoDraft(): EditorDraftHistoryRestoreResult | undefined {
    if (!canUndoEditorDraftHistory(history.value)) {
      return undefined;
    }

    const activeField = history.value.present.activeField;

    history.value = undoEditorDraftHistory(history.value);
    applyHistorySnapshot(history.value.present);

    // Focus restoration follows the edit being traversed, while selection comes
    // from the restored source snapshot when that field can safely provide one.
    return createHistoryRestoreResult(activeField, history.value.present);
  }

  function redoDraft(): EditorDraftHistoryRestoreResult | undefined {
    if (!canRedoEditorDraftHistory(history.value)) {
      return undefined;
    }

    history.value = redoEditorDraftHistory(history.value);
    applyHistorySnapshot(history.value.present);

    return createHistoryRestoreResult(
      history.value.present.activeField,
      history.value.present,
    );
  }

  watch(
    body,
    () => {
      schedulePreviewCompilation();
    },
    {
      flush: "sync",
    },
  );

  if (getCurrentScope()) {
    onScopeDispose(() => {
      window.clearTimeout(previewCompileTimer);
    });
  }

  return {
    title: readonly(title),
    body: readonly(body),
    bodyDocumentJson: shallowReadonly(bodyDocumentJson),
    previewTitle,
    postBodyWriteInput,
    readerBlocks,
    readerPreviewBlocks,
    previewParagraphs,
    wordCount,
    bodyCharacterCount,
    bodyMaxLength: editorDraftBodyMaxLength,
    savedDraftSnapshot,
    serverDraftBaseline,
    draftSaveStatus,
    canSaveDraft,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    updateTitle,
    updateBodyDocument,
    undoDraft,
    redoDraft,
    saveDraft,
    ensureServerDraft,
    replaceServerDraftBaseline,
  };
}
