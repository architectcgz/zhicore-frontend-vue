import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EditorMobileWorkspace from "../EditorMobileWorkspace.vue";

function mountMobileWorkspace(activeMode: "focus" | "preview") {
  return mount(EditorMobileWorkspace, {
    props: {
      activeMode,
      activeBackgroundId: "paper",
      backgroundCandidates: [
        {
          id: "paper",
          name: "默认",
          className: "editor--paper",
          swatch: "linear-gradient(135deg, #f7f4ee, #edf1f6)",
        },
      ],
      title: "草稿标题",
      bodyDocumentJson: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "草稿正文" }],
          },
        ],
      },
      wordCount: 4,
      bodyCharacterCount: 4,
      bodyMaxLength: 20000,
      saveStatus: "saved",
      saveStatusLabel: "已保存",
      lastSavedLabel: "09:00",
      saveButtonLabel: "保存草稿",
      canSaveDraft: true,
      canUndo: true,
      canRedo: true,
      previewTitle: "草稿标题",
      previewBlocks: [],
    },
    global: {
      stubs: {
        EditorWritingPane: {
          template: '<div class="writing-editor">写作区</div>',
          emits: [
            "titleInput",
            "bodyDocumentInput",
            "undo",
            "redo",
            "saveDraft",
            "toolbarAction",
            "selectMode",
            "selectBackground",
            "scroll",
          ],
        },
        EditorPreviewPane: {
          template: '<div class="reader-preview">预览区</div>',
          emits: ["scroll"],
        },
      },
    },
  });
}

describe("EditorMobileWorkspace", () => {
  it("renders only the writing pane in focus mode", () => {
    const wrapper = mountMobileWorkspace("focus");

    expect(wrapper.find(".writing-editor").exists()).toBe(true);
    expect(wrapper.find(".reader-preview").exists()).toBe(false);
  });

  it("keeps rendering the writing pane while preview is retired", () => {
    const wrapper = mountMobileWorkspace("preview");

    expect(wrapper.find(".writing-editor").exists()).toBe(true);
    expect(wrapper.find(".reader-preview").exists()).toBe(false);
  });

  it("does not render the mobile preview mode switch while preview is retired", () => {
    const wrapper = mountMobileWorkspace("preview");

    expect(wrapper.find(".editor-mobile-workspace__mode-switch").exists()).toBe(
      false,
    );
    expect(wrapper.text()).not.toContain("预览");
  });
});
