import type { EditorCompiledInlineNode } from "./types";

interface InlineRule {
  pattern: RegExp;
  createNode: (match: RegExpExecArray) => EditorCompiledInlineNode;
}

interface InlineToken {
  index: number;
  raw: string;
  node: EditorCompiledInlineNode;
}

export function sanitizeLinkHref(href: string): string | null {
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

export function parseInlineNodes(content: string): EditorCompiledInlineNode[] {
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
