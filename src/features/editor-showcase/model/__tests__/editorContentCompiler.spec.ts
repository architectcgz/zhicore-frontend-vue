import { describe, expect, it } from "vitest";

import { compileEditorContent } from "../editorContentCompiler";

describe("editorContentCompiler", () => {
  it("compiles editor source into structured blocks", () => {
    const compiledDocument = compileEditorContent(
      '阅读 [ZhiCore](https://example.com/docs)。\n\n```ts\nconsole.log("<ok>")\n```后续正文',
    );

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "text",
        label: "Text",
        content: "阅读 [ZhiCore](https://example.com/docs)。",
        inlineNodes: [
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
      {
        type: "code",
        label: "Code",
        language: "ts",
        content: 'console.log("<ok>")',
      },
      {
        type: "text",
        label: "Text",
        content: "后续正文",
        inlineNodes: [
          {
            type: "text",
            text: "后续正文",
          },
        ],
      },
    ]);
    expect(compiledDocument).not.toHaveProperty("html");
  });

  it("keeps an unclosed code fence as plain text", () => {
    const compiledDocument = compileEditorContent("```go\n123213");

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "text",
        label: "Text",
        content: "```go\n123213",
        inlineNodes: [
          {
            type: "text",
            text: "```go\n123213",
          },
        ],
      },
    ]);
  });

  it("keeps an unclosed math fence as plain text without duplicating content", () => {
    const compiledDocument = compileEditorContent("$$E = mc^2\nnext line");

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "text",
        label: "Text",
        content: "$$E = mc^2\nnext line",
        inlineNodes: [
          {
            type: "text",
            text: "$$E = mc^2\nnext line",
          },
        ],
      },
    ]);
  });

  it("compiles bold inline markdown into text nodes with marks", () => {
    const compiledDocument = compileEditorContent("这是 **123123** 文本。");

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "text",
        label: "Text",
        content: "这是 **123123** 文本。",
        inlineNodes: [
          {
            type: "text",
            text: "这是 ",
          },
          {
            type: "text",
            text: "123123",
            marks: [{ type: "bold" }],
          },
          {
            type: "text",
            text: " 文本。",
          },
        ],
      },
    ]);
  });

  it("compiles common inline markdown marks into text nodes with marks", () => {
    const compiledDocument = compileEditorContent(
      "这是 `code <x>`、*斜体*、_强调_、~~删除~~ 和 **加粗**。",
    );

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "text",
        label: "Text",
        content: "这是 `code <x>`、*斜体*、_强调_、~~删除~~ 和 **加粗**。",
        inlineNodes: [
          {
            type: "text",
            text: "这是 ",
          },
          {
            type: "text",
            text: "code <x>",
            marks: [{ type: "inline_code" }],
          },
          {
            type: "text",
            text: "、",
          },
          {
            type: "text",
            text: "斜体",
            marks: [{ type: "italic" }],
          },
          {
            type: "text",
            text: "、",
          },
          {
            type: "text",
            text: "强调",
            marks: [{ type: "italic" }],
          },
          {
            type: "text",
            text: "、",
          },
          {
            type: "text",
            text: "删除",
            marks: [{ type: "strike" }],
          },
          {
            type: "text",
            text: " 和 ",
          },
          {
            type: "text",
            text: "加粗",
            marks: [{ type: "bold" }],
          },
          {
            type: "text",
            text: "。",
          },
        ],
      },
    ]);
  });

  it("preserves stacked inline marks on the same text node", () => {
    const compiledDocument = compileEditorContent(
      "阅读 **[ZhiCore](https://example.com/docs)** 和 **_重点_**。",
    );

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "text",
        inlineNodes: [
          {
            type: "text",
            text: "阅读 ",
          },
          {
            type: "text",
            text: "ZhiCore",
            marks: [
              { type: "bold" },
              { type: "link", href: "https://example.com/docs" },
            ],
          },
          {
            type: "text",
            text: " 和 ",
          },
          {
            type: "text",
            text: "重点",
            marks: [{ type: "bold" }, { type: "italic" }],
          },
          {
            type: "text",
            text: "。",
          },
        ],
      },
    ]);
  });

  it("compiles common block markdown into typed blocks", () => {
    const compiledDocument = compileEditorContent(
      [
        "## 标题 **加粗**",
        "",
        "> 引用 `code`",
        "",
        "- 无序项",
        "- 第二项 **粗**",
        "",
        "1. 第一步",
        "2. 第二步",
        "",
        "- [x] 完成项",
        "- [ ] 待办项",
        "",
        "![架构图](https://example.com/assets/diagram.png)",
      ].join("\n"),
    );

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "heading",
        label: "Heading",
        level: 2,
        content: "标题 **加粗**",
        inlineNodes: [
          {
            type: "text",
            text: "标题 ",
          },
          {
            type: "text",
            text: "加粗",
            marks: [{ type: "bold" }],
          },
        ],
      },
      {
        type: "quote",
        label: "Quote",
        content: "引用 `code`",
        inlineNodes: [
          {
            type: "text",
            text: "引用 ",
          },
          {
            type: "text",
            text: "code",
            marks: [{ type: "inline_code" }],
          },
        ],
      },
      {
        type: "list",
        label: "List",
        ordered: false,
        task: false,
        content: "- 无序项\n- 第二项 **粗**",
        items: [
          {
            content: "无序项",
            inlineNodes: [
              {
                type: "text",
                text: "无序项",
              },
            ],
          },
          {
            content: "第二项 **粗**",
            inlineNodes: [
              {
                type: "text",
                text: "第二项 ",
              },
              {
                type: "text",
                text: "粗",
                marks: [{ type: "bold" }],
              },
            ],
          },
        ],
      },
      {
        type: "list",
        label: "List",
        ordered: true,
        task: false,
        content: "1. 第一步\n2. 第二步",
        items: [
          {
            content: "第一步",
            inlineNodes: [
              {
                type: "text",
                text: "第一步",
              },
            ],
          },
          {
            content: "第二步",
            inlineNodes: [
              {
                type: "text",
                text: "第二步",
              },
            ],
          },
        ],
      },
      {
        type: "list",
        label: "Task List",
        ordered: false,
        task: true,
        content: "- [x] 完成项\n- [ ] 待办项",
        items: [
          {
            checked: true,
            content: "完成项",
            inlineNodes: [
              {
                type: "text",
                text: "完成项",
              },
            ],
          },
          {
            checked: false,
            content: "待办项",
            inlineNodes: [
              {
                type: "text",
                text: "待办项",
              },
            ],
          },
        ],
      },
      {
        type: "media",
        label: "Image",
        content: "![架构图](https://example.com/assets/diagram.png)",
        alt: "架构图",
        src: "https://example.com/assets/diagram.png",
      },
    ]);
  });

  it("compiles pipe table markdown into table blocks", () => {
    const compiledDocument = compileEditorContent(
      [
        "| 表头1 | 表头2 | 表头3 |",
        "| ------ | ------ | ------ |",
        "| 数据1 | 数据2 | 数据3 |",
        "| 数据4 | 数据5 | 数据6 |",
      ].join("\n"),
    );

    expect(compiledDocument.blocks).toMatchObject([
      {
        type: "table",
        label: "Table",
        content:
          "| 表头1 | 表头2 | 表头3 |\n| ------ | ------ | ------ |\n| 数据1 | 数据2 | 数据3 |\n| 数据4 | 数据5 | 数据6 |",
        headers: [
          {
            content: "表头1",
            inlineNodes: [
              {
                type: "text",
                text: "表头1",
              },
            ],
          },
          {
            content: "表头2",
            inlineNodes: [
              {
                type: "text",
                text: "表头2",
              },
            ],
          },
          {
            content: "表头3",
            inlineNodes: [
              {
                type: "text",
                text: "表头3",
              },
            ],
          },
        ],
        rows: [
          [
            {
              content: "数据1",
              inlineNodes: [
                {
                  type: "text",
                  text: "数据1",
                },
              ],
            },
            {
              content: "数据2",
              inlineNodes: [
                {
                  type: "text",
                  text: "数据2",
                },
              ],
            },
            {
              content: "数据3",
              inlineNodes: [
                {
                  type: "text",
                  text: "数据3",
                },
              ],
            },
          ],
          [
            {
              content: "数据4",
              inlineNodes: [
                {
                  type: "text",
                  text: "数据4",
                },
              ],
            },
            {
              content: "数据5",
              inlineNodes: [
                {
                  type: "text",
                  text: "数据5",
                },
              ],
            },
            {
              content: "数据6",
              inlineNodes: [
                {
                  type: "text",
                  text: "数据6",
                },
              ],
            },
          ],
        ],
      },
    ]);
  });

  it("accepts the common short table separator marker", () => {
    const compiledDocument = compileEditorContent(
      [
        "| 表头1 | 表头2 | 表头3 |",
        "| --- | --- | --- |",
        "| 数据1 | 数据2 | 数据3 |",
      ].join("\n"),
    );

    expect(compiledDocument.blocks[0]?.type).toBe("table");
  });

  it("keeps pipe text without a separator row as plain text", () => {
    const compiledDocument = compileEditorContent("测试|1|2");

    expect(compiledDocument.blocks[0]?.type).toBe("text");
  });

  it("attaches source line ranges to compiled blocks", () => {
    const compiledDocument = compileEditorContent(
      [
        "# 标题",
        "",
        "第一段",
        "",
        "第二段",
        "",
        "```go",
        "fmt.Println(1)",
        "```",
        "",
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
      ].join("\n"),
    );

    expect(
      compiledDocument.blocks.map((block) => ({
        type: block.type,
        sourceRange: block.sourceRange,
      })),
    ).toEqual([
      {
        type: "heading",
        sourceRange: {
          startLine: 0,
          endLine: 0,
        },
      },
      {
        type: "text",
        sourceRange: {
          startLine: 2,
          endLine: 5,
        },
      },
      {
        type: "code",
        sourceRange: {
          startLine: 6,
          endLine: 8,
        },
      },
      {
        type: "table",
        sourceRange: {
          startLine: 10,
          endLine: 12,
        },
      },
    ]);
  });
});
