export type EditorCompiledHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type EditorCompiledInlineNode =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "strong";
      text: string;
    }
  | {
      type: "emphasis";
      text: string;
    }
  | {
      type: "strikethrough";
      text: string;
    }
  | {
      type: "inlineCode";
      text: string;
    }
  | {
      type: "link";
      text: string;
      href: string;
    };

export interface EditorCompiledListItem {
  content: string;
  inlineNodes: EditorCompiledInlineNode[];
  checked?: boolean;
}

interface EditorCompiledBlockBase {
  label: string;
  content: string;
}

export type EditorCompiledBlock =
  | (EditorCompiledBlockBase & {
      type: "text";
      inlineNodes: EditorCompiledInlineNode[];
    })
  | (EditorCompiledBlockBase & {
      type: "heading";
      level: EditorCompiledHeadingLevel;
      inlineNodes: EditorCompiledInlineNode[];
    })
  | (EditorCompiledBlockBase & {
      type: "quote";
      inlineNodes: EditorCompiledInlineNode[];
    })
  | (EditorCompiledBlockBase & {
      type: "code";
      language?: string;
    })
  | (EditorCompiledBlockBase & {
      type: "list";
      ordered: boolean;
      task: boolean;
      items: EditorCompiledListItem[];
    })
  | (EditorCompiledBlockBase & {
      type: "media";
      alt: string;
      src: string;
    })
  | (EditorCompiledBlockBase & {
      type: "math";
    });

export type EditorCompiledBlockType = EditorCompiledBlock["type"];

export interface EditorCompiledDocument {
  blocks: EditorCompiledBlock[];
  html: string;
}

interface ClosingFenceLine {
  trailingText: string;
}

interface ParsedHeadingLine {
  level: EditorCompiledHeadingLevel;
  content: string;
}

interface ParsedImageLine {
  alt: string;
  src: string;
}

interface ParsedListLine {
  ordered: boolean;
  task: boolean;
  checked?: boolean;
  content: string;
}

interface CollectedListBlock {
  block: EditorCompiledBlock;
  nextIndex: number;
}

interface InlineRule {
  pattern: RegExp;
  createNode: (match: RegExpExecArray) => EditorCompiledInlineNode;
}

interface InlineToken {
  index: number;
  raw: string;
  node: EditorCompiledInlineNode;
}

