import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import {
  editorProseMirrorSchema,
  serializeProseMirrorDocToJson,
} from "@/features/editor/model/editorProseMirrorEngine";

import EditorMobileWorkspace from "../EditorMobileWorkspace.vue";

function mountMobileWorkspace(activeMode: "focus" | "preview") {
  return mount(EditorMobileWorkspace, {
    props: {
      activeMode,
      activeBackgroundId: "paper",
      backgroundCandidates: [
        {
          id: "paper",
          name: "纸面",
          className: "editor--paper",
          swatch: "linear-gradient(135deg, #f7f4ee, #edf1f6)",
        },
      ],
      title: "草稿标题",
      bodyDocumentJson: serializeProseMirrorDocToJson(
        editorProseMirrorSchema.nodes.doc.create(null, [
          editorProseMirrorSchema.nodes.paragraph.create(null, [
            editorProseMirrorSchema.text("草稿正文"),
          ]),
        ]),
      ),
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

  it("renders only the reader preview in preview mode", () => {
    const wrapper = mountMobileWorkspace("preview");

    expect(wrapper.find(".writing-editor").exists()).toBe(false);
    expect(wrapper.find(".reader-preview").exists()).toBe(true);
  });

  it("emits mode changes from the mobile switch", async () => {
    const wrapper = mountMobileWorkspace("preview");

    await wrapper
      .find(
        '.editor-mobile-workspace__mode-switch button[aria-pressed="false"]',
      )
      .trigger("click");

    expect(wrapper.emitted("selectMode")).toEqual([["focus"]]);
  });
});
