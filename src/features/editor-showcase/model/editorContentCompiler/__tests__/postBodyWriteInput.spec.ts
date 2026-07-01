import { describe, expect, it } from "vitest";

import { compileEditorContentToPostBodyWriteInput } from "@/features/editor-showcase/model/editorContentCompiler";

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
    expect(writeInput.blocks[0]).toMatchObject({
      type: "paragraph",
      children: expect.arrayContaining([
        { type: "text", text: "[relative](/docs)" },
        { type: "text", text: "[hash](#title)" },
        { type: "text", text: "[relative image](/image.png)" },
        {
          type: "text",
          text: "ok",
          marks: [{ type: "link", href: "https://example.com/" }],
        },
      ]),
    });
    expect(writeInput.blocks).not.toContainEqual(
      expect.objectContaining({ type: "external_embed" }),
    );
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
});
