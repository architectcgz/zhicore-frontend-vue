import type { Editor } from "@tiptap/vue-3";
import { isInTable } from "@tiptap/pm/tables";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { editorDraftBodyMaxLength } from "@/features/editor";
import type { EditorTextSelection } from "@/features/editor";
import {
  getTiptapPlainText,
  mapTiptapJsonToPostBodyWriteInput,
  type EditorTiptapDocumentJson,
} from "@/features/editor/tiptap/editorTiptapEngine";

import writingPaneSource from "../EditorWritingPane.vue?raw";
import EditorWritingPane from "../EditorWritingPane.vue";

const writingPaneStyleSource = readFileSync(
  "src/components/editor/EditorWritingPane.css",
  "utf8",
);
const writingPaneTiptapBaseStyleSource = readFileSync(
  "src/components/editor/EditorWritingPaneTiptapBase.css",
  "utf8",
);
const editorWorkspaceSource = readFileSync(
  "src/features/editor/ui/EditorWorkspace.vue",
  "utf8",
);

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function bodyDoc(text: string): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
}

function tableDoc(): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "表头一" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "表头二" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "内容一" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "末格" }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function mountWritingPane(options: { attachTo?: HTMLElement } = {}) {
  return mount(EditorWritingPane, {
    attachTo: options.attachTo,
    props: {
      activeMode: "focus",
      activeBackgroundId: "paper",
      backgroundCandidates: [
        {
          id: "paper",
          name: "默认",
          className: "editor--paper",
          swatch: "linear-gradient(135deg, #f7f4ee, #edf1f6)",
        },
        {
          id: "ink",
          name: "墨蓝",
          className: "editor--ink",
          swatch: "linear-gradient(135deg, #141a24, #263341)",
        },
      ],
      title: "草稿标题",
      bodyDocumentJson: bodyDoc("草稿正文"),
      wordCount: 4,
      bodyCharacterCount: 4,
      saveStatus: "saved",
      saveStatusLabel: "已保存",
      lastSavedLabel: "09:00",
      saveButtonLabel: "保存草稿",
      canSaveDraft: true,
      canUndo: true,
      canRedo: true,
      bodyMaxLength: editorDraftBodyMaxLength,
    },
  });
}

function exposedEditor(wrapper: ReturnType<typeof mountWritingPane>) {
  return wrapper.vm as unknown as {
    bodyEditor: Editor | null;
    bodyEditorElement: HTMLElement | null;
    focusBody: () => void;
    getBodySelection: () => EditorTextSelection;
    setBodySelection: (selection: EditorTextSelection) => void;
    applyBodyToolbarAction: (action: string) => void;
  };
}

function blocksFromEditor(editor: Editor) {
  return mapTiptapJsonToPostBodyWriteInput(editor.getJSON()).blocks;
}

function setSelectionAfterText(editor: Editor, text: string): void {
  let selectionPosition: number | null = null;

  editor.state.doc.descendants((node, position) => {
    if (node.isText && node.text === text) {
      selectionPosition = position + node.nodeSize;
      return false;
    }

    return true;
  });

  if (selectionPosition === null) {
    throw new Error(`Could not find text node: ${text}`);
  }

  editor.commands.setTextSelection(selectionPosition);
}

function dispatchEditorKey(editor: Editor, key: string): boolean {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  let handled = false;

  editor.view.someProp("handleKeyDown", (handleKeyDown) => {
    const didHandle = handleKeyDown(editor.view, event) === true;

    handled = handled || didHandle;
    return didHandle ? true : undefined;
  });

  return handled;
}

