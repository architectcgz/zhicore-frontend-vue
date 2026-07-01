import type { BlockParser } from "../types";

interface ClosingFenceLine {
  trailingText: string;
}

function isFenceLine(line: string): boolean {
  return line.trimStart().startsWith("```");
}

function parseFenceLanguage(line: string): string | undefined {
  const fenceInfo = line.trimStart().slice(3).trim();
  const languageMatch = fenceInfo.match(/^([A-Za-z0-9_-]+)/);

  return languageMatch?.[1];
}

function splitClosingFenceLine(line: string): ClosingFenceLine | null {
  const trimmedLine = line.trimStart();

  if (!trimmedLine.startsWith("```")) {
    return null;
  }

  return {
    trailingText: trimmedLine.slice(3).trimStart(),
  };
}

export const codeFenceParser: BlockParser = {
  parse({ line, lines, nextIndex }) {
    if (!isFenceLine(line)) {
      return null;
    }

    const language = parseFenceLanguage(line);
    const codeLines: string[] = [];
    let index = nextIndex;

    while (index < lines.length) {
      const closingFenceLine = splitClosingFenceLine(lines[index]);

      if (closingFenceLine) {
        return {
          kind: "block",
          block: {
            type: "code",
            label: "Code",
            language,
            content: codeLines.join("\n"),
          },
          nextIndex: index + 1,
          pendingLine: closingFenceLine.trailingText || null,
        };
      }

      codeLines.push(lines[index]);
      index += 1;
    }

    // 未闭合围栏只是用户编辑中的普通文本，不能提前生成会改变阅读语义的 code block。
    return {
      kind: "text",
      lines: [line, ...codeLines],
      nextIndex: index,
    };
  },
};
