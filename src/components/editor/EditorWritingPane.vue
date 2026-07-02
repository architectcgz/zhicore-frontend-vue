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
        <div
          ref="bodyInputRef"
          class="body-input ProseMirror"
          contenteditable="true"
          aria-label="文章正文"
          @keydown="handleEditorKeydown"
        ></div>

        <footer class="document-structure">
          <span>{{ wordCount }} 字</span>
        </footer>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

import type {
  EditorDraftSaveStatus,
  EditorBackground,
  EditorBackgroundId,
  EditorMode,
  EditorToolbarAction,
} from "@/features/editor/model";
import type { EditorProseMirrorDocumentJson } from "@/features/editor/model/editorProseMirrorEngine";
import { editorToolbarGroups } from "@/features/editor/model/editorToolbar";

import { useEditorWritingBodyEditor } from "./useEditorWritingBodyEditor";

const toolbarGroups = editorToolbarGroups;

const props = defineProps<{
  activeMode: EditorMode;
  activeBackgroundId: EditorBackgroundId;
  backgroundCandidates: EditorBackground[];
  title: string;
  bodyDocumentJson: EditorProseMirrorDocumentJson;
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
  bodyDocumentInput: [value: EditorProseMirrorDocumentJson];
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
  bodyEditorView,
  focusBody,
  getBodySelection,
  setBodySelection,
  preserveBodySelectionBeforeToolbarCommand,
  syncBodyEditorFromDocumentJson,
  applyBodyToolbarAction,
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
  }
}

function handleToolbarButtonClick(action: EditorToolbarAction): void {
  emit("toolbarAction", action);
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
  get bodyEditorView() {
    return bodyEditorView.value;
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

<style src="./EditorWritingPaneProseMirrorBase.css"></style>
<style scoped src="./EditorWritingPane.css"></style>
