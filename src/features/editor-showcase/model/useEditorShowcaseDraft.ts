import { computed, getCurrentScope, onScopeDispose, ref } from "vue";

import {
  compileEditorContent,
  type EditorCompiledBlock,
  type EditorCompiledDocument,
  type EditorCompiledInlineNode,
} from "./editorContentCompiler";

export type EditorShowcaseDraftBlockType = EditorCompiledBlock["type"];
export type EditorShowcaseDraftBlock = EditorCompiledBlock;
export type EditorShowcaseInlineNode = EditorCompiledInlineNode;

export type EditorShowcaseToolbarAction =
  "bold" | "italic" | "link" | "code" | "heading2";

export interface EditorShowcaseTextSelection {
  start: number;
  end: number;
}

type EditorContentCompiler = (input: string) => EditorCompiledDocument;

export interface UseEditorShowcaseDraftOptions {
  compileContent?: EditorContentCompiler;
  previewCompileDebounceMs?: number;
}

const defaultTitle = "把复杂系统讲成可以协作的结构";
const defaultBody = [
  "# Markdown 语法验收稿",
  "",
  "一篇文章的价值不只来自观点，也来自读者能否沿着清晰的段落进入上下文。编辑器默认不展示厚重的 block 外框，只有在聚焦、拖拽或校验错误时才露出结构。",
  "",
  "## Inline",
  "",
  "这行包含 **加粗**、_斜体_、~~删除线~~、`inline code` 和 [ZhiCore 链接](https://example.com/docs)。",
  "",
  "## Quote",
  "",
  "> 引用块支持 `inline code` 和 **加粗**，用于验证 blockquote 与 inline 节点组合。",
  "",
  "## Lists",
  "",
  "- 无序列表第一项",
  "- 无序列表第二项 **加粗**",
  "",
  "1. 有序列表第一步",
  "2. 有序列表第二步",
  "",
  "- [x] 已完成任务",
  "- [ ] 未完成任务",
  "",
  "## Image",
  "",
  "![示例图片](https://placehold.co/640x360/png)",
  "",
  "## Code",
  "",
  "```go",
  "package main",
  "",
  'import "fmt"',
  "",
  "func main() {",
  '  fmt.Println("hello zhicore")',
  "}",
  "```",
  "",
  "## Table",
  "",
  "| 表头1 | 表头2 | 表头3 |",
  "| --- | --- | --- |",
  "| 数据1 | 数据2 | 数据3 |",
  "| 数据4 | 数据5 | 数据6 |",
  "",
  "## Math",
  "",
  "$$E = mc^2$$",
].join("\n");

const fallbackPreviewBlock: EditorShowcaseDraftBlock = {
  type: "text",
  label: "Text",
  content: "正文预览会随输入同步更新。",
  inlineNodes: [
    {
      type: "text",
      text: "正文预览会随输入同步更新。",
    },
  ],
};

const defaultPreviewCompileDebounceMs = 160;

function createContentHash(content: string): string {
  let hash = 2166136261;

  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash.toString(36);
}

function normalizeSelection(
  selection: EditorShowcaseTextSelection | undefined,
  textLength: number,
): EditorShowcaseTextSelection {
  if (!selection) {
    return {
      start: textLength,
      end: textLength,
    };
  }

  const start = Math.min(Math.max(selection.start, 0), textLength);
  const end = Math.min(Math.max(selection.end, 0), textLength);

  return start <= end
    ? { start, end }
    : {
        start: end,
        end: start,
      };
}

function applyInlineToolbarAction(
  currentBody: string,
  selection: EditorShowcaseTextSelection,
  wrapper: { prefix: string; suffix: string; placeholder: string },
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const selectedText = currentBody.slice(selection.start, selection.end);
  const innerText = selectedText || wrapper.placeholder;
  const replacement = `${wrapper.prefix}${innerText}${wrapper.suffix}`;

  return {
    nextBody:
      currentBody.slice(0, selection.start) +
      replacement +
      currentBody.slice(selection.end),
    nextSelection: {
      start: selection.start + wrapper.prefix.length,
      end: selection.start + wrapper.prefix.length + innerText.length,
    },
  };
}

function getBlockPadding(
  before: string,
  after: string,
): { leadingBreak: string; trailingBreak: string } {
  const leadingBreak = before.trim()
    ? before.endsWith("\n\n")
      ? ""
      : before.endsWith("\n")
        ? "\n"
        : "\n\n"
    : "";
  const trailingBreak = after.trim()
    ? after.startsWith("\n\n")
      ? ""
      : after.startsWith("\n")
        ? "\n"
        : "\n\n"
    : "";

  return {
    leadingBreak,
    trailingBreak,
  };
}

