<template>
  <section class="editor-mobile-workspace" aria-label="移动端编辑器">
    <div class="editor-mobile-workspace__bar">
      <div
        class="editor-mobile-workspace__mode-switch"
        aria-label="移动端编辑器视图"
      >
        <button
          type="button"
          :aria-pressed="activeMode === 'focus'"
          @click="emit('selectMode', 'focus')"
        >
          写作
        </button>
        <button
          type="button"
          :aria-pressed="activeMode === 'preview'"
          @click="emit('selectMode', 'preview')"
        >
          预览
        </button>
      </div>
      <p>{{ saveStatusLabel }} · {{ wordCount }} 字</p>
    </div>

    <EditorWritingPane
      v-if="activeMode === 'focus'"
      ref="writingPaneRef"
      :active-mode="activeMode"
      :active-background-id="activeBackgroundId"
      :background-candidates="backgroundCandidates"
      :title="title"
      :body="body"
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
      @body-input="emit('bodyInput', $event)"
      @undo="emit('undo')"
      @redo="emit('redo')"
      @save-draft="emit('saveDraft')"
      @toolbar-action="emit('toolbarAction', $event)"
      @select-mode="emit('selectMode', $event)"
      @select-background="emit('selectBackground', $event)"
      @scroll="emit('editorScroll')"
    />

    <EditorPreviewPane
      v-else
      ref="previewPaneRef"
      class="editor-mobile-workspace__preview"
      :preview-title="previewTitle"
      :preview-blocks="previewBlocks"
      :word-count="wordCount"
      @scroll="emit('previewScroll')"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

import EditorPreviewPane from "@/components/editor-showcase/EditorPreviewPane.vue";
import EditorWritingPane from "@/components/editor-showcase/EditorWritingPane.vue";
import type {
  EditorShowcaseTextSelection,
  EditorWorkspacePreviewPaneRef,
  EditorWorkspaceWritingPaneRef,
} from "@/features/editor-showcase/model";

import type {
  EditorWorkspaceShellEmits,
  EditorWorkspaceShellProps,
} from "./editorWorkspaceShellTypes";

defineProps<EditorWorkspaceShellProps>();
const emit = defineEmits<EditorWorkspaceShellEmits>();

const writingPaneRef = ref<EditorWorkspaceWritingPaneRef | null>(null);
const previewPaneRef = ref<EditorWorkspacePreviewPaneRef | null>(null);

defineExpose({
  get bodyInputElement() {
    return writingPaneRef.value?.bodyInputElement ?? null;
  },
  get writingEditorElement() {
    return writingPaneRef.value?.writingEditorElement ?? null;
  },
  get readerPreviewElement() {
    return previewPaneRef.value?.readerPreviewElement ?? null;
  },
  focusBody() {
    writingPaneRef.value?.focusBody();
  },
  getBodySelection() {
    return writingPaneRef.value?.getBodySelection();
  },
  setBodySelection(selection: EditorShowcaseTextSelection) {
    writingPaneRef.value?.setBodySelection(selection);
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

.editor-mobile-workspace__mode-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
}

.editor-mobile-workspace__mode-switch button {
  min-height: 40px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--editor-page-muted, #405466);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.editor-mobile-workspace__mode-switch button[aria-pressed="true"] {
  border-color: var(--editor-page-border, rgba(49, 74, 91, 0.14));
  background: var(--editor-control-hover-bg, rgba(31, 127, 116, 0.1));
  color: var(--editor-page-text, #17202a);
}

.editor-mobile-workspace__mode-switch button:focus-visible {
  outline: 2px solid var(--editor-page-accent, #1f7f74);
  outline-offset: 2px;
}

.editor-mobile-workspace__preview {
  min-height: calc(100dvh - 156px);
}
</style>
