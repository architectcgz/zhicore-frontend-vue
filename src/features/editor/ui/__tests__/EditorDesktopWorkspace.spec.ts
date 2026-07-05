import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import desktopWorkspaceSource from "../EditorDesktopWorkspace.vue?raw";
import EditorDesktopWorkspace from "../EditorDesktopWorkspace.vue";

function mountDesktopWorkspace(activeMode: "focus" | "preview") {
  return mount(EditorDesktopWorkspace, {
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

describe("EditorDesktopWorkspace", () => {
  it("keeps the desktop workspace focused on writing while preview is retired", () => {
    const wrapper = mountDesktopWorkspace("preview");

    expect(wrapper.find(".writing-editor").exists()).toBe(true);
    expect(wrapper.find(".reader-preview").exists()).toBe(false);
  });

  it("keeps the desktop editor stage centered and narrower than the page frame", () => {
    expect(desktopWorkspaceSource).toContain("width: min(920px, 100%);");
    expect(desktopWorkspaceSource).toContain("margin-inline: auto;");
  });
});
