import {
  computed,
  getCurrentScope,
  onScopeDispose,
  readonly,
  ref,
  watch,
} from "vue";

import type { PostBodyBlock, PostBodyWriteInput } from "@/entities/post-body";

import {
  compileEditorContent,
  createEditorPreviewBlockKeyResolver,
  mapEditorCompiledDocumentToPostBodyWriteInput,
  mapEditorCompiledDocumentToPreviewReaderBlocks,
  mapPreviewReaderBlocksToAnchors,
  type EditorCompiledBlock,
  type EditorCompiledDocument,
  type EditorCompiledInlineNode,
  type EditorPreviewReaderBlock,
} from "./editorContentCompiler";
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
  defaultEditorShowcaseBody,
  defaultEditorShowcaseTitle,
  fallbackPreviewBlock,
  fallbackReaderBlock,
} from "./editorShowcaseFixtures";
import {
  applyToolbarActionToBody,
  type EditorShowcaseTextSelection,
  type EditorShowcaseToolbarAction,
} from "./editorToolbarTransforms";

export type EditorShowcaseDraftBlockType = EditorCompiledBlock["type"];
export type EditorShowcaseDraftBlock = EditorCompiledBlock;
export type EditorShowcaseInlineNode = EditorCompiledInlineNode;
export type EditorShowcaseReaderPreviewBlock = EditorPreviewReaderBlock;
export type EditorDraftSaveStatus = "saved" | "dirty" | "saving";
export type { EditorShowcaseTextSelection, EditorShowcaseToolbarAction };

type EditorContentCompiler = (input: string) => EditorCompiledDocument;

export interface UseEditorShowcaseDraftOptions {
  compileContent?: EditorContentCompiler;
  previewCompileDebounceMs?: number;
  historyMergeWindowMs?: number;
  now?: () => Date;
}

export interface EditorSavedDraftSnapshot {
  title: string;
  sourceHash: string;
  contentHash: `local:${string}`;
  savedAt: Date;
  schemaVersion: PostBodyWriteInput["schemaVersion"];
  blockCount: number;
  postBodyWriteInput: PostBodyWriteInput;
}

export interface EditorDraftHistoryRestoreResult {
  activeField: EditorDraftHistoryField;
  selection?: EditorShowcaseTextSelection;
}

export const editorDraftBodyMaxLength = 20000;

const defaultPreviewCompileDebounceMs = 160;
const defaultHistoryMergeWindowMs = 500;
const compilerLogger = createEditorLogger("compiler");
const toolbarLogger = createEditorLogger("toolbar");

function createContentHash(content: string): string {
  let hash = 2166136261;

  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash.toString(36);
}

function clampSelectionToBody(
  selection: EditorShowcaseTextSelection | undefined,
  bodySource: string,
): EditorShowcaseTextSelection | undefined {
  if (!selection) {
    return undefined;
  }

  const start = Math.min(selection.start, bodySource.length);
  const end = Math.min(selection.end, bodySource.length);

  return {
    start,
    end,
  };
}

function limitEditorDraftBodySource(bodySource: string): string {
  return bodySource.slice(0, editorDraftBodyMaxLength);
}

