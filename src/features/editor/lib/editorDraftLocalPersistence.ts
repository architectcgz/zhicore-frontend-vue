import type { PostBodyWriteInput } from "@/entities/post-body";

import type { EditorTiptapDocumentJson } from "../tiptap/editorTiptapEngine";

export interface EditorDraftLocalSavedSnapshot {
  title: string;
  sourceHash: string;
  localContentHash: `local:${string}`;
  savedAt: string;
  schemaVersion: PostBodyWriteInput["schemaVersion"];
  blockCount: number;
  postBodyWriteInput: PostBodyWriteInput;
}

export interface EditorDraftLocalPersistenceState {
  version: 1;
  title: string;
  bodyDocumentJson: EditorTiptapDocumentJson;
  updatedAt: string;
  savedSnapshot?: EditorDraftLocalSavedSnapshot;
}

export const editorDraftLocalStorageKey =
  "zhicore:editor:draft-recovery:v1";

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLocalContentHash(value: unknown): value is `local:${string}` {
  return typeof value === "string" && value.startsWith("local:");
}

function isTiptapDocumentJson(value: unknown): value is EditorTiptapDocumentJson {
  return isPlainRecord(value) && value.type === "doc";
}

function isPostBodyWriteInput(value: unknown): value is PostBodyWriteInput {
  return (
    isPlainRecord(value) &&
    value.schemaVersion === 1 &&
    Array.isArray(value.blocks)
  );
}

function normalizeSavedSnapshot(
  value: unknown,
): EditorDraftLocalSavedSnapshot | undefined {
  if (!isPlainRecord(value)) {
    return undefined;
  }

  if (
    typeof value.title !== "string" ||
    typeof value.sourceHash !== "string" ||
    !isLocalContentHash(value.localContentHash) ||
    typeof value.savedAt !== "string" ||
    typeof value.blockCount !== "number" ||
    !isPostBodyWriteInput(value.postBodyWriteInput)
  ) {
    return undefined;
  }

  return {
    title: value.title,
    sourceHash: value.sourceHash,
    localContentHash: value.localContentHash,
    savedAt: value.savedAt,
    schemaVersion: value.schemaVersion as PostBodyWriteInput["schemaVersion"],
    blockCount: value.blockCount,
    postBodyWriteInput: value.postBodyWriteInput,
  };
}

export function loadEditorDraftLocalPersistence():
  | EditorDraftLocalPersistenceState
  | undefined {
  try {
    const rawState = window.localStorage.getItem(editorDraftLocalStorageKey);

    if (!rawState) {
      return undefined;
    }

    const parsedState = JSON.parse(rawState) as unknown;

    if (
      !isPlainRecord(parsedState) ||
      parsedState.version !== 1 ||
      typeof parsedState.title !== "string" ||
      typeof parsedState.updatedAt !== "string" ||
      !isTiptapDocumentJson(parsedState.bodyDocumentJson)
    ) {
      return undefined;
    }

    return {
      version: 1,
      title: parsedState.title,
      bodyDocumentJson: parsedState.bodyDocumentJson,
      updatedAt: parsedState.updatedAt,
      savedSnapshot: normalizeSavedSnapshot(parsedState.savedSnapshot),
    };
  } catch {
    return undefined;
  }
}

export function persistEditorDraftLocalPersistence(
  state: EditorDraftLocalPersistenceState,
): void {
  try {
    window.localStorage.setItem(
      editorDraftLocalStorageKey,
      JSON.stringify(state),
    );
  } catch {
    // 本地恢复缓存是防关页丢稿的保护层；浏览器禁用或配额满时，不应阻断当前编辑。
  }
}
