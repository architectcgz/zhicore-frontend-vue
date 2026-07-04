import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import EditorWorkspace from "../EditorWorkspace.vue";

describe("EditorWorkspace", () => {
  it("shows publish as a document-level action in the editor header", () => {
    const wrapper = mount(EditorWorkspace, {
      global: {
        stubs: {
          EditorDesktopWorkspace: {
            template: '<div class="editor-desktop-stage" />',
          },
          EditorMobileWorkspace: {
            template: '<div class="editor-mobile-workspace" />',
          },
        },
      },
    });

    const publishButton = wrapper.find(".editor-workspace__publish");

    expect(publishButton.exists()).toBe(true);
    expect(publishButton.text()).toBe("发布");
  });
});
