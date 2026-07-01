import { afterEach, describe, expect, it, vi } from "vitest";

import { useEditorShowcaseDraft } from "../useEditorShowcaseDraft";

describe("useEditorShowcaseDraft", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with an editable title and body", () => {
    const draft = useEditorShowcaseDraft();

    expect(draft.title.value).toContain("把复杂系统讲成可以协作的结构");
    expect(draft.body.value).toContain("一篇文章的价值");
  });

  it("does not render a math block until the draft source contains math syntax", () => {
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    expect(draft.readerBlocks.value).not.toContainEqual(
      expect.objectContaining({ type: "math" }),
    );

    draft.updateBody("$$E = mc^2$$");

    expect(draft.readerBlocks.value).toContainEqual({
      type: "math",
      latex: "E = mc^2",
    });
  });

  it("updates the reader preview from draft input", () => {
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateTitle("新的文章标题");
    draft.updateBody("第一段正文。\n\n第二段正文，用于预览。");

    expect(draft.previewTitle.value).toBe("新的文章标题");
    expect(draft.previewParagraphs.value).toEqual([
      "第一段正文。\n\n第二段正文，用于预览。",
    ]);
    expect(draft.wordCount.value).toBe(14);
  });

  it("debounces body compilation until typing stops", async () => {
    vi.useFakeTimers();
    const compileContent = vi.fn((input: string) => ({
      blocks: [
        {
          type: "text" as const,
          label: "Text",
          content: input,
          inlineNodes: [
            {
              type: "text" as const,
              text: input,
            },
          ],
        },
      ],
      html: `<p>${input}</p>`,
    }));
    const draft = useEditorShowcaseDraft({
      compileContent,
      previewCompileDebounceMs: 160,
    });

    draft.updateBody("第一次输入");
    draft.updateBody("第二次输入");

    expect(compileContent).toHaveBeenCalledTimes(1);
    expect(draft.previewBlocks.value[0]?.content).not.toBe("第二次输入");

    await vi.advanceTimersByTimeAsync(159);
    expect(compileContent).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    expect(compileContent).toHaveBeenCalledTimes(2);
    expect(compileContent).toHaveBeenLastCalledWith("第二次输入");
    expect(draft.previewBlocks.value[0]?.content).toBe("第二次输入");
  });

  it("updates preview when v-model mutates body directly", async () => {
    vi.useFakeTimers();
    const draft = useEditorShowcaseDraft({
      previewCompileDebounceMs: 160,
    });

    draft.body.value = "- [ ] 未完成任务";
    await vi.advanceTimersByTimeAsync(160);

    expect(draft.previewBlocks.value).toMatchObject([
      {
        type: "list",
        label: "Task List",
        ordered: false,
        task: true,
        content: "- [ ] 未完成任务",
        items: [
          {
            checked: false,
            content: "未完成任务",
            inlineNodes: [
              {
                type: "text",
                text: "未完成任务",
              },
            ],
          },
        ],
      },
    ]);

    draft.body.value = "- [x] 未完成任务";
    await vi.advanceTimersByTimeAsync(160);

    expect(draft.previewBlocks.value).toMatchObject([
      {
        type: "list",
        label: "Task List",
        ordered: false,
        task: true,
        content: "- [x] 未完成任务",
        items: [
          {
            checked: true,
            content: "未完成任务",
            inlineNodes: [
              {
                type: "text",
                text: "未完成任务",
              },
            ],
          },
        ],
      },
    ]);
  });

  it("does not compile again when the body content is unchanged", async () => {
    vi.useFakeTimers();
    const compileContent = vi.fn((input: string) => ({
      blocks: [
        {
          type: "text" as const,
          label: "Text",
          content: input,
          inlineNodes: [
            {
              type: "text" as const,
              text: input,
            },
          ],
        },
      ],
      html: `<p>${input}</p>`,
    }));
    const draft = useEditorShowcaseDraft({
      compileContent,
      previewCompileDebounceMs: 160,
    });

    draft.updateBody(draft.body.value);
    await vi.advanceTimersByTimeAsync(160);

    expect(compileContent).toHaveBeenCalledTimes(1);
  });

  it("keeps blank-line-separated plain text in one text block", () => {
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateBody("段落一。\n\n\n段落二仍然是纯文本。");

    expect(draft.previewBlocks.value).toMatchObject([
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
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateBody(
      '段落一。\n\n段落二仍然是纯文本。\n\n```go\nfmt.Println("hi")\n```\n\n段落三。',
    );

    expect(draft.previewBlocks.value).toMatchObject([
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
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateBody("阅读 [ZhiCore](https://example.com/docs) 文档。");

    expect(draft.previewBlocks.value).toMatchObject([
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
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateBody('```ts\nconsole.log("ok")\n```后续正文');

    expect(draft.previewBlocks.value).toMatchObject([
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
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateBody("段落一。");
    draft.applyToolbarAction("code", { start: 4, end: 4 });

    expect(draft.body.value).toBe("段落一。\n\n```ts\n// 在这里输入代码\n```");
    expect(draft.previewBlocks.value).toMatchObject([
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
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateTitle("   ");
    draft.updateBody("");

    expect(draft.previewTitle.value).toBe("未命名草稿");
    expect(draft.previewParagraphs.value).toEqual([
      "正文预览会随输入同步更新。",
    ]);
    expect(draft.wordCount.value).toBe(0);
  });
});
