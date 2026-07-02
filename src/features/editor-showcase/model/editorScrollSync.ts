import type { EditorCompiledBlock } from "./editorContentCompiler";

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
  activeAnchorScrollTop: number | null;
  tolerancePx?: number;
}

export interface PreviewToEditorScrollTarget {
  strategy: "bottom" | "anchor" | "progress";
  scrollTop: number;
}

export interface BlockLineAnchor {
  blockIndex: number;
  startLine: number;
  endLine: number;
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
    // 文档底部是强边界：长表格等最后一个 block 内滚到底时，不能只同步到该 block 起始行。
    return {
      strategy: "bottom",
      scrollTop: getMaxScrollTop(
        input.editorScrollHeight,
        input.editorClientHeight,
      ),
    };
  }

  if (input.activeAnchorScrollTop !== null) {
    return {
      strategy: "anchor",
      scrollTop: input.activeAnchorScrollTop,
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

export function buildBlockLineAnchors(
  blocks: EditorCompiledBlock[],
): BlockLineAnchor[] {
  return blocks.flatMap((block, blockIndex) => {
    if (!block.sourceRange) {
      return [];
    }

    return [
      {
        blockIndex,
        startLine: block.sourceRange.startLine,
        endLine: block.sourceRange.endLine,
      },
    ];
  });
}

export function getActiveBlockIndexFromLine(
  anchors: BlockLineAnchor[],
  lineNumber: number,
): number | null {
  if (!anchors.length) {
    return null;
  }

  let activeBlockIndex = anchors[0].blockIndex;

  for (const anchor of anchors) {
    if (lineNumber < anchor.startLine) {
      break;
    }

    activeBlockIndex = anchor.blockIndex;

    if (lineNumber <= anchor.endLine) {
      break;
    }
  }

  return activeBlockIndex;
}
