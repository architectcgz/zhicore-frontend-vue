import { describe, expect, it } from "vitest";

import { useEditorShowcaseDraft } from "../useEditorShowcaseDraft";

describe("useEditorShowcaseDraft", () => {
  it("starts with an editable title and body", () => {
    const draft = useEditorShowcaseDraft();

    expect(draft.title.value).toContain("把复杂系统讲成可以协作的结构");
    expect(draft.body.value).toContain("一篇文章的价值");
  });

  it("updates the reader preview from draft input", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateTitle("新的文章标题");
    draft.updateBody("第一段正文。\n\n第二段正文，用于预览。");

    expect(draft.previewTitle.value).toBe("新的文章标题");
    expect(draft.previewParagraphs.value).toEqual([
      "第一段正文。\n\n第二段正文，用于预览。",
    ]);
    expect(draft.wordCount.value).toBe(14);
  });

  it("keeps blank-line-separated plain text in one text block", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateBody("段落一。\n\n\n段落二仍然是纯文本。");

    expect(draft.previewBlocks.value).toEqual([
      {
        type: "text",
        label: "Text",
        content: "段落一。\n\n\n段落二仍然是纯文本。",
        inlineNodes: [
          {
            type: "text",
            text: "段落一。\n\n\n段落二仍然是纯文本。",
          },
        ],
      },
    ]);
  });

  it("splits plain text from non-text blocks after blank lines", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateBody(
      '段落一。\n\n段落二仍然是纯文本。\n\n```go\nfmt.Println("hi")\n```\n\n段落三。',
    );

    expect(draft.previewBlocks.value).toEqual([
      {
        type: "text",
        label: "Text",
        content: "段落一。\n\n段落二仍然是纯文本。",
        inlineNodes: [
          {
            type: "text",
            text: "段落一。\n\n段落二仍然是纯文本。",
          },
        ],
      },
      {
        type: "code",
        label: "Code",
        language: "go",
        content: 'fmt.Println("hi")',
      },
      {
        type: "text",
        label: "Text",
        content: "段落三。",
        inlineNodes: [
          {
            type: "text",
            text: "段落三。",
          },
        ],
      },
    ]);
  });

  it("parses markdown links into safe preview inline nodes", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateBody("阅读 [ZhiCore](https://example.com/docs) 文档。");

    expect(draft.previewBlocks.value).toEqual([
      {
        type: "text",
        label: "Text",
        content: "阅读 [ZhiCore](https://example.com/docs) 文档。",
        inlineNodes: [
          {
            type: "text",
            text: "阅读 ",
          },
          {
            type: "link",
            text: "ZhiCore",
            href: "https://example.com/docs",
          },
          {
            type: "text",
            text: " 文档。",
          },
        ],
      },
    ]);
  });

  it("ends a code block before text typed after the closing fence", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateBody('```ts\nconsole.log("ok")\n```后续正文');

    expect(draft.previewBlocks.value).toEqual([
      {
        type: "code",
        label: "Code",
        language: "ts",
        content: 'console.log("ok")',
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
  });

  it("inserts a code block from the toolbar action", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateBody("段落一。");
    draft.applyToolbarAction("code", { start: 4, end: 4 });

    expect(draft.body.value).toBe("段落一。\n\n```ts\n// 在这里输入代码\n```");
    expect(draft.previewBlocks.value).toEqual([
      {
        type: "text",
        label: "Text",
        content: "段落一。",
        inlineNodes: [
          {
            type: "text",
            text: "段落一。",
          },
        ],
      },
      {
        type: "code",
        label: "Code",
        language: "ts",
        content: "// 在这里输入代码",
      },
    ]);
  });

  it("wraps selected plain text from toolbar actions", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateBody("需要加粗");
    const selection = draft.applyToolbarAction("bold", { start: 0, end: 4 });

    expect(draft.body.value).toBe("**需要加粗**");
    expect(selection).toEqual({ start: 2, end: 6 });
  });

  it("uses fallback preview text when input is empty", () => {
    const draft = useEditorShowcaseDraft();

    draft.updateTitle("   ");
    draft.updateBody("");

    expect(draft.previewTitle.value).toBe("未命名草稿");
    expect(draft.previewParagraphs.value).toEqual([
      "正文预览会随输入同步更新。",
    ]);
    expect(draft.wordCount.value).toBe(0);
  });
});
