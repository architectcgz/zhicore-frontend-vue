import type { BlockParser, EditorCompiledHeadingLevel } from "../types";

interface ParsedHeadingLine {
  level: EditorCompiledHeadingLevel;
  content: string;
}

function parseHeadingLine(line: string): ParsedHeadingLine | null {
  const headingMatch = line.trim().match(/^(#{1,6})\s+(.+?)\s*#*$/);

  if (!headingMatch) {
    return null;
  }

  return {
    level: headingMatch[1].length as EditorCompiledHeadingLevel,
    content: headingMatch[2],
  };
}

export const headingParser: BlockParser = {
  parse({ line, nextIndex, parseInlineNodes }) {
    const heading = parseHeadingLine(line);

    if (!heading) {
      return null;
    }

    return {
      kind: "block",
      block: {
        type: "heading",
        label: "Heading",
        level: heading.level,
        content: heading.content,
        inlineNodes: parseInlineNodes(heading.content),
      },
      nextIndex,
    };
  },
};
