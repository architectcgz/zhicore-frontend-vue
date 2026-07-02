import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { EditorWorkspaceShellRef } from "../useEditorWorkspaceController";
import { useEditorWorkspaceController } from "../useEditorWorkspaceController";

function defineReadonlyNumberProperty(
  element: Element,
  propertyName: "scrollHeight" | "clientHeight",
  value: number,
): void {
  Object.defineProperty(element, propertyName, {
    configurable: true,
    value,
  });
}

function createControllerHost() {
  return defineComponent({
    setup(_, { expose }) {
      const controller = useEditorWorkspaceController();

      expose({ controller });

      return () => null;
    },
  });
}

describe("useEditorWorkspaceController", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rehydrates editor layout after the workspace shell is recreated", async () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });

    const wrapper = mount(createControllerHost());
    const controller = (
      wrapper.vm as unknown as {
        controller: ReturnType<typeof useEditorWorkspaceController>;
      }
    ).controller;
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const recreatedShell: EditorWorkspaceShellRef = {
      bodyInputElement: bodyInput,
      writingEditorElement: writingEditor,
      readerPreviewElement: null,
      focusBody: vi.fn(),
      getBodySelection: vi.fn(),
      setBodySelection: vi.fn(),
    };

    defineReadonlyNumberProperty(bodyInput, "scrollHeight", 640);
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 900);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 420);
    controller.workspaceShellRef.value = recreatedShell;

    await nextTick();
    await nextTick();

    expect(bodyInput.style.height).toBe("640px");
  });

  it("restores toolbar selection before focusing the body input", async () => {
    const wrapper = mount(createControllerHost());
    const controller = (
      wrapper.vm as unknown as {
        controller: ReturnType<typeof useEditorWorkspaceController>;
      }
    ).controller;
    const callOrder: string[] = [];
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const shell: EditorWorkspaceShellRef = {
      bodyInputElement: bodyInput,
      writingEditorElement: writingEditor,
      readerPreviewElement: null,
      focusBody: vi.fn(() => {
        callOrder.push("focus");
      }),
      getBodySelection: vi.fn(() => ({ start: 0, end: 0 })),
      setBodySelection: vi.fn(() => {
        callOrder.push("selection");
      }),
    };

    defineReadonlyNumberProperty(bodyInput, "scrollHeight", 640);
    controller.workspaceShellRef.value = shell;

    await controller.handleToolbarAction("quote");

    expect(callOrder).toEqual(["selection", "focus"]);
  });
});
