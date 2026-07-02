import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { editorDraftBodyMaxLength } from "@/features/editor-showcase/model";

import EditorWritingPane from "../EditorWritingPane.vue";

function mountWritingPane() {
  return mount(EditorWritingPane, {
    props: {
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
    ]);
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
