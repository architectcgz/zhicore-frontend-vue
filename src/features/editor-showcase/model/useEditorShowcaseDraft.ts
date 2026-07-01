import { computed, getCurrentScope, onScopeDispose, ref, watch } from "vue";

import type { PostBodyBlock } from "@/entities/post-body";

import {
  compileEditorContent,
  mapEditorCompiledDocumentToPostBodyWriteInput,
  type EditorCompiledBlock,
  type EditorCompiledDocument,
  type EditorCompiledInlineNode,
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
export type { EditorShowcaseTextSelection, EditorShowcaseToolbarAction };

type EditorContentCompiler = (input: string) => EditorCompiledDocument;

export interface UseEditorShowcaseDraftOptions {
  compileContent?: EditorContentCompiler;
  previewCompileDebounceMs?: number;
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

  const readerBlocks = computed<PostBodyBlock[]>(() => {
    return postBodyWriteInput.value.blocks.length
      ? postBodyWriteInput.value.blocks
      : [fallbackReaderBlock];
  });

  const previewBlocks = computed(() => {
    return draftBlocks.value.length
      ? draftBlocks.value
      : [fallbackPreviewBlock];
  });

  const compiledHtml = computed(() => compiledDocument.value.html);

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
    compiledHtml,
    draftBlocks,
    postBodyWriteInput,
    readerBlocks,
    previewBlocks,
    previewParagraphs,
    wordCount,
    updateTitle,
    updateBody,
    applyToolbarAction,
  };
}
