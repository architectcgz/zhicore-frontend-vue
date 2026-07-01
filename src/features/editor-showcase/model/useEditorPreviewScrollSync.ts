import { computed, nextTick, type Ref } from "vue";

import type { EditorPreviewBlockAnchor } from "./editorContentCompiler";
import { createEditorLogger } from "./editorDebug";
import {
  getActiveBlockIndexFromLine,
  getSyncedScrollTop,
  type BlockLineAnchor,
} from "./editorScrollSync";

const scrollLogger = createEditorLogger("scroll");
const editorBottomStickinessMinTolerancePx = 2;

export interface UseEditorPreviewScrollSyncOptions {
  bodyInputRef: Readonly<Ref<HTMLTextAreaElement | null>>;
  writingEditorRef: Readonly<Ref<HTMLElement | null>>;
  readerPreviewRef: Readonly<Ref<HTMLElement | null>>;
  previewBlockAnchors: Readonly<Ref<EditorPreviewBlockAnchor[]>>;
  isPreviewMode: Readonly<Ref<boolean>>;
}

function getBodyInputLineHeight(bodyInput: HTMLTextAreaElement): number {
  const style = window.getComputedStyle(bodyInput);
  const parsedLineHeight =
    Number.parseFloat(style.lineHeight) ||
    Number.parseFloat(bodyInput.style.lineHeight);

  if (Number.isFinite(parsedLineHeight)) {
    return parsedLineHeight;
  }

  const parsedFontSize =
    Number.parseFloat(style.fontSize) ||
    Number.parseFloat(bodyInput.style.fontSize);

  return (Number.isFinite(parsedFontSize) ? parsedFontSize : 18) * 1.84;
}

function getEditorMaxScrollTop(writingEditor: HTMLElement): number {
  return Math.max(0, writingEditor.scrollHeight - writingEditor.clientHeight);
}

function hasBodyCaretAtDocumentEnd(bodyInput: HTMLTextAreaElement): boolean {
  return (
    bodyInput.selectionStart === bodyInput.value.length &&
    bodyInput.selectionEnd === bodyInput.value.length
  );
}

function shouldKeepEditorPinnedToBottom(
  writingEditor: HTMLElement,
  bodyInput: HTMLTextAreaElement,
): boolean {
  if (
    document.activeElement !== bodyInput ||
    !hasBodyCaretAtDocumentEnd(bodyInput)
  ) {
    return false;
  }

  const maxScrollTop = getEditorMaxScrollTop(writingEditor);
  const bottomTolerance = Math.max(
    editorBottomStickinessMinTolerancePx,
    getBodyInputLineHeight(bodyInput),
  );

  return (
    maxScrollTop <= bottomTolerance ||
    writingEditor.scrollTop >= maxScrollTop - bottomTolerance
  );
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
  const blockLineAnchors = computed<BlockLineAnchor[]>(() =>
    options.previewBlockAnchors.value.map((anchor) => ({
      blockIndex: anchor.readerBlockIndex,
      startLine: anchor.sourceRange.startLine,
      endLine: anchor.sourceRange.endLine,
    })),
  );

  function resizeBodyInput(): void {
    const bodyInput = options.bodyInputRef.value;
    const writingEditor = options.writingEditorRef.value;

    if (!bodyInput) {
      return;
    }

    const previousEditorScrollTop = writingEditor?.scrollTop ?? 0;
    const previousBodyInputScrollTop = bodyInput.scrollTop;
    const shouldStickToEditorBottom =
      writingEditor !== null
        ? shouldKeepEditorPinnedToBottom(writingEditor, bodyInput)
        : false;

    bodyInput.style.height = "auto";
    bodyInput.style.height = `${bodyInput.scrollHeight}px`;
    bodyInput.scrollTop = 0;

    if (writingEditor) {
      if (
        document.activeElement === bodyInput &&
        previousBodyInputScrollTop > 0
      ) {
        // 浏览器先把 textarea 内容向下滚动以追随光标；auto-height 后把这段位移转移给外层编辑器。
        writingEditor.scrollTop = Math.min(
          previousEditorScrollTop + previousBodyInputScrollTop,
          getEditorMaxScrollTop(writingEditor),
        );
        return;
      }

      // 尾部继续输入但没有内部滚动位移时兜底贴底；普通编辑仍保留用户当前阅读位置。
      writingEditor.scrollTop = shouldStickToEditorBottom
        ? getEditorMaxScrollTop(writingEditor)
        : previousEditorScrollTop;
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
    const activeReaderBlockIndex = getActiveBlockIndexFromLine(
      blockLineAnchors.value,
      sourceLineNumber,
    );

    if (activeReaderBlockIndex !== null) {
      const blockElement = readerPreview.querySelector<HTMLElement>(
        `[data-preview-reader-block-index="${activeReaderBlockIndex}"]`,
      );

      if (blockElement) {
        readerPreview.scrollTop = getPreviewBlockScrollTop(
          readerPreview,
          blockElement,
        );
        scrollLogger.debug(() => [
          "synced preview by block anchor",
          {
            sourceLineNumber,
            activeReaderBlockIndex,
            targetScrollTop: readerPreview.scrollTop,
          },
        ]);
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
    scrollLogger.debug(() => [
      "synced preview by scroll progress",
      {
        sourceScrollTop: writingEditor.scrollTop,
        targetScrollTop: readerPreview.scrollTop,
      },
    ]);
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
