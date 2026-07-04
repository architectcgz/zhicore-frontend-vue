import { nextTick, type Ref } from "vue";

import { createEditorLogger } from "../lib/editorDebug";
import {
  getPreviewToEditorScrollTarget,
  getSyncedScrollTop,
} from "../lib/editorScrollSync";

const scrollLogger = createEditorLogger("scroll");
const editorBottomStickinessMinTolerancePx = 2;
const syncedScrollTolerancePx = 1;

export interface UseEditorPreviewScrollSyncOptions {
  bodyInputRef: Readonly<Ref<HTMLElement | null>>;
  writingEditorRef: Readonly<Ref<HTMLElement | null>>;
  readerPreviewRef: Readonly<Ref<HTMLElement | null>>;
  isPreviewMode: Readonly<Ref<boolean>>;
}

function getBodyInputLineHeight(bodyInput: HTMLElement): number {
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

function getElementMaxScrollTop(element: HTMLElement): number {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

function isElementScrolledToBottom(element: HTMLElement): boolean {
  const maxScrollTop = getElementMaxScrollTop(element);

  return (
    maxScrollTop > syncedScrollTolerancePx &&
    element.scrollTop >= maxScrollTop - syncedScrollTolerancePx
  );
}

function isTextareaElement(
  element: HTMLElement,
): element is HTMLTextAreaElement {
  return element instanceof HTMLTextAreaElement;
}

function isBodyEditorActive(bodyInput: HTMLElement): boolean {
  return (
    document.activeElement === bodyInput ||
    (document.activeElement !== null &&
      bodyInput.contains(document.activeElement))
  );
}

function hasBodyCaretAtDocumentEnd(bodyInput: HTMLElement): boolean {
  if (!isTextareaElement(bodyInput)) {
    return false;
  }

  return (
    bodyInput.selectionStart === bodyInput.value.length &&
    bodyInput.selectionEnd === bodyInput.value.length
  );
}

function shouldKeepEditorPinnedToBottom(
  writingEditor: HTMLElement,
  bodyInput: HTMLElement,
): boolean {
  if (!isBodyEditorActive(bodyInput) || !hasBodyCaretAtDocumentEnd(bodyInput)) {
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

function hasSyncedScrollTop(
  currentScrollTop: number,
  expectedScrollTop: number | null,
): boolean {
  return (
    expectedScrollTop !== null &&
    Math.abs(currentScrollTop - expectedScrollTop) <= syncedScrollTolerancePx
  );
}

export function useEditorPreviewScrollSync(
  options: UseEditorPreviewScrollSyncOptions,
) {
  // 左右面板会互相设置 scrollTop；记录预期值用来吞掉对应的程序化滚动事件。
  let pendingEditorScrollTop: number | null = null;
  let pendingPreviewScrollTop: number | null = null;

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
      if (isBodyEditorActive(bodyInput) && previousBodyInputScrollTop > 0) {
        // 浏览器可能先把正文编辑元素内部滚动以追随光标；auto-height 后把这段位移转移给外层编辑器。
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
    const readerPreview = options.readerPreviewRef.value;

    if (!writingEditor || !readerPreview || !options.isPreviewMode.value) {
      return;
    }

    if (hasSyncedScrollTop(writingEditor.scrollTop, pendingEditorScrollTop)) {
      pendingEditorScrollTop = null;
      return;
    }

    pendingEditorScrollTop = null;

    if (writingEditor.scrollTop <= syncedScrollTolerancePx) {
      pendingPreviewScrollTop = 0;
      readerPreview.scrollTop = 0;
      scrollLogger.debug(() => [
        "synced preview to document top",
        {
          sourceScrollTop: writingEditor.scrollTop,
          targetScrollTop: readerPreview.scrollTop,
        },
      ]);
      return;
    }

    if (isElementScrolledToBottom(writingEditor)) {
      const nextPreviewScrollTop = getElementMaxScrollTop(readerPreview);
      pendingPreviewScrollTop = nextPreviewScrollTop;
      readerPreview.scrollTop = nextPreviewScrollTop;
      scrollLogger.debug(() => [
        "synced preview to document bottom",
        {
          sourceScrollTop: writingEditor.scrollTop,
          targetScrollTop: readerPreview.scrollTop,
        },
      ]);
      return;
    }

    const nextPreviewScrollTop = getSyncedScrollTop({
      sourceScrollTop: writingEditor.scrollTop,
      sourceScrollHeight: writingEditor.scrollHeight,
      sourceClientHeight: writingEditor.clientHeight,
      targetScrollHeight: readerPreview.scrollHeight,
      targetClientHeight: readerPreview.clientHeight,
    });
    pendingPreviewScrollTop = nextPreviewScrollTop;
    readerPreview.scrollTop = nextPreviewScrollTop;
    scrollLogger.debug(() => [
      "synced preview by scroll progress",
      {
        sourceScrollTop: writingEditor.scrollTop,
        targetScrollTop: readerPreview.scrollTop,
      },
    ]);
  }

  function syncEditorScroll(): void {
    const writingEditor = options.writingEditorRef.value;
    const readerPreview = options.readerPreviewRef.value;

    if (!writingEditor || !readerPreview || !options.isPreviewMode.value) {
      return;
    }

    if (hasSyncedScrollTop(readerPreview.scrollTop, pendingPreviewScrollTop)) {
      pendingPreviewScrollTop = null;
      return;
    }

    pendingPreviewScrollTop = null;

    const editorScrollTarget = getPreviewToEditorScrollTarget({
      previewScrollTop: readerPreview.scrollTop,
      previewScrollHeight: readerPreview.scrollHeight,
      previewClientHeight: readerPreview.clientHeight,
      editorScrollHeight: writingEditor.scrollHeight,
      editorClientHeight: writingEditor.clientHeight,
      tolerancePx: syncedScrollTolerancePx,
    });

    pendingEditorScrollTop = editorScrollTarget.scrollTop;
    writingEditor.scrollTop = editorScrollTarget.scrollTop;

    if (editorScrollTarget.strategy === "bottom") {
      scrollLogger.debug(() => [
        "synced editor to document bottom",
        {
          sourceScrollTop: readerPreview.scrollTop,
          targetScrollTop: writingEditor.scrollTop,
        },
      ]);
      return;
    }

    scrollLogger.debug(() => [
      "synced editor by preview scroll progress",
      {
        sourceScrollTop: readerPreview.scrollTop,
        targetScrollTop: writingEditor.scrollTop,
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
    resizeBodyInput,
    syncEditorScroll,
    syncPreviewScroll,
    syncEditorLayoutOnNextFrame,
  };
}
