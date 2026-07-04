import type { EditorTiptapDocumentJson } from "./editorTiptapEngine";
import {
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
} from "./editorTiptapEngine";
import {
  loadEditorDraftLocalPersistence,
  persistEditorDraftLocalPersistence,
} from "./editorDraftLocalPersistence";
import {
  createEditorLocalSavedSnapshot,
  restoreEditorLocalSavedSnapshot,
  type EditorSavedDraftSnapshot,
} from "./editorDraftSnapshot";

export interface EditorRestoredLocalDraft {
  title: string;
  bodyDocumentJson: EditorTiptapDocumentJson;
  savedSnapshot?: EditorSavedDraftSnapshot;
}

export interface PersistEditorCurrentDraftInput {
  title: string;
  bodyDocumentJson: EditorTiptapDocumentJson;
  savedSnapshot: EditorSavedDraftSnapshot;
  updatedAt: Date;
}

export function loadRestoredEditorLocalDraft(
  bodyMaxLength: number,
): EditorRestoredLocalDraft | undefined {
  const localDraft = loadEditorDraftLocalPersistence();

  if (!localDraft) {
    return undefined;
  }

  if (getTiptapPlainText(localDraft.bodyDocumentJson).length > bodyMaxLength) {
    return undefined;
  }

  try {
    mapTiptapJsonToPostBodyWriteInput(localDraft.bodyDocumentJson);
  } catch {
    return undefined;
  }

  return {
    title: localDraft.title,
    bodyDocumentJson: localDraft.bodyDocumentJson,
    savedSnapshot: restoreEditorLocalSavedSnapshot(localDraft.savedSnapshot),
  };
}

export function persistEditorCurrentDraftToLocal(
  input: PersistEditorCurrentDraftInput,
): void {
  persistEditorDraftLocalPersistence({
    version: 1,
    title: input.title,
    bodyDocumentJson: input.bodyDocumentJson,
    updatedAt: input.updatedAt.toISOString(),
    savedSnapshot: createEditorLocalSavedSnapshot(input.savedSnapshot),
  });
}
