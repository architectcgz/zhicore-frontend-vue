import type {
  PostBodyBlock,
  PostBodyInlineMark,
  PostBodyInlineNode,
  PostBodyTableCell,
  PostBodyWriteInput,
} from "@/entities/post-body";

interface MarkdownLine {
  text: string;
  index: number;
}

const unorderedListPattern = /^[-*+]\s+(.+)$/;
const orderedListPattern = /^\d+\.\s+(.+)$/;
const taskListPattern = /^[-*+]\s+\[( |x|X)\]\s+(.+)$/;

function textNode(
  text: string,
  marks: PostBodyInlineMark[] = [],
): PostBodyInlineNode {
  return {
    type: "text",
    text,
    ...(marks.length ? { marks } : {}),
  };
}

function parseInlineMarkdown(text: string): PostBodyInlineNode[] {
  const nodes: PostBodyInlineNode[] = [];
  const pattern =
    /(\*\*([^*]+)\*\*)|(~~([^~]+)~~)|(`([^`]+)`)|(\[([^\]]+)\]\((https?:\/\/[^)\s]+)\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(textNode(text.slice(cursor, match.index)));
    }

    if (match[2]) {
      nodes.push(textNode(match[2], [{ type: "bold" }]));
    } else if (match[4]) {
      nodes.push(textNode(match[4], [{ type: "strike" }]));
    } else if (match[6]) {
      nodes.push(textNode(match[6], [{ type: "inline_code" }]));
    } else if (match[8] && match[9]) {
      nodes.push(textNode(match[8], [{ type: "link", href: match[9] }]));
    }

    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    nodes.push(textNode(text.slice(cursor)));
  }

  return nodes.length ? nodes : text ? [textNode(text)] : [];
}

function paragraphBlock(text: string): PostBodyBlock {
  return {
    type: "paragraph",
    children: parseInlineMarkdown(text),
  };
}

function parsePipeRow(text: string): string[] | null {
  const trimmed = text.trim();

  if (!trimmed.includes("|")) {
    return null;
  }

  const cells = trimmed
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  return cells.length >= 2 ? cells : null;
}

function isPipeTableSeparator(text: string, columnCount: number): boolean {
  const cells = parsePipeRow(text);

  return (
    cells !== null &&
    cells.length === columnCount &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function tableCell(text: string): PostBodyTableCell {
  return {
    children: parseInlineMarkdown(text),
  };
}

function consumePipeTable(lines: MarkdownLine[], startIndex: number) {
  const header = parsePipeRow(lines[startIndex]?.text ?? "");

  if (
    !header ||
    !isPipeTableSeparator(lines[startIndex + 1]?.text ?? "", header.length)
  ) {
    return null;
  }

  const rows: PostBodyTableCell[][] = [];
  let cursor = startIndex + 2;

  while (cursor < lines.length) {
    const row = parsePipeRow(lines[cursor].text);

    if (!row || row.length !== header.length) {
      break;
    }

    rows.push(row.map(tableCell));
    cursor += 1;
  }

  return {
    block: {
      type: "table",
      headers: header.map(tableCell),
      rows,
    } satisfies PostBodyBlock,
    nextIndex: cursor,
  };
}

function consumeList(lines: MarkdownLine[], startIndex: number) {
  const firstLine = lines[startIndex].text;
  const taskMatch = taskListPattern.exec(firstLine);
  const unorderedMatch = unorderedListPattern.exec(firstLine);
  const orderedMatch = orderedListPattern.exec(firstLine);

  if (!taskMatch && !unorderedMatch && !orderedMatch) {
    return null;
  }

  const task = Boolean(taskMatch);
  const ordered = Boolean(orderedMatch);
  const items: Array<{
    children: PostBodyInlineNode[];
    checked?: boolean;
  }> = [];
  let cursor = startIndex;

  while (cursor < lines.length) {
    const text = lines[cursor].text;
    const currentTaskMatch = taskListPattern.exec(text);
    const currentUnorderedMatch = unorderedListPattern.exec(text);
    const currentOrderedMatch = orderedListPattern.exec(text);

    if (task && currentTaskMatch) {
      items.push({
        checked: currentTaskMatch[1].toLowerCase() === "x",
        children: parseInlineMarkdown(currentTaskMatch[2]),
      });
    } else if (!task && ordered && currentOrderedMatch) {
      items.push({
        children: parseInlineMarkdown(currentOrderedMatch[1]),
      });
    } else if (!task && !ordered && currentUnorderedMatch) {
      items.push({
        children: parseInlineMarkdown(currentUnorderedMatch[1]),
      });
    } else {
      break;
    }

    cursor += 1;
  }

  return {
    block: {
      type: "list",
      ordered,
      task,
      items,
    } satisfies PostBodyBlock,
    nextIndex: cursor,
  };
}

function consumeCodeFence(lines: MarkdownLine[], startIndex: number) {
  const opening = /^```\s*([A-Za-z0-9_-]*)\s*$/.exec(lines[startIndex].text);

  if (!opening) {
    return null;
  }

  const codeLines: string[] = [];
  let cursor = startIndex + 1;

  while (cursor < lines.length && lines[cursor].text.trim() !== "```") {
    codeLines.push(lines[cursor].text);
    cursor += 1;
  }

  return {
    block: {
      type: "code_block",
      ...(opening[1] ? { language: opening[1] } : {}),
      code: codeLines.join("\n"),
    } satisfies PostBodyBlock,
    nextIndex: cursor < lines.length ? cursor + 1 : cursor,
  };
}

