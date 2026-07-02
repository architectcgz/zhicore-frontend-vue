import type { PostBodyBlock } from "@/entities/post-body";
import {
  editorProseMirrorSchema,
  serializeProseMirrorDocToJson,
  type EditorProseMirrorDocumentJson,
} from "./editorProseMirrorEngine";

export const defaultEditorTitle = "把复杂系统讲成可以协作的结构";

function text(content: string, markNames: string[] = []) {
  return editorProseMirrorSchema.text(
    content,
    markNames.map((markName) =>
      editorProseMirrorSchema.marks[markName].create(),
    ),
  );
}

function createDefaultEditorDocument() {
  const linkMark = editorProseMirrorSchema.marks.link.create({
    href: "https://example.com/docs",
  });
  const createCell = (content: string) =>
    editorProseMirrorSchema.nodes.table_cell.create(null, text(content));

  return editorProseMirrorSchema.nodes.doc.create(null, [
    editorProseMirrorSchema.nodes.heading.create({ level: 1 }, [
      text("ProseMirror 编辑器验收稿"),
    ]),
    editorProseMirrorSchema.nodes.paragraph.create(null, [
      text(
        "一篇文章的价值不只来自观点，也来自读者能否沿着清晰的段落进入上下文。编辑器默认不展示厚重的 block 外框，只有在聚焦、拖拽或校验错误时才露出结构。",
      ),
    ]),
    editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [
      text("Inline"),
    ]),
    editorProseMirrorSchema.nodes.paragraph.create(null, [
      text("这行包含 "),
      text("加粗", ["bold"]),
      text("、"),
      text("斜体", ["italic"]),
      text("、"),
      text("删除线", ["strike"]),
      text("、"),
      text("inline code", ["inline_code"]),
      text(" 和 "),
      editorProseMirrorSchema.text("ZhiCore 链接", [linkMark]),
      text("。"),
    ]),
    editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [text("Quote")]),
    editorProseMirrorSchema.nodes.quote.create(null, [
      text("引用块支持 "),
      text("inline code", ["inline_code"]),
      text(" 和 "),
      text("加粗", ["bold"]),
      text("，用于验证 blockquote 与 inline 节点组合。"),
    ]),
    editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [text("Lists")]),
    editorProseMirrorSchema.nodes.list.create({ ordered: false, task: false }, [
      editorProseMirrorSchema.nodes.list_item.create(null, [
        text("无序列表第一项"),
      ]),
      editorProseMirrorSchema.nodes.list_item.create(null, [
        text("无序列表第二项 "),
        text("加粗", ["bold"]),
      ]),
    ]),
    editorProseMirrorSchema.nodes.list.create({ ordered: true, task: false }, [
      editorProseMirrorSchema.nodes.list_item.create(null, [
        text("有序列表第一步"),
      ]),
      editorProseMirrorSchema.nodes.list_item.create(null, [
        text("有序列表第二步"),
      ]),
    ]),
    editorProseMirrorSchema.nodes.list.create({ ordered: false, task: true }, [
      editorProseMirrorSchema.nodes.list_item.create({ checked: true }, [
        text("已完成任务"),
      ]),
      editorProseMirrorSchema.nodes.list_item.create({ checked: false }, [
        text("未完成任务"),
      ]),
    ]),
    editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [text("Image")]),
    editorProseMirrorSchema.nodes.external_embed.create({
      provider: "image",
      url: "https://placehold.co/640x360/png",
      title: "示例图片",
    }),
    editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [text("Code")]),
    editorProseMirrorSchema.nodes.code_block.create({ language: "go" }, [
      text(
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
    ]),
    editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [text("Table")]),
    editorProseMirrorSchema.nodes.table.create(null, [
      editorProseMirrorSchema.nodes.table_row.create(null, [
        createCell("表头1"),
        createCell("表头2"),
        createCell("表头3"),
      ]),
      editorProseMirrorSchema.nodes.table_row.create(null, [
        createCell("数据1"),
        createCell("数据2"),
        createCell("数据3"),
      ]),
      editorProseMirrorSchema.nodes.table_row.create(null, [
        createCell("数据4"),
        createCell("数据5"),
        createCell("数据6"),
      ]),
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
