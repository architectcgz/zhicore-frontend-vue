import type { BlockParser } from "../types";

interface MathFenceContent {
  latex: string;
  trailingText: string;
}

function isMathFenceLine(line: string): boolean {
  return line.trimStart().startsWith("$$");
}

function splitInlineMathFenceContent(content: string): MathFenceContent | null {
  const closingFenceIndex = content.indexOf("$$");

  if (closingFenceIndex === -1) {
    return null;
  }

  return {
    latex: content.slice(0, closingFenceIndex).trim(),
    trailingText: content.slice(closingFenceIndex + 2).trimStart(),
  };
}

function createMathBlock(content: string) {
  return {
    type: "math" as const,
    label: "Math",
    content,
  };
}

export const mathParser: BlockParser = {
  parse({ line, lines, nextIndex }) {
    if (!isMathFenceLine(line)) {
      return null;
    }

    const openingContent = line.trimStart().slice(2);
    const inlineFenceContent = splitInlineMathFenceContent(openingContent);

    if (inlineFenceContent) {
      return {
        kind: "block",
        block: createMathBlock(inlineFenceContent.latex),
        nextIndex,
        pendingLine: inlineFenceContent.trailingText || null,
      };
    }

    const mathLines: string[] = [];
    const sourceLines = [line];
    let index = nextIndex;

    if (openingContent.trim()) {
      mathLines.push(openingContent.trimStart());
    }

    while (index < lines.length) {
      const currentLine = lines[index];

      if (isMathFenceLine(currentLine)) {
        const closingContent = currentLine.trimStart().slice(2);

        return {
          kind: "block",
          block: createMathBlock(mathLines.join("\n").trim()),
          nextIndex: index + 1,
          pendingLine: closingContent.trimStart() || null,
        };
      }

      mathLines.push(currentLine);
      sourceLines.push(currentLine);
      index += 1;
    }

    // 未闭合公式围栏仍是编辑中的普通文本，避免把半成品提交为正式 math block。
    return {
      kind: "text",
      lines: sourceLines,
      nextIndex: index,
    };
  },
};
