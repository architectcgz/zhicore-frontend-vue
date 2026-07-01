<template>
  <section :class="['editor-workspace-demo', activeBackgroundClass]">
    <header class="editor-workspace-demo__header">
      <div>
        <p class="editor-workspace-demo__eyebrow">ZhiCore Editor</p>
        <h1>连续文档编辑器</h1>
      </div>

      <div class="editor-workspace-demo__status" aria-label="草稿结构状态">
        <span>schema v1</span>
        <span>{{ structureMarkers.length }} blocks</span>
        <span>postVersion 12</span>
      </div>
    </header>

    <section class="editor-frame">
      <div class="editor-action-bar">
        <div class="mode-switch" aria-label="编辑器视图">
          <button
            type="button"
            :aria-pressed="activeMode === 'focus'"
            @click="selectMode('focus')"
          >
            专注写作
          </button>
          <button
            type="button"
            :aria-pressed="activeMode === 'preview'"
            @click="selectMode('preview')"
          >
            写作 + 预览
          </button>
        </div>

        <div class="background-picker" aria-label="背景候选">
          <button
            v-for="background in backgroundCandidates"
            :key="background.id"
            class="background-swatch"
            type="button"
            :aria-label="`切换到${background.name}背景`"
            :aria-pressed="activeBackground.id === background.id"
            @click="selectBackground(background.id)"
          >
            <span :style="{ background: background.swatch }"></span>
            {{ background.name }}
          </button>
        </div>

        <RouterLink class="document-link" to="/editor-document-showcase">
          工程文档展示
        </RouterLink>
      </div>

      <div
        class="editor-stage"
        :class="{ 'editor-stage--preview': isPreviewMode }"
      >
        <main class="writing-editor" aria-label="可输入编辑区">
          <div class="writing-editor__meta">
            <span>草稿已保存 10:42</span>
            <span>baseDraftBodyHash sha256:9af...</span>
          </div>

          <section class="writing-editor__canvas">
            <aside class="document-gutter" aria-label="文档结构操作">
              <button
                class="gutter-insert"
                type="button"
                aria-label="插入内容块"
              >
                +
              </button>

              <div class="gutter-track">
                <button
                  v-for="marker in structureMarkers"
                  :key="marker.path"
                  class="gutter-marker"
                  type="button"
                  :aria-label="`${marker.path} ${marker.label}`"
                  :title="`${marker.path} ${marker.label}`"
                >
                  <span class="gutter-drag" aria-hidden="true"></span>
                  <span>{{ marker.label }}</span>
                </button>
              </div>
            </aside>

            <article class="document-sheet">
              <nav class="selection-toolbar" aria-label="格式工具">
                <button
                  type="button"
                  aria-label="加粗"
                  title="加粗"
                  @click="handleToolbarAction('bold')"
                >
                  B
                </button>
                <button
                  type="button"
                  aria-label="斜体"
                  title="斜体"
                  @click="handleToolbarAction('italic')"
                >
                  I
                </button>
                <button
                  type="button"
                  aria-label="插入链接"
                  title="插入链接"
                  @click="handleToolbarAction('link')"
                >
                  Link
                </button>
                <button
                  type="button"
                  aria-label="插入代码块"
                  title="插入代码块"
                  @click="handleToolbarAction('code')"
                >
                  Code
                </button>
                <button
                  type="button"
                  aria-label="插入二级标题"
                  title="插入二级标题"
                  @click="handleToolbarAction('heading2')"
                >
                  H2
                </button>
              </nav>

              <p class="document-sheet__path">作者工作台 / 草稿</p>
              <textarea
                v-model="title"
                class="title-input"
                rows="2"
                aria-label="文章标题"
              />
              <textarea
                ref="bodyInputRef"
                v-model="body"
                class="body-input"
                rows="14"
                aria-label="文章正文"
              />

              <footer class="document-structure">
                <span>Content blocks</span>
                <strong>{{ structureMarkers.length }}</strong>
                <span>basePostVersion 12</span>
              </footer>
            </article>
          </section>
        </main>

        <aside class="reader-preview" aria-label="读者预览">
          <div class="reader-preview__header">
            <span>读者视图</span>
            <strong>{{ wordCount }} 字</strong>
          </div>
          <div class="reader-preview__cover"></div>
          <h2>{{ previewTitle }}</h2>
          <EditorReaderPreviewBlock
            v-for="(block, blockIndex) in previewBlocks"
            :key="`${blockIndex}-${block.type}-${block.content}`"
            :block="block"
          />
          <dl class="reader-preview__facts">
            <div>
              <dt>正文</dt>
              <dd>blocks</dd>
            </div>
            <div>
              <dt>媒体</dt>
              <dd>fileId</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { RouterLink } from "vue-router";

