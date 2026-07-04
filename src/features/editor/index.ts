export { default as EditorWorkspace } from "./ui/EditorWorkspace.vue";

export {
  editorCodeBlockLanguageOptions,
  normalizeEditorCodeBlockLanguage,
  serializeEditorCodeBlockLanguage,
} from "./config/editorCodeBlockLanguages";
export type { EditorCodeBlockLanguage } from "./config/editorCodeBlockLanguages";
export { editorToolbarGroups } from "./config/editorToolbar";
export {
  createEditorDebugLogger,
  createEditorLogger,
  isEditorDebugMode,
} from "./lib/editorDebug";
export type {
  EditorDebugLogger,
  EditorDebugNamespace,
  EditorLoggerNamespace,
} from "./lib/editorDebug";
export type { EditorPreviewReaderBlock } from "./lib/editorPreviewTypes";
export { getSyncedScrollTop } from "./lib/editorScrollSync";
export type { SyncedScrollInput } from "./lib/editorScrollSync";
export type {
  EditorTextSelection,
  EditorToolbarAction,
} from "./lib/editorToolbarTypes";
export {
  editorDraftBodyMaxLength,
  useEditorDraft,
} from "./composables/useEditorDraft";
export type {
  EditorDraftBlock,
  EditorDraftBlockType,
  EditorDraftSaveStatus,
  EditorDraftServerSaveClient,
  EditorInlineNode,
  EditorReaderPreviewBlock,
  EditorSavedDraftSnapshot,
  EditorServerDraftBaseline,
  UseEditorDraftOptions,
} from "./composables/useEditorDraft";
export { useEditorDisplay } from "./composables/useEditorDisplay";
export type {
  EditorBackground,
  EditorBackgroundId,
  EditorMode,
} from "./composables/useEditorDisplay";
export { useEditorPreviewScrollSync } from "./composables/useEditorPreviewScrollSync";
export type { UseEditorPreviewScrollSyncOptions } from "./composables/useEditorPreviewScrollSync";
export { useEditorWorkspaceController } from "./composables/useEditorWorkspaceController";
export type {
  EditorWorkspacePreviewPaneRef,
  EditorWorkspaceShellRef,
  EditorWorkspaceWritingPaneRef,
} from "./composables/useEditorWorkspaceController";
export {
  createDefaultEditorDocumentJson,
  EditorPostBodyMappingError,
  editorPostBodyMaxContainerDepth,
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
  mapTiptapJsonToPreviewReaderBlocks,
} from "./tiptap/editorTiptapEngine";
export type {
  EditorTiptapDocumentJson,
  EditorTiptapSelection,
} from "./tiptap/editorTiptapEngine";
export {
  createEditorTiptapContractGuardExtension,
  createEditorTiptapExtensions,
  EditorTiptapExternalEmbed,
  EditorTiptapMathBlock,
} from "./tiptap/editorTiptapExtensions";
export { applyTiptapToolbarAction } from "./tiptap/editorTiptapToolbarCommands";
