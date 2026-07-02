import { describe, expect, it } from "vitest";

import {
  editorProseMirrorSchema,
  mapProseMirrorDocToPostBodyWriteInput,
} from "../editorProseMirrorEngine";

describe("editorProseMirrorEngine", () => {
  it("exposes rich ProseMirror nodes and inline marks for Content V1 editing", () => {
    expect(Object.keys(editorProseMirrorSchema.nodes)).toEqual(
      expect.arrayContaining([
        "doc",
        "paragraph",
        "heading",
        "quote",
        "code_block",
        "list",
        "list_item",
        "math_block",
        "table",
        "table_row",
        "table_cell",
        "external_embed",
        "text",
      ]),
    );
    expect(Object.keys(editorProseMirrorSchema.marks)).toEqual(
      expect.arrayContaining([
        "bold",
        "italic",
        "underline",
        "strike",
        "inline_code",
        "link",
      ]),
    );
  });

  it("maps ProseMirror bold marks to PostBodyWriteInput without treating markdown markers as formatting", () => {
    const bold = editorProseMirrorSchema.marks.bold.create();
    const doc = editorProseMirrorSchema.nodes.doc.create(null, [
      editorProseMirrorSchema.nodes.paragraph.create(null, [
        editorProseMirrorSchema.text("真实加粗", [bold]),
        editorProseMirrorSchema.text(" **普通星号**"),
      ]),
    ]);

    expect(mapProseMirrorDocToPostBodyWriteInput(doc)).toEqual({
      schemaVersion: 1,
      blocks: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "真实加粗",
              marks: [{ type: "bold" }],
            },
            {
              type: "text",
              text: " **普通星号**",
            },
          ],
        },
      ],
    });
  });

  it("maps ProseMirror block nodes to Content V1 blocks", () => {
    const doc = editorProseMirrorSchema.nodes.doc.create(null, [
      editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [
        editorProseMirrorSchema.text("标题"),
      ]),
      editorProseMirrorSchema.nodes.quote.create(null, [
        editorProseMirrorSchema.text("引用"),
      ]),
      editorProseMirrorSchema.nodes.code_block.create({ language: "ts" }, [
        editorProseMirrorSchema.text("console.log(1)"),
      ]),
      editorProseMirrorSchema.nodes.list.create(
        { ordered: false, task: true },
        [
          editorProseMirrorSchema.nodes.list_item.create({ checked: true }, [
            editorProseMirrorSchema.text("任务"),
          ]),
        ],
      ),
      editorProseMirrorSchema.nodes.external_embed.create({
        provider: "image",
        url: "https://example.com/image.png",
        title: "示例图",
      }),
    ]);

    expect(mapProseMirrorDocToPostBodyWriteInput(doc).blocks).toEqual([
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "标题" }],
      },
      {
        type: "quote",
        children: [{ type: "text", text: "引用" }],
      },
      {
        type: "code_block",
        language: "ts",
        code: "console.log(1)",
      },
      {
        type: "list",
        ordered: false,
        task: true,
        items: [
          {
            checked: true,
            children: [{ type: "text", text: "任务" }],
          },
        ],
      },
      {
        type: "external_embed",
        provider: "image",
        url: "https://example.com/image.png",
        title: "示例图",
      },
    ]);
  });
});
