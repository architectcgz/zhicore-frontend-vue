import { describe, expect, it } from "vitest";

import type { EditorTiptapDocumentJson } from "../editorTiptapEngine";
import {
  createEditorLocalSavedSnapshot,
  createEditorSavedDraftSnapshot,
  createEditorSourceHash,
  restoreEditorLocalSavedSnapshot,
} from "../editorDraftSnapshot";

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

describe("editorDraftSnapshot", () => {
  it("creates a saved snapshot from the current editor document", () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const documentJson = bodyDoc("快照正文");

    const snapshot = createEditorSavedDraftSnapshot(
      " 快照标题 ",
      documentJson,
      savedAt,
    );

    expect(snapshot).toMatchObject({
      title: "快照标题",
      sourceHash: createEditorSourceHash(" 快照标题 ", documentJson),
      savedAt,
      schemaVersion: 1,
      blockCount: 1,
      postBodyWriteInput: {
        schemaVersion: 1,
        blocks: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "快照正文" }],
          },
        ],
      },
    });
    expect(snapshot.localContentHash).toMatch(/^local:/);
  });

  it("serializes and restores local saved snapshot dates", () => {
    const savedAt = new Date("2026-07-02T00:00:00.000Z");
    const snapshot = createEditorSavedDraftSnapshot(
      "本地标题",
      bodyDoc("本地正文"),
      savedAt,
    );

    const localSnapshot = createEditorLocalSavedSnapshot(snapshot);
    const restoredSnapshot = restoreEditorLocalSavedSnapshot(localSnapshot);

    expect(localSnapshot.savedAt).toBe("2026-07-02T00:00:00.000Z");
    expect(restoredSnapshot?.savedAt).toEqual(savedAt);
  });
});
