import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EditorWritingPane from "../EditorWritingPane.vue";

function mountWritingPane() {
  return mount(EditorWritingPane, {
    props: {
      title: "草稿标题",
      body: "草稿正文",
      wordCount: 4,
      saveStatus: "saved",
      saveStatusLabel: "已保存",
      lastSavedLabel: "09:00",
      savedContentHash: "local:test",
    },
  });
}

describe("EditorWritingPane", () => {
  it("renders a toolbar button for every markdown action", () => {
    const wrapper = mountWritingPane();
    const buttons = wrapper.findAll(".selection-toolbar button");

    expect(buttons.map((button) => button.text())).toEqual([
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
    const buttons = wrapper.findAll(".selection-toolbar button");

    await buttons[17].trigger("click");

    expect(wrapper.emitted("toolbarAction")).toEqual([["table"]]);
  });

  it("keeps toolbar mousedown from stealing the body textarea selection", () => {
    const wrapper = mountWritingPane();
    const tableButton = wrapper.findAll(".selection-toolbar button")[17];
    const event = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
    });

    tableButton.element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });
});
