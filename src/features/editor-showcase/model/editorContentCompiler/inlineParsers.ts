import { sanitizePostBodyExternalUrl } from "@/entities/post-body";

import type {
  EditorCompiledInlineMark,
  EditorCompiledInlineNode,
} from "./types";

interface MarkdownInlineToken {
  index: number;
  rawLength: number;
  nodes: EditorCompiledInlineNode[];
}

interface DelimitedMarkSpec {
  opener: string;
  closer: string;
  marks: EditorCompiledInlineMark[];
}

const delimitedMarkSpecs: DelimitedMarkSpec[] = [
  {
    opener: "~~",
    closer: "~~",
    marks: [{ type: "strike" }],
  },
  {
    opener: "***",
    closer: "***",
    marks: [{ type: "bold" }, { type: "italic" }],
  },
  {
    opener: "___",
    closer: "___",
    marks: [{ type: "bold" }, { type: "italic" }],
  },
  {
    opener: "**",
    closer: "**",
    marks: [{ type: "bold" }],
  },
  {
    opener: "__",
    closer: "__",
    marks: [{ type: "bold" }],
  },
  {
    opener: "*",
    closer: "*",
    marks: [{ type: "italic" }],
  },
  {
    opener: "_",
    closer: "_",
    marks: [{ type: "italic" }],
  },
];

export function sanitizeLinkHref(href: string): string | null {
  return sanitizePostBodyExternalUrl(href);
}

function areMarksEqual(
  previousMarks: EditorCompiledInlineMark[] = [],
  nextMarks: EditorCompiledInlineMark[] = [],
): boolean {
  if (previousMarks.length !== nextMarks.length) {
    return false;
  }

  return previousMarks.every((previousMark, index) => {
    const nextMark = nextMarks[index];

    if (!nextMark || previousMark.type !== nextMark.type) {
      return false;
    }

    if (previousMark.type === "link" && nextMark.type === "link") {
      return previousMark.href === nextMark.href;
    }

    return true;
  });
}

function createTextNode(
  text: string,
  marks: EditorCompiledInlineMark[],
): EditorCompiledInlineNode | null {
  if (!text) {
    return null;
  }

  return marks.length
    ? {
        type: "text",
        text,
        marks: [...marks],
      }
    : {
        type: "text",
        text,
      };
}

function appendTextNode(
  nodes: EditorCompiledInlineNode[],
  text: string,
  marks: EditorCompiledInlineMark[],
): void {
  const nextNode = createTextNode(text, marks);

  if (!nextNode) {
    return;
  }

  const previousNode = nodes[nodes.length - 1];
  const nextMarks = nextNode.marks ?? [];

  if (previousNode && areMarksEqual(previousNode.marks ?? [], nextMarks)) {
    previousNode.text += nextNode.text;
    return;
  }

  nodes.push(nextNode);
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n");
}

function parseInlineCodeToken(
  content: string,
  index: number,
  activeMarks: EditorCompiledInlineMark[],
): MarkdownInlineToken | null {
  if (content[index] !== "`") {
    return null;
  }

  const closingIndex = content.indexOf("`", index + 1);

  if (closingIndex === -1) {
    return null;
  }

  const codeText = content.slice(index + 1, closingIndex);

  if (!codeText || hasLineBreak(codeText)) {
    return null;
  }

  const node = createTextNode(codeText, [
    ...activeMarks,
    { type: "inline_code" },
  ]);

  return node
    ? {
        index,
        rawLength: closingIndex - index + 1,
        nodes: [node],
      }
    : null;
}

function parseLinkToken(
  content: string,
  index: number,
  activeMarks: EditorCompiledInlineMark[],
): MarkdownInlineToken | null {
  if (content[index] !== "[") {
    return null;
  }

  const closeBracketIndex = content.indexOf("]", index + 1);

  if (
    closeBracketIndex === -1 ||
    content[closeBracketIndex + 1] !== "(" ||
    hasLineBreak(content.slice(index + 1, closeBracketIndex))
  ) {
    return null;
  }

  const closeParenIndex = content.indexOf(")", closeBracketIndex + 2);

  if (closeParenIndex === -1) {
    return null;
  }

  const linkText = content.slice(index + 1, closeBracketIndex);
  const rawHref = content.slice(closeBracketIndex + 2, closeParenIndex);

  if (!linkText || /\s/.test(rawHref)) {
    return null;
  }

  const href = sanitizeLinkHref(rawHref);
  const rawLink = content.slice(index, closeParenIndex + 1);

  if (!href) {
    const node = createTextNode(rawLink, activeMarks);

    return node
      ? {
          index,
          rawLength: rawLink.length,
          nodes: [node],
        }
      : null;
  }

  return {
    index,
    rawLength: rawLink.length,
    nodes: parseInlineSegment(linkText, [
      ...activeMarks,
      { type: "link", href },
    ]),
  };
}

function parseDelimitedMarkToken(
  content: string,
  index: number,
  activeMarks: EditorCompiledInlineMark[],
): MarkdownInlineToken | null {
  const spec = delimitedMarkSpecs.find((item) =>
    content.startsWith(item.opener, index),
  );

  if (!spec) {
    return null;
  }

  const innerStartIndex = index + spec.opener.length;
  const closingIndex = content.indexOf(spec.closer, innerStartIndex);

  if (closingIndex === -1) {
    return null;
  }

  const innerText = content.slice(innerStartIndex, closingIndex);

  if (!innerText || hasLineBreak(innerText)) {
    return null;
  }

  return {
    index,
    rawLength: closingIndex + spec.closer.length - index,
    nodes: parseInlineSegment(innerText, [...activeMarks, ...spec.marks]),
  };
}

function findNextInlineToken(
  content: string,
  start: number,
  activeMarks: EditorCompiledInlineMark[],
): MarkdownInlineToken | null {
  for (let index = start; index < content.length; index += 1) {
    const token =
      parseInlineCodeToken(content, index, activeMarks) ??
      parseLinkToken(content, index, activeMarks) ??
      parseDelimitedMarkToken(content, index, activeMarks);

    if (token) {
      return token;
    }
  }

  return null;
}

function parseInlineSegment(
  content: string,
  activeMarks: EditorCompiledInlineMark[],
): EditorCompiledInlineNode[] {
  const nodes: EditorCompiledInlineNode[] = [];
  let cursor = 0;

  while (cursor < content.length) {
    const token = findNextInlineToken(content, cursor, activeMarks);

    if (!token) {
      appendTextNode(nodes, content.slice(cursor), activeMarks);
      break;
    }

    if (token.index > cursor) {
      appendTextNode(nodes, content.slice(cursor, token.index), activeMarks);
    }

    nodes.push(...token.nodes);
    cursor = token.index + token.rawLength;
  }

  return nodes;
}

export function parseInlineNodes(content: string): EditorCompiledInlineNode[] {
  const nodes = parseInlineSegment(content, []);

  return nodes.length
    ? nodes
    : [
        {
          type: "text",
          text: content,
        },
      ];
}
