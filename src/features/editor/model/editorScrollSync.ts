export interface SyncedScrollInput {
  sourceScrollTop: number;
  sourceScrollHeight: number;
  sourceClientHeight: number;
  targetScrollHeight: number;
  targetClientHeight: number;
}

export interface PreviewToEditorScrollTargetInput {
  previewScrollTop: number;
  previewScrollHeight: number;
  previewClientHeight: number;
  editorScrollHeight: number;
  editorClientHeight: number;
  tolerancePx?: number;
}

export interface PreviewToEditorScrollTarget {
  strategy: "bottom" | "progress";
  scrollTop: number;
}

const defaultScrollTolerancePx = 1;

function getMaxScrollTop(scrollHeight: number, clientHeight: number): number {
  return Math.max(0, scrollHeight - clientHeight);
}

function isScrollAtBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  tolerancePx: number,
): boolean {
  const maxScrollTop = getMaxScrollTop(scrollHeight, clientHeight);

  return maxScrollTop > tolerancePx && scrollTop >= maxScrollTop - tolerancePx;
}

export function getSyncedScrollTop(input: SyncedScrollInput): number {
  const sourceScrollableHeight =
    input.sourceScrollHeight - input.sourceClientHeight;
  const targetScrollableHeight =
    input.targetScrollHeight - input.targetClientHeight;

  if (sourceScrollableHeight <= 0 || targetScrollableHeight <= 0) {
    return 0;
  }

  const progress = input.sourceScrollTop / sourceScrollableHeight;

  return Math.round(progress * targetScrollableHeight);
}

export function getPreviewToEditorScrollTarget(
  input: PreviewToEditorScrollTargetInput,
): PreviewToEditorScrollTarget {
  const tolerancePx = input.tolerancePx ?? defaultScrollTolerancePx;

  if (
    isScrollAtBottom(
      input.previewScrollTop,
      input.previewScrollHeight,
      input.previewClientHeight,
      tolerancePx,
    )
  ) {
    // 文档底部是强边界：长表格等高内容滚到底时，目标侧也必须贴到底。
    return {
      strategy: "bottom",
      scrollTop: getMaxScrollTop(
        input.editorScrollHeight,
        input.editorClientHeight,
      ),
    };
  }

  return {
    strategy: "progress",
    scrollTop: getSyncedScrollTop({
      sourceScrollTop: input.previewScrollTop,
      sourceScrollHeight: input.previewScrollHeight,
      sourceClientHeight: input.previewClientHeight,
      targetScrollHeight: input.editorScrollHeight,
      targetClientHeight: input.editorClientHeight,
    }),
  };
}
