import { Editor } from "@tiptap/vue-3";
import { ref, shallowRef } from "vue";

import type {
  EditorTextSelection,
  EditorToolbarAction,
} from "@/features/editor/model";
import {
  normalizeEditorCodeBlockLanguage,
  serializeEditorCodeBlockLanguage,
} from "@/features/editor/model";
import {
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
  type EditorTiptapDocumentJson,
} from "@/features/editor/model/editorTiptapEngine";
import { createEditorTiptapExtensions } from "@/features/editor/model/editorTiptapExtensions";
import { applyTiptapToolbarAction } from "@/features/editor/model/editorTiptapToolbarCommands";

interface ToolbarCommandScrollSnapshot {
  writingEditor: HTMLElement | null;
  viewportScrollX: number;
  viewportScrollY: number;
  editorScrollLeft: number;
  editorScrollTop: number;
}

export interface UseEditorWritingBodyEditorOptions {
  getBodyDocumentJson: () => EditorTiptapDocumentJson;
  getBodyMaxLength: () => number;
  emitBodyDocumentInput: (value: EditorTiptapDocumentJson) => void;
}

export function useEditorWritingBodyEditor(
  options: UseEditorWritingBodyEditorOptions,
) {
  const bodyInputRef = ref<HTMLElement | null>(null);
  const writingEditorRef = ref<HTMLElement | null>(null);
  const bodyEditor = shallowRef<Editor | null>(null);
  const currentCodeBlockLanguage = ref<string | null>(null);
  const lastBodySelection = ref<EditorTextSelection>({
    start: 0,
    end: 0,
  });
  const lastToolbarCommandScrollSnapshot =
    ref<ToolbarCommandScrollSnapshot | null>(null);
  const toolbarCommandScrollTimers: number[] = [];

  function refreshBodyInputElement(): void {
    bodyInputRef.value = bodyEditor.value?.view.dom ?? null;
  }

  function readBodySelection(): EditorTextSelection | undefined {
    const editor = bodyEditor.value;

    if (!editor) {
      return undefined;
    }

    return {
      start: editor.state.selection.from,
      end: editor.state.selection.to,
    };
  }

  function readCurrentCodeBlockLanguage(): string | null {
    const editor = bodyEditor.value;

    if (!editor?.isActive("codeBlock")) {
      return null;
    }

    const language = editor.getAttributes("codeBlock").language;

    return normalizeEditorCodeBlockLanguage(language);
  }

  function refreshCurrentCodeBlockLanguage(): void {
    currentCodeBlockLanguage.value = readCurrentCodeBlockLanguage();
  }

  function rememberBodySelection(): void {
    const selection = readBodySelection();

    if (selection) {
      lastBodySelection.value = selection;
    }

    refreshCurrentCodeBlockLanguage();
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

  function preserveBodySelectionBeforeToolbarCommand(event: Event): void {
    // 工具栏命令依赖正文选区定位插入点；先拦截按钮聚焦，避免移动端触摸按下时把编辑器选区折回末尾。
    event.preventDefault();
    rememberBodySelection();
    lastToolbarCommandScrollSnapshot.value = captureToolbarCommandScroll();
  }

  function isBodyEditorFocused(): boolean {
    const bodyEditorElement = bodyInputRef.value;
    const activeElement = document.activeElement;

    return (
      bodyEditorElement !== null &&
      activeElement !== null &&
      (activeElement === bodyEditorElement ||
        bodyEditorElement.contains(activeElement))
    );
  }

  function getBodySelection(): EditorTextSelection {
    // 工具栏点击期间编辑器可能已经失焦；此时移动端浏览器可能把 DOM selection 折到末尾。
    if (!isBodyEditorFocused()) {
      return lastBodySelection.value;
    }

    return readBodySelection() ?? lastBodySelection.value;
  }

  function createToolbarCommandScrollRestorer(): () => void {
    const snapshot =
      lastToolbarCommandScrollSnapshot.value ?? captureToolbarCommandScroll();

    return () => {
      if (typeof window === "undefined") {
        return;
      }

      if (snapshot.writingEditor) {
        snapshot.writingEditor.scrollLeft = snapshot.editorScrollLeft;
        snapshot.writingEditor.scrollTop = snapshot.editorScrollTop;
      }

      window.scrollTo(snapshot.viewportScrollX, snapshot.viewportScrollY);
    };
  }

  function clearToolbarCommandScrollTimers(): void {
    toolbarCommandScrollTimers.splice(0).forEach((timerId) => {
      window.clearTimeout(timerId);
    });
  }

  function scheduleToolbarCommandScrollRestore(
    restoreScroll: () => void,
  ): void {
    clearToolbarCommandScrollTimers();
    restoreScroll();
    window.requestAnimationFrame(restoreScroll);
    toolbarCommandScrollTimers.push(
      window.setTimeout(restoreScroll, 0),
      window.setTimeout(restoreScroll, 80),
      window.setTimeout(restoreScroll, 180),
      window.setTimeout(() => {
        lastToolbarCommandScrollSnapshot.value = null;
      }, 220),
    );
  }

  function focusBody(): void {
    const restoreScroll = createToolbarCommandScrollRestorer();
    const editor = bodyEditor.value;

    editor?.commands.focus(undefined, { scrollIntoView: false });
    bodyInputRef.value?.focus({ preventScroll: true });
    // 部分移动端浏览器会在 preventScroll 后延迟把编辑器光标滚进视口；
    // 工具栏命令聚焦正文时应保持作者当前阅读位置。
    scheduleToolbarCommandScrollRestore(restoreScroll);
  }

  function clampBodySelectionToDocument(
    selection: EditorTextSelection,
    editor = bodyEditor.value,
  ): EditorTextSelection {
    const maxPosition = Math.max(1, (editor?.state.doc.content.size ?? 1) - 1);
    const start = Math.min(Math.max(selection.start, 0), maxPosition);
    const end = Math.min(Math.max(selection.end, 0), maxPosition);

    return start <= end ? { start, end } : { start: end, end: start };
  }

  function setBodySelection(selection: EditorTextSelection): void {
    const restoreScroll = createToolbarCommandScrollRestorer();
    const editor = bodyEditor.value;
    const tiptapSelection = clampBodySelectionToDocument(selection, editor);

    editor?.commands.setTextSelection({
      from: tiptapSelection.start,
      to: tiptapSelection.end,
    });
    lastBodySelection.value = tiptapSelection;
    // 移动端浏览器会在设置选区后主动把光标滚进视口；
    // 工具栏命令应保持作者当前阅读位置，只更新源码和选区。
    scheduleToolbarCommandScrollRestore(restoreScroll);
  }

  function syncBodyEditorFromDocumentJson(
    documentJson: EditorTiptapDocumentJson,
  ): void {
    const editor = bodyEditor.value;

    if (
      !editor ||
      JSON.stringify(editor.getJSON()) === JSON.stringify(documentJson)
    ) {
      return;
    }

    editor.commands.setContent(documentJson, {
      emitUpdate: false,
      errorOnInvalidContent: true,
    });
    setBodySelection(lastBodySelection.value);
  }

  function applyBodyToolbarAction(action: EditorToolbarAction): void {
    applyTiptapToolbarAction(bodyEditor.value, action);
    rememberBodySelection();
  }

  function setCodeBlockLanguage(language: string): void {
    const editor = bodyEditor.value;

    if (!editor?.isActive("codeBlock")) {
      return;
    }

    const nextLanguage = serializeEditorCodeBlockLanguage(
      normalizeEditorCodeBlockLanguage(language),
    );

    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .updateAttributes("codeBlock", {
        language: nextLanguage,
      })
      .run();
    rememberBodySelection();
  }

  function mountBodyEditor(): void {
    bodyEditor.value = new Editor({
      content: options.getBodyDocumentJson(),
      enableInputRules: false,
      enablePasteRules: false,
      extensions: createEditorTiptapExtensions({
        getBodyMaxLength: options.getBodyMaxLength,
      }),
      onCreate() {
        refreshBodyInputElement();
        rememberBodySelection();
      },
      onUpdate({ editor }) {
        const nextBodyDocumentJson = editor.getJSON();

        if (
          getTiptapPlainText(nextBodyDocumentJson).length >
          options.getBodyMaxLength()
        ) {
          return;
        }

        try {
          // draft owner 只接收可保存的 Content V1 文档树；guard extension 已拦截，保留此处作为安全网。
          mapTiptapJsonToPostBodyWriteInput(nextBodyDocumentJson);
        } catch {
          return;
        }

        rememberBodySelection();

        if (
          JSON.stringify(nextBodyDocumentJson) !==
          JSON.stringify(options.getBodyDocumentJson())
        ) {
          options.emitBodyDocumentInput(nextBodyDocumentJson);
        }
      },
      onSelectionUpdate() {
        rememberBodySelection();
      },
    });
    refreshBodyInputElement();
    rememberBodySelection();
  }

  function destroyBodyEditor(): void {
    clearToolbarCommandScrollTimers();
    bodyEditor.value?.destroy();
    bodyEditor.value = null;
    bodyInputRef.value = null;
    currentCodeBlockLanguage.value = null;
  }

  return {
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
  };
}
