import { blockParsers } from "./blockParsers";
import { parseInlineNodes } from "./inlineParsers";
import type {
  BlockParserResult,
  EditorCompiledBlock,
  EditorCompiledDocument,
  EditorCompiledInlineNode,
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

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeHtmlTextWithBreaks(input: string): string {
  return escapeHtml(input).replaceAll("\n", "<br>");
}

function compileInlineNodesToHtml(nodes: EditorCompiledInlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === "link") {
        return `<a href="${escapeHtml(node.href)}" target="_blank" rel="noreferrer">${escapeHtml(node.text)}</a>`;
      }

      if (node.type === "strong") {
        return `<strong>${escapeHtml(node.text)}</strong>`;
      }

      if (node.type === "emphasis") {
        return `<em>${escapeHtml(node.text)}</em>`;
      }

      if (node.type === "strikethrough") {
        return `<del>${escapeHtml(node.text)}</del>`;
      }

      if (node.type === "inlineCode") {
        return `<code>${escapeHtml(node.text)}</code>`;
      }

      return escapeHtmlTextWithBreaks(node.text);
    })
    .join("");
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

export function compileEditorBlocksToHtml(
  blocks: EditorCompiledBlock[],
): string {
  return blocks
    .map((block) => {
      if (block.type === "code") {
        const languageClass = block.language
          ? ` class="language-${escapeHtml(block.language)}"`
          : "";

        return `<pre><code${languageClass}>${escapeHtml(block.content)}</code></pre>`;
      }

      if (block.type === "text") {
        return `<p>${compileInlineNodesToHtml(block.inlineNodes)}</p>`;
      }

      if (block.type === "heading") {
        return `<h${block.level}>${compileInlineNodesToHtml(block.inlineNodes)}</h${block.level}>`;
      }

      if (block.type === "quote") {
        return `<blockquote>${compileInlineNodesToHtml(block.inlineNodes)}</blockquote>`;
      }

      if (block.type === "list") {
        const tagName = block.ordered ? "ol" : "ul";
        const className = block.task ? ' class="task-list"' : "";
        const itemsHtml = block.items
          .map((item) => {
            const checkbox =
              item.checked === undefined
                ? ""
                : `<input type="checkbox"${item.checked ? " checked" : ""} disabled> `;

            return `<li>${checkbox}${compileInlineNodesToHtml(item.inlineNodes)}</li>`;
          })
          .join("");

        return `<${tagName}${className}>${itemsHtml}</${tagName}>`;
      }

      if (block.type === "table") {
        const headersHtml = block.headers
          .map(
            (header) =>
              `<th>${compileInlineNodesToHtml(header.inlineNodes)}</th>`,
          )
          .join("");
        const rowsHtml = block.rows
          .map((row) => {
            const cellsHtml = row
              .map(
                (cell) =>
                  `<td>${compileInlineNodesToHtml(cell.inlineNodes)}</td>`,
              )
              .join("");

            return `<tr>${cellsHtml}</tr>`;
          })
          .join("");

        return `<table><thead><tr>${headersHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
      }

      if (block.type === "media") {
        const caption = block.alt
          ? `<figcaption>${escapeHtml(block.alt)}</figcaption>`
          : "";

        return `<figure><img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}">${caption}</figure>`;
      }

      return `<pre><code>${escapeHtml(block.content)}</code></pre>`;
    })
    .join("");
}

export function compileEditorContent(input: string): EditorCompiledDocument {
  const blocks = compileEditorBlocks(input);

  return {
    blocks,
    html: compileEditorBlocksToHtml(blocks),
  };
}
