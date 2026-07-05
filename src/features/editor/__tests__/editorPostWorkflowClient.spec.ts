import { describe, expect, it, vi } from "vitest";

import { createPost, publishPost, saveDraftBody } from "@/api/post";

import { createEditorPostWorkflowClient } from "../lib/editorPostWorkflowClient";

vi.mock("@/api/post", () => ({
  createPost: vi.fn(),
  saveDraftBody: vi.fn(),
  publishPost: vi.fn(),
}));

describe("editorPostWorkflowClient", () => {
  it("creates an editor draft through the Content create post endpoint", async () => {
    vi.mocked(createPost).mockResolvedValue({
      postId: "post-1",
      postVersion: 1,
    });
    const client = createEditorPostWorkflowClient();

    const baseline = await client.createDraft({
      title: "发布标题",
    });

    expect(createPost).toHaveBeenCalledWith({
      title: "发布标题",
    });
    expect(baseline).toEqual({
      postId: "post-1",
      basePostVersion: 1,
    });
  });

  it("saves only Content body write input plus server baseline fields", async () => {
    vi.mocked(saveDraftBody).mockResolvedValue({
      postId: "post-1",
      postVersion: 2,
      draftBodyId: "body-1",
      draftBodyHash: "sha256:body",
      savedAt: "2026-07-05T00:00:00Z",
      wordCount: 2,
    });
    const client = createEditorPostWorkflowClient();

    await client.saveDraftBody("post-1", {
      schemaVersion: 1,
      blocks: [
        { type: "paragraph", children: [{ type: "text", text: "正文" }] },
      ],
      basePostVersion: 1,
      clientSavedAt: "2026-07-05T00:00:00.000Z",
    });

    expect(saveDraftBody).toHaveBeenCalledWith("post-1", {
      schemaVersion: 1,
      blocks: [
        { type: "paragraph", children: [{ type: "text", text: "正文" }] },
      ],
      basePostVersion: 1,
      clientSavedAt: "2026-07-05T00:00:00.000Z",
    });
  });

  it("publishes with the latest server draft baseline", async () => {
    vi.mocked(publishPost).mockResolvedValue({
      postId: "post-1",
      postVersion: 3,
      publishedAt: "2026-07-05T00:00:00Z",
    });
    const client = createEditorPostWorkflowClient();

    await client.publishDraft({
      postId: "post-1",
      basePostVersion: 2,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:body",
    });

    expect(publishPost).toHaveBeenCalledWith("post-1", {
      basePostVersion: 2,
      draftBodyId: "body-1",
      draftBodyHash: "sha256:body",
    });
  });
});
