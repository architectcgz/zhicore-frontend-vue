<template>
  <section :class="['editor-workspace-demo', activeBackgroundClass]">
    <header class="editor-workspace-demo__header">
      <div>
        <p class="editor-workspace-demo__eyebrow">ZhiCore Editor</p>
        <h1>连续文档编辑器</h1>
      </div>

      <div
        v-if="isEditorDebugMode"
        class="editor-workspace-demo__status"
        aria-label="草稿结构状态"
      >
        <span>schema v1</span>
        <span>{{ previewBlocks.length }} blocks</span>
        <span>postVersion 12</span>
      </div>
    </header>

    <section class="editor-frame">
      <EditorActionBar
        :active-mode="activeMode"
        :active-background-id="activeBackground.id"
        :background-candidates="backgroundCandidates"
        @select-mode="handleModeSelect"
        @select-background="selectBackground"
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
          v-model:title="title"
          v-model:body="body"
          :block-count="previewBlocks.length"
          :debug="isEditorDebugMode"
          @body-input="handleBodyInput"
          @toolbar-action="handleToolbarAction"
          @scroll="syncPreviewScroll"
        />

        <EditorPreviewPane
          ref="previewPaneRef"
          :preview-title="previewTitle"
          :preview-blocks="previewBlocks"
          :word-count="wordCount"
        />
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";

import {
  isEditorDebugMode,
  useEditorPreviewScrollSync,
  useEditorShowcaseDisplay,
  useEditorShowcaseDraft,
  type EditorShowcaseMode,
  type EditorShowcaseToolbarAction,
} from "@/features/editor-showcase/model";

import EditorActionBar from "./EditorActionBar.vue";
import EditorPreviewPane from "./EditorPreviewPane.vue";
import EditorWritingPane from "./EditorWritingPane.vue";

const {
  activeMode,
  activeBackground,
  activeBackgroundClass,
  backgroundCandidates,
  isPreviewMode,
  selectMode,
  selectBackground,
} = useEditorShowcaseDisplay();

const {
  title,
  body,
  previewTitle,
  previewBlocks,
  wordCount,
  applyToolbarAction,
} = useEditorShowcaseDraft();

const writingPaneRef = ref<InstanceType<typeof EditorWritingPane> | null>(null);
const previewPaneRef = ref<InstanceType<typeof EditorPreviewPane> | null>(null);

const bodyInputRef = computed(
  () => writingPaneRef.value?.bodyInputElement ?? null,
);
const writingEditorRef = computed(
  () => writingPaneRef.value?.writingEditorElement ?? null,
);
const readerPreviewRef = computed(
  () => previewPaneRef.value?.readerPreviewElement ?? null,
);

const { resizeBodyInput, syncPreviewScroll, syncEditorLayoutOnNextFrame } =
  useEditorPreviewScrollSync({
    bodyInputRef,
    writingEditorRef,
    readerPreviewRef,
    previewBlocks,
    isPreviewMode,
  });

function handleBodyInput(): void {
  void syncEditorLayoutOnNextFrame();
}

function handleModeSelect(mode: EditorShowcaseMode): void {
  selectMode(mode);
  void syncEditorLayoutOnNextFrame();
}

async function handleToolbarAction(
  action: EditorShowcaseToolbarAction,
): Promise<void> {
  const nextSelection = applyToolbarAction(
    action,
    writingPaneRef.value?.getBodySelection(),
  );

  await nextTick();
  resizeBodyInput();
  writingPaneRef.value?.focusBody();
  writingPaneRef.value?.setBodySelection(nextSelection);
  syncPreviewScroll();
}

onMounted(() => {
  resizeBodyInput();
});

watch(
  previewBlocks,
  () => {
    void syncEditorLayoutOnNextFrame();
  },
  {
    flush: "post",
  },
);
</script>

<style scoped>
.editor-workspace-demo {
  min-height: 100vh;
  padding: clamp(16px, 3vw, 34px);
  color: #17202a;
  transition:
    background 0.35s ease,
    color 0.35s ease;
}

.editor-showcase--paper {
  background: linear-gradient(135deg, #f7f4ee 0%, #eef2f5 58%, #e4edf0 100%);
}

.editor-showcase--sage {
  background: linear-gradient(135deg, #eaf3ef 0%, #d9e8e1 56%, #e8ddd3 100%);
}

.editor-showcase--sand {
  background: linear-gradient(135deg, #f5f0e8 0%, #ead7bd 58%, #dbe6e5 100%);
}

.editor-showcase--ink {
  color: #e6edf3;
  background: linear-gradient(135deg, #141a24 0%, #263341 58%, #1e2c35 100%);
}

.editor-workspace-demo__header,
.editor-frame {
  max-width: 1480px;
  margin-inline: auto;
}

.editor-workspace-demo__header {
  display: flex;
  gap: 18px;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 14px;
}

.editor-workspace-demo__eyebrow {
  margin: 0 0 6px;
  color: #587083;
  font-size: 12px;
  font-weight: 760;
  text-transform: uppercase;
}

.editor-showcase--ink .editor-workspace-demo__eyebrow {
  color: #9db8ca;
}

.editor-workspace-demo h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1;
  letter-spacing: 0;
}

.editor-workspace-demo__status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.editor-workspace-demo__status span {
  padding: 7px 10px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.52);
  color: #405466;
  font-size: 12px;
}

.editor-showcase--ink .editor-workspace-demo__status span {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #d7e4ee;
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
  .editor-workspace-demo__header {
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
  .editor-workspace-demo {
    padding: 16px;
  }

  .editor-workspace-demo h1 {
    font-size: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .editor-workspace-demo,
  .editor-stage {
    transition: none;
  }
}
</style>
