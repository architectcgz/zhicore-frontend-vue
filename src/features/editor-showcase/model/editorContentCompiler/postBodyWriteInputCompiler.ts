import {
  sanitizePostBodyExternalUrl,
  type PostBodyBlock,
  type PostBodyInlineMark,
  type PostBodyInlineNode,
  type PostBodyTableCell,
  type PostBodyWriteInput,
} from "@/entities/post-body";

import { compileEditorContent } from "./compileEditorContent";
import type {
  EditorCompiledBlock,
  EditorCompiledDocument,
  EditorCompiledInlineNode,
  EditorCompiledTableCell,
} from "./types";

function mapInlineNode(node: EditorCompiledInlineNode): PostBodyInlineNode {
  if (node.type === "text") {
    return {
      type: "text",
      text: node.text,
    };
  }

  const markByInlineType = {
    strong: "bold",
    emphasis: "italic",
    strikethrough: "strike",
    inlineCode: "inline_code",
  } satisfies Partial<
    Record<EditorCompiledInlineNode["type"], PostBodyInlineMark["type"]>
  >;

  if (node.type === "link") {
    const href = sanitizePostBodyExternalUrl(node.href);

    if (!href) {
      return {
        type: "text",
        text: node.text,
      };
    }

    return {
      type: "text",
      text: node.text,
      marks: [
        {
          type: "link",
          href,
        },
      ],
    };
  }

  return {
    type: "text",
    text: node.text,
    marks: [
      {
        type: markByInlineType[node.type],
      },
    ],
  };
}

function mapInlineNodes(
  nodes: EditorCompiledInlineNode[],
): PostBodyInlineNode[] {
  return nodes.map(mapInlineNode);
}

function mapTableCell(cell: EditorCompiledTableCell): PostBodyTableCell {
  return {
    children: mapInlineNodes(cell.inlineNodes),
  };
}

function mapCompiledBlock(block: EditorCompiledBlock): PostBodyBlock {
  if (block.type === "text") {
    return {
      type: "paragraph",
      children: mapInlineNodes(block.inlineNodes),
    };
  }

  if (block.type === "heading") {
    return {
      type: "heading",
      level: block.level,
      children: mapInlineNodes(block.inlineNodes),
    };
  }

  if (block.type === "quote") {
    return {
      type: "quote",
      children: mapInlineNodes(block.inlineNodes),
    };
  }

  if (block.type === "code") {
    return {
      type: "code_block",
      language: block.language,
      code: block.content,
    };
  }

  if (block.type === "list") {
    return {
      type: "list",
      ordered: block.ordered,
      task: block.task,
      items: block.items.map((item) => ({
        children: mapInlineNodes(item.inlineNodes),
        checked: item.checked,
      })),
    };
  }

  if (block.type === "table") {
    return {
      type: "table",
      headers: block.headers.map(mapTableCell),
      rows: block.rows.map((row) => row.map(mapTableCell)),
    };
  }

  if (block.type === "media") {
    const url = sanitizePostBodyExternalUrl(block.src);

    if (!url) {
      return {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: block.content,
          },
        ],
      };
    }

    // Markdown 图片没有 Upload fileId，不能伪装成系统内 image block，只能降级为安全外部嵌入。
    return {
      type: "external_embed",
      provider: "image",
      url,
      title: block.alt,
    };
  }

  return {
    type: "math",
    latex: block.content,
  };
}

function createBlankLineSpacerBlock(blankLineCount: number): PostBodyBlock {
  return {
    type: "paragraph",
    children: [
      {
        type: "text",
        text: "\n".repeat(blankLineCount),
      },
    ],
  };
}

function getVisibleBlankLineCountBetweenBlocks(
  previousBlock: EditorCompiledBlock,
  nextBlock: EditorCompiledBlock,
): number {
  if (!previousBlock.sourceRange || !nextBlock.sourceRange) {
    return 0;
  }

  const blankLineCount =
    nextBlock.sourceRange.startLine - previousBlock.sourceRange.endLine - 1;

  // 编辑器中的块本身已经由结构表达，源文本里的每个块间空白行都代表作者希望保留的留白。
  return Math.max(0, blankLineCount);
}

export function mapEditorCompiledDocumentToPostBodyWriteInput(
  document: EditorCompiledDocument,
): PostBodyWriteInput {
  const blocks: PostBodyBlock[] = [];

  document.blocks.forEach((block, blockIndex) => {
    const previousBlock = document.blocks[blockIndex - 1];

    if (previousBlock) {
      const visibleBlankLineCount = getVisibleBlankLineCountBetweenBlocks(
        previousBlock,
        block,
      );

      if (visibleBlankLineCount > 0) {
        blocks.push(createBlankLineSpacerBlock(visibleBlankLineCount));
      }
    }

    blocks.push(mapCompiledBlock(block));
  });

  return {
    schemaVersion: 1,
    blocks,
  };
}

export function compileEditorContentToPostBodyWriteInput(
  input: string,
): PostBodyWriteInput {
  return mapEditorCompiledDocumentToPostBodyWriteInput(
    compileEditorContent(input),
  );
}
