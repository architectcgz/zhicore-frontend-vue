import { describe, expect, it } from "vitest";

import { textareaEditorContentAdapter } from "../editorContentAdapter";

describe("editorContentAdapter", () => {
  it("returns only PostBodyWriteInput from the persistence outlet", () => {
    const writeInput = textareaEditorContentAdapter.toPostBodyWriteInput(
      ["## 标题", "", "正文 ++重点++"].join("\n"),
    );
    const serialized = JSON.stringify(writeInput);

    expect(writeInput).toEqual({
      schemaVersion: 1,
      blocks: [
        {
          type: "heading",
          level: 2,
          children: [{ type: "text", text: "标题" }],
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "正文 " },
            { type: "text", text: "重点", marks: [{ type: "underline" }] },
          ],
        },
      ],
    });
    expect(serialized).not.toContain("inlineNodes");
    expect(serialized).not.toContain("sourceRange");
    expect(serialized).not.toContain("stableKey");
    expect(serialized).not.toContain("prosemirror");
    expect(serialized).not.toContain("textarea-source");
  });

  it("keeps reader preview output separate from the persistence outlet", () => {
    const previewBlocks = textareaEditorContentAdapter.toPreviewReaderBlocks(
      [
        "```go",
        "package main",
        "```",
        "",
        "",
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
      ].join("\n"),
    );

    expect(previewBlocks).toHaveLength(3);
    expect(previewBlocks[1]).toMatchObject({
      block: {
        type: "paragraph",
        children: [{ type: "text", text: "\n\n" }],
      },
    });
    expect(previewBlocks[1]).not.toHaveProperty("sourceRange");
  });

  it("declares Content V1 quote and list structure limits as inline-only", () => {
    expect(textareaEditorContentAdapter.contentCapabilities).toEqual({
      quote: {
        children: "inline-only",
        multiParagraph: false,
      },
      list: {
        itemChildren: "inline-only",
        nested: false,
      },
      persistence: {
        output: "post-body-write-input",
        storesInternalDocument: false,
      },
    });
    expect(
      textareaEditorContentAdapter.getUnsupportedContentReasons("普通正文"),
    ).toEqual([]);
  });
});