describe("EditorWritingPane", () => {
  it("renders a toolbar button for every Tiptap action", () => {
    const wrapper = mountWritingPane();
    const buttons = wrapper.findAll(".selection-toolbar button");

    expect(buttons.map((button) => button.text())).toEqual([
      "撤销",
      "重做",
      "保存草稿",
      "B",
      "I",
      "U",
      "S",
      "`",
      "Link",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      ">",
      "-",
      "1.",
      "[]",
      "Img",
      "Code",
      "Tbl",
      "Math",
      "更多",
    ]);
  });

  it("renders the body editor with Tiptap EditorContent", () => {
    const wrapper = mountWritingPane();

    expect(writingPaneSource).toContain("@tiptap/vue-3");
    expect(writingPaneSource).toContain("EditorContent");
    expect(writingPaneSource).not.toContain('contenteditable="true"');
    expect(wrapper.find("textarea.body-input").exists()).toBe(false);
    expect(exposedEditor(wrapper).bodyEditorElement).toBeInstanceOf(
      HTMLElement,
    );
    expect(
      exposedEditor(wrapper).bodyEditorElement?.classList.contains(
        "ProseMirror",
      ),
    ).toBe(true);
  });

  it("does not render the preview mode switch while the workbench preview is retired", () => {
    const wrapper = mountWritingPane();

    expect(wrapper.find(".writing-editor__mode-switch").exists()).toBe(false);
    expect(wrapper.text()).not.toContain("写作 + 预览");
  });

  it("emits Tiptap body document input when the document changes", () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.bodyEditor?.commands.setTextSelection(1);
    exposed.bodyEditor?.commands.insertContent("追加");

    const emittedDocument = wrapper.emitted("bodyDocumentInput")?.at(-1)?.[0];

    expect(
      getTiptapPlainText(emittedDocument as EditorTiptapDocumentJson),
    ).toBe("追加草稿正文");
  });

  it("rejects Tiptap changes that exceed the body limit", () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);
    const oversizedBody = "x".repeat(editorDraftBodyMaxLength + 1);

    exposed.bodyEditor?.commands.setTextSelection(1);
    exposed.bodyEditor?.commands.insertContent(oversizedBody);

    expect(wrapper.emitted("bodyDocumentInput")).toBeUndefined();
    expect(getTiptapPlainText(exposed.bodyEditor!.getJSON())).toBe("草稿正文");
  });

  it("rejects unsupported nested container structures before they enter draft", () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.bodyEditor?.commands.setTextSelection(1);
    exposed.bodyEditor?.commands.insertContent({
      type: "blockquote",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "列表项" }],
                },
                {
                  type: "blockquote",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "过深" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(wrapper.emitted("bodyDocumentInput")).toBeUndefined();
    expect(getTiptapPlainText(exposed.bodyEditor!.getJSON())).toBe("草稿正文");
  });

  it("syncs external Tiptap body changes and clamps the selection", async () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.setBodySelection({ start: 2, end: 4 });
    await wrapper.setProps({ bodyDocumentJson: bodyDoc("短") });

    expect(getTiptapPlainText(exposed.bodyEditor!.getJSON())).toBe("短");
    expect(exposed.getBodySelection()).toEqual({ start: 2, end: 2 });
  });

  it("restores body focus without forcing the mobile viewport to scroll", () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);
    const focusSpy = vi.spyOn(exposed.bodyEditorElement!, "focus");

    exposed.focusBody();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("uses the scroll position captured before a toolbar command click", () => {
    vi.useFakeTimers();
    const wrapper = mountWritingPane();
    const quoteButton = wrapper.find<HTMLButtonElement>(
      '.selection-toolbar button[aria-label="引用块"]',
    );
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 420,
      });
    });
    const exposed = exposedEditor(wrapper);

    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 420,
    });

    quoteButton.element.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerType: "touch",
      }),
    );
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 0,
    });

    exposed.focusBody();
    vi.advanceTimersByTime(120);

    expect(scrollToSpy).toHaveBeenCalledWith(0, 420);
  });

  it("restores the current scroll position after resetting the body selection", () => {
    const wrapper = mountWritingPane();
    const writingEditor = wrapper.find<HTMLElement>(".writing-editor");
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 420,
      });
    });
    const exposed = exposedEditor(wrapper);

    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 420,
    });
    writingEditor.element.scrollTop = 180;

    exposed.setBodySelection({ start: 2, end: 4 });

    expect(exposed.getBodySelection()).toEqual({ start: 2, end: 4 });
    expect(scrollToSpy).toHaveBeenCalledWith(0, 420);
    expect(writingEditor.element.scrollTop).toBe(180);
  });

  it("emits the matching toolbar action when a button is clicked", async () => {
    const wrapper = mountWritingPane();
    const underlineButton = wrapper.find(
      '.selection-toolbar button[aria-label="下划线"]',
    );

    await underlineButton.trigger("click");

    expect(wrapper.emitted("toolbarAction")).toEqual([["underline"]]);
    expect(wrapper.emitted("bodyDocumentInput")).toBeUndefined();
  });

  it("emits save from the editor save shortcut", () => {
    const wrapper = mountWritingPane();
    const titleInput = wrapper.find<HTMLTextAreaElement>(".title-input");
    const event = new KeyboardEvent("keydown", {
      key: "s",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    titleInput.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(wrapper.emitted("saveDraft")).toEqual([[]]);
  });

  it("applies inline toolbar commands as Tiptap marks", () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("bold");
    exposed.applyBodyToolbarAction("link");

    expect(blocksFromEditor(exposed.bodyEditor!)).toEqual([
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "草稿正文",
            marks: [
              { type: "link", href: "https://example.com/" },
              { type: "bold" },
            ],
          },
        ],
      },
    ]);
  });

  it("applies every inline toolbar command as the expected save mark", () => {
    const cases = [
      ["bold", { type: "bold" }],
      ["italic", { type: "italic" }],
      ["underline", { type: "underline" }],
      ["strike", { type: "strike" }],
      ["inlineCode", { type: "inline_code" }],
      ["link", { type: "link", href: "https://example.com/" }],
    ] as const;

    cases.forEach(([action, expectedMark]) => {
      const wrapper = mountWritingPane();
      const exposed = exposedEditor(wrapper);

      exposed.setBodySelection({ start: 1, end: 5 });
      exposed.applyBodyToolbarAction(action);

      expect(blocksFromEditor(exposed.bodyEditor!)).toEqual([
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "草稿正文",
              marks: [expectedMark],
            },
          ],
        },
      ]);
    });
  });

  it("applies block toolbar commands as Tiptap nodes", () => {
    function blocksAfterToolbarAction(
      action: "heading2" | "quote" | "code" | "unorderedList" | "table",
    ) {
      const wrapper = mountWritingPane();
      const exposed = exposedEditor(wrapper);

      exposed.bodyEditor?.commands.insertContentAt(
        { from: 1, to: 5 },
        "结构文本",
      );
      exposed.setBodySelection({ start: 1, end: 5 });
      exposed.applyBodyToolbarAction(action);

      return blocksFromEditor(exposed.bodyEditor!);
    }

    expect(blocksAfterToolbarAction("heading2")).toEqual([
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "结构文本" }],
      },
    ]);
    expect(blocksAfterToolbarAction("quote")).toEqual([
      {
        type: "quote",
        blocks: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "结构文本" }],
          },
        ],
      },
    ]);
    expect(blocksAfterToolbarAction("code")).toEqual([
      {
        type: "code_block",
        language: "ts",
        code: "结构文本",
      },
    ]);
    expect(blocksAfterToolbarAction("unorderedList")).toEqual([
      {
        type: "list",
        ordered: false,
        task: false,
        items: [
          {
            blocks: [
              {
                type: "paragraph",
                children: [{ type: "text", text: "结构文本" }],
              },
            ],
          },
        ],
      },
    ]);
    expect(blocksAfterToolbarAction("table")).toEqual([
      {
        type: "table",
        headers: [{ children: [] }, { children: [] }],
        rows: [[{ children: [] }, { children: [] }]],
      },
    ]);
  });

  it("moves out of the last table cell into a new paragraph with right or down arrow", () => {
    (["ArrowRight", "ArrowDown"] as const).forEach((key) => {
      const wrapper = mountWritingPane();
      const exposed = exposedEditor(wrapper);

      exposed.bodyEditor?.commands.setContent(tableDoc(), {
        emitUpdate: false,
        errorOnInvalidContent: true,
      });
      setSelectionAfterText(exposed.bodyEditor!, "末格");
      const handled = dispatchEditorKey(exposed.bodyEditor!, key);

      expect(handled).toBe(true);
      expect(isInTable(exposed.bodyEditor!.state)).toBe(false);
      expect(blocksFromEditor(exposed.bodyEditor!)).toEqual([
        {
          type: "table",
          headers: [
            { children: [{ type: "text", text: "表头一" }] },
            { children: [{ type: "text", text: "表头二" }] },
          ],
          rows: [
            [
              { children: [{ type: "text", text: "内容一" }] },
              { children: [{ type: "text", text: "末格" }] },
            ],
          ],
        },
        {
          type: "paragraph",
          children: [],
        },
      ]);
    });
  });

  it("updates the selected code block language from the editor toolbar", async () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.bodyEditor?.commands.insertContentAt(
      { from: 1, to: 5 },
      "结构文本",
    );
    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("code");
    await wrapper.vm.$nextTick();

    const languageSelect = wrapper.find<HTMLSelectElement>(
      ".selection-toolbar__code-language",
    );

    expect(languageSelect.exists()).toBe(true);
    expect(languageSelect.element.value).toBe("ts");

    await languageSelect.setValue("go");

    expect(blocksFromEditor(exposed.bodyEditor!)).toEqual([
      {
        type: "code_block",
        language: "go",
        code: "结构文本",
      },
    ]);
  });

  it("lets authors choose the language from the code block divider", async () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.bodyEditor?.commands.insertContentAt(
      { from: 1, to: 5 },
      "结构文本",
    );
    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("code");
    await wrapper.vm.$nextTick();

    const codeBlockLanguageBar = exposed.bodyEditorElement?.querySelector(
      ".editor-code-block__language-bar",
    );
    const codeBlockLanguageSelect =
      exposed.bodyEditorElement?.querySelector<HTMLSelectElement>(
        ".editor-code-block__language-select",
      ) ?? null;

    expect(codeBlockLanguageBar).toBeInstanceOf(HTMLElement);
    expect(codeBlockLanguageSelect).toBeInstanceOf(HTMLSelectElement);
    expect(codeBlockLanguageSelect?.value).toBe("ts");

    if (!codeBlockLanguageSelect) {
      throw new Error("code block language select was not rendered");
    }

    codeBlockLanguageSelect.value = "python";
    codeBlockLanguageSelect.dispatchEvent(
      new Event("change", { bubbles: true }),
    );
    await wrapper.vm.$nextTick();

    expect(blocksFromEditor(exposed.bodyEditor!)).toEqual([
      {
        type: "code_block",
        language: "python",
        code: "结构文本",
      },
    ]);
  });

  it("applies every heading toolbar command with its matching level", () => {
    (
      [
        ["heading1", 1],
        ["heading2", 2],
        ["heading3", 3],
        ["heading4", 4],
        ["heading5", 5],
        ["heading6", 6],
      ] as const
    ).forEach(([action, level]) => {
      const wrapper = mountWritingPane();
      const exposed = exposedEditor(wrapper);

      exposed.bodyEditor?.commands.insertContentAt(
        { from: 1, to: 5 },
        "结构文本",
      );
      exposed.setBodySelection({ start: 1, end: 5 });
      exposed.applyBodyToolbarAction(action);

      expect(blocksFromEditor(exposed.bodyEditor!)).toEqual([
        {
          type: "heading",
          level,
          children: [{ type: "text", text: "结构文本" }],
        },
      ]);
    });
  });

  it("applies remaining structural toolbar commands as saveable blocks", () => {
    function blocksAfterToolbarAction(
      action: "orderedList" | "taskList" | "image",
    ) {
      const wrapper = mountWritingPane();
      const exposed = exposedEditor(wrapper);

      exposed.bodyEditor?.commands.insertContentAt(
        { from: 1, to: 5 },
        "结构文本",
      );
      exposed.setBodySelection({ start: 1, end: 5 });
      exposed.applyBodyToolbarAction(action);

      return blocksFromEditor(exposed.bodyEditor!);
    }

    expect(blocksAfterToolbarAction("orderedList")).toEqual([
      {
        type: "list",
        ordered: true,
        task: false,
        items: [
          {
            blocks: [
              {
                type: "paragraph",
                children: [{ type: "text", text: "结构文本" }],
              },
            ],
          },
        ],
      },
    ]);
    expect(blocksAfterToolbarAction("taskList")).toEqual([
      {
        type: "list",
        ordered: false,
        task: true,
        items: [
          {
            checked: false,
            blocks: [
              {
                type: "paragraph",
                children: [{ type: "text", text: "结构文本" }],
              },
            ],
          },
        ],
      },
    ]);
    expect(blocksAfterToolbarAction("image")).toEqual([
      {
        type: "external_embed",
        provider: "image",
        url: "https://example.com/image.png",
        title: "图片说明",
      },
    ]);
  });

  it("inserts an empty Tiptap math block when no text is selected", () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.setBodySelection({ start: 1, end: 1 });
    exposed.applyBodyToolbarAction("math");

    expect(blocksFromEditor(exposed.bodyEditor!)[0]).toEqual({
      type: "math",
      latex: "",
    });
    expect(getTiptapPlainText(exposed.bodyEditor!.getJSON())).not.toContain(
      "E = mc^2",
    );
  });

  it("does not render unsafe external embed URLs as clickable editor links", () => {
    const wrapper = mountWritingPane();
    const exposed = exposedEditor(wrapper);

    exposed.bodyEditor?.commands.setContent(
      {
        type: "doc",
        content: [
          {
            type: "external_embed",
            attrs: {
              provider: "image",
              url: "javascript:alert(1)",
              title: "危险图片",
            },
          },
        ],
      },
      { emitUpdate: false },
    );

    expect(
      exposed.bodyEditorElement?.querySelector('a[href^="javascript:"]'),
    ).toBeNull();
    expect(exposed.bodyEditorElement?.textContent).toContain("危险图片");
  });

  it("keeps Tiptap editor styles scoped without deep selectors", () => {
    expect(writingPaneStyleSource).not.toContain(":deep");
    expect(writingPaneSource).not.toContain("EditorWritingPaneProseMirror.css");
    expect(writingPaneSource).toContain(
      '<style src="./EditorWritingPaneTiptapBase.css"></style>',
    );
    expect(writingPaneTiptapBaseStyleSource).toContain(
      ".writing-editor .body-input .ProseMirror",
    );
    expect(writingPaneTiptapBaseStyleSource).toContain("min-height: inherit;");
    expect(writingPaneTiptapBaseStyleSource).toContain("outline: 0;");
    expect(writingPaneTiptapBaseStyleSource).toContain(
      ".writing-editor .body-input .ProseMirror p",
    );
    expect(writingPaneTiptapBaseStyleSource).toContain(
      ".writing-editor .body-input .ProseMirror pre",
    );
    expect(writingPaneTiptapBaseStyleSource).toContain(
      ".writing-editor .body-input .ProseMirror table",
    );
    expect(writingPaneTiptapBaseStyleSource).toContain(
      "var(--editor-reader-code-border",
    );
    expect(writingPaneTiptapBaseStyleSource).toContain(
      "var(--editor-reader-block-bg",
    );
  });

  it("keeps the floating toolbar background tied to the global glassmorphism theme", () => {
    const themeBlocks =
      editorWorkspaceSource.match(
        /\.editor--(?:paper|sage|sand|ink)\s*\{[\s\S]*?\n\}/g,
      ) ?? [];

    expect(editorWorkspaceSource).toContain(
      "--editor-toolbar-bg: rgba(10, 15, 22, 0.95);",
    );
    expect(writingPaneStyleSource).toContain(
      "var(--editor-control-bg, rgba(10, 15, 22, 0.95))",
    );
    expect(themeBlocks).toHaveLength(4);
    themeBlocks.forEach((source) => {
      expect(source).not.toContain("--editor-toolbar-bg");
      expect(source).toContain("--editor-page-accent");
    });
  });

  it("centers the document sheet in a narrower writing canvas", () => {
    expect(writingPaneStyleSource).toContain(
      "grid-template-columns: minmax(0, 720px);",
    );
    expect(writingPaneStyleSource).toContain("justify-content: center;");
    expect(writingPaneStyleSource).toContain("width: 100%;");
  });

  it("keeps toolbar mousedown from stealing the body editor selection", () => {
    const wrapper = mountWritingPane();
    const tableButton = wrapper.find(
      '.selection-toolbar button[aria-label="表格"]',
    );
    const event = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });

    tableButton.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("keeps toolbar pointerdown from stealing the body editor selection on touch devices", () => {
    const wrapper = mountWritingPane();
    const tableButton = wrapper.find(
      '.selection-toolbar button[aria-label="表格"]',
    );
    const event = new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerType: "touch",
    });

    tableButton.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it("does not cancel pointer events on the mobile toolbar more toggle", () => {
    const wrapper = mountWritingPane();
    const toggleButton = wrapper.find(".selection-toolbar__toggle");
    const event = new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerType: "touch",
    });

    toggleButton.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it("uses the remembered body selection when a toolbar command runs after the editor lost focus", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const wrapper = mountWritingPane({ attachTo: host });
    const tableButton = wrapper.find<HTMLButtonElement>(
      '.selection-toolbar button[aria-label="表格"]',
    );
    const exposed = exposedEditor(wrapper);

    exposed.bodyEditorElement?.focus();
    exposed.setBodySelection({ start: 2, end: 2 });

    tableButton.element.focus();

    expect(document.activeElement).toBe(tableButton.element);
    expect(exposed.getBodySelection()).toEqual({ start: 2, end: 2 });

    wrapper.unmount();
    host.remove();
  });

  it("emits history and save commands from the editor toolbar", async () => {
    const wrapper = mountWritingPane();

    await wrapper
      .find('.selection-toolbar button[aria-label="撤销上一步编辑"]')
      .trigger("click");
    await wrapper
      .find('.selection-toolbar button[aria-label="重做上一步编辑"]')
      .trigger("click");
    await wrapper.find(".selection-toolbar__command--save").trigger("click");

    expect(wrapper.emitted("undo")).toEqual([[]]);
    expect(wrapper.emitted("redo")).toEqual([[]]);
    expect(wrapper.emitted("saveDraft")).toEqual([[]]);
  });

  it("keeps the body limit visible in the editor status", () => {
    const wrapper = mountWritingPane();

    expect(wrapper.text()).toContain(`4 / ${editorDraftBodyMaxLength} 字符`);
  });
});