function trimBlockContent(content: string): string {
  return content.replace(/^\n+|\n+$/g, "");
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

function sanitizeLinkHref(href: string): string | null {
  if (/^(https?:\/\/|\/|#)/.test(href)) {
    return href;
  }

  return null;
}

function createInlineCodeNode(
  match: RegExpExecArray,
): EditorCompiledInlineNode {
  return {
    type: "inlineCode",
    text: match.groups?.inlineCodeText ?? "",
  };
}

function createLinkNode(match: RegExpExecArray): EditorCompiledInlineNode {
  const linkText = match.groups?.linkText ?? "";
  const linkHref = match.groups?.linkHref ?? "";
  const href = sanitizeLinkHref(linkHref);

  if (!href) {
    return {
      type: "text",
      text: match[0],
    };
  }

  return {
    type: "link",
    text: linkText,
    href,
  };
}

function createStrongNode(match: RegExpExecArray): EditorCompiledInlineNode {
  return {
    type: "strong",
    text: match.groups?.strongText ?? "",
  };
}

function createEmphasisNode(match: RegExpExecArray): EditorCompiledInlineNode {
  return {
    type: "emphasis",
    text: match.groups?.emphasisText ?? "",
  };
}

function createStrikethroughNode(
  match: RegExpExecArray,
): EditorCompiledInlineNode {
  return {
    type: "strikethrough",
    text: match.groups?.strikethroughText ?? "",
  };
}

// 规则顺序表达语法优先级：更长或更强的标记先匹配，避免 **bold** 被当成 *italic*。
const inlineRules: InlineRule[] = [
  {
    pattern: /`(?<inlineCodeText>[^`\n]+)`/y,
    createNode: createInlineCodeNode,
  },
  {
    pattern: /\[(?<linkText>[^\]\n]+)]\((?<linkHref>[^)\s]+)\)/y,
    createNode: createLinkNode,
  },
  {
    pattern: /~~(?<strikethroughText>[^~\n]+)~~/y,
    createNode: createStrikethroughNode,
  },
  {
    pattern: /\*\*(?<strongText>[^*\n]+)\*\*/y,
    createNode: createStrongNode,
  },
  {
    pattern: /__(?<strongText>[^_\n]+)__/y,
    createNode: createStrongNode,
  },
  {
    pattern: /\*(?<emphasisText>[^*\n]+)\*/y,
    createNode: createEmphasisNode,
  },
  {
    pattern: /_(?<emphasisText>[^_\n]+)_/y,
    createNode: createEmphasisNode,
  },
];

function findNextInlineToken(
  content: string,
  start: number,
): InlineToken | null {
  for (let index = start; index < content.length; index += 1) {
    for (const rule of inlineRules) {
      rule.pattern.lastIndex = index;

      const match = rule.pattern.exec(content);

      if (match?.index === index) {
        return {
          index,
          raw: match[0],
          node: rule.createNode(match),
        };
      }
    }
  }

  return null;
}

function parseInlineNodes(content: string): EditorCompiledInlineNode[] {
  const nodes: EditorCompiledInlineNode[] = [];
  let cursor = 0;

  while (cursor < content.length) {
    const token = findNextInlineToken(content, cursor);

    if (!token) {
      nodes.push({
        type: "text",
        text: content.slice(cursor),
      });
      break;
    }

    if (token.index > cursor) {
      nodes.push({
        type: "text",
        text: content.slice(cursor, token.index),
      });
    }

    nodes.push(token.node);
    cursor = token.index + token.raw.length;
  }

  return nodes.length
    ? nodes
    : [
        {
          type: "text",
          text: content,
        },
      ];
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

function parseImageLine(line: string): ParsedImageLine | null {
  const imageMatch = line.trim().match(/^!\[([^\]\n]*)]\(([^)\s]+)\)$/);

  if (!imageMatch) {
    return null;
  }

  const src = sanitizeLinkHref(imageMatch[2]);

  if (!src) {
    return null;
  }

  return {
    alt: imageMatch[1],
    src,
  };
}

function isQuoteLine(line: string): boolean {
  return /^>\s?/.test(line.trimStart());
}

function stripQuoteMarker(line: string): string {
  return line.trimStart().replace(/^>\s?/, "");
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

function createTextBlock(content: string): EditorCompiledBlock {
  return {
    type: "text",
    label: "Text",
    content,
    inlineNodes: parseInlineNodes(content),
  };
}

function createHeadingBlock(heading: ParsedHeadingLine): EditorCompiledBlock {
  return {
    type: "heading",
    label: "Heading",
    level: heading.level,
    content: heading.content,
    inlineNodes: parseInlineNodes(heading.content),
  };
}

function createQuoteBlock(content: string): EditorCompiledBlock {
  return {
    type: "quote",
    label: "Quote",
    content,
    inlineNodes: parseInlineNodes(content),
  };
}

function createImageBlock(
  image: ParsedImageLine,
  sourceLine: string,
): EditorCompiledBlock {
  return {
    type: "media",
    label: "Image",
    content: sourceLine.trim(),
    alt: image.alt,
    src: image.src,
  };
}

function collectListBlock(
  lines: string[],
  startIndex: number,
): CollectedListBlock | null {
  const firstItem = parseListLine(lines[startIndex]);

  if (!firstItem) {
    return null;
  }

  const items: EditorCompiledListItem[] = [];
  const rawLines: string[] = [];
  let index = startIndex;

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
}

export function compileEditorBlocks(input: string): EditorCompiledBlock[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const blocks: EditorCompiledBlock[] = [];
  const textLines: string[] = [];
  let index = 0;
  let pendingLine: string | null = null;

  function flushTextBlock(): void {
    const content = trimBlockContent(textLines.join("\n"));

    if (content.trim()) {
      blocks.push(createTextBlock(content));
    }

    textLines.length = 0;
  }

  while (index < lines.length || pendingLine !== null) {
    const line = pendingLine ?? lines[index];

    if (pendingLine === null) {
      index += 1;
    } else {
      pendingLine = null;
    }

    if (!line.trim()) {
      if (textLines.length) {
        textLines.push("");
      }

      continue;
    }

    if (isFenceLine(line)) {
      const language = parseFenceLanguage(line);
      const codeLines: string[] = [];
      let closed = false;

      flushTextBlock();

      while (index < lines.length) {
        const closingFenceLine = splitClosingFenceLine(lines[index]);

        if (closingFenceLine) {
          blocks.push({
            type: "code",
            label: "Code",
            language,
            content: codeLines.join("\n"),
          });
          index += 1;
          pendingLine = closingFenceLine.trailingText || null;
          closed = true;
          break;
        }

        codeLines.push(lines[index]);
        index += 1;
      }

      if (!closed) {
        blocks.push({
          type: "code",
          label: "Code",
          language,
          content: codeLines.join("\n"),
        });
      }

      continue;
    }

    const heading = parseHeadingLine(line);

    if (heading) {
      flushTextBlock();
      blocks.push(createHeadingBlock(heading));
      continue;
    }

    if (isQuoteLine(line)) {
      const quoteLines = [stripQuoteMarker(line)];

      flushTextBlock();

      while (index < lines.length && isQuoteLine(lines[index])) {
        quoteLines.push(stripQuoteMarker(lines[index]));
        index += 1;
      }

      blocks.push(createQuoteBlock(quoteLines.join("\n")));
      continue;
    }

    const listBlock = collectListBlock(lines, index - 1);

    if (listBlock) {
      flushTextBlock();
      blocks.push(listBlock.block);
      index = listBlock.nextIndex;
      continue;
    }

    const image = parseImageLine(line);

    if (image) {
      flushTextBlock();
      blocks.push(createImageBlock(image, line));
      continue;
    }

    if (line.trimStart().startsWith("$$")) {
      flushTextBlock();
      blocks.push({
        type: "math",
        label: "Math",
        content: line.trim(),
      });
      continue;
    }

    textLines.push(line);
  }

  flushTextBlock();

  return blocks;
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
