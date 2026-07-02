import type { PostBodyBlock } from "@/entities/post-body";
import {
  editorProseMirrorSchema,
  serializeProseMirrorDocToJson,
  type EditorProseMirrorDocumentJson,
} from "./editorProseMirrorEngine";

export const defaultEditorTitle = "把复杂系统讲成可以协作的结构";

const defaultEditorMarkdown = [
  "# ProseMirror 编辑器验收稿",
  "",
  "一篇文章的价值不只来自观点，也来自读者能否沿着清晰的段落进入上下文。",
  "",
  "## Inline",
  "",
  "这行包含 **加粗**、~~删除线~~、`inline code` 和 [ZhiCore 链接](https://example.com/docs)。",
  "",
  "## Quote",
  "",
  "> 引用块支持 `inline code` 和 **加粗**。",
  "",
  "## Lists",
  "",
  "- 无序列表第一项",
  "- 无序列表第二项 **加粗**",
  "1. 有序列表第一步",
  "2. 有序列表第二步",
  "- [x] 已完成任务",
  "- [ ] 未完成任务",
  "",
  "## Code",
  "",
  "``` go",
  "package main",
  "",
  'import "fmt"',
  "",
  "func main() {",
  '  fmt.Println("hello zhicore")',
  "}",
  "```",
  "",
  "## Table",
  "",
  "| 表头1 | 表头2 | 表头3 |",
  "| --- | --- | --- |",
  "| 数据1 | 数据2 | 数据3 |",
  "| 数据4 | 数据5 | 数据6 |",
].join("\n");

function createDefaultEditorDocument() {
  return editorProseMirrorSchema.nodes.doc.create(
    null,
    defaultEditorMarkdown
      .split("\n")
      .map((line) =>
        editorProseMirrorSchema.nodes.paragraph.create(
          null,
          line ? editorProseMirrorSchema.text(line) : undefined,
        ),
      ),
  );
}

export function createDefaultEditorDocumentJson(): EditorProseMirrorDocumentJson {
  return serializeProseMirrorDocToJson(createDefaultEditorDocument());
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
