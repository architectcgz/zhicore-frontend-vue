import type {
  BlockParser,
  EditorCompiledInlineNode,
  EditorCompiledTableCell,
} from "../types";

function parseTableRow(line: string): string[] | null {
  let trimmedLine = line.trim();

  if (!trimmedLine.includes("|")) {
    return null;
  }

  if (trimmedLine.startsWith("|")) {
    trimmedLine = trimmedLine.slice(1);
  }

  if (trimmedLine.endsWith("|")) {
    trimmedLine = trimmedLine.slice(0, -1);
  }

  const cells = trimmedLine.split("|").map((cell) => cell.trim());

  return cells.length >= 2 ? cells : null;
}

function isTableSeparatorLine(
  line: string,
  expectedCellCount: number,
): boolean {
  const cells = parseTableRow(line);

  return (
    cells?.length === expectedCellCount &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
}

function createTableCell(
  content: string,
  parseInlineNodes: (value: string) => EditorCompiledInlineNode[],
): EditorCompiledTableCell {
  return {
    content,
    inlineNodes: parseInlineNodes(content),
  };
}

export const tableParser: BlockParser = {
  parse({ line, lines, nextIndex, parseInlineNodes }) {
    const headerCells = parseTableRow(line);

    if (
      !headerCells ||
      !isTableSeparatorLine(lines[nextIndex] ?? "", headerCells.length)
    ) {
      return null;
    }

    const rows: EditorCompiledTableCell[][] = [];
    const rawLines = [line.trimEnd(), lines[nextIndex].trimEnd()];
    let index = nextIndex + 1;

    while (index < lines.length) {
      const rowCells = parseTableRow(lines[index]);

      if (!rowCells || rowCells.length !== headerCells.length) {
        break;
      }

      rows.push(
        rowCells.map((cell) => createTableCell(cell, parseInlineNodes)),
      );
      rawLines.push(lines[index].trimEnd());
      index += 1;
    }

    return {
      kind: "block",
      block: {
        type: "table",
        label: "Table",
        content: rawLines.join("\n"),
        headers: headerCells.map((cell) =>
          createTableCell(cell, parseInlineNodes),
        ),
        rows,
      },
      nextIndex: index,
    };
  },
};
