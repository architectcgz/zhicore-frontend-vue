import { computed, nextTick, type Ref } from "vue";

import type { EditorCompiledBlock } from "./editorContentCompiler";
import {
  buildBlockLineAnchors,
  getActiveBlockIndexFromLine,
  getSyncedScrollTop,
} from "./editorScrollSync";

export interface UseEditorPreviewScrollSyncOptions {
  bodyInputRef: Readonly<Ref<HTMLTextAreaElement | null>>;
  writingEditorRef: Readonly<Ref<HTMLElement | null>>;
  readerPreviewRef: Readonly<Ref<HTMLElement | null>>;
  previewBlocks: Readonly<Ref<EditorCompiledBlock[]>>;
  isPreviewMode: Readonly<Ref<boolean>>;
}

function getBodyInputLineHeight(bodyInput: HTMLTextAreaElement): number {
  const style = window.getComputedStyle(bodyInput);
  const parsedLineHeight = Number.parseFloat(style.lineHeight);

  if (Number.isFinite(parsedLineHeight)) {
    return parsedLineHeight;
  }

  return Number.parseFloat(style.fontSize) * 1.84;
}

function getSourceLineNumberAtEditorTop(
  writingEditor: HTMLElement,
  bodyInput: HTMLTextAreaElement,
): number {
  const lineHeight = getBodyInputLineHeight(bodyInput);
  const bodyTopInEditor =
    bodyInput.getBoundingClientRect().top -
    writingEditor.getBoundingClientRect().top +
    writingEditor.scrollTop;
  const bodyScrollTop = Math.max(0, writingEditor.scrollTop - bodyTopInEditor);

  return Math.floor(bodyScrollTop / lineHeight);
}

function getPreviewBlockScrollTop(
  readerPreview: HTMLElement,
  blockElement: HTMLElement,
): number {
  const nextScrollTop =
    blockElement.getBoundingClientRect().top -
    readerPreview.getBoundingClientRect().top +
    readerPreview.scrollTop;
  const maxScrollTop = readerPreview.scrollHeight - readerPreview.clientHeight;

  return Math.min(Math.max(0, Math.round(nextScrollTop)), maxScrollTop);
}

export function useEditorPreviewScrollSync(
  options: UseEditorPreviewScrollSyncOptions,
) {
  const blockLineAnchors = computed(() =>
    buildBlockLineAnchors(options.previewBlocks.value),
  );

  function resizeBodyInput(): void {
    const bodyInput = options.bodyInputRef.value;
    const writingEditor = options.writingEditorRef.value;

    if (!bodyInput) {
      return;
    }

    const previousEditorScrollTop = writingEditor?.scrollTop ?? 0;

    bodyInput.style.height = "auto";
    bodyInput.style.height = `${bodyInput.scrollHeight}px`;

    if (writingEditor) {
      writingEditor.scrollTop = previousEditorScrollTop;
    }
  }

  function syncPreviewScroll(): void {
    const writingEditor = options.writingEditorRef.value;
    const bodyInput = options.bodyInputRef.value;
    const readerPreview = options.readerPreviewRef.value;

    if (
      !writingEditor ||
      !bodyInput ||
      !readerPreview ||
      !options.isPreviewMode.value
    ) {
      return;
    }

    const sourceLineNumber = getSourceLineNumberAtEditorTop(
      writingEditor,
      bodyInput,
    );
    const activeBlockIndex = getActiveBlockIndexFromLine(
      blockLineAnchors.value,
      sourceLineNumber,
    );

    if (activeBlockIndex !== null) {
      const blockElement = readerPreview.querySelector<HTMLElement>(
        `[data-preview-block-index="${activeBlockIndex}"]`,
      );

      if (blockElement) {
        readerPreview.scrollTop = getPreviewBlockScrollTop(
          readerPreview,
          blockElement,
        );
        return;
      }
    }

    readerPreview.scrollTop = getSyncedScrollTop({
      sourceScrollTop: writingEditor.scrollTop,
      sourceScrollHeight: writingEditor.scrollHeight,
      sourceClientHeight: writingEditor.clientHeight,
      targetScrollHeight: readerPreview.scrollHeight,
      targetClientHeight: readerPreview.clientHeight,
    });
  }

  async function syncEditorLayoutOnNextFrame(): Promise<void> {
    await nextTick();
    window.requestAnimationFrame(() => {
      resizeBodyInput();
      syncPreviewScroll();
    });
  }

  return {
    blockLineAnchors,
    resizeBodyInput,
    syncPreviewScroll,
    syncEditorLayoutOnNextFrame,
  };
}
