import type { BlockParser } from "../types";

function isQuoteLine(line: string): boolean {
  return /^>\s?/.test(line.trimStart());
}

function stripQuoteMarker(line: string): string {
  return line.trimStart().replace(/^>\s?/, "");
}

export const quoteParser: BlockParser = {
  parse({ line, lines, nextIndex, parseInlineNodes }) {
    if (!isQuoteLine(line)) {
      return null;
    }

    const quoteLines = [stripQuoteMarker(line)];
    let index = nextIndex;

    while (index < lines.length && isQuoteLine(lines[index])) {
      quoteLines.push(stripQuoteMarker(lines[index]));
      index += 1;
    }

    const content = quoteLines.join("\n");

    return {
      kind: "block",
      block: {
        type: "quote",
        label: "Quote",
        content,
        inlineNodes: parseInlineNodes(content),
      },
      nextIndex: index,
    };
  },
};
