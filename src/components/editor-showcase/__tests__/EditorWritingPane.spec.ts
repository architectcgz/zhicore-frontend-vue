import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import { editorDraftBodyMaxLength } from "@/features/editor-showcase/model";
import type { EditorShowcaseTextSelection } from "@/features/editor-showcase/model";

import writingPaneSource from "../EditorWritingPane.vue?raw";
import EditorWritingPane from "../EditorWritingPane.vue";

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
          className: "editor-showcase--paper",
          swatch: "linear-gradient(135deg, #f7f4ee, #edf1f6)",
        },
        {
          id: "ink",
          name: "墨蓝",
          className: "editor-showcase--ink",
          swatch: "linear-gradient(135deg, #141a24, #263341)",
        },
      ],
      title: "草稿标题",
      body: "草稿正文",
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
  it("renders a toolbar button for every markdown action", () => {
    const wrapper = mountWritingPane();
    const buttons = wrapper.findAll(".selection-toolbar button");

    expect(buttons.map((button) => button.text())).toEqual([
      "撤销",
      "重做",
      "保存草稿",
      "B",
      "I",
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
    expect(writingPaneSource).toContain("position: fixed;");
    expect(writingPaneSource).toContain("top: auto;");
    expect(writingPaneSource).toContain(
      "bottom: calc(12px + env(safe-area-inset-bottom, 0px));",
    );
    expect(writingPaneSource).toContain(
      "padding: 10px 12px calc(92px + env(safe-area-inset-bottom, 0px));",
    );
    expect(writingPaneSource).toContain(
      "padding: 8px 10px calc(92px + env(safe-area-inset-bottom, 0px));",
    );
    expect(writingPaneSource).toContain(
      ".selection-toolbar.selection-toolbar--expanded",
    );
    expect(writingPaneSource).toContain(
      "grid-template-columns: repeat(6, minmax(0, 1fr));",
    );
  });

  it("restores body focus without forcing the mobile viewport to scroll", () => {
    const wrapper = mountWritingPane();
    const bodyInput = wrapper.find<HTMLTextAreaElement>(".body-input");
    const focusSpy = vi.spyOn(bodyInput.element, "focus");
    const exposed = wrapper.vm as unknown as {
      focusBody: () => void;
    };

    exposed.focusBody();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("emits the matching toolbar action when a button is clicked", async () => {
    const wrapper = mountWritingPane();
    const tableButton = wrapper.find(
      '.selection-toolbar button[aria-label="表格"]',
    );

    await tableButton.trigger("click");

    expect(wrapper.emitted("toolbarAction")).toEqual([["table"]]);
  });

  it("keeps toolbar mousedown from stealing the body textarea selection", () => {
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

  it("keeps toolbar pointerdown from stealing the body textarea selection on touch devices", () => {
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

  it("uses the remembered body selection when a toolbar command runs after the textarea lost focus", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const wrapper = mountWritingPane({ attachTo: host });
    const bodyInput = wrapper.find<HTMLTextAreaElement>(".body-input");
    const tableButton = wrapper.find<HTMLButtonElement>(
      '.selection-toolbar button[aria-label="表格"]',
    );
    const exposed = wrapper.vm as unknown as {
      getBodySelection: () => EditorShowcaseTextSelection;
    };

    bodyInput.element.focus();
    bodyInput.element.setSelectionRange(2, 2);
    await bodyInput.trigger("select");

    tableButton.element.focus();
    Object.defineProperty(bodyInput.element, "selectionStart", {
      configurable: true,
      value: 4,
    });
    Object.defineProperty(bodyInput.element, "selectionEnd", {
      configurable: true,
      value: 4,
    });

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

  it("sets the body textarea maxlength from the editor limit", () => {
    const wrapper = mountWritingPane();

    expect(wrapper.find(".body-input").attributes("maxlength")).toBe(
      String(editorDraftBodyMaxLength),
    );
  });

  it("keeps the document structure footer focused on the word count", () => {
    const wrapper = mountWritingPane();

    expect(wrapper.find(".document-structure").text()).toBe("4 字");
  });

  it("emits undo when Ctrl+Z is pressed in the body textarea", async () => {
    const wrapper = mountWritingPane();
    const bodyInput = wrapper.find(".body-input");

    await bodyInput.trigger("keydown", {
      key: "z",
      ctrlKey: true,
    });

    expect(wrapper.emitted("undo")).toEqual([[]]);
  });

  it("emits redo when Ctrl+Shift+Z or Ctrl+Y is pressed in the body textarea", async () => {
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
