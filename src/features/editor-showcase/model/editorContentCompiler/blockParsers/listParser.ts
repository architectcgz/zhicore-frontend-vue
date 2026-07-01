import type { BlockParser, EditorCompiledListItem } from "../types";

interface ParsedListLine {
  ordered: boolean;
  task: boolean;
  checked?: boolean;
  content: string;
}

function parseListLine(line: string): ParsedListLine | null {
  const trimmedLine = line.trimStart();
  const taskMatch = trimmedLine.match(/^[-*]\s+\[(x|X| )]\s+(.*)$/);

  if (taskMatch) {
    return {
      ordered: false,
      task: true,
      checked: taskMatch[1].toLowerCase() === "x",
      content: taskMatch[2],
    };
  }

  const unorderedMatch = trimmedLine.match(/^[-*]\s+(.*)$/);

  if (unorderedMatch) {
    return {
      ordered: false,
      task: false,
      content: unorderedMatch[1],
    };
  }

  const orderedMatch = trimmedLine.match(/^\d+[.)]\s+(.*)$/);

  if (orderedMatch) {
    return {
      ordered: true,
      task: false,
      content: orderedMatch[1],
    };
  }

  return null;
}

export const listParser: BlockParser = {
  parse({ line, lines, nextIndex, parseInlineNodes }) {
    const firstItem = parseListLine(line);

    if (!firstItem) {
      return null;
    }

    const items: EditorCompiledListItem[] = [];
    const rawLines = [line.trimEnd()];
    let index = nextIndex;

    items.push({
      ...(firstItem.task ? { checked: firstItem.checked ?? false } : {}),
      content: firstItem.content,
      inlineNodes: parseInlineNodes(firstItem.content),
    });

    while (index < lines.length) {
      const item = parseListLine(lines[index]);

      if (
        !item ||
        item.ordered !== firstItem.ordered ||
        item.task !== firstItem.task
      ) {
        break;
      }

      items.push({
        ...(item.task ? { checked: item.checked ?? false } : {}),
        content: item.content,
        inlineNodes: parseInlineNodes(item.content),
      });
      rawLines.push(lines[index].trimEnd());
      index += 1;
    }

    return {
      kind: "block",
      block: {
        type: "list",
        label: firstItem.task ? "Task List" : "List",
        ordered: firstItem.ordered,
        task: firstItem.task,
        content: rawLines.join("\n"),
        items,
      },
      nextIndex: index,
    };
  },
};
