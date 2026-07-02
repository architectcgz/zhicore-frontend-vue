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
      <span>{{ wordCount }} 字</span>
      <span>{{ bodyCharacterCount }} / {{ bodyMaxLength }} 字符</span>
    </div>

    <section class="writing-editor__canvas">
      <article class="document-sheet">
        <nav class="selection-toolbar" aria-label="格式工具">
          <div
            v-for="group in toolbarGroups"
            :key="group.id"
            class="selection-toolbar__group"
          >
            <button
              v-for="item in group.items"
              :key="item.action"
              type="button"
              :aria-label="item.title"
              :title="item.title"
              @mousedown.prevent
              @click="emit('toolbarAction', item.action)"
            >
              {{ item.label }}
            </button>
          </div>
        </nav>

        <p class="document-sheet__path">作者工作台 / 草稿</p>
        <textarea
          :value="title"
          class="title-input"
          rows="2"
          aria-label="文章标题"
          placeholder="输入文章标题"
          @input="handleTitleInput"
          @keydown="handleEditorKeydown"
        />
        <textarea
          ref="bodyInputRef"
          :value="body"
          class="body-input"
          rows="14"
          :maxlength="bodyMaxLength"
          aria-label="文章正文"
          placeholder="从这里开始写正文"
          @input="handleBodyInput"
          @keydown="handleEditorKeydown"
          @focus="rememberBodySelection"
          @keyup="rememberBodySelection"
          @mouseup="rememberBodySelection"
          @select="rememberBodySelection"
        />

        <footer class="document-structure">
          <span>PostBodyWriteInput</span>
          <strong>schema v1</strong>
          <span>{{ wordCount }} 字</span>
          <span>{{ bodyCharacterCount }} / {{ bodyMaxLength }} 字符</span>
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

interface ToolbarItem {
  action: EditorShowcaseToolbarAction;
  label: string;
  title: string;
}

interface ToolbarGroup {
  id: string;
  items: ToolbarItem[];
}

const toolbarGroups: ToolbarGroup[] = [
  {
    id: "inline",
    items: [
      { action: "bold", label: "B", title: "加粗" },
      { action: "italic", label: "I", title: "斜体" },
      { action: "strike", label: "S", title: "删除线" },
      { action: "inlineCode", label: "`", title: "行内代码" },
      { action: "link", label: "Link", title: "插入链接" },
    ],
  },
  {
    id: "heading",
    items: [
      { action: "heading1", label: "H1", title: "一级标题" },
      { action: "heading2", label: "H2", title: "二级标题" },
      { action: "heading3", label: "H3", title: "三级标题" },
      { action: "heading4", label: "H4", title: "四级标题" },
      { action: "heading5", label: "H5", title: "五级标题" },
      { action: "heading6", label: "H6", title: "六级标题" },
    ],
  },
  {
    id: "block",
    items: [
      { action: "quote", label: ">", title: "引用块" },
      { action: "unorderedList", label: "-", title: "无序列表" },
      { action: "orderedList", label: "1.", title: "有序列表" },
      { action: "taskList", label: "[]", title: "任务列表" },
      { action: "image", label: "Img", title: "插入图片" },
      { action: "code", label: "Code", title: "代码块" },
      { action: "table", label: "Tbl", title: "表格" },
      { action: "math", label: "Math", title: "数学公式" },
    ],
  },
];

defineProps<{
  title: string;
  body: string;
  wordCount: number;
  bodyCharacterCount: number;
  bodyMaxLength: number;
  saveStatus: EditorDraftSaveStatus;
  saveStatusLabel: string;
  lastSavedLabel: string;
  savedContentHash: string;
}>();

const emit = defineEmits<{
  titleInput: [value: string];
  bodyInput: [value: string];
  undo: [];
  redo: [];
  toolbarAction: [action: EditorShowcaseToolbarAction];
  scroll: [];
}>();

const bodyInputRef = ref<HTMLTextAreaElement | null>(null);
const writingEditorRef = ref<HTMLElement | null>(null);
const lastBodySelection = ref<EditorShowcaseTextSelection>({
  start: 0,
  end: 0,
});

function handleTitleInput(event: Event): void {
  emit("titleInput", (event.target as HTMLTextAreaElement).value);
}

function handleBodyInput(event: Event): void {
  rememberBodySelection();
  emit("bodyInput", (event.target as HTMLTextAreaElement).value);
}

function handleEditorKeydown(event: KeyboardEvent): void {
  const isModifierPressed = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (!isModifierPressed) {
    return;
  }

  if (key === "z" && !event.shiftKey) {
    event.preventDefault();
    emit("undo");
    return;
  }

  if ((key === "z" && event.shiftKey) || key === "y") {
    event.preventDefault();
    emit("redo");
  }
}

function readBodySelection(): EditorShowcaseTextSelection | undefined {
  const textarea = bodyInputRef.value;

  if (!textarea) {
    return undefined;
  }

  return {
    start: textarea.selectionStart,
    end: textarea.selectionEnd,
  };
}

function rememberBodySelection(): void {
  const selection = readBodySelection();

  if (selection) {
    lastBodySelection.value = selection;
  }
}

function getBodySelection(): EditorShowcaseTextSelection {
  return readBodySelection() ?? lastBodySelection.value;
}

function focusBody(): void {
  bodyInputRef.value?.focus();
}

function setBodySelection(selection: EditorShowcaseTextSelection): void {
  bodyInputRef.value?.setSelectionRange(selection.start, selection.end);
  lastBodySelection.value = selection;
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
  flex-wrap: wrap;
  width: min(100%, max-content);
  gap: 6px;
  margin: 0 auto 12px;
  padding: 4px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 8px;
  background: var(--editor-control-bg-active, rgba(255, 255, 255, 0.88));
}

.selection-toolbar__group {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.selection-toolbar__group + .selection-toolbar__group {
  padding-left: 6px;
  border-left: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
}

.selection-toolbar button {
  min-width: 32px;
  min-height: 28px;
  padding: 0 7px;
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
    justify-content: flex-start;
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
