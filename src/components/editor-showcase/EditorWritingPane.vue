<template>
  <main
    ref="writingEditorRef"
    class="writing-editor"
    aria-label="可输入编辑区"
    @scroll="emit('scroll')"
  >
    <div class="writing-editor__meta">
      <div class="writing-editor__status" aria-live="polite">
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

      <div class="writing-editor__mode-switch" aria-label="编辑器视图">
        <button
          type="button"
          :aria-pressed="activeMode === 'focus'"
          @click="emit('selectMode', 'focus')"
        >
          专注写作
        </button>
        <button
          type="button"
          :aria-pressed="activeMode === 'preview'"
          @click="emit('selectMode', 'preview')"
        >
          写作 + 预览
        </button>
      </div>

      <div class="writing-editor__background-picker" aria-label="背景候选">
        <button
          v-for="background in backgroundCandidates"
          :key="background.id"
          class="writing-editor__background-swatch"
          type="button"
          :aria-label="`切换到${background.name}背景`"
          :aria-pressed="activeBackgroundId === background.id"
          @click="emit('selectBackground', background.id)"
        >
          <span :style="{ background: background.swatch }"></span>
          {{ background.name }}
        </button>
      </div>
    </div>

    <section class="writing-editor__canvas">
      <article class="document-sheet">
        <nav
          :class="[
            'selection-toolbar',
            { 'selection-toolbar--expanded': isToolbarExpanded },
          ]"
          aria-label="格式工具"
        >
          <div class="selection-toolbar__group">
            <button
              class="selection-toolbar__command selection-toolbar__mobile-primary"
              type="button"
              aria-label="撤销上一步编辑"
              title="撤销"
              :disabled="!canUndo"
              @pointerdown="preserveBodySelectionBeforeToolbarCommand"
              @mousedown="preserveBodySelectionBeforeToolbarCommand"
              @click="emit('undo')"
            >
              撤销
            </button>
            <button
              class="selection-toolbar__command selection-toolbar__mobile-primary"
              type="button"
              aria-label="重做上一步编辑"
              title="重做"
              :disabled="!canRedo"
              @pointerdown="preserveBodySelectionBeforeToolbarCommand"
              @mousedown="preserveBodySelectionBeforeToolbarCommand"
              @click="emit('redo')"
            >
              重做
            </button>
            <button
              class="selection-toolbar__command selection-toolbar__command--save selection-toolbar__mobile-primary"
              type="button"
              title="保存草稿"
              :disabled="!canSaveDraft"
              @pointerdown="preserveBodySelectionBeforeToolbarCommand"
              @mousedown="preserveBodySelectionBeforeToolbarCommand"
              @click="emit('saveDraft')"
            >
              {{ saveButtonLabel }}
            </button>
          </div>

          <div
            v-for="group in toolbarGroups"
            :key="group.id"
            class="selection-toolbar__group"
          >
            <button
              v-for="item in group.items"
              :key="item.action"
              :class="{
                'selection-toolbar__mobile-primary':
                  item.action === 'bold' || item.action === 'link',
              }"
              type="button"
              :aria-label="item.title"
              :title="item.title"
              @pointerdown="preserveBodySelectionBeforeToolbarCommand"
              @mousedown="preserveBodySelectionBeforeToolbarCommand"
              @click="emit('toolbarAction', item.action)"
            >
              {{ item.label }}
            </button>
          </div>

          <button
            class="selection-toolbar__toggle"
            type="button"
            :aria-expanded="isToolbarExpanded"
            aria-label="展开或收起全部格式工具"
            @click="isToolbarExpanded = !isToolbarExpanded"
          >
            {{ isToolbarExpanded ? "收起" : "更多" }}
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
          <span>{{ wordCount }} 字</span>
        </footer>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from "vue";

