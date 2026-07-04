import { isReadonly } from "vue";
import { describe, expect, it, vi } from "vitest";

import { editorDraftBodyMaxLength, useEditorDraft } from "../useEditorDraft";
import type { EditorTiptapDocumentJson } from "../editorTiptapEngine";

function bodyDoc(text: string): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
}

function richBodyDoc(): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Tiptap 标题" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "真实加粗", marks: [{ type: "bold" }] },
          { type: "text", text: " **普通星号**" },
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
                content: [{ type: "text", text: "任务" }],
              },
            ],
          },
        ],
      },
    ],
  };
}

function overNestedContainerBodyDoc(): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "blockquote",
        content: [
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "列表项" }],
                  },
                  {
                    type: "blockquote",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "过深引用" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function multiParagraphBodyDoc(paragraphs: string[]): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: paragraphs.map((paragraph) => ({
      type: "paragraph",
      content: paragraph ? [{ type: "text", text: paragraph }] : [],
    })),
  };
}

describe("useEditorDraft", () => {
  it("starts with an editable title and Tiptap body document", () => {
    const draft = useEditorDraft();

    expect(draft.title.value).toContain("把复杂系统讲成可以协作的结构");
    expect(draft.body.value).toContain("一篇文章的价值");
    expect(draft.bodyDocumentJson.value).toMatchObject({ type: "doc" });
  });

  it("starts preview from native Tiptap reader blocks without sample spacer paragraphs", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });
    const inlineHeadingIndex = draft.readerBlocks.value.findIndex(
      (block) =>
        block.type === "heading" &&
        block.children.some((child) => child.text === "Inline"),
    );

    expect(draft.readerBlocks.value.slice(0, 2)).toEqual([
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", text: "Tiptap 编辑器验收稿" }],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "一篇文章的价值不只来自观点，也来自读者能否沿着清晰的段落进入上下文。",
          },
        ],
      },
    ]);
    expect(
      draft.readerBlocks.value.slice(
        inlineHeadingIndex,
        inlineHeadingIndex + 3,
      ),
    ).toEqual([
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "Inline" }],
      },
      {
        type: "paragraph",
        children: expect.arrayContaining([
          {
            type: "text",
            text: "加粗",
            marks: [{ type: "bold" }],
          },
          {
            type: "text",
            text: "inline code",
            marks: [{ type: "inline_code" }],
          },
        ]),
      },
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "Quote" }],
      },
    ]);
    expect(JSON.stringify(draft.readerBlocks.value)).not.toContain(
      "# Markdown",
    );
    expect(JSON.stringify(draft.readerBlocks.value)).not.toContain("```go");
  });

  it("keeps raw markdown markers as plain Tiptap text", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });

    draft.updateBodyDocument(bodyDoc("**不是加粗**"));

    expect(draft.postBodyWriteInput.value.blocks).toEqual([
      {
        type: "paragraph",
        children: [{ type: "text", text: "**不是加粗**" }],
      },
    ]);
  });

  it("maps Tiptap marks and nodes into preview and save models", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });

    draft.updateBodyDocument(richBodyDoc(), { start: 1, end: 1 });

    expect(draft.readerBlocks.value).toEqual([
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "Tiptap 标题" }],
      },
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
      {
        type: "list",
        ordered: false,
        task: true,
        items: [
          {
            checked: true,
            blocks: [
              {
                type: "paragraph",
                children: [{ type: "text", text: "任务" }],
              },
            ],
          },
        ],
      },
    ]);
    expect(draft.postBodyWriteInput.value.blocks).toEqual(
      draft.readerBlocks.value,
    );
  });

  it("preserves empty paragraphs entered between Tiptap body blocks", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });

    draft.updateBodyDocument(multiParagraphBodyDoc(["第一段", "", "第三段"]), {
      start: 5,
      end: 5,
    });

    expect(draft.postBodyWriteInput.value.blocks).toEqual([
      {
        type: "paragraph",
        children: [{ type: "text", text: "第一段" }],
      },
      {
        type: "paragraph",
        children: [],
      },
      {
        type: "paragraph",
        children: [{ type: "text", text: "第三段" }],
      },
    ]);
    expect(draft.readerBlocks.value).toEqual(
      draft.postBodyWriteInput.value.blocks,
    );
  });

  it("rejects oversized Tiptap body documents", () => {
    const draft = useEditorDraft();
    const previousBody = draft.body.value;
    const oversizedBody = "文".repeat(editorDraftBodyMaxLength + 20);

    draft.updateBodyDocument(bodyDoc(oversizedBody), {
      start: oversizedBody.length,
      end: oversizedBody.length,
    });

    expect(draft.body.value).toBe(previousBody);
  });

  it("rejects Tiptap body documents that exceed Content V1 container depth", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });
    const previousBodyDocumentJson = draft.bodyDocumentJson.value;

    draft.updateBodyDocument(overNestedContainerBodyDoc(), {
      start: 1,
      end: 1,
    });

    expect(draft.bodyDocumentJson.value).toBe(previousBodyDocumentJson);
  });

  it("exposes title, body text and body document as readonly state", () => {
    const draft = useEditorDraft();

    expect(isReadonly(draft.title)).toBe(true);
    expect(isReadonly(draft.body)).toBe(true);
    expect(isReadonly(draft.bodyDocumentJson)).toBe(true);
  });

  it("undoes and redoes Tiptap body document updates", () => {
    const draft = useEditorDraft({ historyMergeWindowMs: 0 });
    const initialBody = draft.body.value;

    draft.updateBodyDocument(bodyDoc("撤销正文"), { start: 2, end: 2 });

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

  it("tracks dirty state and saves a local PostBody snapshot from Tiptap", async () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const draft = useEditorDraft({
      now: () => savedAt,
    });

    expect(draft.draftSaveStatus.value).toBe("saved");
    expect(draft.canSaveDraft.value).toBe(false);

    draft.updateTitle("真实编辑器");
    draft.updateBodyDocument(richBodyDoc(), { start: 1, end: 1 });

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
    expect(draft.savedDraftSnapshot.value.localContentHash).toMatch(/^local:/);
    expect(draft.savedDraftSnapshot.value.postBodyWriteInput.blocks[1]).toEqual(
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
    );
  });

  it("saves through the server client without leaking Tiptap JSON", async () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const saveDraftBody = vi.fn().mockResolvedValue({
      postId: "post-1",
      postVersion: 8,
      draftBodyId: "body-2",
      draftBodyHash: "sha256:next",
      savedAt: "2026-07-02T00:00:00Z",
      wordCount: 6,
    });
    const draft = useEditorDraft({
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

    draft.updateBodyDocument(richBodyDoc(), { start: 1, end: 1 });

    await draft.saveDraft();

    expect(saveDraftBody).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        schemaVersion: 1,
        basePostVersion: 7,
        baseDraftBodyId: "body-1",
        baseDraftBodyHash: "sha256:base",
        blocks: draft.postBodyWriteInput.value.blocks,
      }),
    );
    expect(saveDraftBody.mock.calls[0][1]).not.toHaveProperty("type");
    expect(saveDraftBody.mock.calls[0][1]).not.toHaveProperty("content");
    expect(saveDraftBody.mock.calls[0][1]).not.toHaveProperty("selection");
    expect(draft.serverDraftBaseline.value).toEqual({
      postId: "post-1",
      basePostVersion: 8,
      baseDraftBodyId: "body-2",
      baseDraftBodyHash: "sha256:next",
    });
    expect(draft.hasUnsavedChanges.value).toBe(false);
  });

  it("keeps local Tiptap input and dirty state when server save fails", async () => {
    const saveDraftBody = vi.fn().mockRejectedValue(new Error("save failed"));
    const draft = useEditorDraft({
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

    draft.updateBodyDocument(bodyDoc("未保存的服务端正文"), {
      start: 2,
      end: 2,
    });

    await expect(draft.saveDraft()).rejects.toThrow("save failed");

    expect(draft.body.value).toBe("未保存的服务端正文");
    expect(draft.hasUnsavedChanges.value).toBe(true);
    expect(draft.draftSaveStatus.value).toBe("dirty");
    expect(draft.savedDraftSnapshot.value).toBe(previousSnapshot);
  });
});
