import type { Node as ProseMirrorNode } from "prosemirror-model";

import type { PostBodyBlock } from "@/entities/post-body";
import {
  editorProseMirrorSchema,
  serializeProseMirrorDocToJson,
  type EditorProseMirrorDocumentJson,
} from "./editorProseMirrorEngine";

export const defaultEditorTitle = "把复杂系统讲成可以协作的结构";

function createDefaultEditorDocument() {
  const { nodes, marks } = editorProseMirrorSchema;
  const emptyParagraph = () => nodes.paragraph.create();
  const paragraph = (...content: ProseMirrorNode[]) =>
    nodes.paragraph.create(null, content);
  const heading = (level: 1 | 2, text: string) =>
    nodes.heading.create({ level }, editorProseMirrorSchema.text(text));
  const listItem = (text: string, checked: boolean | null = null) =>
    nodes.list_item.create({ checked }, editorProseMirrorSchema.text(text));
  const tableCell = (text: string) =>
    nodes.table_cell.create(null, editorProseMirrorSchema.text(text));
  const tableRow = (cells: string[]) =>
    nodes.table_row.create(null, cells.map(tableCell));

  return editorProseMirrorSchema.nodes.doc.create(null, [
    heading(1, "ProseMirror 编辑器验收稿"),
    emptyParagraph(),
    paragraph(
      editorProseMirrorSchema.text(
        "一篇文章的价值不只来自观点，也来自读者能否沿着清晰的段落进入上下文。",
      ),
    ),
    emptyParagraph(),
    heading(2, "Inline"),
    emptyParagraph(),
    paragraph(
      editorProseMirrorSchema.text("这行包含 "),
      editorProseMirrorSchema.text("加粗", [marks.bold.create()]),
      editorProseMirrorSchema.text("、"),
      editorProseMirrorSchema.text("删除线", [marks.strike.create()]),
      editorProseMirrorSchema.text("、"),
      editorProseMirrorSchema.text("inline code", [marks.inline_code.create()]),
      editorProseMirrorSchema.text(" 和 "),
      editorProseMirrorSchema.text("ZhiCore 链接", [
        marks.link.create({ href: "https://example.com/docs" }),
      ]),
      editorProseMirrorSchema.text("。"),
    ),
    emptyParagraph(),
    heading(2, "Quote"),
    emptyParagraph(),
    nodes.quote.create(null, [
      editorProseMirrorSchema.text("引用块支持 "),
      editorProseMirrorSchema.text("inline code", [marks.inline_code.create()]),
      editorProseMirrorSchema.text(" 和 "),
      editorProseMirrorSchema.text("加粗", [marks.bold.create()]),
      editorProseMirrorSchema.text("。"),
    ]),
    emptyParagraph(),
    heading(2, "Lists"),
    emptyParagraph(),
    nodes.list.create({ ordered: false, task: false }, [
      listItem("无序列表第一项"),
      nodes.list_item.create(null, [
        editorProseMirrorSchema.text("无序列表第二项 "),
        editorProseMirrorSchema.text("加粗", [marks.bold.create()]),
      ]),
    ]),
    nodes.list.create({ ordered: true, task: false }, [
      listItem("有序列表第一步"),
      listItem("有序列表第二步"),
    ]),
    nodes.list.create({ ordered: false, task: true }, [
      listItem("已完成任务", true),
      listItem("未完成任务", false),
    ]),
    emptyParagraph(),
    heading(2, "Code"),
    emptyParagraph(),
    nodes.code_block.create(
      { language: "go" },
      editorProseMirrorSchema.text(
        [
          "package main",
          "",
          'import "fmt"',
          "",
          "func main() {",
          '  fmt.Println("hello zhicore")',
          "}",
        ].join("\n"),
      ),
    ),
    emptyParagraph(),
    heading(2, "Table"),
    emptyParagraph(),
    nodes.table.create(null, [
      tableRow(["表头1", "表头2", "表头3"]),
      tableRow(["数据1", "数据2", "数据3"]),
      tableRow(["数据4", "数据5", "数据6"]),
    ]),
  ]);
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
