import type { PostBodyBlock, PostBodyWriteInput } from "@/entities/post-body";

import type { EditorPreviewReaderBlock } from "./editorPreviewTypes";
import { fallbackReaderBlock } from "../config/editorFixtures";

export function createEditorReaderPreviewBlocks(
  writeInput: PostBodyWriteInput,
): EditorPreviewReaderBlock[] {
  const previewBlocks = writeInput.blocks.map((block, blockIndex) => ({
    stableKey: `tiptap-preview-${blockIndex}-${block.type}-${JSON.stringify(block).length}`,
    block,
    readerBlockIndex: blockIndex,
  }));

  return previewBlocks.length
    ? previewBlocks
    : [
        {
          stableKey: "editor-preview-fallback",
          block: fallbackReaderBlock,
          readerBlockIndex: 0,
        },
      ];
}

export function createEditorPreviewParagraphs(
  readerBlocks: Array<{ block: PostBodyBlock }>,
): string[] {
  const paragraphs = readerBlocks
    .map((previewBlock) => previewBlock.block)
    .filter((block) => block.type === "paragraph")
    .map((paragraph) => paragraph.children.map((child) => child.text).join(""));

  return paragraphs.length ? paragraphs : ["正文预览会随输入同步更新。"];
}
