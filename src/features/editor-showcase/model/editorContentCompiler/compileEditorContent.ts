import { blockParsers } from "./blockParsers";
import { parseInlineNodes } from "./inlineParsers";
import type {
  BlockParserResult,
  EditorCompiledBlock,
  EditorCompiledDocument,
  EditorCompiledSourceRange,
} from "./types";

function trimBlockContent(content: string): string {
  return content.replace(/^\n+|\n+$/g, "");
}

function createTextBlock(
  content: string,
  sourceRange: EditorCompiledSourceRange,
): EditorCompiledBlock {
  return {
    type: "text",
    label: "Text",
    content,
    sourceRange,
    inlineNodes: parseInlineNodes(content),
  };
}

function attachSourceRange(
  block: EditorCompiledBlock,
  sourceRange: EditorCompiledSourceRange,
): EditorCompiledBlock {
  return {
    ...block,
    sourceRange,
  };
}

export function compileEditorBlocks(input: string): EditorCompiledBlock[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const blocks: EditorCompiledBlock[] = [];
  const textLines: string[] = [];
  let textStartLine: number | null = null;
  let textEndLine: number | null = null;
  let index = 0;
  let pendingLine: string | null = null;
  let pendingLineNumber: number | null = null;

  function flushTextBlock(): void {
    const content = trimBlockContent(textLines.join("\n"));

    if (content.trim() && textStartLine !== null && textEndLine !== null) {
      blocks.push(
        createTextBlock(content, {
          startLine: textStartLine,
          endLine: textEndLine,
        }),
      );
    }

    textLines.length = 0;
    textStartLine = null;
    textEndLine = null;
  }

  function appendTextLines(
    linesToAppend: string[],
    startLine: number,
    endLine: number,
  ): void {
    if (!linesToAppend.length) {
      return;
    }

    textStartLine ??= startLine;
    textEndLine = Math.max(textEndLine ?? endLine, endLine);
    textLines.push(...linesToAppend);
  }

  function applyParserResult(
    result: BlockParserResult,
    startLine: number,
  ): void {
    if (result.kind === "text") {
      appendTextLines(
        result.lines,
        startLine,
        Math.max(startLine, result.nextIndex - 1),
      );
    } else {
      flushTextBlock();
      blocks.push(
        attachSourceRange(result.block, {
          startLine,
          endLine: Math.max(startLine, result.nextIndex - 1),
        }),
      );
    }

    index = result.nextIndex;
    pendingLine = result.pendingLine ?? null;
    pendingLineNumber = pendingLine
      ? Math.max(startLine, result.nextIndex - 1)
      : null;
  }

  scanLines: while (index < lines.length || pendingLine !== null) {
    const lineNumber = pendingLineNumber ?? index;
    const line = pendingLine ?? lines[index];

    if (pendingLine === null) {
      index += 1;
    } else {
      pendingLine = null;
      pendingLineNumber = null;
    }

    if (!line.trim()) {
      if (textLines.length) {
        appendTextLines([""], lineNumber, lineNumber);
      }

      continue;
    }

    for (const parser of blockParsers) {
      const result = parser.parse({
        line,
        lines,
        nextIndex: index,
        parseInlineNodes,
      });

      if (result) {
        applyParserResult(result, lineNumber);
        continue scanLines;
      }
    }

    appendTextLines([line], lineNumber, lineNumber);
  }

  flushTextBlock();

  return blocks;
}

export function compileEditorContent(input: string): EditorCompiledDocument {
  const blocks = compileEditorBlocks(input);

  return {
    blocks,
  };
}
