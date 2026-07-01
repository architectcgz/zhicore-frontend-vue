import { computed, getCurrentScope, onScopeDispose, ref, watch } from "vue";

import type { PostBodyBlock, PostBodyWriteInput } from "@/entities/post-body";

import {
  compileEditorContent,
  mapEditorCompiledDocumentToPostBodyWriteInput,
  mapEditorCompiledDocumentToPreviewReaderBlocks,
  mapPreviewReaderBlocksToAnchors,
  type EditorCompiledBlock,
  type EditorCompiledDocument,
  type EditorCompiledInlineNode,
  type EditorPreviewReaderBlock,
} from "./editorContentCompiler";
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

const defaultPreviewCompileDebounceMs = 160;
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

export function useEditorShowcaseDraft(
  options: UseEditorShowcaseDraftOptions = {},
) {
  const compileContent = options.compileContent ?? compileEditorContent;
  const now = options.now ?? (() => new Date());
  const previewCompileDebounceMs =
    options.previewCompileDebounceMs ?? defaultPreviewCompileDebounceMs;
  const title = ref(defaultEditorShowcaseTitle);
  const body = ref(defaultEditorShowcaseBody);
  const compiledDocument = ref<EditorCompiledDocument>(
    compileContent(defaultEditorShowcaseBody),
  );
  let lastCompiledBody = defaultEditorShowcaseBody;
  let lastCompiledBodyHash = createContentHash(defaultEditorShowcaseBody);
  let previewCompileTimer: number | undefined;

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

  const readerPreviewBlocks = computed<EditorPreviewReaderBlock[]>(() => {
    const previewBlocks = mapEditorCompiledDocumentToPreviewReaderBlocks(
      compiledDocument.value,
    );

    return previewBlocks.length
      ? previewBlocks
      : [
          {
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

  function updateTitle(nextTitle: string): void {
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

  function updateBody(nextBody: string): void {
    if (nextBody === body.value) {
      return;
    }

    body.value = nextBody;
  }

  function applyToolbarAction(
    action: EditorShowcaseToolbarAction,
    selection?: EditorShowcaseTextSelection,
  ): EditorShowcaseTextSelection {
    const result = applyToolbarActionToBody(body.value, action, selection);

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
    title,
    body,
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
    savedDraftSnapshot,
    draftSaveStatus,
    canSaveDraft,
    hasUnsavedChanges,
    updateTitle,
    updateBody,
    applyToolbarAction,
    saveDraft,
  };
}
