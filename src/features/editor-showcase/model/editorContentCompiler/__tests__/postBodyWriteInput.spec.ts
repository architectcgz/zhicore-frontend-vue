import { describe, expect, it } from "vitest";

import {
  compileEditorContent,
  compileEditorContentToPostBodyWriteInput,
  mapEditorCompiledDocumentToPreviewReaderBlocks,
} from "@/features/editor-showcase/model/editorContentCompiler";

describe("compileEditorContentToPostBodyWriteInput", () => {
  it("compiles editor markdown-like source into the formal PostBodyWriteInput", () => {
    const writeInput = compileEditorContentToPostBodyWriteInput(
      [
        "## 标题 **加粗**",
        "",
        "阅读 [ZhiCore](https://example.com/docs)。",
        "",
        "```ts",
        'console.log("<ok>")',
        "```",
        "",
        "| 字段 | 说明 |",
        "| --- | --- |",
        "| blocks | 正文结构 |",
      ].join("\n"),
    );

    expect(writeInput).toEqual({
      schemaVersion: 1,
      blocks: [
        {
          type: "heading",
          level: 2,
          children: [
            { type: "text", text: "标题 " },
            { type: "text", text: "加粗", marks: [{ type: "bold" }] },
          ],
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "阅读 " },
            {
              type: "text",
              text: "ZhiCore",
              marks: [{ type: "link", href: "https://example.com/docs" }],
            },
            { type: "text", text: "。" },
          ],
        },
        {
          type: "code_block",
          language: "ts",
          code: 'console.log("<ok>")',
        },
        {
          type: "table",
          headers: [
            { children: [{ type: "text", text: "字段" }] },
            { children: [{ type: "text", text: "说明" }] },
          ],
          rows: [
            [
              { children: [{ type: "text", text: "blocks" }] },
              { children: [{ type: "text", text: "正文结构" }] },
            ],
          ],
        },
      ],
    });
  });

  it("does not write unsafe or relative URLs into formal post body links and embeds", () => {
    const writeInput = compileEditorContentToPostBodyWriteInput(
      [
        "[js](javascript:alert(1)) [relative](/docs) [hash](#title) [ok](https://example.com)",
        "",
        "![relative image](/image.png)",
      ].join("\n"),
    );

    expect(writeInput.blocks).toHaveLength(1);
    expect(writeInput.blocks[0]?.type).toBe("paragraph");

    const paragraph = writeInput.blocks[0];

    if (paragraph?.type !== "paragraph") {
      throw new Error("expected paragraph block");
    }

    const plainText = paragraph.children.map((node) => node.text).join("");

    expect(plainText).toContain("[relative](/docs)");
    expect(plainText).toContain("[hash](#title)");
    expect(plainText).toContain("[relative image](/image.png)");
    expect(paragraph.children).toEqual(
      expect.arrayContaining([
        {
          type: "text",
          text: "ok",
          marks: [{ type: "link", href: "https://example.com/" }],
        },
      ]),
    );
    expect(
      paragraph.children.flatMap((node) =>
        (node.marks ?? []).filter((mark) => mark.type === "link"),
      ),
    ).not.toContainEqual(
      expect.objectContaining({ href: expect.stringMatching(/^javascript:/i) }),
    );
    expect(writeInput.blocks).not.toContainEqual(
      expect.objectContaining({ type: "external_embed" }),
    );
  });

  it("compiles markdown image syntax into an external embed instead of a system image", () => {
    const writeInput = compileEditorContentToPostBodyWriteInput(
      "![架构图](https://example.com/assets/diagram.png)",
    );

    expect(writeInput.blocks).toEqual([
      {
        type: "external_embed",
        provider: "image",
        url: "https://example.com/assets/diagram.png",
        title: "架构图",
      },
    ]);
    expect(writeInput.blocks).not.toContainEqual(
      expect.objectContaining({ type: "image" }),
    );
  });

  it("writes stacked inline marks into the formal post body contract", () => {
    const writeInput = compileEditorContentToPostBodyWriteInput(
      "阅读 **[ZhiCore](https://example.com/docs)** 和 **++重点++**。",
    );

    expect(writeInput.blocks).toEqual([
      {
        type: "paragraph",
        children: [
          { type: "text", text: "阅读 " },
          {
            type: "text",
            text: "ZhiCore",
            marks: [
              { type: "bold" },
              { type: "link", href: "https://example.com/docs" },
            ],
          },
          { type: "text", text: " 和 " },
          {
            type: "text",
            text: "重点",
            marks: [{ type: "bold" }, { type: "underline" }],
          },
          { type: "text", text: "。" },
        ],
      },
    ]);
  });

  it("writes underline marks into the formal post body contract", () => {
    const writeInput =
      compileEditorContentToPostBodyWriteInput("这是 ++重点++。");

    expect(writeInput.blocks).toEqual([
      {
        type: "paragraph",
        children: [
          { type: "text", text: "这是 " },
          { type: "text", text: "重点", marks: [{ type: "underline" }] },
          { type: "text", text: "。" },
        ],
      },
    ]);
  });

  it("writes fenced math as pure latex without markdown delimiters", () => {
    const writeInput = compileEditorContentToPostBodyWriteInput(
      ["$$", "E = mc^2", "\\\\int_0^1 x \\\\, dx", "$$"].join("\n"),
    );

    expect(writeInput).toEqual({
      schemaVersion: 1,
      blocks: [
        {
          type: "math",
          latex: "E = mc^2\n\\\\int_0^1 x \\\\, dx",
        },
      ],
    });
  });

  it("does not write block spacer paragraphs into the formal post body contract", () => {
    const writeInput = compileEditorContentToPostBodyWriteInput(
      [
        "```go",
        "package main",
        "```",
        "",
        "",
        "| 名称 | 说明 |",
        "| --- | --- |",
        "| ZhiCore | 内容社区 |",
      ].join("\n"),
    );

    expect(writeInput.blocks).toEqual([
      expect.objectContaining({ type: "code_block" }),
      expect.objectContaining({ type: "table" }),
    ]);
    expect(writeInput.blocks).not.toContainEqual({
      type: "paragraph",
      children: [{ type: "text", text: "\n\n" }],
    });
  });

  it("keeps blank-line spacers and source ranges in reader preview blocks", () => {
    const compiledDocument = compileEditorContent(
      [
        "```go",
        "package main",
        "```",
        "",
        "",
        "| 名称 | 说明 |",
        "| --- | --- |",
        "| ZhiCore | 内容社区 |",
      ].join("\n"),
    );

    const previewBlocks =
      mapEditorCompiledDocumentToPreviewReaderBlocks(compiledDocument);

    expect(previewBlocks).toMatchObject([
      {
        block: {
          type: "code_block",
        },
        sourceRange: {
          startLine: 0,
          endLine: 2,
        },
        compiledBlockIndex: 0,
      },
      {
        block: {
          type: "paragraph",
          children: [{ type: "text", text: "\n\n" }],
        },
      },
      {
        block: {
          type: "table",
        },
        sourceRange: {
          startLine: 5,
          endLine: 7,
        },
        compiledBlockIndex: 1,
      },
    ]);
    expect(previewBlocks[1]).not.toHaveProperty("sourceRange");
    expect(previewBlocks[1]).not.toHaveProperty("compiledBlockIndex");
  });

  it("serializes the formal post body without editor-only preview fields", () => {
    const writeInput = compileEditorContentToPostBodyWriteInput(
      ["## 标题", "", "阅读 [ZhiCore](https://example.com/docs)。"].join("\n"),
    );
    const serialized = JSON.stringify(writeInput);

    expect(serialized).not.toContain("stableKey");
    expect(serialized).not.toContain("readerBlockIndex");
    expect(serialized).not.toContain("compiledBlockIndex");
    expect(serialized).not.toContain("sourceRange");
    expect(serialized).not.toContain("label");
    expect(serialized).not.toContain("content");
    expect(writeInput.blocks).toEqual([
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "标题" }],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "阅读 ",
          },
          {
            type: "text",
            text: "ZhiCore",
            marks: [{ type: "link", href: "https://example.com/docs" }],
          },
          {
            type: "text",
            text: "。",
          },
        ],
      },
    ]);
  });
});
