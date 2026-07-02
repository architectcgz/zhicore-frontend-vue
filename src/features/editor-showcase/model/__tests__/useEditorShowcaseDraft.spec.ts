import { isReadonly } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  editorDraftBodyMaxLength,
  useEditorShowcaseDraft,
} from "../useEditorShowcaseDraft";

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

  it("limits pasted body source to the editor maximum length", () => {
    const draft = useEditorShowcaseDraft();
    const oversizedBody = "文".repeat(editorDraftBodyMaxLength + 20);

    draft.updateBody(oversizedBody, {
      start: oversizedBody.length,
      end: oversizedBody.length,
    });

    expect(draft.body.value).toHaveLength(editorDraftBodyMaxLength);

    const restoreResult = draft.redoDraft();

    expect(restoreResult).toBeUndefined();
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

  it("exposes title and body as readonly state so writes go through draft actions", () => {
    const draft = useEditorShowcaseDraft();

    expect(isReadonly(draft.title)).toBe(true);
    expect(isReadonly(draft.body)).toBe(true);
  });

  it("updates preview when updateBody mutates body through the draft owner", async () => {
    vi.useFakeTimers();
    const draft = useEditorShowcaseDraft({
      previewCompileDebounceMs: 160,
    });

    draft.updateBody("- [ ] 未完成任务");
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

    draft.updateBody("- [x] 未完成任务");
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

    expect(draft.body.value).toBe("段落一。\n```ts\n// 在这里输入代码\n```");
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

  it("does not apply toolbar actions that would exceed the body source limit", () => {
    const draft = useEditorShowcaseDraft();
    const bodyAtLimit = "文".repeat(editorDraftBodyMaxLength);

    draft.updateBody(bodyAtLimit, {
      start: editorDraftBodyMaxLength,
      end: editorDraftBodyMaxLength,
    });
    const selection = draft.applyToolbarAction("bold", { start: 0, end: 1 });

    expect(draft.body.value).toBe(bodyAtLimit);
    expect(selection).toEqual({ start: 0, end: 1 });
  });

  it("undoes a body update and exposes redo for the restored change", () => {
    const draft = useEditorShowcaseDraft({ historyMergeWindowMs: 0 });
    const initialBody = draft.body.value;

    draft.updateBody("撤销正文", { start: 4, end: 4 });

    expect(draft.canUndo.value).toBe(true);

    const restoreResult = draft.undoDraft();

    expect(draft.body.value).toBe(initialBody);
    expect(draft.canRedo.value).toBe(true);
    expect(restoreResult).toEqual({
      activeField: "body",
      selection: expect.any(Object),
    });

    draft.redoDraft();

    expect(draft.body.value).toBe("撤销正文");
  });

  it("returns the title as the restore target when undoing a title edit", () => {
    const draft = useEditorShowcaseDraft({ historyMergeWindowMs: 0 });
    const initialTitle = draft.title.value;

    draft.updateTitle("撤销标题");

    const restoreResult = draft.undoDraft();

    expect(draft.title.value).toBe(initialTitle);
    expect(restoreResult).toEqual({
      activeField: "title",
    });
  });

  it("keeps toolbar changes as their own undo step", () => {
    const draft = useEditorShowcaseDraft({ historyMergeWindowMs: 0 });

    draft.updateBody("需要加粗", { start: 4, end: 4 });
    draft.applyToolbarAction("bold", { start: 0, end: 4 });

    expect(draft.body.value).toBe("**需要加粗**");

    draft.undoDraft();

    expect(draft.body.value).toBe("需要加粗");
  });

  it("returns to a saved state when undo restores the saved snapshot", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-02T00:00:00.000Z"));
    const draft = useEditorShowcaseDraft({ historyMergeWindowMs: 0 });

    draft.updateBody("已保存正文", { start: 5, end: 5 });
    await draft.saveDraft();

    expect(draft.draftSaveStatus.value).toBe("saved");

    vi.setSystemTime(new Date("2026-07-02T00:00:01.000Z"));
    draft.updateBody("已保存正文之后的新内容", { start: 11, end: 11 });

    expect(draft.draftSaveStatus.value).toBe("dirty");

    draft.undoDraft();

    expect(draft.body.value).toBe("已保存正文");
    expect(draft.hasUnsavedChanges.value).toBe(false);
    expect(draft.draftSaveStatus.value).toBe("saved");
  });

  it("updates the preview synchronously after undo and redo when debounce is disabled", () => {
    const draft = useEditorShowcaseDraft({
      historyMergeWindowMs: 0,
      previewCompileDebounceMs: 0,
    });

    draft.updateBody("普通正文。", { start: 5, end: 5 });
    draft.updateBody("$$E = mc^2$$", { start: 12, end: 12 });

    expect(draft.readerBlocks.value).toContainEqual({
      type: "math",
      latex: "E = mc^2",
    });

    draft.undoDraft();

    expect(draft.readerBlocks.value).not.toContainEqual(
      expect.objectContaining({ type: "math" }),
    );

    draft.redoDraft();

    expect(draft.readerBlocks.value).toContainEqual({
      type: "math",
      latex: "E = mc^2",
    });
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
      blockCount: 2,
    });
    expect(draft.savedDraftSnapshot.value.localContentHash).toMatch(/^local:/);
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

  it("saves through the server client and advances the server draft baseline", async () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const saveDraftBody = vi.fn().mockResolvedValue({
      postId: "post-1",
      postVersion: 8,
      draftBodyId: "body-2",
      draftBodyHash: "sha256:next",
      savedAt: "2026-07-02T00:00:00Z",
      wordCount: 6,
    });
    const draft = useEditorShowcaseDraft({
      previewCompileDebounceMs: 0,
      now: () => savedAt,
      serverDraftBaseline: {
        postId: "post-1",
        basePostVersion: 7,
        baseDraftBodyId: "body-1",
        baseDraftBodyHash: "sha256:base",
      },
      serverSaveClient: {
        saveDraftBody,
      },
    });

    draft.updateBody("## 新正文");

    await draft.saveDraft();

    expect(saveDraftBody).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        schemaVersion: 1,
        basePostVersion: 7,
        baseDraftBodyId: "body-1",
        baseDraftBodyHash: "sha256:base",
      }),
    );
    expect(draft.serverDraftBaseline.value).toEqual({
      postId: "post-1",
      basePostVersion: 8,
      baseDraftBodyId: "body-2",
      baseDraftBodyHash: "sha256:next",
    });
    expect(draft.hasUnsavedChanges.value).toBe(false);
  });

  it("does not send a local content hash as the server draft base hash", async () => {
    const saveDraftBody = vi.fn().mockResolvedValue({
      postId: "post-1",
      postVersion: 8,
      draftBodyId: "body-2",
      draftBodyHash: "sha256:next",
      savedAt: "2026-07-02T00:00:00Z",
      wordCount: 6,
    });
    const draft = useEditorShowcaseDraft({
      previewCompileDebounceMs: 0,
      serverDraftBaseline: {
        postId: "post-1",
        basePostVersion: 7,
        baseDraftBodyId: "body-1",
      },
      serverSaveClient: {
        saveDraftBody,
      },
    });

    expect(draft.savedDraftSnapshot.value.localContentHash).toMatch(/^local:/);

    draft.updateBody("服务端保存正文");

    await draft.saveDraft();

    expect(saveDraftBody).toHaveBeenCalledWith(
      "post-1",
      expect.not.objectContaining({
        baseDraftBodyHash: expect.stringMatching(/^local:/),
      }),
    );
  });

  it("keeps local input and dirty state when server save fails", async () => {
    const error = new Error("save failed");
    const saveDraftBody = vi.fn().mockRejectedValue(error);
    const draft = useEditorShowcaseDraft({
      previewCompileDebounceMs: 0,
      serverDraftBaseline: {
        postId: "post-1",
        basePostVersion: 7,
        baseDraftBodyId: "body-1",
        baseDraftBodyHash: "sha256:base",
      },
      serverSaveClient: {
        saveDraftBody,
      },
    });
    const previousSnapshot = draft.savedDraftSnapshot.value;

    draft.updateBody("未保存的服务端正文");

    await expect(draft.saveDraft()).rejects.toThrow("save failed");

    expect(draft.body.value).toBe("未保存的服务端正文");
    expect(draft.hasUnsavedChanges.value).toBe(true);
    expect(draft.draftSaveStatus.value).toBe("dirty");
    expect(draft.savedDraftSnapshot.value).toBe(previousSnapshot);
    expect(draft.serverDraftBaseline.value).toEqual({
      postId: "post-1",
      basePostVersion: 7,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:base",
    });
  });
});
