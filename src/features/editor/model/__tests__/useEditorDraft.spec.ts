import { isReadonly } from "vue";
import { describe, expect, it, vi } from "vitest";

import { editorDraftBodyMaxLength, useEditorDraft } from "../useEditorDraft";
import {
  editorProseMirrorSchema,
  serializeProseMirrorDocToJson,
  type EditorProseMirrorDocumentJson,
} from "../editorProseMirrorEngine";

function bodyDoc(text: string): EditorProseMirrorDocumentJson {
  return serializeProseMirrorDocToJson(
    editorProseMirrorSchema.nodes.doc.create(null, [
      editorProseMirrorSchema.nodes.paragraph.create(
        null,
        text ? editorProseMirrorSchema.text(text) : undefined,
      ),
    ]),
  );
}

function richBodyDoc(): EditorProseMirrorDocumentJson {
  return serializeProseMirrorDocToJson(
    editorProseMirrorSchema.nodes.doc.create(null, [
      editorProseMirrorSchema.nodes.heading.create({ level: 2 }, [
        editorProseMirrorSchema.text("ProseMirror 标题"),
      ]),
      editorProseMirrorSchema.nodes.paragraph.create(null, [
        editorProseMirrorSchema.text("真实加粗", [
          editorProseMirrorSchema.marks.bold.create(),
        ]),
        editorProseMirrorSchema.text(" **普通星号**"),
      ]),
      editorProseMirrorSchema.nodes.list.create(
        { ordered: false, task: true },
        [
          editorProseMirrorSchema.nodes.list_item.create({ checked: true }, [
            editorProseMirrorSchema.text("任务"),
          ]),
        ],
      ),
    ]),
  );
}

describe("useEditorDraft", () => {
  it("starts with an editable title and ProseMirror body document", () => {
    const draft = useEditorDraft();

    expect(draft.title.value).toContain("把复杂系统讲成可以协作的结构");
    expect(draft.body.value).toContain("一篇文章的价值");
    expect(draft.bodyDocumentJson.value).toMatchObject({ type: "doc" });
  });

  it("starts preview from compiled ProseMirror reader blocks instead of markdown-like source text", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });

    expect(draft.readerBlocks.value.slice(0, 4)).toEqual([
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", text: "ProseMirror 编辑器验收稿" }],
      },
      expect.objectContaining({
        type: "paragraph",
      }),
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
    ]);
    expect(JSON.stringify(draft.readerBlocks.value)).not.toContain(
      "# Markdown",
    );
    expect(JSON.stringify(draft.readerBlocks.value)).not.toContain("```go");
  });

  it("maps raw markdown markers into preview and save models", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });

    draft.updateBodyDocument(bodyDoc("**不是加粗**"));

    expect(draft.postBodyWriteInput.value.blocks).toEqual([
      {
        type: "paragraph",
        children: [
          { type: "text", text: "不是加粗", marks: [{ type: "bold" }] },
        ],
      },
    ]);
  });

  it("maps ProseMirror marks and nodes into preview and save models", () => {
    const draft = useEditorDraft({ previewCompileDebounceMs: 0 });

    draft.updateBodyDocument(richBodyDoc(), { start: 1, end: 1 });

    expect(draft.readerBlocks.value).toEqual([
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "ProseMirror 标题" }],
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
            children: [{ type: "text", text: "任务" }],
          },
        ],
      },
    ]);
    expect(draft.postBodyWriteInput.value.blocks).toEqual(
      draft.readerBlocks.value,
    );
  });

  it("rejects oversized ProseMirror body documents", () => {
    const draft = useEditorDraft();
    const previousBody = draft.body.value;
    const oversizedBody = "文".repeat(editorDraftBodyMaxLength + 20);

    draft.updateBodyDocument(bodyDoc(oversizedBody), {
      start: oversizedBody.length,
      end: oversizedBody.length,
    });

    expect(draft.body.value).toBe(previousBody);
  });

  it("exposes title, body text and body document as readonly state", () => {
    const draft = useEditorDraft();

    expect(isReadonly(draft.title)).toBe(true);
    expect(isReadonly(draft.body)).toBe(true);
    expect(isReadonly(draft.bodyDocumentJson)).toBe(true);
  });

  it("undoes and redoes ProseMirror body document updates", () => {
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

  it("tracks dirty state and saves a local PostBody snapshot from ProseMirror", async () => {
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
    expect(draft.serverDraftBaseline.value).toEqual({
      postId: "post-1",
      basePostVersion: 8,
      baseDraftBodyId: "body-2",
      baseDraftBodyHash: "sha256:next",
    });
    expect(draft.hasUnsavedChanges.value).toBe(false);
  });

  it("keeps local ProseMirror input and dirty state when server save fails", async () => {
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
