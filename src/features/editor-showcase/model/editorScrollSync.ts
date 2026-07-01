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

function skipBlankLines(lines: string[], startLine: number): number {
  let lineIndex = startLine;

  while (lineIndex < lines.length && !lines[lineIndex].trim()) {
    lineIndex += 1;
  }

  return lineIndex;
}

function countSourceLinesForBlock(block: EditorCompiledBlock): number {
  if (block.type === "code") {
    return block.content ? block.content.split("\n").length + 2 : 2;
  }

  if (
    block.type === "heading" ||
    block.type === "media" ||
    block.type === "math"
  ) {
    return 1;
  }

  return block.content.split("\n").length;
}

export function buildBlockLineAnchors(
  source: string,
  blocks: EditorCompiledBlock[],
): BlockLineAnchor[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const anchors: BlockLineAnchor[] = [];
  let nextLine = 0;

  blocks.forEach((block, blockIndex) => {
    const startLine = skipBlankLines(lines, nextLine);
    const lineCount = countSourceLinesForBlock(block);
    const endLine = Math.min(
      lines.length - 1,
      startLine + Math.max(lineCount, 1) - 1,
    );

    anchors.push({
      blockIndex,
      startLine,
      endLine,
    });
    nextLine = endLine + 1;
  });

  return anchors;
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
