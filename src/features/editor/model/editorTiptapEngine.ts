import type { JSONContent } from "@tiptap/core";

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

export interface EditorTiptapSelection {
  from: number;
  to: number;
}

export type EditorTiptapDocumentJson = JSONContent;

export const editorPostBodyMaxContainerDepth = 2;

export class EditorPostBodyMappingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EditorPostBodyMappingError";
  }
}

export function createDefaultEditorDocumentJson(): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [],
      },
    ],
  };
}

function getNodeText(node: JSONContent): string {
  if (node.type === "text") {
    return node.text ?? "";
  }

  return (node.content ?? []).map(getNodeText).join("");
}

export function getTiptapPlainText(
  documentJson: EditorTiptapDocumentJson,
): string {
  return (documentJson.content ?? []).map(getNodeText).join("\n");
}

function mapTiptapMarkToPostBodyMark(
  mark: NonNullable<JSONContent["marks"]>[number],
): PostBodyInlineMark | null {
  if (mark.type === "link") {
    const href = sanitizePostBodyExternalUrl(String(mark.attrs?.href ?? ""));

    if (!href) {
      throw new EditorPostBodyMappingError(
        "Content V1 links only support safe http/https URLs",
      );
    }

    return {
      type: "link",
      href,
    };
  }

  if (mark.type === "code") {
    return { type: "inline_code" };
  }

  if (
    mark.type === "bold" ||
    mark.type === "italic" ||
    mark.type === "underline" ||
    mark.type === "strike"
  ) {
    return { type: mark.type };
  }

  throw new EditorPostBodyMappingError(`Unsupported inline mark: ${mark.type}`);
}

function mapInlineContentToPostBodyNodes(
  node: JSONContent,
): PostBodyInlineNode[] {
  const inlineNodes: PostBodyInlineNode[] = [];

  (node.content ?? []).forEach((child) => {
    if (child.type !== "text") {
      throw new EditorPostBodyMappingError(
        `Unsupported inline node: ${child.type ?? "unknown"}`,
      );
    }

    const marks = (child.marks ?? [])
      .map(mapTiptapMarkToPostBodyMark)
      .filter((mark): mark is PostBodyInlineMark => mark !== null);

    inlineNodes.push({
      type: "text",
      text: child.text ?? "",
      ...(marks.length ? { marks } : {}),
    });
  });

  return inlineNodes;
}

function mapTiptapContainerChildrenToPostBodyBlocks(
  node: JSONContent,
): PostBodyBlock[] {
  const blocks: PostBodyBlock[] = [];
  const inlineNodes: PostBodyInlineNode[] = [];

  (node.content ?? []).forEach((child) => {
    if (child.type === "text") {
      const marks = (child.marks ?? [])
        .map(mapTiptapMarkToPostBodyMark)
        .filter((mark): mark is PostBodyInlineMark => mark !== null);

      inlineNodes.push({
        type: "text",
        text: child.text ?? "",
        ...(marks.length ? { marks } : {}),
      });
      return;
    }

    if (inlineNodes.length) {
      blocks.push({
        type: "paragraph",
        children: inlineNodes.splice(0),
      });
    }

    blocks.push(mapTiptapBlockToPostBodyBlock(child));
  });

  if (inlineNodes.length) {
    blocks.push({
      type: "paragraph",
      children: inlineNodes,
    });
  }

  return blocks;
}

function mapTableCellToPostBodyCell(cell: JSONContent): PostBodyTableCell {
  const colspan = Number(cell.attrs?.colspan ?? 1);
  const rowspan = Number(cell.attrs?.rowspan ?? 1);

  if (colspan !== 1 || rowspan !== 1) {
    throw new EditorPostBodyMappingError(
      "Content V1 tables do not support rowspan or colspan",
    );
  }

  const cellContent = cell.content ?? [];

  if (cellContent.length > 1) {
    throw new EditorPostBodyMappingError(
      "Content V1 table cells support at most one paragraph",
    );
  }

  const [paragraph] = cellContent;

  if (paragraph && paragraph.type !== "paragraph") {
    throw new EditorPostBodyMappingError(
      "Content V1 table cells only support inline paragraph content",
    );
  }

  return {
    children: paragraph ? mapInlineContentToPostBodyNodes(paragraph) : [],
  };
}