function consumeMathFence(lines: MarkdownLine[], startIndex: number) {
  if (lines[startIndex].text.trim() !== "$$") {
    return null;
  }

  const latexLines: string[] = [];
  let cursor = startIndex + 1;

  while (cursor < lines.length && lines[cursor].text.trim() !== "$$") {
    latexLines.push(lines[cursor].text);
    cursor += 1;
  }

  return {
    block: {
      type: "math",
      latex: latexLines.join("\n"),
    } satisfies PostBodyBlock,
    nextIndex: cursor < lines.length ? cursor + 1 : cursor,
  };
}

function collectParagraph(lines: MarkdownLine[], startIndex: number) {
  const paragraphLines: string[] = [];
  let cursor = startIndex;

  while (cursor < lines.length) {
    const text = lines[cursor].text;

    if (
      !text.trim() ||
      /^#{1,6}\s+/.test(text) ||
      /^>\s+/.test(text) ||
      /^```\s*/.test(text) ||
      text.trim() === "$$" ||
      taskListPattern.test(text) ||
      unorderedListPattern.test(text) ||
      orderedListPattern.test(text) ||
      consumePipeTable(lines, cursor)
    ) {
      break;
    }

    paragraphLines.push(text);
    cursor += 1;
  }

  return {
    block: paragraphBlock(paragraphLines.join("\n")),
    nextIndex: cursor,
  };
}

export function mapMarkdownTextToPostBodyWriteInput(
  markdown: string,
): PostBodyWriteInput {
  const lines = markdown.split("\n").map((text, index) => ({ text, index }));
  const blocks: PostBodyBlock[] = [];
  let cursor = 0;

  while (cursor < lines.length) {
    const line = lines[cursor];
    const trimmed = line.text.trim();

    if (!trimmed) {
      cursor += 1;
      continue;
    }

    const codeFence = consumeCodeFence(lines, cursor);

    if (codeFence) {
      blocks.push(codeFence.block);
      cursor = codeFence.nextIndex;
      continue;
    }

    const mathFence = consumeMathFence(lines, cursor);

    if (mathFence) {
      blocks.push(mathFence.block);
      cursor = mathFence.nextIndex;
      continue;
    }

    const table = consumePipeTable(lines, cursor);

    if (table) {
      blocks.push(table.block);
      cursor = table.nextIndex;
      continue;
    }

    const list = consumeList(lines, cursor);

    if (list) {
      blocks.push(list.block);
      cursor = list.nextIndex;
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+)$/.exec(line.text);

    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInlineMarkdown(headingMatch[2]),
      });
      cursor += 1;
      continue;
    }

    const quoteMatch = /^>\s+(.+)$/.exec(line.text);

    if (quoteMatch) {
      blocks.push({
        type: "quote",
        children: parseInlineMarkdown(quoteMatch[1]),
      });
      cursor += 1;
      continue;
    }

    const paragraph = collectParagraph(lines, cursor);
    blocks.push(paragraph.block);
    cursor = paragraph.nextIndex;
  }

  return {
    schemaVersion: 1,
    blocks,
  };
}
