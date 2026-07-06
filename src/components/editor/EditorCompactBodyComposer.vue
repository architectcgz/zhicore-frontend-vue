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
        :data-testid="`compact-toolbar-${item.action}`"
        @pointerdown="preserveBodySelectionBeforeToolbarCommand"
        @mousedown="preserveBodySelectionBeforeToolbarCommand"
        @click="handleToolbarButtonClick(item.action)"
      >
        {{ item.label }}
      </button>
    </nav>

    <form
      v-if="activePanel === 'link'"
      class="editor-compact-body__panel editor-compact-body__link-panel"
      aria-label="编辑链接"
      @submit.prevent="applyLinkDraft"
    >
      <label>
        <span>文字</span>
        <input
          v-model="linkDraftText"
          data-testid="compact-link-text"
          type="text"
          autocomplete="off"
          placeholder="显示文字"
        />
      </label>
      <label>
        <span>链接</span>
        <input
          v-model="linkDraftHref"
          data-testid="compact-link-href"
          type="url"
          inputmode="url"
          autocomplete="off"
          placeholder="https://"
        />
      </label>
      <p v-if="linkDraftError" class="editor-compact-body__panel-error">
        {{ linkDraftError }}
      </p>
      <div class="editor-compact-body__panel-actions">
        <button type="button" @click="closeCompactPanel">取消</button>
        <button
          class="editor-compact-body__panel-primary"
          data-testid="compact-link-apply"
          type="button"
          @click="applyLinkDraft"
        >
          应用
        </button>
      </div>
    </form>

    <div
      v-if="activePanel === 'mention'"
      class="editor-compact-body__panel editor-compact-body__mention-panel"
      aria-label="选择提及用户"
    >
      <button
        v-for="suggestion in mentionSuggestions"
        :key="suggestion.publicId"
        type="button"
        :data-testid="`compact-mention-option-${suggestion.publicId}`"
        @click="insertMention(suggestion)"
      >
        <span>{{ suggestion.displayName.slice(0, 1) }}</span>
        <strong>{{ suggestion.displayName }}</strong>
        <small>@{{ suggestion.publicId }}</small>
      </button>
    </div>

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

import { sanitizePostBodyExternalUrl } from "@/entities/post-body";
import {
  editorToolbarGroups,
  getTiptapPlainText,
  type EditorTiptapDocumentJson,
  type EditorToolbarAction,
} from "@/features/editor";

import { useEditorWritingBodyEditor } from "./useEditorWritingBodyEditor";

const mentionToolbarItem = {
  action: "mention",
  label: "@",
  title: "提及用户",
} as const;
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
const defaultMentionSuggestions: readonly CompactMentionSuggestion[] = [
  { publicId: "user-lin", displayName: "Lin" },
  { publicId: "user-zhou", displayName: "Zhou" },
  { publicId: "user-chen", displayName: "Chen" },
];

interface CompactMentionSuggestion {
  publicId: string;
  displayName: string;
}

const props = defineProps<{
  modelValue: string;
  maxLength: number;
  ariaLabel?: string;
  inputLabel?: string;
  toolbarActions?: readonly EditorToolbarAction[];
  mentionSuggestions?: readonly CompactMentionSuggestion[];
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

  const toolbarItems = editorToolbarGroups
    .flatMap((group) => group.items)
    .filter((item) => actionSet.has(item.action));

  return actionSet.has("mention")
    ? [...toolbarItems, mentionToolbarItem]
    : toolbarItems;
});
const resolvedAriaLabel = computed(() => props.ariaLabel ?? "轻量编辑器");
const resolvedInputLabel = computed(() => props.inputLabel ?? "正文");
const mentionSuggestions = computed(
  () => props.mentionSuggestions ?? defaultMentionSuggestions,
);

const bodyDocumentJson = ref<EditorTiptapDocumentJson>(
  createPlainTextDocumentJson(props.modelValue),
);
const activePanel = ref<"link" | "mention" | null>(null);
const linkDraftText = ref("");
const linkDraftHref = ref("");
const linkDraftError = ref("");
const linkDraftSelection = ref<{ from: number; to: number } | null>(null);

