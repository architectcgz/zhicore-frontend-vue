import type { EditorTiptapDocumentJson } from "../tiptap/editorTiptapEngine";
import {
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
} from "../tiptap/editorTiptapEngine";
import {
  loadEditorDraftLocalPersistence,
  persistEditorDraftLocalPersistence,
} from "./editorDraftLocalPersistence";
import {
  createEditorLocalSavedSnapshot,
  restoreEditorLocalSavedSnapshot,
  type EditorSavedDraftSnapshot,
} from "./editorDraftSnapshot";
import type { EditorServerDraftBaseline } from "./editorDraftSavePayload";

export interface EditorRestoredLocalDraft {
  title: string;
  bodyDocumentJson: EditorTiptapDocumentJson;
  savedSnapshot?: EditorSavedDraftSnapshot;
  serverDraftBaseline?: EditorServerDraftBaseline;
}

export interface PersistEditorCurrentDraftInput {
  title: string;
  bodyDocumentJson: EditorTiptapDocumentJson;
  savedSnapshot: EditorSavedDraftSnapshot;
  serverDraftBaseline?: EditorServerDraftBaseline;
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
    serverDraftBaseline: localDraft.serverDraftBaseline,
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
    serverDraftBaseline: input.serverDraftBaseline,
  });
}
