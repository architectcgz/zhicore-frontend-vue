<template>
  <section class="editor-mobile-workspace" aria-label="移动端编辑器">
    <div class="editor-mobile-workspace__bar">
      <p>{{ saveStatusLabel }} · {{ wordCount }} 字</p>
    </div>

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
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

import EditorWritingPane from "@/components/editor/EditorWritingPane.vue";
import type {
  EditorTextSelection,
  EditorToolbarAction,
  EditorWorkspaceWritingPaneRef,
} from "@/features/editor/model";

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
.editor-mobile-workspace {
  display: grid;
  gap: 10px;
}

.editor-mobile-workspace__bar {
  position: sticky;
  top: 8px;
  z-index: 4;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 8px;
  background: var(--editor-control-bg-active, #ffffff);
}

.editor-mobile-workspace__bar p {
  margin: 0;
  color: var(--editor-page-muted, #647280);
  font-size: 12px;
  line-height: 1.4;
}
</style>
