<template>
  <section class="editor-workspace">
    <header class="editor-workspace__header">
      <div class="editor-workspace__heading">
        <p>作者工作台</p>
        <h1>草稿编辑</h1>
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
  handleBodyDocumentInput,
  handleModeSelect,
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
  --editor-page-bg: #f3f6f8;
  --editor-page-text: #17202a;
  --editor-page-muted: #5a6875;
  --editor-page-panel: rgba(255, 255, 255, 0.74);
  --editor-page-border: rgba(49, 74, 91, 0.14);
  --editor-page-accent: #1f7f74;
  --editor-page-warning: #b7791f;
  --editor-page-saving: #2563eb;
  --editor-control-bg: rgba(255, 255, 255, 0.78);
  --editor-control-bg-muted: rgba(255, 255, 255, 0.56);
  --editor-control-bg-active: #ffffff;
  --editor-control-hover-bg: rgba(31, 127, 116, 0.1);
  --editor-control-disabled-bg: rgba(49, 74, 91, 0.12);
  --editor-control-disabled-text: #6b7b88;
  --editor-control-primary: #1f7f74;
  --editor-control-primary-hover: #176b62;
  --editor-toolbar-bg: var(--editor-control-bg);
  --editor-body-text: #3f4f5d;
  --editor-reader-text: #485765;
  --editor-reader-muted: #647280;
  --editor-reader-heading: #17202a;
  --editor-reader-strong: #17202a;
  --editor-reader-emphasis: #2f4d58;
  --editor-reader-strikethrough: #6f7f8b;
  --editor-reader-link: #1f6f77;
  --editor-reader-link-hover: #154f59;
  --editor-reader-code-text: #23424d;
  --editor-reader-code-bg: rgba(23, 32, 42, 0.08);
  --editor-reader-code-border: rgba(23, 32, 42, 0.1);
  --editor-reader-code-caption: #657785;
  --editor-reader-code-caption-border: rgba(23, 32, 42, 0.08);
  --editor-reader-quote-border: rgba(31, 111, 119, 0.32);
  --editor-reader-block-bg: rgba(23, 32, 42, 0.07);
  --editor-reader-image-border: rgba(23, 32, 42, 0.1);
  --editor-reader-task-accent: #1f6f77;

  min-height: 100vh;
  padding: 24px;
  background: var(--editor-page-bg);
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
