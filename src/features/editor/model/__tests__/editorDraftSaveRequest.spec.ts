import { describe, expect, it } from "vitest";

import type { PostBodyWriteInput } from "@/entities/post-body";

import { createEditorDraftSaveRequest } from "../editorDraftSaveRequest";

const writeInput: PostBodyWriteInput = {
  schemaVersion: 1,
  blocks: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "保存正文" }],
    },
  ],
};

describe("editorDraftSaveRequest", () => {
  it("keeps server draft hash in the save request baseline", () => {
    const request = createEditorDraftSaveRequest(
      {
        postId: "post-1",
        basePostVersion: 7,
        baseDraftBodyId: "body-1",
        baseDraftBodyHash: "sha256:base",
      },
      writeInput,
      new Date("2026-07-02T00:00:00.000Z"),
    );

    expect(request).toMatchObject({
      schemaVersion: 1,
      blocks: writeInput.blocks,
      basePostVersion: 7,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:base",
      clientSavedAt: "2026-07-02T00:00:00.000Z",
    });
  });

  it("does not send local content hash as a server draft hash", () => {
    const request = createEditorDraftSaveRequest(
      {
        postId: "post-1",
        basePostVersion: 7,
        baseDraftBodyHash: "local:front-end-only",
      },
      writeInput,
      new Date("2026-07-02T00:00:00.000Z"),
    );

    expect(request).not.toHaveProperty("baseDraftBodyHash");
  });
});
