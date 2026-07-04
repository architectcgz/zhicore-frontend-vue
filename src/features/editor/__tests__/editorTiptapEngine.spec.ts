import { describe, expect, it } from "vitest";

import {
  EditorPostBodyMappingError,
  mapTiptapJsonToPostBodyWriteInput,
  type EditorTiptapDocumentJson,
} from "../tiptap/editorTiptapEngine";

describe("editorTiptapEngine", () => {
  it("maps Tiptap document nodes to Content V1 blocks", () => {
    const documentJson: EditorTiptapDocumentJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "普通 " },
            { type: "text", text: "加粗", marks: [{ type: "bold" }] },
            {
              type: "text",
              text: " 链接",
              marks: [
                { type: "link", attrs: { href: "https://example.com/path" } },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "标题" }],
        },
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "引用段落" }],
            },
            {
              type: "codeBlock",
              attrs: { language: "ts" },
              content: [{ type: "text", text: "const quoted = true" }],
            },
          ],
        },
        {
          type: "codeBlock",
          attrs: { language: "ts" },
          content: [{ type: "text", text: "console.log(1)" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "无序列表" }],
                },
              ],
            },
          ],
        },
        {
          type: "orderedList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "有序列表" }],
                },
              ],
            },
          ],
        },
        {
          type: "taskList",
          content: [
            {
              type: "taskItem",
              attrs: { checked: true },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "任务列表" }],
                },
              ],
            },
          ],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "表头" }],
                    },
                  ],
                },
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "内容" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "math_block",
          content: [{ type: "text", text: "x^2" }],
        },
        {
          type: "external_embed",
          attrs: {
            provider: "image",
            url: "https://example.com/image.png",
            title: "示例图",
          },
        },
      ],
    };

    expect(mapTiptapJsonToPostBodyWriteInput(documentJson)).toEqual({
      schemaVersion: 1,
      blocks: [
        {
          type: "paragraph",
          children: [
            { type: "text", text: "普通 " },
            { type: "text", text: "加粗", marks: [{ type: "bold" }] },
            {
              type: "text",
              text: " 链接",
              marks: [{ type: "link", href: "https://example.com/path" }],
            },
          ],
        },
        {
          type: "heading",
          level: 3,
          children: [{ type: "text", text: "标题" }],
        },
        {
          type: "quote",
          blocks: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "引用段落" }],
            },
            {
              type: "code_block",
              language: "ts",
              code: "const quoted = true",
            },
          ],
        },
        {
          type: "code_block",
          language: "ts",
          code: "console.log(1)",
        },
        {
          type: "list",
          ordered: false,
          task: false,
          items: [
            {
              blocks: [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "无序列表" }],
                },
              ],
            },
          ],
        },
        {
          type: "list",
          ordered: true,
          task: false,
          items: [
            {
              blocks: [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "有序列表" }],
                },
              ],
            },
          ],
        },
        {
          type: "list",
          ordered: false,
          task: true,
          items: [
            {
              checked: true,
              blocks: [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "任务列表" }],
                },
              ],
            },
          ],
        },
        {
          type: "table",
          headers: [{ children: [{ type: "text", text: "表头" }] }],
          rows: [[{ children: [{ type: "text", text: "内容" }] }]],
        },
        {
          type: "math",
          latex: "x^2",
        },
        {
          type: "external_embed",
          provider: "image",
          url: "https://example.com/image.png",
          title: "示例图",
        },
      ],
    });
  });

  it("keeps markdown-like markers as normal text", () => {
    const documentJson: EditorTiptapDocumentJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "**普通星号**" }],
        },
      ],
    };

    expect(mapTiptapJsonToPostBodyWriteInput(documentJson).blocks).toEqual([
      {
        type: "paragraph",
        children: [{ type: "text", text: "**普通星号**" }],
      },
    ]);
  });

  it("rejects unsafe links before they enter the save model", () => {
    const documentJson: EditorTiptapDocumentJson = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "危险链接",
              marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }],
            },
          ],
        },
      ],
    };

    expect(() => mapTiptapJsonToPostBodyWriteInput(documentJson)).toThrow(
      EditorPostBodyMappingError,
    );
  });

  it("uses visible math block text as the saved latex source", () => {
    const documentJson: EditorTiptapDocumentJson = {
      type: "doc",
      content: [
        {
          type: "math_block",
          attrs: { latex: "old" },
          content: [{ type: "text", text: "x^2" }],
        },
      ],
    };

    expect(mapTiptapJsonToPostBodyWriteInput(documentJson).blocks).toEqual([
      {
        type: "math",
        latex: "x^2",
      },
    ]);
  });

  it("does not save hidden math attrs when visible math text is empty", () => {
    const documentJson: EditorTiptapDocumentJson = {
      type: "doc",
      content: [
        {
          type: "math_block",
          attrs: { latex: "old" },
        },
      ],
    };

    expect(mapTiptapJsonToPostBodyWriteInput(documentJson).blocks).toEqual([
      {
        type: "math",
        latex: "",
      },
    ]);
  });

  it("rejects unsupported inline and block nodes instead of flattening them", () => {
    expect(() =>
      mapTiptapJsonToPostBodyWriteInput({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "hardBreak" }],
          },
        ],
      }),
    ).toThrow(EditorPostBodyMappingError);

    expect(() =>
      mapTiptapJsonToPostBodyWriteInput({
        type: "doc",
        content: [{ type: "horizontalRule" }],
      }),
    ).toThrow(EditorPostBodyMappingError);
  });

  it("rejects complex table cells instead of flattening block content", () => {
    const documentJson: EditorTiptapDocumentJson = {
      type: "doc",
      content: [
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  attrs: { colspan: 2, rowspan: 1 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "跨列" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() => mapTiptapJsonToPostBodyWriteInput(documentJson)).toThrow(
      EditorPostBodyMappingError,
    );
  });

  it("rejects documents that exceed the Content V1 container depth", () => {
    const documentJson: EditorTiptapDocumentJson = {
      type: "doc",
      content: [
        {
          type: "blockquote",
          content: [
            {
              type: "bulletList",
              content: [
                {
                  type: "listItem",
                  content: [
                    {
                      type: "blockquote",
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "过深" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    expect(() => mapTiptapJsonToPostBodyWriteInput(documentJson)).toThrow(
      EditorPostBodyMappingError,
    );
    expect(() => mapTiptapJsonToPostBodyWriteInput(documentJson)).toThrow(
      "Content V1 supports at most 2 nested block containers",
    );
  });
});
