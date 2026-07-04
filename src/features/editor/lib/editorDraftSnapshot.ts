import type { PostBodyWriteInput } from "@/entities/post-body";

import type { EditorDraftLocalSavedSnapshot } from "./editorDraftLocalPersistence";
import {
  mapTiptapJsonToPostBodyWriteInput,
  type EditorTiptapDocumentJson,
} from "../tiptap/editorTiptapEngine";

export interface EditorSavedDraftSnapshot {
  title: string;
  sourceHash: string;
  localContentHash: `local:${string}`;
  savedAt: Date;
  schemaVersion: PostBodyWriteInput["schemaVersion"];
  blockCount: number;
  postBodyWriteInput: PostBodyWriteInput;
}

function createContentHash(content: string): string {
  let hash = 2166136261;

  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash.toString(36);
}

export function createEditorSourceHash(
  title: string,
  bodyDocumentJson: EditorTiptapDocumentJson,
): string {
  return createContentHash(`${title}\u0000${JSON.stringify(bodyDocumentJson)}`);
}

export function createEditorSavedDraftSnapshot(
  title: string,
  bodyDocumentJson: EditorTiptapDocumentJson,
  savedAt: Date,
): EditorSavedDraftSnapshot {
  const writeInput = mapTiptapJsonToPostBodyWriteInput(bodyDocumentJson);
  const contentHash = createContentHash(JSON.stringify(writeInput));

  return {
    title: title.trim() || "未命名草稿",
    sourceHash: createEditorSourceHash(title, bodyDocumentJson),
    localContentHash: `local:${contentHash}`,
    savedAt,
    schemaVersion: writeInput.schemaVersion,
    blockCount: writeInput.blocks.length,
    postBodyWriteInput: writeInput,
  };
}

export function createEditorLocalSavedSnapshot(
  snapshot: EditorSavedDraftSnapshot,
): EditorDraftLocalSavedSnapshot {
  return {
    ...snapshot,
    savedAt: snapshot.savedAt.toISOString(),
  };
}

export function restoreEditorLocalSavedSnapshot(
  snapshot: EditorDraftLocalSavedSnapshot | undefined,
): EditorSavedDraftSnapshot | undefined {
  if (!snapshot) {
    return undefined;
  }

  const savedAt = new Date(snapshot.savedAt);

  if (Number.isNaN(savedAt.getTime())) {
    return undefined;
  }

  return {
    ...snapshot,
    savedAt,
  };
}
