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
  EditorCompiledInlineMark,
  EditorCompiledInlineNode,
  EditorCompiledSourceRange,
  EditorCompiledTableCell,
} from "./types";

export interface EditorPreviewReaderBlock {
  stableKey: string;
  block: PostBodyBlock;
  readerBlockIndex: number;
  sourceRange?: EditorCompiledSourceRange;
  compiledBlockIndex?: number;
}

export interface EditorPreviewBlockAnchor {
  readerBlockIndex: number;
  sourceRange: EditorCompiledSourceRange;
}

interface EditorPreviewBlockKeyInput {
  block: PostBodyBlock;
  fingerprint: string;
  readerBlockIndex: number;
  sourceRange?: EditorCompiledSourceRange;
  compiledBlockIndex?: number;
}

export interface EditorPreviewBlockKeyResolver {
  beginPass: () => void;
  resolve: (input: EditorPreviewBlockKeyInput) => string;
  finishPass: () => void;
}

export interface MapEditorCompiledDocumentToPreviewReaderBlocksOptions {
  keyResolver?: EditorPreviewBlockKeyResolver;
}

function createContentHash(content: string): string {
  let hash = 2166136261;

  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function createPreviewBlockFingerprint(block: PostBodyBlock): string {
  return `${block.type}:${createContentHash(JSON.stringify(block))}`;
}

function pushKey(
  registry: Map<string, string[]>,
  fingerprint: string,
  stableKey: string,
): void {
  const keys = registry.get(fingerprint);

  if (keys) {
    keys.push(stableKey);
    return;
  }

  registry.set(fingerprint, [stableKey]);
}

export function createEditorPreviewBlockKeyResolver(): EditorPreviewBlockKeyResolver {
  let nextKeyId = 0;
  let previousKeysByFingerprint = new Map<string, string[]>();
  let reusableKeysByFingerprint = new Map<string, string[]>();
  let currentKeysByFingerprint = new Map<string, string[]>();

  return {
    beginPass() {
      reusableKeysByFingerprint = new Map(
        [...previousKeysByFingerprint.entries()].map(([fingerprint, keys]) => [
          fingerprint,
          [...keys],
        ]),
      );
      currentKeysByFingerprint = new Map();
    },
    resolve(input) {
      const reusableKeys = reusableKeysByFingerprint.get(input.fingerprint);
      const stableKey =
        reusableKeys?.shift() ?? `editor-preview-block-${nextKeyId++}`;

      pushKey(currentKeysByFingerprint, input.fingerprint, stableKey);

      return stableKey;
    },
    finishPass() {
      previousKeysByFingerprint = currentKeysByFingerprint;
    },
  };
}

function mapInlineMark(
  mark: EditorCompiledInlineMark,
): PostBodyInlineMark | null {
  if (mark.type === "link") {
    const href = sanitizePostBodyExternalUrl(mark.href);

    if (!href) {
      return null;
    }

    return {
      type: "link",
      href,
    };
  }

  return mark;
}

function mapInlineNode(node: EditorCompiledInlineNode): PostBodyInlineNode {
  const marks = (node.marks ?? [])
    .map(mapInlineMark)
    .filter((mark): mark is PostBodyInlineMark => mark !== null);

  return {
    type: "text",
    text: node.text,
    ...(marks.length ? { marks } : {}),
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
  const blocks = mapEditorCompiledDocumentToPreviewReaderBlocks(document).map(
    (previewBlock) => previewBlock.block,
  );

  return {
    schemaVersion: 1,
    blocks,
  };
}

export function mapEditorCompiledDocumentToPreviewReaderBlocks(
  document: EditorCompiledDocument,
  options: MapEditorCompiledDocumentToPreviewReaderBlocksOptions = {},
): EditorPreviewReaderBlock[] {
  const previewBlocks: EditorPreviewReaderBlock[] = [];
  const fingerprintOccurrences = new Map<string, number>();

  function resolveStableKey(
    block: PostBodyBlock,
    input: Omit<EditorPreviewBlockKeyInput, "block" | "fingerprint">,
  ): string {
    const fingerprint = createPreviewBlockFingerprint(block);

    if (options.keyResolver) {
      return options.keyResolver.resolve({
        ...input,
        block,
        fingerprint,
      });
    }

    const occurrence = fingerprintOccurrences.get(fingerprint) ?? 0;
    fingerprintOccurrences.set(fingerprint, occurrence + 1);

    return `${fingerprint}:${occurrence}`;
  }

  options.keyResolver?.beginPass();

  document.blocks.forEach((block, blockIndex) => {
    const previousBlock = document.blocks[blockIndex - 1];

    if (previousBlock) {
      const visibleBlankLineCount = getVisibleBlankLineCountBetweenBlocks(
        previousBlock,
        block,
      );

      if (visibleBlankLineCount > 0) {
        const spacerBlock = createBlankLineSpacerBlock(visibleBlankLineCount);

        previewBlocks.push({
          stableKey: resolveStableKey(spacerBlock, {
            readerBlockIndex: previewBlocks.length,
          }),
          block: spacerBlock,
          readerBlockIndex: previewBlocks.length,
        });
      }
    }

    const readerBlock = mapCompiledBlock(block);

    previewBlocks.push({
      stableKey: resolveStableKey(readerBlock, {
        readerBlockIndex: previewBlocks.length,
        sourceRange: block.sourceRange,
        compiledBlockIndex: blockIndex,
      }),
      block: readerBlock,
      readerBlockIndex: previewBlocks.length,
      sourceRange: block.sourceRange,
      compiledBlockIndex: blockIndex,
    });
  });

  options.keyResolver?.finishPass();

  return previewBlocks;
}

export function mapPreviewReaderBlocksToAnchors(
  previewBlocks: EditorPreviewReaderBlock[],
): EditorPreviewBlockAnchor[] {
  return previewBlocks.flatMap((previewBlock) => {
    if (!previewBlock.sourceRange) {
      return [];
    }

    return [
      {
        readerBlockIndex: previewBlock.readerBlockIndex,
        sourceRange: previewBlock.sourceRange,
      },
    ];
  });
}

export function compileEditorContentToPostBodyWriteInput(
  input: string,
): PostBodyWriteInput {
  return mapEditorCompiledDocumentToPostBodyWriteInput(
    compileEditorContent(input),
  );
}
