import type { EditorCompiledBlock } from "./editorContentCompiler";
import type { PostBodyBlock } from "@/entities/post-body";

export const defaultEditorShowcaseTitle = "把复杂系统讲成可以协作的结构";

export const defaultEditorShowcaseBody = [
  "# Markdown 语法验收稿",
  "",
  "一篇文章的价值不只来自观点，也来自读者能否沿着清晰的段落进入上下文。编辑器默认不展示厚重的 block 外框，只有在聚焦、拖拽或校验错误时才露出结构。",
  "",
  "## Inline",
  "",
  "这行包含 **加粗**、_斜体_、~~删除线~~、`inline code` 和 [ZhiCore 链接](https://example.com/docs)。",
  "",
  "## Quote",
  "",
  "> 引用块支持 `inline code` 和 **加粗**，用于验证 blockquote 与 inline 节点组合。",
  "",
  "## Lists",
  "",
  "- 无序列表第一项",
  "- 无序列表第二项 **加粗**",
  "",
  "1. 有序列表第一步",
  "2. 有序列表第二步",
  "",
  "- [x] 已完成任务",
  "- [ ] 未完成任务",
  "",
  "## Image",
  "",
  "![示例图片](https://placehold.co/640x360/png)",
  "",
  "## Code",
  "",
  "```go",
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

export const fallbackPreviewBlock: EditorCompiledBlock = {
  type: "text",
  label: "Text",
  content: "正文预览会随输入同步更新。",
  inlineNodes: [
    {
      type: "text",
      text: "正文预览会随输入同步更新。",
    },
  ],
};

export const fallbackReaderBlock: PostBodyBlock = {
  type: "paragraph",
  children: [
    {
      type: "text",
      text: "正文预览会随输入同步更新。",
    },
  ],
};