function applyBlockToolbarAction(
  currentBody: string,
  selection: EditorShowcaseTextSelection,
  block: { prefix: string; suffix: string; placeholder: string },
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const before = currentBody.slice(0, selection.start);
  const after = currentBody.slice(selection.end);
  const selectedText = currentBody.slice(selection.start, selection.end).trim();
  const innerText = selectedText || block.placeholder;
  const { leadingBreak, trailingBreak } = getBlockPadding(before, after);
  const replacement = `${leadingBreak}${block.prefix}${innerText}${block.suffix}${trailingBreak}`;
  const innerStart =
    selection.start + leadingBreak.length + block.prefix.length;

  return {
    nextBody: before + replacement + after,
    nextSelection: {
      start: innerStart,
      end: innerStart + innerText.length,
    },
  };
}

function applyToolbarActionToBody(
  currentBody: string,
  action: EditorShowcaseToolbarAction,
  selection?: EditorShowcaseTextSelection,
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const normalizedSelection = normalizeSelection(selection, currentBody.length);

  switch (action) {
    case "bold":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "**",
        suffix: "**",
        placeholder: "加粗文本",
      });
    case "italic":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "_",
        suffix: "_",
        placeholder: "斜体文本",
      });
    case "link":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "[",
        suffix: "](https://example.com)",
        placeholder: "链接文本",
      });
    case "heading2":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "## ",
        suffix: "",
        placeholder: "小标题",
      });
    case "code":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "```ts\n",
        suffix: "\n```",
        placeholder: "// 在这里输入代码",
      });
  }
}

export function useEditorShowcaseDraft(
  options: UseEditorShowcaseDraftOptions = {},
) {
  const compileContent = options.compileContent ?? compileEditorContent;
  const previewCompileDebounceMs =
    options.previewCompileDebounceMs ?? defaultPreviewCompileDebounceMs;
  const title = ref(defaultTitle);
  const body = ref(defaultBody);
  const compiledDocument = ref<EditorCompiledDocument>(
    compileContent(defaultBody),
  );
  let lastCompiledBody = defaultBody;
  let lastCompiledBodyHash = createContentHash(defaultBody);
  let previewCompileTimer: number | undefined;

  const previewTitle = computed(() => {
    const trimmedTitle = title.value.trim();
    return trimmedTitle || "未命名草稿";
  });

  const draftBlocks = computed(() => compiledDocument.value.blocks);

  const previewBlocks = computed(() => {
    return draftBlocks.value.length
      ? draftBlocks.value
      : [fallbackPreviewBlock];
  });

  const compiledHtml = computed(() => compiledDocument.value.html);

  const previewParagraphs = computed(() => {
    const paragraphs = previewBlocks.value
      .filter((block) => block.type === "text")
      .map((paragraph) => paragraph.content);

    return paragraphs.length ? paragraphs : ["正文预览会随输入同步更新。"];
  });

  const wordCount = computed(() => {
    const contentChars = body.value.match(/\p{Script=Han}|[A-Za-z0-9]+/gu);
    return contentChars?.length ?? 0;
  });

  function updateTitle(nextTitle: string): void {
    title.value = nextTitle;
  }

  function compilePreviewNow(): void {
    const nextBodyHash = createContentHash(body.value);

    if (
      nextBodyHash === lastCompiledBodyHash &&
      body.value === lastCompiledBody
    ) {
      return;
    }

    compiledDocument.value = compileContent(body.value);
    lastCompiledBody = body.value;
    lastCompiledBodyHash = nextBodyHash;
  }

  function schedulePreviewCompilation(): void {
    window.clearTimeout(previewCompileTimer);

    if (previewCompileDebounceMs <= 0) {
      compilePreviewNow();
      return;
    }

    // 正文输入可能连续触发，预览编译延迟到用户短暂停顿后执行，减少同步解析压力。
    previewCompileTimer = window.setTimeout(() => {
      compilePreviewNow();
    }, previewCompileDebounceMs);
  }

  function updateBody(nextBody: string): void {
    if (nextBody === body.value) {
      return;
    }

    body.value = nextBody;
    schedulePreviewCompilation();
  }

  function applyToolbarAction(
    action: EditorShowcaseToolbarAction,
    selection?: EditorShowcaseTextSelection,
  ): EditorShowcaseTextSelection {
    const result = applyToolbarActionToBody(body.value, action, selection);

    body.value = result.nextBody;
    schedulePreviewCompilation();
    return result.nextSelection;
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      window.clearTimeout(previewCompileTimer);
    });
  }

  return {
    title,
    body,
    previewTitle,
    compiledDocument,
    compiledHtml,
    draftBlocks,
    previewBlocks,
    previewParagraphs,
    wordCount,
    updateTitle,
    updateBody,
    applyToolbarAction,
  };
}
