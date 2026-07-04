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
        <div class="selection-toolbar-layer">
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
                @click="handleToolbarButtonClick(item.action)"
              >
                {{ item.label }}
              </button>
            </div>

            <select
              v-if="currentCodeBlockLanguage"
              class="selection-toolbar__code-language"
              :value="currentCodeBlockLanguage"
              aria-label="代码语言"
              @change="handleCodeBlockLanguageChange"
            >
              <option
                v-for="language in codeBlockLanguageOptions"
                :key="language.value"
                :value="language.value"
              >
                {{ language.label }}
              </option>
            </select>

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
        </div>

        <textarea
          :value="title"
          class="title-input"
          rows="1"
          aria-label="文章标题"
          placeholder="输入文章标题"
          @input="handleTitleInput"
          @keydown="handleEditorKeydown"
        />
        <EditorContent
          :editor="bodyEditor ?? undefined"
          class="body-input"
          aria-label="文章正文"
          @keydown="handleEditorKeydown"
        />

        <footer class="document-structure">
          <span>{{ wordCount }} 字</span>
        </footer>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { EditorContent } from "@tiptap/vue-3";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import type {
  EditorDraftSaveStatus,
  EditorBackground,
  EditorBackgroundId,
  EditorMode,
  EditorToolbarAction,
  EditorTiptapDocumentJson,
} from "@/features/editor";
import { editorCodeBlockLanguageOptions } from "@/features/editor/config/editorCodeBlockLanguages";
import { editorToolbarGroups } from "@/features/editor/config/editorToolbar";

import { useEditorWritingBodyEditor } from "./useEditorWritingBodyEditor";

const toolbarGroups = editorToolbarGroups;
const codeBlockLanguageOptions = editorCodeBlockLanguageOptions;

const props = defineProps<{
  activeMode: EditorMode;
  activeBackgroundId: EditorBackgroundId;
  backgroundCandidates: EditorBackground[];
  title: string;
  bodyDocumentJson: EditorTiptapDocumentJson;
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
  bodyDocumentInput: [value: EditorTiptapDocumentJson];
  undo: [];
  redo: [];
  saveDraft: [];
  toolbarAction: [action: EditorToolbarAction];
  selectMode: [mode: EditorMode];
  selectBackground: [backgroundId: EditorBackgroundId];
  scroll: [];
}>();

const isToolbarExpanded = ref(false);
const {
  bodyInputRef,
  writingEditorRef,
  bodyEditor,
  currentCodeBlockLanguage,
  focusBody,
  getBodySelection,
  setBodySelection,
  preserveBodySelectionBeforeToolbarCommand,
  syncBodyEditorFromDocumentJson,
  applyBodyToolbarAction,
  setCodeBlockLanguage,
  mountBodyEditor,
  destroyBodyEditor,
} = useEditorWritingBodyEditor({
  getBodyDocumentJson: () => props.bodyDocumentJson,
  getBodyMaxLength: () => props.bodyMaxLength,
  emitBodyDocumentInput: (value) => emit("bodyDocumentInput", value),
});

function handleTitleInput(event: Event): void {
  emit("titleInput", (event.target as HTMLTextAreaElement).value);
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
    return;
  }

  if (key === "s") {
    // 编辑器内的保存快捷键复用工具栏保存入口，避免浏览器默认保存页面打断草稿流程。
    event.preventDefault();
    emit("saveDraft");
  }
}

function handleToolbarButtonClick(action: EditorToolbarAction): void {
  emit("toolbarAction", action);
}

function handleCodeBlockLanguageChange(event: Event): void {
  setCodeBlockLanguage((event.target as HTMLSelectElement).value);
}

onMounted(() => {
  mountBodyEditor();
});

onBeforeUnmount(() => {
  destroyBodyEditor();
});

watch(
  () => props.bodyDocumentJson,
  (bodyDocumentJson) => {
    syncBodyEditorFromDocumentJson(bodyDocumentJson);
  },
);

defineExpose({
  get bodyInputElement() {
    return bodyInputRef.value;
  },
  get bodyEditorElement() {
    return bodyInputRef.value;
  },
  get bodyEditor() {
    return bodyEditor.value;
  },
  get writingEditorElement() {
    return writingEditorRef.value;
  },
  focusBody,
  getBodySelection,
  setBodySelection,
  applyBodyToolbarAction,
});
</script>

<style src="./EditorWritingPaneTiptapBase.css"></style>
<style scoped src="./EditorWritingPane.css"></style>
