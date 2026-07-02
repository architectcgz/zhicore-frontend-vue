<template>
  <section :class="['editor-workspace', activeBackgroundClass]">
    <header class="editor-workspace__header">
      <div class="editor-workspace__heading">
        <p>作者工作台</p>
        <h1>草稿编辑</h1>
      </div>

      <div class="editor-workspace__summary" aria-label="草稿状态摘要">
        <span
          :class="[
            'editor-workspace__save-state',
            `editor-workspace__save-state--${draftSaveStatus}`,
          ]"
        >
          {{ saveStatusLabel }}
        </span>
        <span>schema v1</span>
        <span>{{ wordCount }} 字</span>
      </div>
    </header>

    <section class="editor-frame">
      <EditorActionBar
        :active-mode="activeMode"
        :active-background-id="activeBackground.id"
        :background-candidates="backgroundCandidates"
        :save-status="draftSaveStatus"
        :save-status-label="saveStatusLabel"
        :save-button-label="saveButtonLabel"
        :can-save-draft="canSaveDraft"
        :can-undo="canUndo"
        :can-redo="canRedo"
        :last-saved-label="lastSavedLabel"
        :word-count="wordCount"
        @select-mode="handleModeSelect"
        @select-background="selectBackground"
        @undo="handleUndoDraft"
        @redo="handleRedoDraft"
        @save-draft="handleSaveDraft"
      />

      <div
        class="editor-stage"
        :class="{
          'editor-stage--focus': !isPreviewMode,
          'editor-stage--preview': isPreviewMode,
        }"
      >
        <EditorWritingPane
          ref="writingPaneRef"
          :title="title"
          :body="body"
          :word-count="wordCount"
          :save-status="draftSaveStatus"
          :save-status-label="saveStatusLabel"
          :last-saved-label="lastSavedLabel"
          :saved-content-hash="savedContentHash"
          @title-input="handleTitleInput"
          @body-input="handleBodyInput"
          @undo="handleUndoDraft"
          @redo="handleRedoDraft"
          @toolbar-action="handleToolbarAction"
          @scroll="syncPreviewScroll"
        />

        <EditorPreviewPane
          ref="previewPaneRef"
          :preview-title="previewTitle"
          :preview-blocks="readerPreviewBlocks"
          :word-count="wordCount"
          @scroll="syncEditorScroll"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { useEditorWorkspaceController } from "@/features/editor-showcase/model";

import EditorActionBar from "@/components/editor-showcase/EditorActionBar.vue";
import EditorPreviewPane from "@/components/editor-showcase/EditorPreviewPane.vue";
import EditorWritingPane from "@/components/editor-showcase/EditorWritingPane.vue";

const {
  activeMode,
  activeBackground,
  activeBackgroundClass,
  backgroundCandidates,
  body,
  canRedo,
  handleBodyInput,
  handleModeSelect,
  handleRedoDraft,
  handleSaveDraft,
  handleTitleInput,
  handleToolbarAction,
  handleUndoDraft,
  isPreviewMode,
  canSaveDraft,
  canUndo,
  draftSaveStatus,
  lastSavedLabel,
  previewTitle,
  readerPreviewBlocks,
  previewPaneRef,
  saveButtonLabel,
  saveStatusLabel,
  selectBackground,
  savedContentHash,
  syncEditorScroll,
  syncPreviewScroll,
  title,
  wordCount,
  writingPaneRef,
} = useEditorWorkspaceController();
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

.editor-showcase--paper {
  --editor-page-bg: #f3f6f8;
  --editor-page-panel: rgba(255, 255, 255, 0.78);
}

.editor-showcase--sage {
  --editor-page-bg: #edf5f1;
  --editor-page-panel: rgba(255, 255, 255, 0.7);
}

.editor-showcase--sand {
  --editor-page-bg: #f4efe8;
  --editor-page-panel: rgba(255, 255, 255, 0.72);
}

.editor-showcase--ink {
  --editor-page-bg: #121923;
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

.editor-workspace__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.editor-workspace__summary span {
  padding: 7px 10px;
  border: 1px solid var(--editor-page-border);
  border-radius: 999px;
  background: var(--editor-page-panel);
  color: var(--editor-page-muted);
  font-size: 12px;
}

.editor-workspace__save-state {
  position: relative;
  padding-left: 24px;
}

.editor-workspace__save-state::before {
  position: absolute;
  top: 50%;
  left: 10px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--editor-page-accent);
  content: "";
  transform: translateY(-50%);
}

.editor-workspace__save-state--dirty::before {
  background: var(--editor-page-warning);
}

.editor-workspace__save-state--saving::before {
  background: var(--editor-page-saving);
}

.editor-frame {
  display: grid;
  gap: 12px;
}

.editor-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.42fr);
  gap: 12px;
  align-items: stretch;
  min-height: 660px;
  transition: grid-template-columns 0.32s ease;
}

.editor-stage--focus {
  grid-template-columns: minmax(0, 1fr);
}

.editor-stage--focus .reader-preview {
  display: none;
}

@media (max-width: 980px) {
  .editor-workspace__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .editor-stage,
  .editor-stage--focus,
  .editor-stage--preview {
    grid-template-columns: 1fr;
  }

  .editor-stage {
    min-height: auto;
  }

  .editor-stage--focus .reader-preview {
    display: none;
  }

  .editor-stage--preview .reader-preview {
    display: block;
  }
}

@media (max-width: 640px) {
  .editor-workspace {
    padding: 16px;
  }

  .editor-workspace h1 {
    font-size: 26px;
  }

  .editor-workspace__summary {
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .editor-workspace,
  .editor-stage {
    transition: none;
  }
}
</style>
