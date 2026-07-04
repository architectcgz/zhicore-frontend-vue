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

import type { EditorPreviewReaderBlock } from "./editorPreviewTypes";
import {
  canRedoEditorDraftHistory,
  canUndoEditorDraftHistory,
  createEditorDraftHistory,
  recordEditorDraftHistoryChange,
  redoEditorDraftHistory,
  undoEditorDraftHistory,
  type EditorDraftHistoryField,
  type EditorDraftHistorySnapshot,
} from "./editorDraftHistory";
import {
  loadRestoredEditorLocalDraft,
  persistEditorCurrentDraftToLocal,
} from "./editorDraftRecovery";
import {
  createEditorPreviewParagraphs,
  createEditorReaderPreviewBlocks,
} from "./editorDraftPreview";
import {
  createEditorDraftSaveRequest,
  type EditorDraftServerSaveClient,
  type EditorServerDraftBaseline,
} from "./editorDraftSaveRequest";
import {
  createEditorSavedDraftSnapshot,
  createEditorSourceHash,
  type EditorSavedDraftSnapshot,
} from "./editorDraftSnapshot";
import { createEditorLogger } from "./editorDebug";
import {
  createDefaultEditorDocumentJson,
  defaultEditorTitle,
} from "./editorFixtures";
import {
  EditorPostBodyMappingError,
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
  type EditorTiptapDocumentJson,
} from "./editorTiptapEngine";
import {
  type EditorTextSelection,
  type EditorToolbarAction,
} from "./editorToolbarTypes";

export type EditorDraftBlockType = PostBodyBlock["type"];
export type EditorDraftBlock = PostBodyBlock;
export type EditorInlineNode = PostBodyInlineNode;
export type EditorReaderPreviewBlock = EditorPreviewReaderBlock;
export type EditorDraftSaveStatus = "saved" | "dirty" | "saving";

export interface UseEditorDraftOptions {
  previewCompileDebounceMs?: number;
  historyMergeWindowMs?: number;
  now?: () => Date;
  serverDraftBaseline?: EditorServerDraftBaseline;
  serverSaveClient?: EditorDraftServerSaveClient;
}

export interface EditorDraftHistoryRestoreResult {
  activeField: EditorDraftHistoryField;
  selection?: EditorTextSelection;
}

export type {
  EditorDraftServerSaveClient,
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
  const serverDraftBaseline = ref<EditorServerDraftBaseline | undefined>(
    options.serverDraftBaseline,
  );
  const isSavingDraft = ref(false);
  const hasUnsavedChanges = computed(
    () => currentSourceHash.value !== savedDraftSnapshot.value.sourceHash,
  );
  const draftSaveStatus = computed<EditorDraftSaveStatus>(() => {
    if (isSavingDraft.value) {
      return "saving";
    }

    return hasUnsavedChanges.value ? "dirty" : "saved";
  });
  const canSaveDraft = computed(
    () => !isSavingDraft.value && hasUnsavedChanges.value,
  );
  const canUndo = computed(() => canUndoEditorDraftHistory(history.value));
  const canRedo = computed(() => canRedoEditorDraftHistory(history.value));

  function persistCurrentDraftToLocal(
    snapshot = savedDraftSnapshot.value,
  ): void {
    persistEditorCurrentDraftToLocal({
      title: title.value,
      bodyDocumentJson: bodyDocumentJson.value,
      updatedAt: now(),
      savedSnapshot: snapshot,
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

  async function saveDraft(): Promise<void> {
    if (!canSaveDraft.value) {
      return;
    }

    isSavingDraft.value = true;

    try {
      // 保存快照必须基于当前 Tiptap JSON 重新映射，不能依赖可能仍在 debounce 中的预览日志。
      compilePreviewNow();
      const savedAt = now();
      const baseline = serverDraftBaseline.value;

      if (baseline && options.serverSaveClient) {
        const response = await options.serverSaveClient.saveDraftBody(
          baseline.postId,
          createEditorDraftSaveRequest(
            baseline,
            postBodyWriteInput.value,
            savedAt,
          ),
        );

        // 服务端返回的 draftBodyHash 才是下一次乐观保存基线；本地 hash
        // 只用于前端 dirty 判断，不能混入 Content API 请求。
        serverDraftBaseline.value = {
          postId: response.postId,
          basePostVersion: response.postVersion,
          baseDraftBodyId: response.draftBodyId,
          baseDraftBodyHash: response.draftBodyHash,
        };
        const nextSavedSnapshot = createSavedDraftSnapshot(savedAt);

        savedDraftSnapshot.value = nextSavedSnapshot;
        persistCurrentDraftToLocal(nextSavedSnapshot);
        return;
      }

      await Promise.resolve();
      const nextSavedSnapshot = createSavedDraftSnapshot(savedAt);

      savedDraftSnapshot.value = nextSavedSnapshot;
      persistCurrentDraftToLocal(nextSavedSnapshot);
    } finally {
      isSavingDraft.value = false;
    }
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
    serverDraftBaseline: readonly(serverDraftBaseline),
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
  };
}
