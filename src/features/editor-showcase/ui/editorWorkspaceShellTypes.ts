import type {
  EditorDraftSaveStatus,
  EditorShowcaseBackground,
  EditorShowcaseBackgroundId,
  EditorShowcaseMode,
  EditorShowcaseReaderPreviewBlock,
  EditorShowcaseToolbarAction,
} from "@/features/editor-showcase/model";

export interface EditorWorkspaceShellProps {
  activeMode: EditorShowcaseMode;
  activeBackgroundId: EditorShowcaseBackgroundId;
  backgroundCandidates: EditorShowcaseBackground[];
  title: string;
  body: string;
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
  previewBlocks: EditorShowcaseReaderPreviewBlock[];
}

export type EditorWorkspaceShellEmits = {
  titleInput: [value: string];
  bodyInput: [value: string];
  undo: [];
  redo: [];
  saveDraft: [];
  toolbarAction: [action: EditorShowcaseToolbarAction];
  selectMode: [mode: EditorShowcaseMode];
  selectBackground: [backgroundId: EditorShowcaseBackgroundId];
  editorScroll: [];
  previewScroll: [];
};
