import { Schema, type Node as ProseMirrorNode } from "prosemirror-model";

import type {
  PostBodyBlock,
  PostBodyInlineMark,
  PostBodyInlineNode,
  PostBodyTableCell,
  PostBodyWriteInput,
} from "@/entities/post-body";
import {
  isAllowedExternalEmbedProvider,
  sanitizePostBodyExternalUrl,
} from "@/entities/post-body";

import type { EditorPreviewReaderBlock } from "./editorPreviewTypes";

export interface EditorProseMirrorSelection {
  from: number;
  to: number;
}

export type EditorProseMirrorDocumentJson = ReturnType<
  ProseMirrorNode["toJSON"]
>;

export const editorProseMirrorSchema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: {
      content: "text*",
      group: "block",
      parseDOM: [{ tag: "p" }, { tag: "div" }],
      toDOM() {
        return ["p", 0];
      },
    },
    heading: {
      attrs: {
        level: { default: 2 },
      },
      content: "text*",
      group: "block",
      defining: true,
      parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({
        tag: `h${level}`,
        attrs: { level },
      })),
      toDOM(node) {
        return [`h${node.attrs.level}`, 0];
      },
    },
    quote: {
      content: "text*",
      group: "block",
      defining: true,
      parseDOM: [{ tag: "blockquote" }],
      toDOM() {
        return ["blockquote", 0];
      },
    },
    code_block: {
      attrs: {
        language: { default: null },
      },
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [
        {
          tag: "pre",
          preserveWhitespace: "full",
        },
      ],
      toDOM(node) {
        return [
          "pre",
          [
            "code",
            node.attrs.language ? { "data-language": node.attrs.language } : {},
            0,
          ],
        ];
      },
    },
    list: {
      attrs: {
        ordered: { default: false },
        task: { default: false },
      },
      content: "list_item+",
      group: "block",
      parseDOM: [
        { tag: "ul", attrs: { ordered: false, task: false } },
        { tag: "ol", attrs: { ordered: true, task: false } },
      ],
      toDOM(node) {
        return [node.attrs.ordered ? "ol" : "ul", 0];
      },
    },
    list_item: {
      attrs: {
        checked: { default: null },
      },
      content: "text*",
      defining: true,
      parseDOM: [{ tag: "li" }],
      toDOM() {
        return ["li", 0];
      },
    },
    math_block: {
      content: "text*",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [{ tag: "pre[data-math]" }],
      toDOM() {
        return ["pre", { "data-math": "true" }, 0];
      },
    },
    table: {
      content: "table_row+",
      group: "block",
      parseDOM: [{ tag: "table" }],
      toDOM() {
        return ["table", ["tbody", 0]];
      },
    },
    table_row: {
      content: "table_cell+",
      parseDOM: [{ tag: "tr" }],
      toDOM() {
        return ["tr", 0];
      },
    },
    table_cell: {
      content: "text*",
      parseDOM: [{ tag: "td" }, { tag: "th" }],
      toDOM() {
        return ["td", 0];
      },
    },
    external_embed: {
      attrs: {
        provider: { default: "image" },
        url: { default: "https://example.com/image.png" },
        title: { default: "图片说明" },
      },
      group: "block",
      atom: true,
      parseDOM: [
        {
          tag: "figure[data-external-embed]",
          getAttrs(node) {
            if (!(node instanceof HTMLElement)) {
              return null;
            }

            return {
              provider: node.dataset.externalEmbed ?? "image",
              url: node.dataset.url ?? "https://example.com/image.png",
              title: node.dataset.title ?? "图片说明",
            };
          },
        },
      ],
      toDOM(node) {
        const title = String(node.attrs.title ?? "");
        const url = String(node.attrs.url ?? "");

        return [
          "figure",
          {
            "data-external-embed": node.attrs.provider,
            "data-url": url,
            "data-title": title,
          },
          ["a", { href: url }, title || url],
        ];
      },
    },
    text: {
      group: "inline",
    },
  },
  marks: {
    bold: {
      parseDOM: [{ tag: "strong" }, { tag: "b" }],
      toDOM() {
        return ["strong", 0];
      },
    },
    italic: {
      parseDOM: [{ tag: "em" }, { tag: "i" }],
      toDOM() {
        return ["em", 0];
      },
    },
    underline: {
      parseDOM: [{ tag: "u" }],
      toDOM() {
        return ["u", 0];
      },
    },
    strike: {
      parseDOM: [{ tag: "s" }, { tag: "del" }],
      toDOM() {
        return ["s", 0];
      },
    },
    inline_code: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code", 0];
      },
    },
    link: {
      attrs: {
        href: {},
      },
      inclusive: false,
      parseDOM: [
        {
          tag: "a[href]",
          getAttrs(node) {
            return {
              href:
                node instanceof HTMLElement
                  ? node.getAttribute("href")
                  : undefined,
            };
          },
        },
      ],
      toDOM(mark) {
        return ["a", { href: mark.attrs.href }, 0];
      },
    },
  },
});

