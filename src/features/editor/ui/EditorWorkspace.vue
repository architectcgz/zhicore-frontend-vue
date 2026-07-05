<template>
  <section class="editor-workspace">
    <header class="editor-workspace__header">
      <div class="editor-workspace__heading">
        <p>作者工作台</p>
        <h1>草稿编辑</h1>
      </div>
      <div class="editor-workspace__actions">
        <p
          v-if="publishErrorLabel"
          class="editor-workspace__publish-error"
          role="alert"
        >
          {{ publishErrorLabel }}
        </p>
        <button
          class="editor-workspace__publish"
          type="button"
          :disabled="!canPublishDraft"
          @click="handlePublishDraft"
        >
          <Send class="editor-workspace__publish-icon" aria-hidden="true" />
          {{ publishButtonLabel }}
        </button>
      </div>
    </header>

    <section :class="['editor-frame', activeBackgroundClass]">
      <EditorMobileWorkspace
        v-if="isMobileWorkspace"
        ref="workspaceShellRef"
        :active-mode="activeMode"
        :active-background-id="activeBackground.id"
        :background-candidates="backgroundCandidates"
        :title="title"
        :body-document-json="bodyDocumentJson"
        :word-count="wordCount"
        :body-character-count="bodyCharacterCount"
        :body-max-length="bodyMaxLength"
        :save-status="draftSaveStatus"
        :save-status-label="saveStatusLabel"
        :last-saved-label="lastSavedLabel"
        :save-button-label="saveButtonLabel"
        :can-save-draft="canSaveDraft"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :preview-title="previewTitle"
        :preview-blocks="readerPreviewBlocks"
        @title-input="handleTitleInput"
        @body-document-input="handleBodyDocumentInput"
        @undo="handleUndoDraft"
        @redo="handleRedoDraft"
        @save-draft="handleSaveDraft"
        @toolbar-action="handleToolbarAction"
        @select-mode="handleModeSelect"
        @select-background="selectBackground"
        @editor-scroll="syncPreviewScroll"
        @preview-scroll="syncEditorScroll"
      />
      <EditorDesktopWorkspace
        v-else
        ref="workspaceShellRef"
        :active-mode="activeMode"
        :active-background-id="activeBackground.id"
        :background-candidates="backgroundCandidates"
        :title="title"
        :body-document-json="bodyDocumentJson"
        :word-count="wordCount"
        :body-character-count="bodyCharacterCount"
        :body-max-length="bodyMaxLength"
        :save-status="draftSaveStatus"
        :save-status-label="saveStatusLabel"
        :last-saved-label="lastSavedLabel"
        :save-button-label="saveButtonLabel"
        :can-save-draft="canSaveDraft"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :preview-title="previewTitle"
        :preview-blocks="readerPreviewBlocks"
        @title-input="handleTitleInput"
        @body-document-input="handleBodyDocumentInput"
        @undo="handleUndoDraft"
        @redo="handleRedoDraft"
        @save-draft="handleSaveDraft"
        @toolbar-action="handleToolbarAction"
        @select-mode="handleModeSelect"
        @select-background="selectBackground"
        @editor-scroll="syncPreviewScroll"
        @preview-scroll="syncEditorScroll"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { Send } from "@lucide/vue";
import { useMediaQuery } from "@vueuse/core";

import { useEditorWorkspaceController } from "../composables/useEditorWorkspaceController";

import EditorDesktopWorkspace from "./EditorDesktopWorkspace.vue";
import EditorMobileWorkspace from "./EditorMobileWorkspace.vue";

const {
  activeMode,
  activeBackground,
  activeBackgroundClass,
  backgroundCandidates,
  bodyDocumentJson,
  bodyCharacterCount,
  bodyMaxLength,
  canRedo,
  canPublishDraft,
  handleBodyDocumentInput,
  handleModeSelect,
  handlePublishDraft,
  handleRedoDraft,
  handleSaveDraft,
  handleTitleInput,
  handleToolbarAction,
  handleUndoDraft,
  canSaveDraft,
  canUndo,
  draftSaveStatus,
  lastSavedLabel,
  previewTitle,
  publishButtonLabel,
  publishErrorLabel,
  readerPreviewBlocks,
  saveButtonLabel,
  saveStatusLabel,
  selectBackground,
  syncEditorScroll,
  syncPreviewScroll,
  title,
  wordCount,
  workspaceShellRef,
} = useEditorWorkspaceController();

const isMobileWorkspace = useMediaQuery("(max-width: 980px)");
</script>

