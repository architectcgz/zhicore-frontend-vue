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
  --editor-toolbar-bg: rgba(255, 255, 255, 0.03);
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

  min-height: 100vh;
  padding: 24px;
  background: 
    radial-gradient(circle at top right, rgba(0, 229, 181, 0.15), transparent 40%),
    radial-gradient(circle at bottom left, rgba(0, 168, 255, 0.1), transparent 40%),
    linear-gradient(135deg, #0a0f14 0%, #111a22 100%);
  color: var(--editor-page-text);
  transition:
    background-color 0.2s ease,
    color 0.35s ease;
}

.editor--paper {
  --editor-control-bg: #f7f4ee;
  --editor-control-bg-muted: rgba(247, 244, 238, 0.72);
  --editor-control-bg-active: #fffdf8;
  --editor-toolbar-bg: var(--editor-control-bg);
}

.editor--sage {
  --editor-page-panel: rgba(237, 245, 241, 0.74);
  --editor-control-bg: #edf5f1;
  --editor-control-bg-muted: rgba(224, 239, 232, 0.74);
  --editor-control-bg-active: #f7fbf8;
  --editor-toolbar-bg: var(--editor-control-bg);
  --editor-control-hover-bg: rgba(31, 127, 116, 0.12);
  --editor-body-text: #365348;
  --editor-reader-text: #42584f;
}

.editor--sand {
  --editor-page-panel: rgba(244, 239, 232, 0.74);
  --editor-control-bg: #f4efe8;
  --editor-control-bg-muted: rgba(235, 223, 207, 0.72);
  --editor-control-bg-active: #fffaf2;
  --editor-toolbar-bg: var(--editor-control-bg);
  --editor-control-hover-bg: rgba(183, 121, 31, 0.12);
  --editor-body-text: #5b4937;
  --editor-reader-text: #5f4e3e;
  --editor-reader-muted: #746656;
  --editor-reader-emphasis: #67513a;
}

.editor--ink {
  --editor-page-text: #e6edf3;
  --editor-page-muted: #aab8c5;
  --editor-page-panel: rgba(19, 27, 38, 0.78);
  --editor-page-border: rgba(210, 225, 236, 0.14);
  --editor-page-accent: #7dd3fc;
  --editor-control-bg: rgba(19, 27, 38, 0.72);
  --editor-control-bg-muted: rgba(255, 255, 255, 0.08);
  --editor-control-bg-active: rgba(255, 255, 255, 0.18);
  --editor-control-hover-bg: rgba(125, 211, 252, 0.12);
  --editor-control-disabled-bg: rgba(255, 255, 255, 0.08);
  --editor-control-disabled-text: #9db8ca;
  --editor-control-primary: #2b7f9d;
  --editor-control-primary-hover: #216f8a;
  --editor-toolbar-bg: #101823;
  --editor-body-text: #cbd6df;
  --editor-reader-text: #c1ccd6;
  --editor-reader-muted: #c1ccd6;
  --editor-reader-heading: #c1ccd6;
  --editor-reader-strong: #c1ccd6;
  --editor-reader-emphasis: #c1ccd6;
  --editor-reader-strikethrough: #c1ccd6;
  --editor-reader-link: #d7e5ea;
  --editor-reader-link-hover: #ffffff;
  --editor-reader-code-text: #d7e5ea;
  --editor-reader-code-bg: rgba(255, 255, 255, 0.09);
  --editor-reader-code-border: rgba(255, 255, 255, 0.1);
  --editor-reader-code-caption: #9db8ca;
  --editor-reader-code-caption-border: rgba(255, 255, 255, 0.09);
  --editor-reader-quote-border: rgba(115, 184, 191, 0.38);
  --editor-reader-block-bg: rgba(255, 255, 255, 0.08);
  --editor-reader-image-border: rgba(255, 255, 255, 0.1);
  --editor-reader-task-accent: #7dd3fc;
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