export function createProseMirrorDocFromJson(
  documentJson: EditorProseMirrorDocumentJson,
): ProseMirrorNode {
  return editorProseMirrorSchema.nodeFromJSON(documentJson);
}

export function serializeProseMirrorDocToJson(
  doc: ProseMirrorNode,
): EditorProseMirrorDocumentJson {
  return doc.toJSON();
}

export function getProseMirrorPlainText(doc: ProseMirrorNode): string {
  return doc.textBetween(0, doc.content.size, "\n");
}

function mapProseMirrorMarkToPostBodyMark(
  mark: ProseMirrorNode["marks"][number],
): PostBodyInlineMark | null {
  if (mark.type.name === "link") {
    return {
      type: "link",
      href: String(mark.attrs.href ?? ""),
    };
  }

  if (
    mark.type.name === "bold" ||
    mark.type.name === "italic" ||
    mark.type.name === "underline" ||
    mark.type.name === "strike" ||
    mark.type.name === "inline_code"
  ) {
    return {
      type: mark.type.name,
    };
  }

  return null;
}

function mapInlineContentToPostBodyNodes(
  node: ProseMirrorNode,
): PostBodyInlineNode[] {
  const inlineNodes: PostBodyInlineNode[] = [];

  node.forEach((child) => {
    if (!child.isText) {
      return;
    }

    const marks = child.marks
      .map(mapProseMirrorMarkToPostBodyMark)
      .filter((mark): mark is PostBodyInlineMark => mark !== null);

    inlineNodes.push({
      type: "text",
      text: child.text ?? "",
      ...(marks.length ? { marks } : {}),
    });
  });

  return inlineNodes;
}

function mapTableCellToPostBodyCell(cell: ProseMirrorNode): PostBodyTableCell {
  return {
    children: mapInlineContentToPostBodyNodes(cell),
  };
}

function mapProseMirrorBlockToPostBodyBlock(
  block: ProseMirrorNode,
): PostBodyBlock {
  if (block.type.name === "heading") {
    return {
      type: "heading",
      level: block.attrs.level,
      children: mapInlineContentToPostBodyNodes(block),
    };
  }

  if (block.type.name === "quote") {
    return {
      type: "quote",
      children: mapInlineContentToPostBodyNodes(block),
    };
  }

  if (block.type.name === "code_block") {
    return {
      type: "code_block",
      language: block.attrs.language ?? undefined,
      code: block.textContent,
    };
  }

  if (block.type.name === "list") {
    return {
      type: "list",
      ordered: Boolean(block.attrs.ordered),
      task: Boolean(block.attrs.task),
      items: Array.from({ length: block.childCount }, (_, index) => {
        const item = block.child(index);

        return {
          children: mapInlineContentToPostBodyNodes(item),
          ...(block.attrs.task ? { checked: Boolean(item.attrs.checked) } : {}),
        };
      }),
    };
  }

  if (block.type.name === "math_block") {
    return {
      type: "math",
      latex: block.textContent,
    };
  }

  if (block.type.name === "table") {
    const rows = Array.from({ length: block.childCount }, (_, rowIndex) =>
      Array.from({ length: block.child(rowIndex).childCount }, (_, cellIndex) =>
        mapTableCellToPostBodyCell(block.child(rowIndex).child(cellIndex)),
      ),
    );

    return {
      type: "table",
      headers: rows[0] ?? [],
      rows: rows.slice(1),
    };
  }

  if (block.type.name === "external_embed") {
    const provider = String(block.attrs.provider ?? "image");
    const url = sanitizePostBodyExternalUrl(String(block.attrs.url ?? ""));
    const title = String(block.attrs.title ?? "").trim();

    if (url && isAllowedExternalEmbedProvider(provider)) {
      return {
        type: "external_embed",
        provider,
        url,
        ...(title ? { title } : {}),
      };
    }

    // 不安全的外部资源不能进入正式保存模型；降级为普通段落保留作者可见文本。
    return {
      type: "paragraph",
      children: [
        { type: "text", text: title || String(block.attrs.url ?? "") },
      ],
    };
  }

  return {
    type: "paragraph",
    children: mapInlineContentToPostBodyNodes(block),
  };
}

export function mapProseMirrorDocToPostBodyWriteInput(
  doc: ProseMirrorNode,
): PostBodyWriteInput {
  const blocks: PostBodyBlock[] = [];

  doc.forEach((block) => {
    blocks.push(mapProseMirrorBlockToPostBodyBlock(block));
  });

  return {
    schemaVersion: 1,
    blocks,
  };
}

function createProseMirrorPreviewKey(
  block: PostBodyBlock,
  blockIndex: number,
): string {
  return `pm-preview-${blockIndex}-${block.type}-${JSON.stringify(block).length}`;
}

export function mapProseMirrorDocToPreviewReaderBlocks(
  doc: ProseMirrorNode,
): EditorPreviewReaderBlock[] {
  return mapProseMirrorDocToPostBodyWriteInput(doc).blocks.map(
    (block, blockIndex) => ({
      stableKey: createProseMirrorPreviewKey(block, blockIndex),
      block,
      readerBlockIndex: blockIndex,
    }),
  );
}