function assertContainerDepth(
  blocks: PostBodyBlock[],
  parentContainerDepth = 0,
): void {
  blocks.forEach((block) => {
    if (block.type === "quote") {
      const containerDepth = parentContainerDepth + 1;

      if (containerDepth > editorPostBodyMaxContainerDepth) {
        throw new EditorPostBodyMappingError(
          `Content V1 supports at most ${editorPostBodyMaxContainerDepth} nested block containers`,
        );
      }

      assertContainerDepth(block.blocks, containerDepth);
      return;
    }

    if (block.type === "list") {
      const containerDepth = parentContainerDepth + 1;

      if (containerDepth > editorPostBodyMaxContainerDepth) {
        throw new EditorPostBodyMappingError(
          `Content V1 supports at most ${editorPostBodyMaxContainerDepth} nested block containers`,
        );
      }

      block.items.forEach((item) => {
        assertContainerDepth(item.blocks, containerDepth);
      });
      return;
    }

    if (block.type === "collapsible") {
      const containerDepth = parentContainerDepth + 1;

      if (containerDepth > editorPostBodyMaxContainerDepth) {
        throw new EditorPostBodyMappingError(
          `Content V1 supports at most ${editorPostBodyMaxContainerDepth} nested block containers`,
        );
      }

      assertContainerDepth(block.blocks, containerDepth);
    }
  });
}

function mapTiptapBlockToPostBodyBlock(block: JSONContent): PostBodyBlock {
  if (block.type === "heading") {
    return {
      type: "heading",
      level: block.attrs?.level ?? 2,
      children: mapInlineContentToPostBodyNodes(block),
    };
  }

  if (block.type === "blockquote") {
    return {
      type: "quote",
      blocks: mapTiptapContainerChildrenToPostBodyBlocks(block),
    };
  }

  if (block.type === "codeBlock") {
    return {
      type: "code_block",
      language: block.attrs?.language ?? undefined,
      code: getNodeText(block),
    };
  }

  if (
    block.type === "bulletList" ||
    block.type === "orderedList" ||
    block.type === "taskList"
  ) {
    const task = block.type === "taskList";

    return {
      type: "list",
      ordered: block.type === "orderedList",
      task,
      items: (block.content ?? []).map((item) => ({
        blocks: mapTiptapContainerChildrenToPostBodyBlocks(item),
        ...(task ? { checked: Boolean(item.attrs?.checked) } : {}),
      })),
    };
  }

  if (block.type === "math_block") {
    return {
      type: "math",
      latex: getNodeText(block),
    };
  }

  if (block.type === "table") {
    const rows = (block.content ?? []).map((row) => {
      if (row.type !== "tableRow") {
        throw new EditorPostBodyMappingError(
          `Unsupported table child node: ${row.type ?? "unknown"}`,
        );
      }

      return (row.content ?? []).map((cell) => {
        if (cell.type !== "tableCell" && cell.type !== "tableHeader") {
          throw new EditorPostBodyMappingError(
            `Unsupported table cell node: ${cell.type ?? "unknown"}`,
          );
        }

        return mapTableCellToPostBodyCell(cell);
      });
    });

    return {
      type: "table",
      headers: rows[0] ?? [],
      rows: rows.slice(1),
    };
  }

  if (block.type === "external_embed") {
    const provider = String(block.attrs?.provider ?? "image");
    const url = sanitizePostBodyExternalUrl(String(block.attrs?.url ?? ""));
    const title = String(block.attrs?.title ?? "").trim();

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
        { type: "text", text: title || String(block.attrs?.url ?? "") },
      ],
    };
  }

  if (block.type === "paragraph") {
    return {
      type: "paragraph",
      children: mapInlineContentToPostBodyNodes(block),
    };
  }

  throw new EditorPostBodyMappingError(
    `Unsupported block node: ${block.type ?? "unknown"}`,
  );
}

export function mapTiptapJsonToPostBodyWriteInput(
  documentJson: EditorTiptapDocumentJson,
): PostBodyWriteInput {
  const blocks = (documentJson.content ?? []).map(
    mapTiptapBlockToPostBodyBlock,
  );

  assertContainerDepth(blocks);

  return {
    schemaVersion: 1,
    blocks,
  };
}

function createTiptapPreviewKey(
  block: PostBodyBlock,
  blockIndex: number,
): string {
  return `tiptap-preview-${blockIndex}-${block.type}-${JSON.stringify(block).length}`;
}

export function mapTiptapJsonToPreviewReaderBlocks(
  documentJson: EditorTiptapDocumentJson,
): EditorPreviewReaderBlock[] {
  return mapTiptapJsonToPostBodyWriteInput(documentJson).blocks.map(
    (block, blockIndex) => ({
      stableKey: createTiptapPreviewKey(block, blockIndex),
      block,
      readerBlockIndex: blockIndex,
    }),
  );
}
