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
            type: "text",
            text: "ZhiCore",
            marks: [{ type: "link", href: "https://example.com/docs" }],
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

  it("builds reader preview blocks with source anchors after blank-line spacer blocks", () => {
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateBody(
      [
        "```go",
        "fmt.Println(1)",
        "```",
        "",
        "",
        "| A | B |",
        "| --- | --- |",
        "| 1 | 2 |",
      ].join("\n"),
    );

    expect(
      draft.readerPreviewBlocks.value.map((previewBlock) => ({
        type: previewBlock.block.type,
        readerBlockIndex: previewBlock.readerBlockIndex,
        sourceRange: previewBlock.sourceRange,
      })),
    ).toEqual([
      {
        type: "code_block",
        readerBlockIndex: 0,
        sourceRange: {
          startLine: 0,
          endLine: 2,
        },
      },
      {
        type: "paragraph",
        readerBlockIndex: 1,
        sourceRange: undefined,
      },
      {
        type: "table",
        readerBlockIndex: 2,
        sourceRange: {
          startLine: 5,
          endLine: 7,
        },
      },
    ]);
    expect(draft.previewBlockAnchors.value).toEqual([
      {
        readerBlockIndex: 0,
        sourceRange: {
          startLine: 0,
          endLine: 2,
        },
      },
      {
        readerBlockIndex: 2,
        sourceRange: {
          startLine: 5,
          endLine: 7,
        },
      },
    ]);
  });

  it("reuses reader preview block keys when unchanged blocks move after an insertion", () => {
    const draft = useEditorShowcaseDraft({ previewCompileDebounceMs: 0 });

    draft.updateBody(
      [
        "```ts",
        "console.log('first')",
        "```",
        "",
        "```go",
        'fmt.Println("second")',
        "```",
      ].join("\n"),
    );
    const initialKeys = draft.readerPreviewBlocks.value
      .filter((previewBlock) => previewBlock.block.type === "code_block")
      .map(
        (previewBlock) => (previewBlock as { stableKey?: string }).stableKey,
      );

    draft.updateBody(
      [
        "```md",
        "inserted",
        "```",
        "",
        "```ts",
        "console.log('first')",
        "```",
        "",
        "```go",
        'fmt.Println("second")',
        "```",
      ].join("\n"),
    );
    const movedKeys = draft.readerPreviewBlocks.value
      .filter((previewBlock) => previewBlock.block.type === "code_block")
      .map(
        (previewBlock) => (previewBlock as { stableKey?: string }).stableKey,
      );

    expect(initialKeys).toHaveLength(2);
    expect(movedKeys).toHaveLength(3);
    expect(initialKeys.every((key) => typeof key === "string" && key)).toBe(
      true,
    );
    expect(movedKeys.every((key) => typeof key === "string" && key)).toBe(true);
    expect(movedKeys.slice(1)).toEqual(initialKeys);
  });

  it("tracks dirty state and saves a local PostBody snapshot", async () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const draft = useEditorShowcaseDraft({
      previewCompileDebounceMs: 0,
      now: () => savedAt,
    });

    expect(draft.draftSaveStatus.value).toBe("saved");
    expect(draft.canSaveDraft.value).toBe(false);

    draft.updateTitle("真实编辑器");
    draft.updateBody("## 开始\n\n保存正文。");

    expect(draft.draftSaveStatus.value).toBe("dirty");
    expect(draft.canSaveDraft.value).toBe(true);

    const saving = draft.saveDraft();

    expect(draft.draftSaveStatus.value).toBe("saving");

    await saving;

    expect(draft.draftSaveStatus.value).toBe("saved");
    expect(draft.canSaveDraft.value).toBe(false);
    expect(draft.savedDraftSnapshot.value).toMatchObject({
      title: "真实编辑器",
      savedAt,
      schemaVersion: 1,
      blockCount: 3,
    });
    expect(draft.savedDraftSnapshot.value.contentHash).toMatch(/^local:/);
    expect(
      draft.savedDraftSnapshot.value.postBodyWriteInput.blocks[0],
    ).toMatchObject({
      type: "heading",
      level: 2,
    });
    expect(
      draft.savedDraftSnapshot.value.postBodyWriteInput.blocks.at(-1),
    ).toMatchObject({
      type: "paragraph",
    });
  });
});
