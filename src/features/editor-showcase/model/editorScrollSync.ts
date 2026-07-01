import type { EditorCompiledBlock } from "./editorContentCompiler";

export interface SyncedScrollInput {
  sourceScrollTop: number;
  sourceScrollHeight: number;
  sourceClientHeight: number;
  targetScrollHeight: number;
  targetClientHeight: number;
}

export interface BlockLineAnchor {
  blockIndex: number;
  startLine: number;
  endLine: number;
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