import { useEditorShowcaseDisplay } from "@/features/editor-showcase/model/useEditorShowcaseDisplay";
import {
  useEditorShowcaseDraft,
  type EditorShowcaseToolbarAction,
} from "@/features/editor-showcase/model/useEditorShowcaseDraft";

import EditorReaderPreviewBlock from "./preview/EditorReaderPreviewBlock.vue";

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

const bodyInputRef = ref<HTMLTextAreaElement | null>(null);

const structureMarkers = computed(() => {
  const blockMarkers = previewBlocks.value.slice(0, 5).map((block, index) => ({
    label: block.type === "text" ? "T" : block.label.toUpperCase(),
    path: `blocks[${index + 1}]`,
  }));

  // 标题和正文块仍映射到后端 blocks，界面只在 gutter 暴露轻量结构锚点。
  return [
    {
      label: "H1",
      path: "blocks[0]",
    },
    ...blockMarkers,
  ];
});

async function handleToolbarAction(
  action: EditorShowcaseToolbarAction,
): Promise<void> {
  const textarea = bodyInputRef.value;
  const nextSelection = applyToolbarAction(
    action,
    textarea
      ? {
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
        }
      : undefined,
  );

  await nextTick();
  bodyInputRef.value?.focus();
  bodyInputRef.value?.setSelectionRange(nextSelection.start, nextSelection.end);
}
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

.editor-action-bar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 8px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.64);
  backdrop-filter: blur(18px);
}

.editor-showcase--ink .editor-action-bar {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(19, 27, 38, 0.72);
}

.mode-switch,
.background-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mode-switch button,
.background-swatch,
.document-link {
  min-height: 36px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.56);
  color: #405466;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.mode-switch button,
.document-link {
  padding: 7px 13px;
}

.mode-switch button[aria-pressed="true"],
.background-swatch[aria-pressed="true"] {
  border-color: rgba(31, 127, 116, 0.56);
  background: #ffffff;
  color: #17202a;
}

.mode-switch button:hover,
.background-swatch:hover,
.document-link:hover {
  transform: translateY(-1px);
}

.background-swatch {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 5px 10px 5px 6px;
}

.background-swatch span {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(49, 74, 91, 0.16);
  border-radius: 50%;
}

.editor-showcase--ink .mode-switch button,
.editor-showcase--ink .background-swatch,
.editor-showcase--ink .document-link {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(255, 255, 255, 0.08);
  color: #d7e4ee;
}

.editor-showcase--ink .mode-switch button[aria-pressed="true"],
.editor-showcase--ink .background-swatch[aria-pressed="true"] {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.editor-stage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0fr);
  gap: 12px;
  align-items: stretch;
  min-height: 660px;
  transition: grid-template-columns 0.32s ease;
}

.editor-stage--preview {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.42fr);
}

.writing-editor,
.reader-preview {
  overflow: hidden;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(18px);
}

.editor-showcase--ink .writing-editor,
.editor-showcase--ink .reader-preview {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(19, 27, 38, 0.72);
}

.writing-editor {
  display: grid;
  grid-template-rows: auto 1fr;
}

.writing-editor__meta {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(49, 74, 91, 0.1);
  color: #647280;
  font-size: 13px;
}

.editor-showcase--ink .writing-editor__meta {
  border-color: rgba(210, 225, 236, 0.12);
  color: #9db8ca;
}

.writing-editor__canvas {
  display: grid;
  grid-template-columns: 42px minmax(0, 940px);
  align-items: start;
  min-height: 590px;
  padding: 10px 16px 22px 4px;
}

.document-gutter {
  position: sticky;
  top: 10px;
  display: grid;
  gap: 22px;
  justify-items: center;
  padding-top: 72px;
  color: #657785;
}