import type {
  EditorDraftSaveStatus,
  EditorShowcaseBackground,
  EditorShowcaseBackgroundId,
  EditorShowcaseMode,
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

interface ToolbarCommandScrollSnapshot {
  writingEditor: HTMLElement | null;
  viewportScrollX: number;
  viewportScrollY: number;
  editorScrollLeft: number;
  editorScrollTop: number;
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
  activeMode: EditorShowcaseMode;
  activeBackgroundId: EditorShowcaseBackgroundId;
  backgroundCandidates: EditorShowcaseBackground[];
  title: string;
  body: string;
  wordCount: number;
  bodyCharacterCount: number;
  bodyMaxLength: number;
  saveStatus: EditorDraftSaveStatus;
  saveStatusLabel: string;
  lastSavedLabel: string;
  saveButtonLabel: string;
  canSaveDraft: boolean;
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  titleInput: [value: string];
  bodyInput: [value: string];
  undo: [];
  redo: [];
  saveDraft: [];
  toolbarAction: [action: EditorShowcaseToolbarAction];
  selectMode: [mode: EditorShowcaseMode];
  selectBackground: [backgroundId: EditorShowcaseBackgroundId];
  scroll: [];
}>();

const bodyInputRef = ref<HTMLTextAreaElement | null>(null);
const writingEditorRef = ref<HTMLElement | null>(null);
const isToolbarExpanded = ref(false);
const lastBodySelection = ref<EditorShowcaseTextSelection>({
  start: 0,
  end: 0,
});
const lastToolbarCommandScrollSnapshot =
  ref<ToolbarCommandScrollSnapshot | null>(null);

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

function preserveBodySelectionBeforeToolbarCommand(event: Event): void {
  // 工具栏命令依赖正文选区定位插入点；先拦截按钮聚焦，避免移动端触摸按下时把 textarea 光标折回末尾。
  event.preventDefault();
  rememberBodySelection();
  lastToolbarCommandScrollSnapshot.value = captureToolbarCommandScroll();
}

function getBodySelection(): EditorShowcaseTextSelection {
  // 工具栏点击期间 textarea 可能已经失焦；此时移动端浏览器可能把 DOM selection 折到末尾。
  if (document.activeElement !== bodyInputRef.value) {
    return lastBodySelection.value;
  }

  return readBodySelection() ?? lastBodySelection.value;
}

function captureToolbarCommandScroll(): ToolbarCommandScrollSnapshot {
  const writingEditor = writingEditorRef.value;

  return {
    writingEditor,
    viewportScrollX: window.scrollX,
    viewportScrollY: window.scrollY,
    editorScrollLeft: writingEditor?.scrollLeft ?? 0,
    editorScrollTop: writingEditor?.scrollTop ?? 0,
  };
}

function createToolbarCommandScrollRestorer(): () => void {
  const snapshot =
    lastToolbarCommandScrollSnapshot.value ?? captureToolbarCommandScroll();

  return () => {
    if (snapshot.writingEditor) {
      snapshot.writingEditor.scrollLeft = snapshot.editorScrollLeft;
      snapshot.writingEditor.scrollTop = snapshot.editorScrollTop;
    }

    if (
      window.scrollX !== snapshot.viewportScrollX ||
      window.scrollY !== snapshot.viewportScrollY
    ) {
      window.scrollTo(snapshot.viewportScrollX, snapshot.viewportScrollY);
    }
  };
}

function scheduleToolbarCommandScrollRestore(restoreScroll: () => void): void {
  restoreScroll();
  window.requestAnimationFrame(restoreScroll);
  window.setTimeout(restoreScroll, 0);
  window.setTimeout(restoreScroll, 80);
  window.setTimeout(restoreScroll, 180);
  window.setTimeout(() => {
    lastToolbarCommandScrollSnapshot.value = null;
  }, 220);
}

function focusBody(): void {
  const restoreScroll = createToolbarCommandScrollRestorer();

  bodyInputRef.value?.focus({ preventScroll: true });
  // 部分移动端浏览器会在 preventScroll 后延迟把 textarea 光标滚进视口；
  // 工具栏命令聚焦正文时应保持作者当前阅读位置。
  scheduleToolbarCommandScrollRestore(restoreScroll);
}

function setBodySelection(selection: EditorShowcaseTextSelection): void {
  const restoreScroll = createToolbarCommandScrollRestorer();

  bodyInputRef.value?.setSelectionRange(selection.start, selection.end);
  lastBodySelection.value = selection;
  // 移动端浏览器会在 setSelectionRange 后主动把 textarea 光标滚进视口；
  // 工具栏命令应保持作者当前阅读位置，只更新源码和选区。
  scheduleToolbarCommandScrollRestore(restoreScroll);
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
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.1));
  color: var(--editor-page-muted, #647280);
  font-size: 13px;
}