<style scoped>
.editor-workspace {
  --editor-page-bg: transparent;
  --editor-page-text: var(--color-text-strong);
  --editor-page-muted: var(--color-text-soft);
  --editor-page-panel: rgba(255, 255, 255, 0.03);
  --editor-page-border: rgba(255, 255, 255, 0.08);
  --editor-page-accent: var(--color-primary);
  --editor-page-warning: #ff6b6b;
  --editor-page-saving: var(--color-primary-soft);
  --editor-control-bg: rgba(0, 0, 0, 0.2);
  --editor-control-bg-muted: rgba(255, 255, 255, 0.05);
  --editor-control-bg-active: rgba(255, 255, 255, 0.1);
  --editor-control-hover-bg: rgba(0, 229, 181, 0.1);
  --editor-control-disabled-bg: rgba(255, 255, 255, 0.05);
  --editor-control-disabled-text: rgba(255, 255, 255, 0.3);
  --editor-control-primary: var(--color-primary);
  --editor-control-primary-hover: var(--color-primary-soft);
  --editor-toolbar-bg: rgba(10, 15, 22, 0.95);
  --editor-body-text: var(--color-text);
  --editor-reader-text: var(--color-text);
  --editor-reader-muted: var(--color-text-soft);
  --editor-reader-heading: var(--color-text-strong);
  --editor-reader-strong: var(--color-text-strong);
  --editor-reader-emphasis: var(--color-primary);
  --editor-reader-strikethrough: var(--color-text-soft);
  --editor-reader-link: var(--color-primary);
  --editor-reader-link-hover: var(--color-primary-soft);
  --editor-reader-code-text: var(--color-text-strong);
  --editor-reader-code-bg: rgba(255, 255, 255, 0.09);
  --editor-reader-code-border: rgba(255, 255, 255, 0.1);
  --editor-reader-code-caption: var(--color-text-soft);
  --editor-reader-code-caption-border: rgba(255, 255, 255, 0.09);
  --editor-reader-quote-border: var(--color-primary-soft);
  --editor-reader-block-bg: rgba(255, 255, 255, 0.05);
  --editor-reader-image-border: rgba(255, 255, 255, 0.1);
  --editor-reader-task-accent: var(--color-primary);

  --theme-grad-1: rgba(0, 229, 181, 0.15);
  --theme-grad-2: rgba(0, 168, 255, 0.1);
  --theme-bg-1: #0a0f14;
  --theme-bg-2: #111a22;

  min-height: 100vh;
  padding: 24px;
  background: 
    radial-gradient(circle at top right, var(--theme-grad-1), transparent 40%),
    radial-gradient(circle at bottom left, var(--theme-grad-2), transparent 40%),
    linear-gradient(135deg, var(--theme-bg-1) 0%, var(--theme-bg-2) 100%);
  color: var(--editor-page-text);
  transition:
    background-color 0.2s ease,
    color 0.35s ease;
}

.editor--paper {
  --theme-grad-1: rgba(255, 255, 255, 0.1);
  --theme-grad-2: rgba(200, 200, 200, 0.05);
  --editor-page-accent: #f8fafc;
}

.editor--sage {
  --theme-grad-1: rgba(74, 222, 128, 0.15);
  --theme-grad-2: rgba(34, 197, 94, 0.1);
  --editor-page-accent: #4ade80;
}

.editor--sand {
  --theme-grad-1: rgba(252, 211, 77, 0.15);
  --theme-grad-2: rgba(251, 146, 60, 0.1);
  --editor-page-accent: #fcd34d;
}

.editor--ink {
  --theme-grad-1: rgba(56, 189, 248, 0.15);
  --theme-grad-2: rgba(59, 130, 246, 0.1);
  --editor-page-accent: #38bdf8;
}

.editor-workspace__header,
.editor-frame {
  max-width: 1480px;
  margin-inline: auto;
}

.editor-workspace__header {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.editor-workspace__heading p {
  margin: 0 0 4px;
  color: var(--editor-page-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.editor-workspace__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.editor-workspace__publish-error {
  margin: 0;
  color: var(--editor-page-warning);
  font-size: 13px;
  font-weight: 700;
}

.editor-workspace__publish {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  background: var(--editor-control-primary);
  color: #fff;
  font-weight: 780;
  cursor: pointer;
}

.editor-workspace__publish:hover:not(:disabled),
.editor-workspace__publish:focus-visible:not(:disabled) {
  background: var(--editor-control-primary-hover);
}

.editor-workspace__publish:disabled {
  background: var(--editor-control-disabled-bg);
  color: var(--editor-control-disabled-text);
  cursor: not-allowed;
}

.editor-workspace__publish-icon {
  width: 17px;
  height: 17px;
}

.editor-workspace h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.16;
  letter-spacing: 0;
}

.editor-frame {
  display: grid;
  gap: 12px;
}

@media (max-width: 980px) {
  .editor-workspace__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .editor-workspace__heading p {
    text-transform: none;
  }
}

@media (max-width: 640px) {
  .editor-workspace {
    padding: 16px;
  }

  .editor-workspace h1 {
    font-size: 26px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .editor-workspace {
    transition: none;
  }
}
</style>
