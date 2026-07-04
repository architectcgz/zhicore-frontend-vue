import { describe, expect, it } from "vitest";

import type { PostBodyWriteInput } from "@/entities/post-body";

import {
  createEditorPreviewParagraphs,
  createEditorReaderPreviewBlocks,
} from "../editorDraftPreview";

describe("editorDraftPreview", () => {
  it("creates stable reader preview blocks from saved body input", () => {
    const writeInput: PostBodyWriteInput = {
      schemaVersion: 1,
      blocks: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "预览正文" }],
        },
      ],
    };

    const previewBlocks = createEditorReaderPreviewBlocks(writeInput);

    expect(previewBlocks).toEqual([
      {
        stableKey: expect.stringContaining("tiptap-preview-0-paragraph"),
        block: writeInput.blocks[0],
        readerBlockIndex: 0,
      },
    ]);
    expect(createEditorPreviewParagraphs(previewBlocks)).toEqual(["预览正文"]);
  });
});
