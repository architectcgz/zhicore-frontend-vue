<template>
  <div
    class="editor-desktop-stage"
    :class="{
      'editor-desktop-stage--focus': !isPreviewMode,
      'editor-desktop-stage--preview': isPreviewMode,
    }"
  >
    <EditorWritingPane
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

    <div class="editor-desktop-stage__preview-shell">
      <EditorPreviewPane
        ref="previewPaneRef"
        :preview-title="previewTitle"
        :preview-blocks="previewBlocks"
        :word-count="wordCount"
        @scroll="emit('previewScroll')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import EditorPreviewPane from "@/components/editor-showcase/EditorPreviewPane.vue";
import EditorWritingPane from "@/components/editor-showcase/EditorWritingPane.vue";
import type {
  EditorWorkspacePreviewPaneRef,
  EditorWorkspaceWritingPaneRef,
  EditorShowcaseTextSelection,
} from "@/features/editor-showcase/model";

import type {
  EditorWorkspaceShellEmits,
  EditorWorkspaceShellProps,
} from "./editorWorkspaceShellTypes";

const props = defineProps<EditorWorkspaceShellProps>();
const emit = defineEmits<EditorWorkspaceShellEmits>();

const writingPaneRef = ref<EditorWorkspaceWritingPaneRef | null>(null);
const previewPaneRef = ref<EditorWorkspacePreviewPaneRef | null>(null);
const isPreviewMode = computed(() => props.activeMode === "preview");

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
.editor-desktop-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0fr);
  gap: 0;
  align-items: stretch;
  min-height: 660px;
  transition:
    gap 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    grid-template-columns 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.editor-desktop-stage--preview {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.42fr);
  gap: 12px;
}

.editor-desktop-stage__preview-shell {
  min-width: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transform: translateX(18px) scale(0.985);
  transform-origin: right center;
  visibility: hidden;
  transition:
    opacity 0.18s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 0.24s;
}

.editor-desktop-stage--preview .editor-desktop-stage__preview-shell {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0) scale(1);
  visibility: visible;
  transition:
    opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1) 0.04s,
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1) 0.04s,
    visibility 0s;
}

@media (prefers-reduced-motion: reduce) {
  .editor-desktop-stage,
  .editor-desktop-stage__preview-shell {
    transition: none;
  }

  .editor-desktop-stage__preview-shell {
    transform: none;
  }
}
</style>
