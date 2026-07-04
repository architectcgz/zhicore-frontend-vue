<template>
  <div class="editor-desktop-stage">
    <EditorWritingPane
      ref="writingPaneRef"
      :active-mode="activeMode"
      :active-background-id="activeBackgroundId"
      :background-candidates="backgroundCandidates"
      :title="title"
      :body-document-json="bodyDocumentJson"
      :word-count="wordCount"
      :body-character-count="bodyCharacterCount"
      :body-max-length="bodyMaxLength"
      :save-status="saveStatus"
      :save-status-label="saveStatusLabel"
      :last-saved-label="lastSavedLabel"
      :save-button-label="saveButtonLabel"
      :can-save-draft="canSaveDraft"
      :can-undo="canUndo"
      :can-redo="canRedo"
      @title-input="emit('titleInput', $event)"
      @body-document-input="emit('bodyDocumentInput', $event)"
      @undo="emit('undo')"
      @redo="emit('redo')"
      @save-draft="emit('saveDraft')"
      @toolbar-action="emit('toolbarAction', $event)"
      @select-mode="emit('selectMode', $event)"
      @select-background="emit('selectBackground', $event)"
      @scroll="emit('editorScroll')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import EditorWritingPane from "@/components/editor/EditorWritingPane.vue";
import type {
  EditorWorkspaceWritingPaneRef,
  EditorTextSelection,
  EditorToolbarAction,
} from "@/features/editor";

import type {
  EditorWorkspaceShellEmits,
  EditorWorkspaceShellProps,
} from "./editorWorkspaceShellTypes";

defineProps<EditorWorkspaceShellProps>();
const emit = defineEmits<EditorWorkspaceShellEmits>();

const writingPaneRef = ref<EditorWorkspaceWritingPaneRef | null>(null);

defineExpose({
  get bodyInputElement() {
    return writingPaneRef.value?.bodyInputElement ?? null;
  },
  get writingEditorElement() {
    return writingPaneRef.value?.writingEditorElement ?? null;
  },
  get readerPreviewElement() {
    return null;
  },
  focusBody() {
    writingPaneRef.value?.focusBody();
  },
  getBodySelection() {
    return writingPaneRef.value?.getBodySelection();
  },
  setBodySelection(selection: EditorTextSelection) {
    writingPaneRef.value?.setBodySelection(selection);
  },
  applyBodyToolbarAction(action: EditorToolbarAction) {
    writingPaneRef.value?.applyBodyToolbarAction(action);
  },
});
</script>

<style scoped>
.editor-desktop-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  width: min(920px, 100%);
  min-height: 660px;
  margin-inline: auto;
}
</style>
