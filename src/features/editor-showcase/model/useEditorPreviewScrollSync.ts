import { computed, nextTick, type Ref } from "vue";

import type { EditorPreviewBlockAnchor } from "./editorContentCompiler";
import { createEditorLogger } from "./editorDebug";
import {
  getActiveBlockIndexFromLine,
  getPreviewToEditorScrollTarget,
  getSyncedScrollTop,
  type BlockLineAnchor,
} from "./editorScrollSync";

const scrollLogger = createEditorLogger("scroll");
const editorBottomStickinessMinTolerancePx = 2;
const syncedScrollTolerancePx = 1;

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

function getBodyLineScrollTop(
  writingEditor: HTMLElement,
  bodyInput: HTMLTextAreaElement,
  lineNumber: number,
): number {
  const bodyTopInEditor =
    bodyInput.getBoundingClientRect().top -
    writingEditor.getBoundingClientRect().top +
    writingEditor.scrollTop;
  const maxScrollTop = getEditorMaxScrollTop(writingEditor);
  const nextScrollTop =
    bodyTopInEditor + lineNumber * getBodyInputLineHeight(bodyInput);

  return Math.min(Math.max(0, Math.round(nextScrollTop)), maxScrollTop);
}

function getActivePreviewReaderBlockIndex(
  readerPreview: HTMLElement,
): number | null {
  const blockElements = Array.from(
    readerPreview.querySelectorAll<HTMLElement>(
      "[data-preview-reader-block-index]",
    ),
  );
  let activeReaderBlockIndex: number | null = null;
  const previewRect = readerPreview.getBoundingClientRect();

  for (const blockElement of blockElements) {
    const readerBlockIndex = Number.parseInt(
      blockElement.dataset.previewReaderBlockIndex ?? "",
      10,
    );

    if (!Number.isFinite(readerBlockIndex)) {
      continue;
    }

    const blockScrollTop =
      blockElement.getBoundingClientRect().top -
      previewRect.top +
      readerPreview.scrollTop;

    if (blockScrollTop > readerPreview.scrollTop + syncedScrollTolerancePx) {
      break;
    }

    activeReaderBlockIndex = readerBlockIndex;
  }

  return activeReaderBlockIndex;
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

    if (hasSyncedScrollTop(writingEditor.scrollTop, pendingEditorScrollTop)) {
      pendingEditorScrollTop = null;
      return;
    }

    pendingEditorScrollTop = null;

    if (writingEditor.scrollTop <= syncedScrollTolerancePx) {
      // 顶部包含标题和工具栏等预览外壳，不能用首个正文 block 锚点替代文档顶部。
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
        const nextPreviewScrollTop = getPreviewBlockScrollTop(
          readerPreview,
          blockElement,
        );
        pendingPreviewScrollTop = nextPreviewScrollTop;
        readerPreview.scrollTop = nextPreviewScrollTop;
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

    if (hasSyncedScrollTop(readerPreview.scrollTop, pendingPreviewScrollTop)) {
      pendingPreviewScrollTop = null;
      return;
    }

    pendingPreviewScrollTop = null;

    const activeReaderBlockIndex =
      getActivePreviewReaderBlockIndex(readerPreview);
    const activeAnchor =
      activeReaderBlockIndex === null
        ? undefined
        : options.previewBlockAnchors.value.find(
            (anchor) => anchor.readerBlockIndex === activeReaderBlockIndex,
          );
    const activeSourceLineNumber = activeAnchor?.sourceRange.startLine ?? null;
    const activeAnchorScrollTop = activeAnchor
      ? getBodyLineScrollTop(
          writingEditor,
          bodyInput,
          activeAnchor.sourceRange.startLine,
        )
      : null;
    const editorScrollTarget = getPreviewToEditorScrollTarget({
      previewScrollTop: readerPreview.scrollTop,
      previewScrollHeight: readerPreview.scrollHeight,
      previewClientHeight: readerPreview.clientHeight,
      editorScrollHeight: writingEditor.scrollHeight,
      editorClientHeight: writingEditor.clientHeight,
      activeAnchorScrollTop,
      tolerancePx: syncedScrollTolerancePx,
    });

    pendingEditorScrollTop = editorScrollTarget.scrollTop;
    writingEditor.scrollTop = editorScrollTarget.scrollTop;

    if (editorScrollTarget.strategy === "anchor") {
      scrollLogger.debug(() => [
        "synced editor by preview block anchor",
        {
          activeReaderBlockIndex,
          sourceLineNumber: activeSourceLineNumber,
          targetScrollTop: writingEditor.scrollTop,
        },
      ]);
      return;
    }

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
    blockLineAnchors,
    resizeBodyInput,
    syncEditorScroll,
    syncPreviewScroll,
    syncEditorLayoutOnNextFrame,
  };
}
