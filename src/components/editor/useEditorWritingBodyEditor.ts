import { ref, shallowRef } from "vue";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import {
  EditorState,
  TextSelection,
  type Transaction,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import type {
  EditorTextSelection,
  EditorToolbarAction,
} from "@/features/editor/model";
import {
  createProseMirrorDocFromJson,
  editorProseMirrorSchema,
  serializeProseMirrorDocToJson,
  type EditorProseMirrorDocumentJson,
} from "@/features/editor/model/editorProseMirrorEngine";
import { applyProseMirrorToolbarAction } from "@/features/editor/model/editorProseMirrorToolbarCommands";

interface ToolbarCommandScrollSnapshot {
  writingEditor: HTMLElement | null;
  viewportScrollX: number;
  viewportScrollY: number;
  editorScrollLeft: number;
  editorScrollTop: number;
}

export interface UseEditorWritingBodyEditorOptions {
  getBodyDocumentJson: () => EditorProseMirrorDocumentJson;
  getBodyMaxLength: () => number;
  emitBodyDocumentInput: (value: EditorProseMirrorDocumentJson) => void;
}

export function useEditorWritingBodyEditor(
  options: UseEditorWritingBodyEditorOptions,
) {
  const bodyInputRef = ref<HTMLElement | null>(null);
  const writingEditorRef = ref<HTMLElement | null>(null);
  const bodyEditorView = shallowRef<EditorView | null>(null);
  const lastBodySelection = ref<EditorTextSelection>({
    start: 0,
    end: 0,
  });
  const lastToolbarCommandScrollSnapshot =
    ref<ToolbarCommandScrollSnapshot | null>(null);
  const toolbarCommandScrollTimers: number[] = [];

  function findAncestorDepth(
    position: TextSelection["$from"],
    nodeName: string,
  ): number | null {
    for (let depth = position.depth; depth > 0; depth -= 1) {
      if (position.node(depth).type.name === nodeName) {
        return depth;
      }
    }

    return null;
  }

  function exitTableCellOnEnter(
    state: EditorState,
    dispatch?: (transaction: Transaction) => void,
  ): boolean {
    const tableCellDepth = findAncestorDepth(
      state.selection.$from,
      "table_cell",
    );
    const tableDepth = findAncestorDepth(state.selection.$from, "table");
    const paragraphNode = editorProseMirrorSchema.nodes.paragraph;

    if (tableCellDepth === null || tableDepth === null || !paragraphNode) {
      return false;
    }

    if (dispatch) {
      const insertPosition = state.selection.$from.after(tableDepth);
      const paragraph = paragraphNode.create();
      let transaction = state.tr.insert(insertPosition, paragraph);
      transaction = transaction
        .setSelection(TextSelection.create(transaction.doc, insertPosition + 1))
        .scrollIntoView();

      dispatch(transaction);
    }

    return true;
  }

  function createBodyEditorPlugins() {
    return [
      keymap({
        Enter: exitTableCellOnEnter,
      }),
      // ProseMirror 的基础键盘行为不内置在 EditorView 中；Enter 换行、Backspace 合并段落等编辑语义由 keymap 提供。
      keymap(baseKeymap),
    ];
  }

  function readBodySelection(): EditorTextSelection | undefined {
    const view = bodyEditorView.value;

    if (!view) {
      return undefined;
    }

    return {
      start: view.state.selection.from,
      end: view.state.selection.to,
    };
  }

  function rememberBodySelection(): void {
    const selection = readBodySelection();

    if (selection) {
      lastBodySelection.value = selection;
    }
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

    bodyInputRef.value?.focus({ preventScroll: true });
    // 部分移动端浏览器会在 preventScroll 后延迟把编辑器光标滚进视口；
    // 工具栏命令聚焦正文时应保持作者当前阅读位置。
    scheduleToolbarCommandScrollRestore(restoreScroll);
  }

  function clampBodySelectionToDocument(
    selection: EditorTextSelection,
    doc = bodyEditorView.value?.state.doc,
  ): EditorTextSelection {
    const maxPosition = Math.max(1, (doc?.content.size ?? 1) - 1);
    const start = Math.min(Math.max(selection.start, 0), maxPosition);
    const end = Math.min(Math.max(selection.end, 0), maxPosition);

    return start <= end ? { start, end } : { start: end, end: start };
  }

  function setBodySelection(selection: EditorTextSelection): void {
    const restoreScroll = createToolbarCommandScrollRestorer();
    const view = bodyEditorView.value;

    if (view) {
      const prosemirrorSelection = clampBodySelectionToDocument(
        selection,
        view.state.doc,
      );

      view.dispatch(
        view.state.tr.setSelection(
          TextSelection.create(
            view.state.doc,
            prosemirrorSelection.start,
            prosemirrorSelection.end,
          ),
        ),
      );
    }

    lastBodySelection.value = selection;
    // 移动端浏览器会在设置选区后主动把光标滚进视口；
    // 工具栏命令应保持作者当前阅读位置，只更新源码和选区。
    scheduleToolbarCommandScrollRestore(restoreScroll);
  }

  function createBodyEditorState(): EditorState {
    return EditorState.create({
      schema: editorProseMirrorSchema,
      doc: createProseMirrorDocFromJson(options.getBodyDocumentJson()),
      plugins: createBodyEditorPlugins(),
    });
  }

  function syncBodyEditorFromDocumentJson(
    documentJson: EditorProseMirrorDocumentJson,
  ): void {
    const view = bodyEditorView.value;
    const currentJson = serializeProseMirrorDocToJson(
      view?.state.doc ?? createProseMirrorDocFromJson(documentJson),
    );

    if (!view || JSON.stringify(currentJson) === JSON.stringify(documentJson)) {
      return;
    }

    const doc = createProseMirrorDocFromJson(documentJson);
    const selection = clampBodySelectionToDocument(
      lastBodySelection.value,
      doc,
    );

    view.updateState(
      EditorState.create({
        schema: editorProseMirrorSchema,
        doc,
        selection: TextSelection.create(doc, selection.start, selection.end),
        plugins: createBodyEditorPlugins(),
      }),
    );
    lastBodySelection.value = selection;
  }

  function applyBodyToolbarAction(action: EditorToolbarAction): void {
    applyProseMirrorToolbarAction(bodyEditorView.value, action);
  }

  function mountBodyEditor(): void {
    const bodyEditorElement = bodyInputRef.value;

    if (!bodyEditorElement) {
      return;
    }

    // 正文事实是 ProseMirror JSON；dispatch 后向上同步 doc，由 draft model 负责保存映射。
    bodyEditorView.value = new EditorView(
      { mount: bodyEditorElement },
      {
        state: createBodyEditorState(),
        dispatchTransaction(transaction) {
          const view = bodyEditorView.value;

          if (!view) {
            return;
          }

          const nextState = view.state.apply(transaction);
          const nextBodyDocumentJson = serializeProseMirrorDocToJson(
            nextState.doc,
          );
          const nextBodyLength = nextState.doc.textBetween(
            0,
            nextState.doc.content.size,
            "\n",
          ).length;

          if (
            transaction.docChanged &&
            nextBodyLength > options.getBodyMaxLength()
          ) {
            return;
          }

          view.updateState(nextState);
          rememberBodySelection();

          if (
            transaction.docChanged &&
            JSON.stringify(nextBodyDocumentJson) !==
              JSON.stringify(options.getBodyDocumentJson())
          ) {
            options.emitBodyDocumentInput(nextBodyDocumentJson);
          }
        },
      },
    );
    rememberBodySelection();
  }

  function destroyBodyEditor(): void {
    clearToolbarCommandScrollTimers();
    bodyEditorView.value?.destroy();
    bodyEditorView.value = null;
  }

  return {
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
  };
}
