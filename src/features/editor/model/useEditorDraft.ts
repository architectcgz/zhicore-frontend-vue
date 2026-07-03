import {
  computed,
  getCurrentScope,
  onScopeDispose,
  readonly,
  ref,
  watch,
} from "vue";

import type { SaveDraftBodyReq, SaveDraftBodyResp } from "@/api/post";
import type {
  PostBodyBlock,
  PostBodyInlineNode,
  PostBodyWriteInput,
} from "@/entities/post-body";

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
import { createEditorLogger } from "./editorDebug";
import {
  createDefaultEditorDocumentJson,
  defaultEditorTitle,
  fallbackReaderBlock,
} from "./editorFixtures";
import {
  createProseMirrorDocFromJson,
  getProseMirrorPlainText,
  mapProseMirrorDocToPostBodyWriteInput,
  type EditorProseMirrorDocumentJson,
} from "./editorProseMirrorEngine";
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

export interface EditorSavedDraftSnapshot {
  title: string;
  sourceHash: string;
  localContentHash: `local:${string}`;
  savedAt: Date;
  schemaVersion: PostBodyWriteInput["schemaVersion"];
  blockCount: number;
  postBodyWriteInput: PostBodyWriteInput;
}

export interface EditorServerDraftBaseline {
  postId: string;
  basePostVersion: number;
  baseDraftBodyId?: string;
  baseDraftBodyHash?: string;
}

export interface EditorDraftServerSaveClient {
  saveDraftBody(
    postId: string,
    input: SaveDraftBodyReq,
  ): Promise<SaveDraftBodyResp>;
}

export interface EditorDraftHistoryRestoreResult {
  activeField: EditorDraftHistoryField;
  selection?: EditorTextSelection;
}

export const editorDraftBodyMaxLength = 20000;

const defaultPreviewCompileDebounceMs = 160;
const defaultHistoryMergeWindowMs = 500;
const proseMirrorLogger = createEditorLogger("compiler");

function createContentHash(content: string): string {
  let hash = 2166136261;

  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash.toString(36);
}

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

function isServerDraftBodyHash(hash: string | undefined): hash is string {
  return Boolean(hash && !hash.startsWith("local:"));
}

function createSaveDraftBodyRequest(
  baseline: EditorServerDraftBaseline,
  writeInput: PostBodyWriteInput,
  clientSavedAt: Date,
): SaveDraftBodyReq {
  return {
    ...writeInput,
    basePostVersion: baseline.basePostVersion,
    ...(baseline.baseDraftBodyId
      ? { baseDraftBodyId: baseline.baseDraftBodyId }
      : {}),
    ...(isServerDraftBodyHash(baseline.baseDraftBodyHash)
      ? { baseDraftBodyHash: baseline.baseDraftBodyHash }
      : {}),
    clientSavedAt: clientSavedAt.toISOString(),
  };
}

export function useEditorDraft(options: UseEditorDraftOptions = {}) {
  const now = options.now ?? (() => new Date());
  const previewCompileDebounceMs =
    options.previewCompileDebounceMs ?? defaultPreviewCompileDebounceMs;
  const historyMergeWindowMs =
    options.historyMergeWindowMs ?? defaultHistoryMergeWindowMs;
  const title = ref(defaultEditorTitle);
  const bodyDocumentJson = ref<EditorProseMirrorDocumentJson>(
    createDefaultEditorDocumentJson(),
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

  const bodyDocument = computed(() =>
    createProseMirrorDocFromJson(bodyDocumentJson.value),
  );
  const body = computed(() => getProseMirrorPlainText(bodyDocument.value));

  const postBodyWriteInput = computed(() =>
    mapProseMirrorDocToPostBodyWriteInput(bodyDocument.value),
  );
  const currentSourceHash = computed(() =>
    createContentHash(
      `${title.value}\u0000${JSON.stringify(bodyDocumentJson.value)}`,
    ),
  );

  function createSavedDraftSnapshot(savedAt: Date): EditorSavedDraftSnapshot {
    const writeInput = postBodyWriteInput.value;
    const contentHash = createContentHash(JSON.stringify(writeInput));

    return {
      title: previewTitle.value,
      sourceHash: currentSourceHash.value,
      localContentHash: `local:${contentHash}`,
      savedAt,
      schemaVersion: writeInput.schemaVersion,
      blockCount: writeInput.blocks.length,
      postBodyWriteInput: writeInput,
    };
  }

  const savedDraftSnapshot = ref<EditorSavedDraftSnapshot>(
    createSavedDraftSnapshot(now()),
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

  const readerPreviewBlocks = computed<EditorPreviewReaderBlock[]>(() => {
    const previewBlocks = postBodyWriteInput.value.blocks.map(
      (block, blockIndex) => ({
        stableKey: `prosemirror-preview-${blockIndex}-${block.type}-${JSON.stringify(block).length}`,
        block,
        readerBlockIndex: blockIndex,
      }),
    );

    return previewBlocks.length
      ? previewBlocks
      : [
          {
            stableKey: "editor-preview-fallback",
            block: fallbackReaderBlock,
            readerBlockIndex: 0,
          },
        ];
  });

  const readerBlocks = computed<PostBodyBlock[]>(() => {
    return readerPreviewBlocks.value.map((previewBlock) => previewBlock.block);
  });

  const previewParagraphs = computed(() => {
    const paragraphs = readerBlocks.value
      .filter((block) => block.type === "paragraph")
      .map((paragraph) =>
        paragraph.children.map((child) => child.text).join(""),
      );

    return paragraphs.length ? paragraphs : ["正文预览会随输入同步更新。"];
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
  }

  function compilePreviewNow(): void {
    proseMirrorLogger.debug(() => [
      "mapped ProseMirror preview",
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
    nextBodyDocumentJson: EditorProseMirrorDocumentJson,
    selection?: EditorTextSelection,
  ): void {
    const nextDoc = createProseMirrorDocFromJson(nextBodyDocumentJson);
    const nextPlainText = getProseMirrorPlainText(nextDoc);

    if (nextPlainText.length > editorDraftBodyMaxLength) {
      return;
    }

    const limitedSelection = clampSelectionToBody(
      selection,
      nextDoc.content.size,
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
      // 保存快照必须基于当前 ProseMirror doc 重新映射，不能依赖可能仍在 debounce 中的预览日志。
      compilePreviewNow();
      const savedAt = now();
      const baseline = serverDraftBaseline.value;

      if (baseline && options.serverSaveClient) {
        const response = await options.serverSaveClient.saveDraftBody(
          baseline.postId,
          createSaveDraftBodyRequest(
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
        savedDraftSnapshot.value = createSavedDraftSnapshot(savedAt);
        return;
      }

      await Promise.resolve();
      savedDraftSnapshot.value = createSavedDraftSnapshot(savedAt);
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
    bodyDocumentJson: readonly(bodyDocumentJson),
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
