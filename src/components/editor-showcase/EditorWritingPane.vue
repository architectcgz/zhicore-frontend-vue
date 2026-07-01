<template>
  <main
    ref="writingEditorRef"
    class="writing-editor"
    aria-label="可输入编辑区"
    @scroll="emit('scroll')"
  >
    <div v-if="debug" class="writing-editor__meta">
      <span>草稿已保存 10:42</span>
      <span>baseDraftBodyHash sha256:9af...</span>
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
          @input="handleTitleInput"
        />
        <textarea
          ref="bodyInputRef"
          :value="body"
          class="body-input"
          rows="14"
          aria-label="文章正文"
          @input="handleBodyInput"
        />

        <footer v-if="debug" class="document-structure">
          <span>Content blocks</span>
          <strong>{{ blockCount }}</strong>
          <span>basePostVersion 12</span>
        </footer>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type {
  EditorShowcaseTextSelection,
  EditorShowcaseToolbarAction,
} from "@/features/editor-showcase/model";

defineProps<{
  title: string;
  body: string;
  blockCount: number;
  debug: boolean;
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
  border: 1px solid rgba(49, 74, 91, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.66);
  backdrop-filter: blur(18px);
}

:global(.editor-showcase--ink) .writing-editor {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(19, 27, 38, 0.72);
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

:global(.editor-showcase--ink) .writing-editor__meta {
  border-color: rgba(210, 225, 236, 0.12);
  color: #9db8ca;
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

:global(.editor-showcase--ink) .selection-toolbar {
  border-color: rgba(210, 225, 236, 0.14);
  background: rgba(22, 32, 45, 0.92);
}

:global(.editor-showcase--ink) .selection-toolbar button {
  color: #d7e4ee;
}

:global(.editor-showcase--ink) .selection-toolbar button:hover,
:global(.editor-showcase--ink) .selection-toolbar button:focus-visible {
  background: rgba(125, 211, 252, 0.12);
  color: #ffffff;
}

.document-sheet__path {
  margin: 0 0 6px;
  color: #7d6b5a;
  font-size: 13px;
}

:global(.editor-showcase--ink) .document-sheet__path {
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
  overflow: hidden;
}

.title-input:focus,
.body-input:focus {
  caret-color: #1f7f74;
}

:global(.editor-showcase--ink) .body-input {
  color: #cbd6df;
}

:global(.editor-showcase--ink) .title-input::placeholder,
:global(.editor-showcase--ink) .body-input::placeholder {
  color: #b7c6d1;
}

:global(.editor-showcase--ink) .title-input:focus,
:global(.editor-showcase--ink) .body-input:focus {
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

:global(.editor-showcase--ink) .document-structure {
  border-color: rgba(210, 225, 236, 0.12);
  color: #9db8ca;
}

:global(.editor-showcase--ink) .document-structure strong {
  color: #ffffff;
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
