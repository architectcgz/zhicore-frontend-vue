import { computed, ref } from "vue";
import { describe, expect, it, vi } from "vitest";

import type { PostBodyWriteInput } from "@/entities/post-body";

import type { EditorSavedDraftSnapshot } from "../lib/editorDraftSnapshot";
import { useEditorDraftSaveWorkflow } from "../composables/useEditorDraftSaveWorkflow";

const writeInput: PostBodyWriteInput = {
  schemaVersion: 1,
  blocks: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "保存正文" }],
    },
  ],
};

function createSavedSnapshot(savedAt: Date): EditorSavedDraftSnapshot {
  return {
    title: "保存标题",
    sourceHash: `source:${savedAt.toISOString()}`,
    localContentHash: "local:saved",
    savedAt,
    schemaVersion: 1,
    blockCount: 1,
    postBodyWriteInput: writeInput,
  };
}

describe("useEditorDraftSaveWorkflow", () => {
  it("saves a local draft snapshot and clears the saving state", async () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const hasUnsavedChanges = ref(true);
    const savedDraftSnapshot = ref(createSavedSnapshot(new Date(0)));
    const persistCurrentDraftToLocal = vi.fn();
    const workflow = useEditorDraftSaveWorkflow({
      now: () => savedAt,
      hasUnsavedChanges: computed(() => hasUnsavedChanges.value),
      getPostBodyWriteInput: () => writeInput,
      createSavedDraftSnapshot: createSavedSnapshot,
      savedDraftSnapshot,
      persistCurrentDraftToLocal,
      compilePreviewNow: vi.fn(),
    });

    const saving = workflow.saveDraft();

    expect(workflow.draftSaveStatus.value).toBe("saving");

    await saving;

    expect(savedDraftSnapshot.value.savedAt).toEqual(savedAt);
    expect(persistCurrentDraftToLocal).toHaveBeenCalledWith(
      savedDraftSnapshot.value,
    );
    expect(workflow.draftSaveStatus.value).toBe("dirty");
  });

  it("updates the server draft baseline after a server save", async () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const savedDraftSnapshot = ref(createSavedSnapshot(new Date(0)));
    const saveDraftBody = vi.fn().mockResolvedValue({
      postId: "post-1",
      postVersion: 8,
      draftBodyId: "body-2",
      draftBodyHash: "sha256:next",
      savedAt: "2026-07-02T00:00:00.000Z",
      wordCount: 2,
    });
    const workflow = useEditorDraftSaveWorkflow({
      now: () => savedAt,
      hasUnsavedChanges: computed(() => true),
      getPostBodyWriteInput: () => writeInput,
      createSavedDraftSnapshot: createSavedSnapshot,
      savedDraftSnapshot,
      persistCurrentDraftToLocal: vi.fn(),
      compilePreviewNow: vi.fn(),
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

    await workflow.saveDraft();

    expect(saveDraftBody).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        basePostVersion: 7,
        baseDraftBodyHash: "sha256:base",
        blocks: writeInput.blocks,
      }),
    );
    expect(workflow.serverDraftBaseline.value).toEqual({
      postId: "post-1",
      basePostVersion: 8,
      baseDraftBodyId: "body-2",
      baseDraftBodyHash: "sha256:next",
    });
  });

  it("creates a server draft before saving when no server baseline exists", async () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const savedDraftSnapshot = ref(createSavedSnapshot(new Date(0)));
    const createDraft = vi.fn().mockResolvedValue({
      postId: "post-1",
      basePostVersion: 1,
    });
    const saveDraftBody = vi.fn().mockResolvedValue({
      postId: "post-1",
      postVersion: 2,
      draftBodyId: "body-1",
      draftBodyHash: "sha256:body",
      savedAt: "2026-07-02T00:00:00.000Z",
      wordCount: 2,
    });
    const workflow = useEditorDraftSaveWorkflow({
      now: () => savedAt,
      hasUnsavedChanges: computed(() => true),
      getDraftTitle: () => "首次服务端草稿",
      getPostBodyWriteInput: () => writeInput,
      createSavedDraftSnapshot: createSavedSnapshot,
      savedDraftSnapshot,
      persistCurrentDraftToLocal: vi.fn(),
      compilePreviewNow: vi.fn(),
      serverPostClient: {
        createDraft,
        saveDraftBody,
        publishDraft: vi.fn(),
      },
    });

    await workflow.saveDraft();

    expect(createDraft).toHaveBeenCalledWith({
      title: "首次服务端草稿",
    });
    expect(saveDraftBody).toHaveBeenCalledWith(
      "post-1",
      expect.objectContaining({
        basePostVersion: 1,
        blocks: writeInput.blocks,
      }),
    );
    expect(workflow.serverDraftBaseline.value).toEqual({
      postId: "post-1",
      basePostVersion: 2,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:body",
    });
  });

  it("keeps the created server draft baseline when the first body save fails", async () => {
    const savedDraftSnapshot = ref(createSavedSnapshot(new Date(0)));
    const createDraft = vi.fn().mockResolvedValue({
      postId: "post-1",
      basePostVersion: 1,
    });
    const saveDraftBody = vi
      .fn()
      .mockRejectedValueOnce(new Error("save failed"))
      .mockResolvedValue({
        postId: "post-1",
        postVersion: 2,
        draftBodyId: "body-1",
        draftBodyHash: "sha256:body",
        savedAt: "2026-07-02T00:00:00.000Z",
        wordCount: 2,
      });
    const workflow = useEditorDraftSaveWorkflow({
      now: () => new Date("2026-07-02T00:00:00.000Z"),
      hasUnsavedChanges: computed(() => true),
      getDraftTitle: () => "首次服务端草稿",
      getPostBodyWriteInput: () => writeInput,
      createSavedDraftSnapshot: createSavedSnapshot,
      savedDraftSnapshot,
      persistCurrentDraftToLocal: vi.fn(),
      compilePreviewNow: vi.fn(),
      serverPostClient: {
        createDraft,
        saveDraftBody,
        publishDraft: vi.fn(),
      },
    });

    await expect(workflow.saveDraft()).rejects.toThrow("save failed");

    expect(workflow.serverDraftBaseline.value).toEqual({
      postId: "post-1",
      basePostVersion: 1,
    });

    await workflow.saveDraft();

    expect(createDraft).toHaveBeenCalledTimes(1);
    expect(saveDraftBody).toHaveBeenLastCalledWith(
      "post-1",
      expect.objectContaining({ basePostVersion: 1 }),
    );
  });

  it("keeps the previous saved snapshot when server save fails", async () => {
    const previousSnapshot = createSavedSnapshot(new Date(0));
    const savedDraftSnapshot = ref(previousSnapshot);
    const persistCurrentDraftToLocal = vi.fn();
    const workflow = useEditorDraftSaveWorkflow({
      now: () => new Date("2026-07-02T00:00:00.000Z"),
      hasUnsavedChanges: computed(() => true),
      getPostBodyWriteInput: () => writeInput,
      createSavedDraftSnapshot: createSavedSnapshot,
      savedDraftSnapshot,
      persistCurrentDraftToLocal,
      compilePreviewNow: vi.fn(),
      serverDraftBaseline: {
        postId: "post-1",
        basePostVersion: 7,
      },
      serverSaveClient: {
        saveDraftBody: vi.fn().mockRejectedValue(new Error("save failed")),
      },
    });

    await expect(workflow.saveDraft()).rejects.toThrow("save failed");

    expect(savedDraftSnapshot.value).toStrictEqual(previousSnapshot);
    expect(persistCurrentDraftToLocal).not.toHaveBeenCalled();
    expect(workflow.draftSaveStatus.value).toBe("dirty");
  });
});
