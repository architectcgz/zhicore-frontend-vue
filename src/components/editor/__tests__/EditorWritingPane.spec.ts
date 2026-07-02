import { mount } from "@vue/test-utils";
// @ts-expect-error Vitest runs this spec in Node; browser tsconfig does not expose Node ambient types.
import { readFileSync } from "node:fs";
import { AllSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { afterEach, describe, expect, it, vi } from "vitest";

import { editorDraftBodyMaxLength } from "@/features/editor/model";
import type { EditorTextSelection } from "@/features/editor/model";
import {
  createProseMirrorDocFromJson,
  editorProseMirrorSchema,
  mapProseMirrorDocToPostBodyWriteInput,
  serializeProseMirrorDocToJson,
  type EditorProseMirrorDocumentJson,
} from "@/features/editor/model/editorProseMirrorEngine";

import writingPaneSource from "../EditorWritingPane.vue?raw";
import EditorWritingPane from "../EditorWritingPane.vue";

const writingPaneStyleSource = readFileSync(
  "src/components/editor/EditorWritingPane.css",
  "utf8",
);
const writingPaneProseMirrorBaseStyleSource = readFileSync(
  "src/components/editor/EditorWritingPaneProseMirrorBase.css",
  "utf8",
);
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function bodyDoc(text: string): EditorProseMirrorDocumentJson {
  return serializeProseMirrorDocToJson(
    editorProseMirrorSchema.nodes.doc.create(null, [
      editorProseMirrorSchema.nodes.paragraph.create(
        null,
        text ? editorProseMirrorSchema.text(text) : undefined,
      ),
    ]),
  );
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
          name: "纸面",
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

describe("EditorWritingPane", () => {
  it("renders a toolbar button for every ProseMirror action", () => {
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

  it("toggles the compact toolbar open for touch devices", async () => {
    const wrapper = mountWritingPane();
    const toggleButton = wrapper.find(".selection-toolbar__toggle");

    expect(wrapper.find(".selection-toolbar").classes()).not.toContain(
      "selection-toolbar--expanded",
    );
    expect(toggleButton.attributes("aria-expanded")).toBe("false");

    await toggleButton.trigger("click");

    expect(wrapper.find(".selection-toolbar").classes()).toContain(
      "selection-toolbar--expanded",
    );
    expect(toggleButton.text()).toBe("收起");
    expect(toggleButton.attributes("aria-expanded")).toBe("true");

    await toggleButton.trigger("click");

    expect(wrapper.find(".selection-toolbar").classes()).not.toContain(
      "selection-toolbar--expanded",
    );
    expect(toggleButton.text()).toBe("更多");
    expect(toggleButton.attributes("aria-expanded")).toBe("false");
  });

  it("marks the mobile floating toolbar primary actions", () => {
    const wrapper = mountWritingPane();
    const primaryButtons = wrapper.findAll(
      ".selection-toolbar__mobile-primary",
    );

    expect(primaryButtons.map((button) => button.text())).toEqual([
      "撤销",
      "重做",
      "保存草稿",
      "B",
      "Link",
    ]);
  });

  it("defines the mobile toolbar as a bottom floating editor bar", () => {
    expect(writingPaneStyleSource).toContain("position: fixed;");
    expect(writingPaneStyleSource).toContain("top: auto;");
    expect(writingPaneStyleSource).toContain(
      "bottom: calc(12px + env(safe-area-inset-bottom, 0px));",
    );
    expect(writingPaneStyleSource).toContain(
      "padding: 10px 12px calc(92px + env(safe-area-inset-bottom, 0px));",
    );
    expect(writingPaneStyleSource).toContain(
      "padding: 8px 10px calc(92px + env(safe-area-inset-bottom, 0px));",
    );
    expect(writingPaneStyleSource).toContain(
      ".selection-toolbar.selection-toolbar--expanded",
    );
    expect(writingPaneStyleSource).toContain(
      "grid-template-columns: repeat(6, minmax(0, 1fr));",
    );
  });

  it("renders the body editor with ProseMirror instead of a textarea", () => {
    const wrapper = mountWritingPane();

    expect(wrapper.find("textarea.body-input").exists()).toBe(false);
    expect(wrapper.find(".body-input.ProseMirror").exists()).toBe(true);
    expect(wrapper.find(".body-input").attributes("contenteditable")).toBe(
      "true",
    );
  });

  it("emits ProseMirror body document input when the document changes", async () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
    };

    exposed.bodyEditorView?.dispatch(
      exposed.bodyEditorView.state.tr.insertText("追加"),
    );

    const emittedDocument = wrapper.emitted("bodyDocumentInput")?.at(-1)?.[0];

    expect(
      createProseMirrorDocFromJson(
        emittedDocument as EditorProseMirrorDocumentJson,
      ).textContent,
    ).toBe("追加草稿正文");
  });

  it("splits the current paragraph when pressing Enter in the ProseMirror body", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
      setBodySelection: (selection: EditorTextSelection) => void;
    };
    const view = exposed.bodyEditorView!;

    exposed.setBodySelection({
      start: view.state.doc.content.size - 1,
      end: view.state.doc.content.size - 1,
    });

    const handled = view.someProp("handleKeyDown", (handler) =>
      handler(
        view,
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );

    expect(handled).toBe(true);
    expect(view.state.doc.childCount).toBe(2);
    expect(
      mapProseMirrorDocToPostBodyWriteInput(view.state.doc).blocks,
    ).toEqual([
      {
        type: "paragraph",
        children: [{ type: "text", text: "草稿正文" }],
      },
      {
        type: "paragraph",
        children: [],
      },
    ]);
  });

  it("inserts raw pipe table markdown from the toolbar", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
      setBodySelection: (selection: EditorTextSelection) => void;
      applyBodyToolbarAction: (action: "table") => void;
    };
    const view = exposed.bodyEditorView!;

    exposed.setBodySelection({
      start: 1,
      end: view.state.doc.content.size - 1,
    });
    exposed.applyBodyToolbarAction("table");

    expect(view.state.doc.textContent).toBe(
      "| 表头1 | 表头2 |\n| --- | --- |\n| 内容1 | 内容2 |",
    );
  });

  it("keeps rich pasted content as ProseMirror structure", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
    };

    exposed.bodyEditorView?.dispatch(
      exposed.bodyEditorView.state.tr.setSelection(
        new AllSelection(exposed.bodyEditorView.state.doc),
      ),
    );
    exposed.bodyEditorView?.pasteHTML(
      "<h1>富文本标题</h1><p><strong>粗体正文</strong></p>",
    );

    expect(
      mapProseMirrorDocToPostBodyWriteInput(exposed.bodyEditorView!.state.doc)
        .blocks,
    ).toEqual([
      {
        type: "heading",
        level: 1,
        children: [{ type: "text", text: "富文本标题" }],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "粗体正文",
            marks: [{ type: "bold" }],
          },
        ],
      },
    ]);
  });

  it("syncs external ProseMirror body changes and clamps the selection", async () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      getBodySelection: () => EditorTextSelection;
      setBodySelection: (selection: EditorTextSelection) => void;
      bodyEditorView: EditorView | null;
    };

    exposed.setBodySelection({ start: 2, end: 4 });
    await wrapper.setProps({ bodyDocumentJson: bodyDoc("短") });

    expect(exposed.bodyEditorView?.state.doc.textContent).toBe("短");
    expect(exposed.getBodySelection()).toEqual({ start: 2, end: 2 });
  });

  it("rejects ProseMirror changes that exceed the body limit", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
    };
    const oversizedBody = "x".repeat(editorDraftBodyMaxLength + 1);

    exposed.bodyEditorView?.dispatch(
      exposed.bodyEditorView.state.tr.insertText(oversizedBody),
    );

    expect(wrapper.emitted("bodyDocumentInput")).toBeUndefined();
    expect(exposed.bodyEditorView?.state.doc.textContent).toBe("草稿正文");
  });

  it("restores body focus without forcing the mobile viewport to scroll", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorElement: HTMLElement | null;
      focusBody: () => void;
    };
    const focusSpy = vi.spyOn(exposed.bodyEditorElement!, "focus");

    exposed.focusBody();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("restores the current scroll position when mobile focus scrolls late", () => {
    vi.useFakeTimers();
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorElement: HTMLElement | null;
      focusBody: () => void;
    };
    const focusSpy = vi
      .spyOn(exposed.bodyEditorElement!, "focus")
      .mockImplementation(() => {
        window.setTimeout(() => {
          Object.defineProperty(window, "scrollY", {
            configurable: true,
            value: 0,
          });
        }, 10);
      });
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        value: 420,
      });
    });
    Object.defineProperty(window, "scrollX", {
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      value: 420,
    });

    exposed.focusBody();
    vi.advanceTimersByTime(120);

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(scrollToSpy).toHaveBeenCalledWith(0, 420);
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
    const exposed = wrapper.vm as unknown as {
      focusBody: () => void;
    };

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
    const exposed = wrapper.vm as unknown as {
      getBodySelection: () => EditorTextSelection;
      setBodySelection: (selection: EditorTextSelection) => void;
    };

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

  it("applies inline toolbar commands as raw markdown markers", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
      setBodySelection: (selection: EditorTextSelection) => void;
      applyBodyToolbarAction: (action: "bold" | "link") => void;
    };

    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("bold");
    exposed.applyBodyToolbarAction("link");

    expect(exposed.bodyEditorView!.state.doc.textContent).toBe(
      "**草稿正文**[链接文本](https://example.com)",
    );
  });

  it("applies block toolbar commands as raw markdown text", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
      setBodySelection: (selection: EditorTextSelection) => void;
      applyBodyToolbarAction: (
        action: "heading2" | "quote" | "code" | "unorderedList" | "table",
      ) => void;
    };

    exposed.bodyEditorView?.dispatch(
      exposed.bodyEditorView.state.tr.insertText("结构文本", 1, 5),
    );
    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("heading2");

    expect(exposed.bodyEditorView!.state.doc.textContent).toBe("## 结构文本");

    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("quote");

    expect(exposed.bodyEditorView!.state.doc.textContent).toContain(
      "> ## 结构文本",
    );

    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("code");

    expect(exposed.bodyEditorView!.state.doc.textContent).toContain("``` ts");

    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("unorderedList");

    expect(exposed.bodyEditorView!.state.doc.textContent).toContain("- ```");

    exposed.setBodySelection({ start: 1, end: 5 });
    exposed.applyBodyToolbarAction("table");

    expect(exposed.bodyEditorView!.state.doc.textContent).toContain(
      "| 表头1 | 表头2 |",
    );
  });

  it("keeps ProseMirror editor styles scoped without deep selectors", () => {
    expect(writingPaneStyleSource).not.toContain(":deep");
    expect(writingPaneSource).not.toContain("EditorWritingPaneProseMirror.css");
    expect(writingPaneSource).toContain(
      '<style src="./EditorWritingPaneProseMirrorBase.css"></style>',
    );
    expect(writingPaneProseMirrorBaseStyleSource).toContain(
      ".writing-editor .body-input.ProseMirror p",
    );
    expect(writingPaneProseMirrorBaseStyleSource).not.toContain("pre");
    expect(writingPaneProseMirrorBaseStyleSource).not.toContain("table");
  });

  it("inserts an empty raw math fence instead of a fixed formula when no text is selected", () => {
    const wrapper = mountWritingPane();
    const exposed = wrapper.vm as unknown as {
      bodyEditorView: EditorView | null;
      setBodySelection: (selection: EditorTextSelection) => void;
      applyBodyToolbarAction: (action: "math") => void;
    };

    exposed.setBodySelection({ start: 1, end: 1 });
    exposed.applyBodyToolbarAction("math");

    expect(exposed.bodyEditorView!.state.doc.textContent).toBe(
      "$$\n\n$$草稿正文",
    );
    expect(exposed.bodyEditorView!.state.doc.textContent).not.toContain(
      "E = mc^2",
    );
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
    const exposed = wrapper.vm as unknown as {
      bodyEditorElement: HTMLElement | null;
      getBodySelection: () => EditorTextSelection;
      setBodySelection: (selection: EditorTextSelection) => void;
    };

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

  it("emits editor display changes from the writing meta bar", async () => {
    const wrapper = mountWritingPane();

    await wrapper
      .find('.writing-editor__mode-switch button[aria-pressed="false"]')
      .trigger("click");
    await wrapper
      .find('.writing-editor__background-swatch[aria-label="切换到墨蓝背景"]')
      .trigger("click");

    expect(wrapper.emitted("selectMode")).toEqual([["preview"]]);
    expect(wrapper.emitted("selectBackground")).toEqual([["ink"]]);
  });

  it("keeps the body limit visible in the editor status", () => {
    const wrapper = mountWritingPane();

    expect(wrapper.text()).toContain(`4 / ${editorDraftBodyMaxLength} 字符`);
  });

  it("keeps the document structure footer focused on the word count", () => {
    const wrapper = mountWritingPane();

    expect(wrapper.find(".document-structure").text()).toBe("4 字");
  });

  it("emits undo when Ctrl+Z is pressed in the body editor", async () => {
    const wrapper = mountWritingPane();
    const bodyInput = wrapper.find(".body-input");

    await bodyInput.trigger("keydown", {
      key: "z",
      ctrlKey: true,
    });

    expect(wrapper.emitted("undo")).toEqual([[]]);
  });

  it("emits redo when Ctrl+Shift+Z or Ctrl+Y is pressed in the body editor", async () => {
    const wrapper = mountWritingPane();
    const bodyInput = wrapper.find(".body-input");

    await bodyInput.trigger("keydown", {
      key: "z",
      ctrlKey: true,
      shiftKey: true,
    });
    await bodyInput.trigger("keydown", {
      key: "y",
      ctrlKey: true,
    });

    expect(wrapper.emitted("redo")).toEqual([[], []]);
  });
});