const {
  bodyInputRef,
  writingEditorRef,
  bodyEditor,
  bodySelection,
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
const bodySelectionSignature = computed(() => {
  return `${bodySelection.value.start}:${bodySelection.value.end}`;
});

function handleToolbarButtonClick(action: EditorToolbarAction): void {
  if (action === "link") {
    openLinkPanel();
    return;
  }

  if (action === "mention") {
    openMentionPanel();
    return;
  }

  activePanel.value = null;
  applyBodyToolbarAction(action);
}

function closeCompactPanel(): void {
  activePanel.value = null;
}

function openLinkPanel(): void {
  const editor = bodyEditor.value;

  if (!editor) {
    return;
  }

  if (editor.isActive("link")) {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .extendMarkRange("link")
      .run();
  }

  const { from, to } = editor.state.selection;
  const selectedText = editor.state.doc.textBetween(from, to, "\n").trim();
  const activeHref = String(editor.getAttributes("link").href ?? "");

  linkDraftSelection.value = { from, to };
  linkDraftText.value = selectedText || "链接文本";
  linkDraftHref.value = activeHref || "https://";
  linkDraftError.value = "";
  activePanel.value = "link";
}

function applyLinkDraft(): void {
  const editor = bodyEditor.value;
  const text = linkDraftText.value.trim();
  const href = sanitizePostBodyExternalUrl(linkDraftHref.value);

  if (!editor) {
    return;
  }

  if (!text) {
    linkDraftError.value = "链接文字不能为空";
    return;
  }

  if (!href) {
    linkDraftError.value = "请输入有效的 http 或 https 链接";
    return;
  }

  const selection = linkDraftSelection.value ?? editor.state.selection;

  editor
    .chain()
    .focus(undefined, { scrollIntoView: false })
    .insertContentAt(
      { from: selection.from, to: selection.to },
      {
        type: "text",
        text,
        marks: [{ type: "link", attrs: { href } }],
      },
    )
    .run();
  closeCompactPanel();
}

function openMentionPanel(): void {
  activePanel.value = activePanel.value === "mention" ? null : "mention";
}

function insertMention(suggestion: CompactMentionSuggestion): void {
  bodyEditor.value
    ?.chain()
    .focus(undefined, { scrollIntoView: false })
    .insertContent(`@${suggestion.displayName} `)
    .run();
  closeCompactPanel();
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

watch(bodySelectionSignature, (selectionSignature) => {
  const selection = linkDraftSelection.value;

  if (
    activePanel.value !== "link" ||
    !selection ||
    selectionSignature === `${selection.from}:${selection.to}`
  ) {
    return;
  }

  closeCompactPanel();
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
  border: var(--compact-editor-border, 1px solid var(--color-border));
  border-radius: var(--compact-editor-radius, var(--radius-lg));
  background: var(--compact-editor-bg, var(--color-bg-elevated));
}

.editor-compact-body__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
  padding: var(--space-2);
  border-bottom: var(
    --compact-editor-toolbar-border,
    1px solid var(--color-border)
  );
  background: var(--compact-editor-toolbar-bg, var(--color-bg-hover));
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

.editor-compact-body__panel {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-2) var(--compact-editor-content-padding, var(--space-3))
    var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: var(--compact-editor-panel-bg, var(--color-bg-hover));
}

.editor-compact-body__link-panel {
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr) max-content;
  align-items: end;
  border-top: 1px solid color-mix(in srgb, var(--color-border) 72%, transparent);
}

.editor-compact-body__panel label {
  display: grid;
  gap: var(--space-1);
  min-width: 0;
}

.editor-compact-body__panel label span,
.editor-compact-body__panel-error,
.editor-compact-body__mention-panel small {
  color: var(--color-text-soft);
  font-size: var(--font-size-12);
  font-weight: 650;
}

.editor-compact-body__panel input {
  min-width: 0;
  min-height: 2.125rem;
  padding: 0 var(--space-2);
  border: 0;
  border-bottom: 1px solid var(--color-border);
  border-radius: 0;
  background: transparent;
  color: var(--color-text-strong);
  font: inherit;
  outline: 0;
}

.editor-compact-body__panel input:focus {
  border-bottom-color: var(--color-accent);
}

.editor-compact-body__panel-error {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--color-danger);
}

.editor-compact-body__panel-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: flex-end;
}

.editor-compact-body__panel-actions button,
.editor-compact-body__mention-panel button {
  min-height: 2.125rem;
  padding: 0 var(--space-2);
  border: 0;
  border-radius: 0;
  background: transparent;
  color: var(--color-text-soft);
  cursor: pointer;
  font-weight: 750;
}

.editor-compact-body__panel-actions button:focus-visible {
  color: var(--color-text-strong);
  outline: 2px solid var(--color-accent);
  outline-offset: var(--space-1);
}

.editor-compact-body__panel-actions .editor-compact-body__panel-primary {
  color: var(--color-accent);
}

.editor-compact-body__panel-actions
  .editor-compact-body__panel-primary:focus-visible {
  color: var(--color-accent);
}

.editor-compact-body__mention-panel button:hover,
.editor-compact-body__mention-panel button:focus-visible {
  color: var(--color-text-strong);
  outline: 2px solid var(--color-accent);
  outline-offset: var(--space-1);
}

.editor-compact-body__mention-panel {
  display: flex;
  flex-wrap: wrap;
}

.editor-compact-body__mention-panel button {
  display: inline-grid;
  grid-template-columns: 1.5rem max-content max-content;
  gap: var(--space-2);
  align-items: center;
  padding: 0;
}

.editor-compact-body__mention-panel button span {
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  border-radius: var(--radius-pill);
  background: var(--color-text-strong);
  color: var(--color-bg-elevated);
  font-size: var(--font-size-12);
}

.editor-compact-body__mention-panel strong {
  color: var(--color-text-strong);
  font-size: var(--font-size-13);
}

.editor-compact-body__content {
  min-height: 96px;
  padding: var(--compact-editor-content-padding, var(--space-3));
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--compact-editor-body-size, 1rem);
  line-height: var(--compact-editor-body-line-height, 1.75);
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 640px) {
  .editor-compact-body__link-panel {
    grid-template-columns: 1fr;
  }

  .editor-compact-body__panel-actions {
    justify-content: flex-start;
  }
}
</style>
