import type { PostBodyBlock } from "@/entities/post-body";

import type { EditorTiptapDocumentJson } from "./editorTiptapEngine";

export const defaultEditorTitle = "把复杂系统讲成可以协作的结构";

export function createDefaultEditorDocumentJson(): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Tiptap 编辑器验收稿" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "一篇文章的价值不只来自观点，也来自读者能否沿着清晰的段落进入上下文。",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Inline" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "这行包含 " },
          { type: "text", text: "加粗", marks: [{ type: "bold" }] },
          { type: "text", text: "、" },
          { type: "text", text: "删除线", marks: [{ type: "strike" }] },
          { type: "text", text: "、" },
          { type: "text", text: "inline code", marks: [{ type: "code" }] },
          { type: "text", text: " 和 " },
          {
            type: "text",
            text: "ZhiCore 链接",
            marks: [
              { type: "link", attrs: { href: "https://example.com/docs" } },
            ],
          },
          { type: "text", text: "。" },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Quote" }],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "引用块支持 " },
              {
                type: "text",
                text: "inline code",
                marks: [{ type: "code" }],
              },
              { type: "text", text: " 和 " },
              { type: "text", text: "加粗", marks: [{ type: "bold" }] },
              { type: "text", text: "。" },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Lists" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "无序列表第一项" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "无序列表第二项 " },
                  { type: "text", text: "加粗", marks: [{ type: "bold" }] },
                ],
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
                content: [{ type: "text", text: "有序列表第一步" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "有序列表第二步" }],
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
                content: [{ type: "text", text: "已完成任务" }],
              },
            ],
          },
          {
            type: "taskItem",
            attrs: { checked: false },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "未完成任务" }],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Code" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "go" },
        content: [
          {
            type: "text",
            text: [
              "package main",
              "",
              'import "fmt"',
              "",
              "func main() {",
              '  fmt.Println("hello zhicore")',
              "}",
            ].join("\n"),
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Table" }],
      },
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: ["表头1", "表头2", "表头3"].map((text) => ({
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text }],
                },
              ],
            })),
          },
          ...[
            ["数据1", "数据2", "数据3"],
            ["数据4", "数据5", "数据6"],
          ].map((row) => ({
            type: "tableRow",
            content: row.map((text) => ({
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text }],
                },
              ],
            })),
          })),
        ],
      },
    ],
  };
}

export const fallbackReaderBlock: PostBodyBlock = {
  type: "paragraph",
  children: [
    {
      type: "text",
      text: "正文预览会随输入同步更新。",
    },
  ],
};
