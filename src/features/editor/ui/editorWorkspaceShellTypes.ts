import type {
  EditorDraftSaveStatus,
  EditorBackground,
  EditorBackgroundId,
  EditorMode,
  EditorReaderPreviewBlock,
  EditorToolbarAction,
} from "@/features/editor/model";
import type { EditorProseMirrorDocumentJson } from "@/features/editor/model/editorProseMirrorEngine";

export interface EditorWorkspaceShellProps {
  activeMode: EditorMode;
  activeBackgroundId: EditorBackgroundId;
  backgroundCandidates: EditorBackground[];
  title: string;
  bodyDocumentJson: EditorProseMirrorDocumentJson;
  wordCount: number;
  bodyCharacterCount: number;
  bodyMaxLength: number;
  saveStatus: EditorDraftSaveStatus;
  saveStatusLabel: string;
  lastSavedLabel: string;
  saveButtonLabel: string;
  canSaveDraft: boolean;
  canUndo: boolean;
  canRedo: boolean;
  previewTitle: string;
  previewBlocks: EditorReaderPreviewBlock[];
}

export type EditorWorkspaceShellEmits = {
  titleInput: [value: string];
  bodyDocumentInput: [value: EditorProseMirrorDocumentJson];
  undo: [];
  redo: [];
  saveDraft: [];
  toolbarAction: [action: EditorToolbarAction];
  selectMode: [mode: EditorMode];
  selectBackground: [backgroundId: EditorBackgroundId];
  editorScroll: [];
  previewScroll: [];
};