.writing-editor__status,
.writing-editor__mode-switch,
.writing-editor__background-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.writing-editor__status span {
  white-space: nowrap;
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

.writing-editor__mode-switch,
.writing-editor__background-picker {
  justify-content: flex-end;
}

.writing-editor__mode-switch button,
.writing-editor__background-swatch {
  min-height: 32px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 999px;
  background: var(--editor-control-bg-muted, rgba(255, 255, 255, 0.56));
  color: var(--editor-page-muted, #405466);
  font-size: 13px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.writing-editor__mode-switch button {
  padding: 5px 11px;
}

.writing-editor__mode-switch button[aria-pressed="true"],
.writing-editor__background-swatch[aria-pressed="true"] {
  border-color: var(--editor-page-accent, #1f7f74);
  background: var(--editor-control-bg-active, #ffffff);
  color: var(--editor-page-text, #17202a);
}

.writing-editor__mode-switch button:hover,
.writing-editor__mode-switch button:focus-visible,
.writing-editor__background-swatch:hover,
.writing-editor__background-swatch:focus-visible {
  transform: translateY(-1px);
}

.writing-editor__background-swatch {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 4px 9px 4px 5px;
}

.writing-editor__background-swatch span {
  width: 22px;
  height: 22px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.16));
  border-radius: 50%;
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
  width: 100%;
  max-height: 38px;
  overflow: hidden;
  gap: 6px;
  margin: 0 auto 12px;
  padding: 4px;
  border: 1px solid var(--editor-page-border, rgba(49, 74, 91, 0.14));
  border-radius: 8px;
  background: var(--editor-control-bg-active, rgba(255, 255, 255, 0.88));
  transition:
    max-height 0.2s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.18s ease;
}

.selection-toolbar--expanded {
  max-height: 172px;
  box-shadow: 0 6px 8px rgba(23, 32, 42, 0.08);
}

.selection-toolbar__group {
  display: contents;
}

.selection-toolbar__group + .selection-toolbar__group button:first-child {
  margin-left: 4px;
  box-shadow: inset 1px 0 0 var(--editor-page-border, rgba(49, 74, 91, 0.14));
}

.selection-toolbar__toggle {
  display: none;
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

.selection-toolbar button:disabled {
  color: var(--editor-control-disabled-text, #6b7b88);
  cursor: not-allowed;
  opacity: 0.62;
}

.selection-toolbar button:disabled:hover {
  background: transparent;
}

.selection-toolbar__command {
  min-width: 44px;
}

.selection-toolbar__command--save:not(:disabled) {
  background: var(--editor-control-primary, #1f7f74);
  color: #ffffff;
}

.selection-toolbar__command--save:hover:not(:disabled),
.selection-toolbar__command--save:focus-visible:not(:disabled) {
  background: var(--editor-control-primary-hover, #176b62);
  color: #ffffff;
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

@media (max-width: 980px) {
  .writing-editor {
    max-height: none;
  }

  .writing-editor__meta {
    grid-template-columns: 1fr;
    align-items: flex-start;
  }

  .writing-editor__mode-switch,
  .writing-editor__background-picker {
    justify-content: flex-start;
  }

  .writing-editor__mode-switch {
    display: none;
  }

  .writing-editor__canvas {
    grid-template-columns: minmax(0, 1fr);
    padding: 10px 12px calc(92px + env(safe-area-inset-bottom, 0px));
  }

  .selection-toolbar {
    position: fixed;
    top: auto;
    right: 16px;
    bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    left: 16px;
    z-index: 10;
    display: flex;
    align-items: center;
    width: auto;
    max-height: 54px;
    margin: 0;
    padding: 7px 54px 7px 7px;
    border-color: var(--editor-page-border, rgba(49, 74, 91, 0.18));
    background: var(--editor-control-bg-active, #ffffff);
    box-shadow: 0 8px 14px rgba(23, 32, 42, 0.14);
  }

  .selection-toolbar.selection-toolbar--expanded {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    grid-auto-rows: 40px;
    align-content: start;
    max-height: min(42dvh, 220px);
    overflow-y: auto;
  }

  .selection-toolbar button {
    min-height: 40px;
  }

  .selection-toolbar
    button:not(.selection-toolbar__mobile-primary):not(
      .selection-toolbar__toggle
    ) {
    display: none;
  }

  .selection-toolbar.selection-toolbar--expanded
    button:not(.selection-toolbar__toggle) {
    display: inline-flex;
  }

  .selection-toolbar__mobile-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .selection-toolbar__group + .selection-toolbar__group button:first-child {
    margin-left: 0;
    box-shadow: none;
  }

  .selection-toolbar__toggle {
    position: absolute;
    top: 7px;
    right: 7px;
    display: inline-flex;
    align-items: center;
    min-width: 44px;
    background: var(--editor-control-bg-active, #ffffff);
  }
}

@media (max-width: 640px) {
  .writing-editor__status {
    align-items: flex-start;
    flex-direction: column;
  }

  .writing-editor__canvas {
    grid-template-columns: minmax(0, 1fr);
    padding: 8px 10px calc(92px + env(safe-area-inset-bottom, 0px));
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

@media (hover: hover) and (pointer: fine) {
  .selection-toolbar:hover,
  .selection-toolbar:focus-within {
    max-height: 172px;
    box-shadow: 0 6px 8px rgba(23, 32, 42, 0.08);
  }
}

@media (hover: none), (pointer: coarse) {
  .selection-toolbar {
    padding-right: 60px;
  }

  .selection-toolbar button {
    min-height: 36px;
  }

  .selection-toolbar__toggle {
    display: inline-flex;
    align-items: center;
    background: var(--editor-control-bg-active, #ffffff);
  }

  .writing-editor__mode-switch button,
  .writing-editor__background-swatch {
    min-height: 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .writing-editor__mode-switch button,
  .writing-editor__background-swatch,
  .selection-toolbar {
    transition: none;
  }
}
</style>