export function useEditorShowcaseDraft(
  options: UseEditorShowcaseDraftOptions = {},
) {
  const compileContent = options.compileContent ?? compileEditorContent;
  const now = options.now ?? (() => new Date());
  const previewCompileDebounceMs =
    options.previewCompileDebounceMs ?? defaultPreviewCompileDebounceMs;
  const historyMergeWindowMs =
    options.historyMergeWindowMs ?? defaultHistoryMergeWindowMs;
  const title = ref(defaultEditorShowcaseTitle);
  const body = ref(defaultEditorShowcaseBody);
  const compiledDocument = ref<EditorCompiledDocument>(
    compileContent(defaultEditorShowcaseBody),
  );
  const previewBlockKeyResolver = createEditorPreviewBlockKeyResolver();
  let lastCompiledBody = defaultEditorShowcaseBody;
  let lastCompiledBodyHash = createContentHash(defaultEditorShowcaseBody);
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

  const draftBlocks = computed(() => compiledDocument.value.blocks);

  const postBodyWriteInput = computed(() =>
    mapEditorCompiledDocumentToPostBodyWriteInput(compiledDocument.value),
  );
  const currentSourceHash = computed(() =>
    createContentHash(`${title.value}\u0000${body.value}`),
  );

  function createSavedDraftSnapshot(savedAt: Date): EditorSavedDraftSnapshot {
    const writeInput = postBodyWriteInput.value;
    const contentHash = createContentHash(JSON.stringify(writeInput));

    return {
      title: previewTitle.value,
      sourceHash: currentSourceHash.value,
      contentHash: `local:${contentHash}`,
      savedAt,
      schemaVersion: writeInput.schemaVersion,
      blockCount: writeInput.blocks.length,
      postBodyWriteInput: writeInput,
    };
  }

  const savedDraftSnapshot = ref<EditorSavedDraftSnapshot>(
    createSavedDraftSnapshot(now()),
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
    const previewBlocks = mapEditorCompiledDocumentToPreviewReaderBlocks(
      compiledDocument.value,
      {
        keyResolver: previewBlockKeyResolver,
      },
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

  const previewBlockAnchors = computed(() =>
    mapPreviewReaderBlocksToAnchors(readerPreviewBlocks.value),
  );

  const previewBlocks = computed(() => {
    return draftBlocks.value.length
      ? draftBlocks.value
      : [fallbackPreviewBlock];
  });

  const previewParagraphs = computed(() => {
    const paragraphs = previewBlocks.value
      .filter((block) => block.type === "text")
      .map((paragraph) => paragraph.content);

    return paragraphs.length ? paragraphs : ["正文预览会随输入同步更新。"];
  });

  const wordCount = computed(() => {
    const contentChars = body.value.match(/\p{Script=Han}|[A-Za-z0-9]+/gu);
    return contentChars?.length ?? 0;
  });
  const bodyCharacterCount = computed(() => body.value.length);

  function createCurrentHistorySnapshot(
    activeField: EditorDraftHistoryField,
    selection?: EditorShowcaseTextSelection,
  ): EditorDraftHistorySnapshot {
    return {
      title: title.value,
      body: body.value,
      activeField,
      selection,
      changedAt: now().getTime(),
    };
  }

  function applyHistorySnapshot(snapshot: EditorDraftHistorySnapshot): void {
    title.value = snapshot.title;
    body.value = snapshot.body;
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
    const nextBodyHash = createContentHash(body.value);

    if (
      nextBodyHash === lastCompiledBodyHash &&
      body.value === lastCompiledBody
    ) {
      return;
    }

    compiledDocument.value = compileContent(body.value);
    compilerLogger.debug(() => [
      "compiled preview",
      {
        bodyHash: nextBodyHash,
        blockCount: compiledDocument.value.blocks.length,
      },
    ]);
    lastCompiledBody = body.value;
    lastCompiledBodyHash = nextBodyHash;
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

  function updateBody(
    nextBody: string,
    selection?: EditorShowcaseTextSelection,
  ): void {
    const limitedBody = limitEditorDraftBodySource(nextBody);
    const limitedSelection = clampSelectionToBody(selection, limitedBody);

    if (limitedBody === body.value) {
      return;
    }

    history.value = recordEditorDraftHistoryChange(
      history.value,
      {
        ...createCurrentHistorySnapshot("body", limitedSelection),
        body: limitedBody,
      },
      {
        kind: "typing",
        mergeWindowMs: historyMergeWindowMs,
      },
    );
    body.value = limitedBody;
  }

  function applyToolbarAction(
    action: EditorShowcaseToolbarAction,
    selection?: EditorShowcaseTextSelection,
  ): EditorShowcaseTextSelection {
    const result = applyToolbarActionToBody(body.value, action, selection);

    if (result.nextBody.length > editorDraftBodyMaxLength) {
      // Toolbar actions add markdown syntax around source text; rejecting an
      // overflowing transform avoids storing a truncated, invalid markdown edit.
      return selection ?? { start: body.value.length, end: body.value.length };
    }

    history.value = recordEditorDraftHistoryChange(
      history.value,
      {
        ...createCurrentHistorySnapshot("body", result.nextSelection),
        body: result.nextBody,
      },
      {
        kind: "toolbar",
        forceBoundary: true,
        mergeWindowMs: historyMergeWindowMs,
      },
    );
    body.value = result.nextBody;
    toolbarLogger.debug(() => [
      "applied toolbar action",
      {
        action,
        selection,
        nextSelection: result.nextSelection,
      },
    ]);
    return result.nextSelection;
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
      await Promise.resolve();
      // 保存快照必须基于当前 textarea 源文本重新编译，不能依赖可能仍在 debounce 中的预览结果。
      compilePreviewNow();
      savedDraftSnapshot.value = createSavedDraftSnapshot(now());
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
    previewTitle,
    compiledDocument,
    draftBlocks,
    postBodyWriteInput,
    readerBlocks,
    readerPreviewBlocks,
    previewBlockAnchors,
    previewBlocks,
    previewParagraphs,
    wordCount,
    bodyCharacterCount,
    bodyMaxLength: editorDraftBodyMaxLength,
    savedDraftSnapshot,
    draftSaveStatus,
    canSaveDraft,
    hasUnsavedChanges,
    canUndo,
    canRedo,
    updateTitle,
    updateBody,
    applyToolbarAction,
    undoDraft,
    redoDraft,
    saveDraft,
  };
}
