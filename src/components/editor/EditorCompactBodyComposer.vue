<template>
  <section
    ref="writingEditorRef"
    class="editor-compact-body writing-editor"
    :aria-label="resolvedAriaLabel"
  >
    <nav class="editor-compact-body__toolbar" aria-label="格式工具">
      <button
        v-for="item in compactToolbarItems"
        :key="item.action"
        :class="`editor-compact-body__toolbar-button--${item.action}`"
        type="button"
        :aria-label="item.title"
        :title="item.title"
        @pointerdown="preserveBodySelectionBeforeToolbarCommand"
        @mousedown="preserveBodySelectionBeforeToolbarCommand"
        @click="handleToolbarButtonClick(item.action)"
      >
        {{ item.label }}
      </button>
    </nav>

    <EditorContent
      :editor="bodyEditor ?? undefined"
      class="editor-compact-body__content body-input"
      :aria-label="resolvedInputLabel"
    />
  </section>
</template>

<script setup lang="ts">
import { EditorContent } from "@tiptap/vue-3";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import {
  editorToolbarGroups,
  getTiptapPlainText,
  type EditorTiptapDocumentJson,
  type EditorToolbarAction,
} from "@/features/editor";

import { useEditorWritingBodyEditor } from "./useEditorWritingBodyEditor";

const defaultCompactToolbarActions: readonly EditorToolbarAction[] = [
  "bold",
  "italic",
  "underline",
  "strike",
  "inlineCode",
  "link",
  "quote",
  "unorderedList",
  "orderedList",
  "taskList",
  "code",
];

const props = defineProps<{
  modelValue: string;
  maxLength: number;
  ariaLabel?: string;
  inputLabel?: string;
  toolbarActions?: readonly EditorToolbarAction[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

function createPlainTextDocumentJson(text: string): EditorTiptapDocumentJson {
  const lines = text.split("\n");

  return {
    type: "doc",
    content: lines.map((line) => ({
      type: "paragraph",
      content: line ? [{ type: "text", text: line }] : [],
    })),
  };
}

const compactToolbarItems = computed(() => {
  const actionSet = new Set(
    props.toolbarActions ?? defaultCompactToolbarActions,
  );

  return editorToolbarGroups
    .flatMap((group) => group.items)
    .filter((item) => actionSet.has(item.action));
});
const resolvedAriaLabel = computed(() => props.ariaLabel ?? "轻量编辑器");
const resolvedInputLabel = computed(() => props.inputLabel ?? "正文");

const bodyDocumentJson = ref<EditorTiptapDocumentJson>(
  createPlainTextDocumentJson(props.modelValue),
);

const {
  bodyInputRef,
  writingEditorRef,
  bodyEditor,
  preserveBodySelectionBeforeToolbarCommand,
  syncBodyEditorFromDocumentJson,
  applyBodyToolbarAction,
  mountBodyEditor,
  destroyBodyEditor,
} = useEditorWritingBodyEditor({
  getBodyDocumentJson: () => bodyDocumentJson.value,
  getBodyMaxLength: () => props.maxLength,
  emitBodyDocumentInput: (value) => {
    bodyDocumentJson.value = value;
    emit("update:modelValue", getTiptapPlainText(value));
  },
});

function handleToolbarButtonClick(action: EditorToolbarAction): void {
  applyBodyToolbarAction(action);
}

onMounted(() => {
  mountBodyEditor();
});

onBeforeUnmount(() => {
  destroyBodyEditor();
});

watch(
  () => props.modelValue,
  (modelValue) => {
    // 外部 plain text 回写如果只是当前文档的文本投影，不应抹掉本地 Tiptap 结构。
    if (modelValue === getTiptapPlainText(bodyDocumentJson.value)) {
      return;
    }

    bodyDocumentJson.value = createPlainTextDocumentJson(modelValue);
    syncBodyEditorFromDocumentJson(bodyDocumentJson.value);
  },
);

watch(bodyDocumentJson, (documentJson) => {
  syncBodyEditorFromDocumentJson(documentJson);
});

defineExpose({
  get bodyEditor() {
    return bodyEditor.value;
  },
  get bodyEditorElement() {
    return bodyInputRef.value;
  },
});
</script>

<style src="./EditorWritingPaneTiptapBase.css"></style>
<style scoped>
.editor-compact-body {
  display: grid;
  min-height: 128px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
}

.editor-compact-body__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-hover);
}

.editor-compact-body__toolbar button {
  min-height: 30px;
  padding: 0 var(--space-2);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-soft);
  font-size: 0.8125rem;
  font-weight: 750;
  cursor: pointer;
}

.editor-compact-body__toolbar button:hover,
.editor-compact-body__toolbar button:focus-visible {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
  color: var(--color-text-strong);
  outline: 0;
}

.editor-compact-body__toolbar-button--strike {
  text-decoration: line-through;
  text-decoration-thickness: 2px;
}

.editor-compact-body__content {
  min-height: 96px;
  padding: var(--space-3);
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--compact-editor-body-size, 1rem);
  line-height: var(--compact-editor-body-line-height, 1.75);
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