.gutter-insert,
.gutter-marker {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.gutter-insert {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 999px;
  font-size: 20px;
  line-height: 1;
  opacity: 0.72;
}

.gutter-track {
  display: grid;
  gap: 16px;
}

.gutter-marker {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 4px;
  align-items: center;
  width: 36px;
  min-height: 28px;
  padding: 4px 3px;
  border-radius: 6px;
  font-size: 11px;
  opacity: 0.42;
  transition:
    opacity 0.18s ease,
    background 0.18s ease;
}

.gutter-drag {
  width: 8px;
  height: 15px;
  border-radius: 2px;
  background:
    radial-gradient(circle at 2px 2px, currentColor 1.2px, transparent 1.4px),
    radial-gradient(circle at 6px 2px, currentColor 1.2px, transparent 1.4px),
    radial-gradient(circle at 2px 7px, currentColor 1.2px, transparent 1.4px),
    radial-gradient(circle at 6px 7px, currentColor 1.2px, transparent 1.4px),
    radial-gradient(circle at 2px 12px, currentColor 1.2px, transparent 1.4px),
    radial-gradient(circle at 6px 12px, currentColor 1.2px, transparent 1.4px);
}

.writing-editor:hover .gutter-marker,
.writing-editor:focus-within .gutter-marker,
.gutter-marker:focus-visible,
.gutter-insert:hover,
.gutter-insert:focus-visible {
  opacity: 1;
  background: rgba(31, 127, 116, 0.1);
}

.editor-showcase--ink .document-gutter {
  color: #9db8ca;
}

.editor-showcase--ink .writing-editor:hover .gutter-marker,
.editor-showcase--ink .writing-editor:focus-within .gutter-marker,
.editor-showcase--ink .gutter-marker:focus-visible,
.editor-showcase--ink .gutter-insert:hover,
.editor-showcase--ink .gutter-insert:focus-visible {
  background: rgba(125, 211, 252, 0.12);
}

.document-sheet {
  position: relative;
  width: min(860px, 100%);
  padding: 14px 0 0;
}

.selection-toolbar {
  position: sticky;
  top: 8px;
  z-index: 2;
  display: flex;
  width: fit-content;
  gap: 4px;
  margin: 0 auto 12px;
  padding: 4px;
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
}

.selection-toolbar button {
  min-width: 34px;
  min-height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: #405466;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.selection-toolbar button:hover,
.selection-toolbar button:focus-visible {
  background: rgba(31, 127, 116, 0.1);
  color: #17202a;
}

.editor-showcase--ink .selection-toolbar {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(22, 32, 45, 0.92);
}

.editor-showcase--ink .selection-toolbar button {
  color: #d7e4ee;
}

.editor-showcase--ink .selection-toolbar button:hover,
.editor-showcase--ink .selection-toolbar button:focus-visible {
  background: rgba(125, 211, 252, 0.12);
  color: #ffffff;
}

.document-sheet__path {
  margin: 0 0 6px;
  color: #7d6b5a;
  font-size: 13px;
}

.editor-showcase--ink .document-sheet__path {
  color: #9db8ca;
}

.title-input,
.body-input {
  display: block;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: currentColor;
  resize: none;
}

.title-input::placeholder,
.body-input::placeholder {
  color: #516373;
}

.title-input {
  min-height: 116px;
  padding: 0;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 720;
  line-height: 1.08;
  letter-spacing: 0;
}

.body-input {
  min-height: 374px;
  padding: 0;
  color: #3f4f5d;
  font-size: 18px;
  line-height: 1.84;
}

.title-input:focus,
.body-input:focus {
  caret-color: #1f7f74;
}

.editor-showcase--ink .body-input {
  color: #cbd6df;
}

.editor-showcase--ink .title-input::placeholder,
.editor-showcase--ink .body-input::placeholder {
  color: #b7c6d1;
}

.editor-showcase--ink .title-input:focus,
.editor-showcase--ink .body-input:focus {
  caret-color: #7dd3fc;
}

.document-structure {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin-top: 22px;
  padding-top: 12px;
  border-top: 1px solid rgba(49, 74, 91, 0.1);
  color: #657785;
  font-size: 13px;
}

.document-structure strong {
  color: #17202a;
}

.editor-showcase--ink .document-structure {
  border-color: rgba(210, 225, 236, 0.12);
  color: #9db8ca;
}

.editor-showcase--ink .document-structure strong {
  color: #ffffff;
}

.reader-preview {
  --reader-text: #485765;
  --reader-muted: #647280;
  --reader-heading: #17202a;
  --reader-strong: #17202a;
  --reader-emphasis: #2f4d58;
  --reader-strikethrough: #6f7f8b;
  --reader-link: #1f6f77;
  --reader-link-hover: #154f59;
  --reader-code-text: #23424d;
  --reader-code-bg: rgba(23, 32, 42, 0.08);
  --reader-code-border: rgba(23, 32, 42, 0.1);
  --reader-code-caption: #657785;
  --reader-code-caption-border: rgba(23, 32, 42, 0.08);
  --reader-quote-border: rgba(31, 111, 119, 0.32);
  --reader-block-bg: rgba(23, 32, 42, 0.07);
  --reader-image-border: rgba(23, 32, 42, 0.1);
  --reader-task-accent: #1f6f77;

  min-width: 0;
  padding: 18px;
  opacity: 0;
  pointer-events: none;
  transform: translateX(18px);
  transition:
    opacity 0.26s ease,
    transform 0.26s ease;
}

.editor-showcase--ink .reader-preview {
  --reader-text: #c1ccd6;
  --reader-muted: #c1ccd6;
  --reader-heading: #c1ccd6;
  --reader-strong: #c1ccd6;
  --reader-emphasis: #c1ccd6;
  --reader-strikethrough: #c1ccd6;
  --reader-link: #d7e5ea;
  --reader-link-hover: #ffffff;
  --reader-code-text: #d7e5ea;
  --reader-code-bg: rgba(255, 255, 255, 0.09);
  --reader-code-border: rgba(255, 255, 255, 0.1);
  --reader-code-caption: #9db8ca;
  --reader-code-caption-border: rgba(255, 255, 255, 0.09);
  --reader-quote-border: rgba(115, 184, 191, 0.38);
  --reader-block-bg: rgba(255, 255, 255, 0.08);
  --reader-image-border: rgba(255, 255, 255, 0.1);
  --reader-task-accent: #7dd3fc;
}

.editor-stage--preview .reader-preview {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.reader-preview__header {
  display: flex;
  justify-content: space-between;
  color: var(--reader-muted);
  font-size: 13px;
}

.reader-preview__cover {
  aspect-ratio: 4 / 3;
  margin: 18px 0;
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(34, 99, 122, 0.78), rgba(240, 180, 111, 0.76)),
    linear-gradient(25deg, rgba(255, 255, 255, 0.34), transparent 46%);
}

.reader-preview h2 {
  margin: 0 0 10px;
  color: var(--reader-heading);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.12;
}

.editor-showcase--ink .reader-preview__header {
  color: var(--reader-muted);
}

.reader-preview__facts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 22px 0 0;
}

.reader-preview__facts div {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
}

.reader-preview__facts dt {
  color: var(--reader-muted);
  font-size: 12px;
}

.reader-preview__facts dd {
  margin: 4px 0 0;
  font-weight: 760;
}

.editor-showcase--ink .reader-preview__facts div {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 980px) {
  .editor-workspace-demo__header,
  .editor-action-bar {
    align-items: flex-start;
  }

  .editor-workspace-demo__header {
    flex-direction: column;
  }

  .editor-action-bar,
  .editor-stage,
  .editor-stage--preview {
    grid-template-columns: 1fr;
  }

  .editor-stage {
    min-height: auto;
  }

  .reader-preview {
    display: none;
  }

  .editor-stage--preview .reader-preview {
    display: block;
  }

  .writing-editor__canvas {
    grid-template-columns: 36px minmax(0, 1fr);
    padding-right: 12px;
  }
}

@media (max-width: 640px) {
  .editor-workspace-demo {
    padding: 16px;
  }

  .editor-workspace-demo h1 {
    font-size: 36px;
  }

  .writing-editor__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .writing-editor__canvas {
    grid-template-columns: 28px minmax(0, 1fr);
    padding: 8px 10px 18px 0;
  }

  .document-gutter {
    padding-top: 90px;
  }

  .gutter-marker {
    width: 28px;
  }

  .gutter-marker span:last-child {
    display: none;
  }

  .selection-toolbar {
    max-width: 100%;
    overflow-x: auto;
  }

  .title-input {
    min-height: 104px;
    font-size: 32px;
  }

  .body-input {
    font-size: 17px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .editor-workspace-demo,
  .editor-stage,
  .reader-preview,
  .mode-switch button,
  .background-swatch,
  .document-link,
  .gutter-marker {
    transition: none;
  }
}
</style>
