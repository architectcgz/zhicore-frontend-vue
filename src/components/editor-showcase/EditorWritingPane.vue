<template>
  <main
    ref="writingEditorRef"
    class="writing-editor"
    aria-label="可输入编辑区"
    @scroll="emit('scroll')"
  >
    <div class="writing-editor__meta" aria-live="polite">
      <span
        :class="[
          'writing-editor__save-state',
          `writing-editor__save-state--${saveStatus}`,
        ]"
      >
        {{ saveStatusLabel }}
      </span>
      <span>上次保存 {{ lastSavedLabel }}</span>
      <span>{{ blockCount }} blocks</span>
    </div>

    <section class="writing-editor__canvas">
      <article class="document-sheet">
        <nav class="selection-toolbar" aria-label="格式工具">
          <button
            type="button"
            aria-label="加粗"
            title="加粗"
            @click="emit('toolbarAction', 'bold')"
          >
            B
          </button>
          <button
            type="button"
            aria-label="斜体"
            title="斜体"
            @click="emit('toolbarAction', 'italic')"
          >
            I
          </button>
          <button
            type="button"
            aria-label="插入链接"
            title="插入链接"
            @click="emit('toolbarAction', 'link')"
          >
            Link
          </button>
          <button
            type="button"
            aria-label="插入代码块"
            title="插入代码块"
            @click="emit('toolbarAction', 'code')"
          >
            Code
          </button>
          <button
            type="button"
            aria-label="插入二级标题"
            title="插入二级标题"
            @click="emit('toolbarAction', 'heading2')"
          >
            H2
          </button>
        </nav>

        <p class="document-sheet__path">作者工作台 / 草稿</p>
        <textarea
          :value="title"
          class="title-input"
          rows="2"
          aria-label="文章标题"
          placeholder="输入文章标题"
          @input="handleTitleInput"
        />
        <textarea
          ref="bodyInputRef"
          :value="body"
          class="body-input"
          rows="14"
          aria-label="文章正文"
          placeholder="从这里开始写正文"
          @input="handleBodyInput"
        />

        <footer class="document-structure">
          <span>PostBodyWriteInput</span>
          <strong>schema v1</strong>
          <span>{{ blockCount }} blocks</span>
          <span>{{ savedContentHash }}</span>
        </footer>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type {
  EditorDraftSaveStatus,
  EditorShowcaseTextSelection,
  EditorShowcaseToolbarAction,
} from "@/features/editor-showcase/model";

defineProps<{
  title: string;
  body: string;
  blockCount: number;
  saveStatus: EditorDraftSaveStatus;
  saveStatusLabel: string;
  lastSavedLabel: string;
  savedContentHash: string;
}>();

const emit = defineEmits<{
  "update:title": [value: string];
  "update:body": [value: string];
  bodyInput: [];
  toolbarAction: [action: EditorShowcaseToolbarAction];
  scroll: [];
}>();

const bodyInputRef = ref<HTMLTextAreaElement | null>(null);
const writingEditorRef = ref<HTMLElement | null>(null);

function handleTitleInput(event: Event): void {
  emit("update:title", (event.target as HTMLTextAreaElement).value);
}

function handleBodyInput(event: Event): void {
  emit("update:body", (event.target as HTMLTextAreaElement).value);
  emit("bodyInput");
}

function getBodySelection(): EditorShowcaseTextSelection | undefined {
  const textarea = bodyInputRef.value;

  if (!textarea) {
    return undefined;
  }

  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
  };
}

function focusBody(): void {
  bodyInputRef.value?.focus();
}

function setBodySelection(selection: EditorShowcaseTextSelection): void {
  bodyInputRef.value?.setSelectionRange(selection.start, selection.end);
}

defineExpose({
  get bodyInputElement() {
    return bodyInputRef.value;
  },
  get writingEditorElement() {
    return writingEditorRef.value;
  },
  focusBody,
  getBodySelection,
  setBodySelection,
});
</script>

<style scoped>
.writing-editor {
  display: grid;
  grid-template-rows: auto 1fr;
  max-height: min(760px, calc(100vh - 170px));
  overflow: hidden;
  overflow-y: auto;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 8px;
  background: var(--editor-control-bg, rgba(255, 255, 255, 0.78));
}

.writing-editor__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.1));
  color: var(--editor-page-muted, #647280);
  font-size: 13px;
}

.writing-editor__save-state {
  position: relative;
  padding-left: 14px;
  color: var(--editor-page-text, #344858);
  font-weight: 700;
}

.writing-editor__save-state::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--editor-page-accent, #1f7f74);
  content: "";
  transform: translateY(-50%);
}

.writing-editor__save-state--dirty::before {
  background: var(--editor-page-warning, #b7791f);
}

.writing-editor__save-state--saving::before {
  background: var(--editor-page-saving, #2563eb);
}

.writing-editor__canvas {
  display: grid;
  grid-template-columns: minmax(0, 940px);
  align-items: start;
  min-height: 590px;
  padding: 10px 16px 22px;
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
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 8px;
  background: var(--editor-control-bg-active, rgba(255, 255, 255, 0.88));
}

.selection-toolbar button {
  min-width: 34px;
  min-height: 28px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--editor-page-muted, #405466);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.selection-toolbar button:hover,
.selection-toolbar button:focus-visible {
  background: var(--editor-control-hover-bg, rgba(31, 127, 116, 0.1));
  color: var(--editor-page-text, #17202a);
}

.document-sheet__path {
  margin: 0 0 6px;
  color: var(--editor-page-muted, #7d6b5a);
  font-size: 13px;
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
  color: var(--editor-page-muted, #516373);
}

.title-input {
  min-height: 116px;
  padding: 0;
  font-size: 44px;
  font-weight: 720;
  line-height: 1.08;
  letter-spacing: 0;
}

.body-input {
  min-height: 374px;
  padding: 0;
  color: var(--editor-body-text, #3f4f5d);
  font-size: 18px;
  line-height: 1.84;
  overflow: hidden;
}

.title-input:focus,
.body-input:focus {
  caret-color: var(--editor-page-accent, #1f7f74);
}

.document-structure {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin-top: 22px;
  padding-top: 12px;
  border-top: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.1));
  color: var(--editor-page-muted, #657785);
  font-size: 13px;
}

.document-structure strong {
  color: var(--editor-page-text, #17202a);
}

@media (max-width: 980px) {
  .writing-editor__canvas {
    grid-template-columns: minmax(0, 1fr);
    padding-inline: 12px;
  }
}

@media (max-width: 640px) {
  .writing-editor__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .writing-editor__canvas {
    grid-template-columns: minmax(0, 1fr);
    padding: 8px 10px 18px;
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
</style>
