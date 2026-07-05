import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { EditorWorkspaceShellRef } from "../composables/useEditorWorkspaceController";
import { useEditorWorkspaceController } from "../composables/useEditorWorkspaceController";
import type { EditorPostWorkflowClient } from "../lib/editorPostWorkflowClient";

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
  return defineComponent<{
    postWorkflowClient?: EditorPostWorkflowClient;
  }>({
    props: {
      postWorkflowClient: {
        type: Object,
        required: false,
      },
    },
    setup(_, { expose }) {
      const controller = useEditorWorkspaceController({
        postWorkflowClient: _.postWorkflowClient,
      });

      expose({ controller });

      return () => null;
    },
  });
}

describe("useEditorWorkspaceController", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
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
      applyBodyToolbarAction: vi.fn(),
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
      applyBodyToolbarAction: vi.fn(() => {
        callOrder.push("command");
      }),
    };

    defineReadonlyNumberProperty(bodyInput, "scrollHeight", 640);
    controller.workspaceShellRef.value = shell;

    await controller.handleToolbarAction("quote");

    expect(callOrder).toEqual(["command", "selection", "focus"]);
  });

  it("saves a server draft and publishes with the returned baseline", async () => {
    const postWorkflowClient: EditorPostWorkflowClient = {
      createDraft: vi.fn().mockResolvedValue({
        postId: "post-1",
        basePostVersion: 1,
      }),
      saveDraftBody: vi.fn().mockResolvedValue({
        postId: "post-1",
        postVersion: 2,
        draftBodyId: "body-1",
        draftBodyHash: "sha256:body",
        savedAt: "2026-07-05T00:00:00Z",
        wordCount: 2,
      }),
      publishDraft: vi.fn().mockResolvedValue({
        postId: "post-1",
        postVersion: 3,
        publishedAt: "2026-07-05T00:00:00Z",
      }),
    };
    const wrapper = mount(createControllerHost(), {
      props: { postWorkflowClient },
    });
    const controller = (
      wrapper.vm as unknown as {
        controller: ReturnType<typeof useEditorWorkspaceController>;
      }
    ).controller;

    controller.handleTitleInput("发布标题");
    await controller.handlePublishDraft();

    expect(postWorkflowClient.createDraft).toHaveBeenCalledWith({
      title: "发布标题",
    });
    expect(postWorkflowClient.saveDraftBody).toHaveBeenCalled();
    expect(postWorkflowClient.publishDraft).toHaveBeenCalledWith({
      postId: "post-1",
      basePostVersion: 2,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:body",
    });
    expect(controller.publishSuccessLabel.value).toBe("已发布");
  });

  it("does not publish when the pre-publish server save fails", async () => {
    const postWorkflowClient: EditorPostWorkflowClient = {
      createDraft: vi.fn().mockResolvedValue({
        postId: "post-1",
        basePostVersion: 1,
      }),
      saveDraftBody: vi.fn().mockRejectedValue(new Error("save failed")),
      publishDraft: vi.fn(),
    };
    const wrapper = mount(createControllerHost(), {
      props: { postWorkflowClient },
    });
    const controller = (
      wrapper.vm as unknown as {
        controller: ReturnType<typeof useEditorWorkspaceController>;
      }
    ).controller;

    controller.handleTitleInput("发布标题");
    await controller.handlePublishDraft();

    expect(postWorkflowClient.publishDraft).not.toHaveBeenCalled();
    expect(controller.publishErrorLabel.value).toBe("发布前保存失败，请重试");
    expect(controller.publishSuccessLabel.value).toBe("");
  });

  it("publishes a clean server draft without saving the body again", async () => {
    const postWorkflowClient: EditorPostWorkflowClient = {
      createDraft: vi.fn().mockResolvedValue({
        postId: "post-1",
        basePostVersion: 1,
      }),
      saveDraftBody: vi.fn().mockResolvedValue({
        postId: "post-1",
        postVersion: 2,
        draftBodyId: "body-1",
        draftBodyHash: "sha256:body",
        savedAt: "2026-07-05T00:00:00Z",
        wordCount: 2,
      }),
      publishDraft: vi.fn().mockResolvedValue({
        postId: "post-1",
        postVersion: 3,
        publishedAt: "2026-07-05T00:00:00Z",
      }),
    };
    const wrapper = mount(createControllerHost(), {
      props: { postWorkflowClient },
    });
    const controller = (
      wrapper.vm as unknown as {
        controller: ReturnType<typeof useEditorWorkspaceController>;
      }
    ).controller;

    controller.handleTitleInput("发布标题");
    await controller.handleSaveDraft();
    vi.mocked(postWorkflowClient.saveDraftBody).mockClear();

    await controller.handlePublishDraft();

    expect(postWorkflowClient.saveDraftBody).not.toHaveBeenCalled();
    expect(postWorkflowClient.publishDraft).toHaveBeenCalledWith({
      postId: "post-1",
      basePostVersion: 2,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:body",
    });
  });

  it("advances the server baseline after publishing before later edits are saved", async () => {
    const saveDraftBody = vi
      .fn()
      .mockResolvedValueOnce({
        postId: "post-1",
        postVersion: 2,
        draftBodyId: "body-1",
        draftBodyHash: "sha256:body",
        savedAt: "2026-07-05T00:00:00Z",
        wordCount: 2,
      })
      .mockResolvedValueOnce({
        postId: "post-1",
        postVersion: 4,
        draftBodyId: "body-2",
        draftBodyHash: "sha256:next",
        savedAt: "2026-07-05T00:01:00Z",
        wordCount: 3,
      });
    const postWorkflowClient: EditorPostWorkflowClient = {
      createDraft: vi.fn().mockResolvedValue({
        postId: "post-1",
        basePostVersion: 1,
      }),
      saveDraftBody,
      publishDraft: vi.fn().mockResolvedValue({
        postId: "post-1",
        postVersion: 3,
        publishedAt: "2026-07-05T00:00:00Z",
      }),
    };
    const wrapper = mount(createControllerHost(), {
      props: { postWorkflowClient },
    });
    const controller = (
      wrapper.vm as unknown as {
        controller: ReturnType<typeof useEditorWorkspaceController>;
      }
    ).controller;

    controller.handleTitleInput("发布标题");
    await controller.handlePublishDraft();
    controller.handleTitleInput("发布后的修改");
    await controller.handleSaveDraft();

    expect(saveDraftBody).toHaveBeenLastCalledWith(
      "post-1",
      expect.not.objectContaining({
        baseDraftBodyId: "body-1",
        baseDraftBodyHash: "sha256:body",
      }),
    );
    expect(saveDraftBody).toHaveBeenLastCalledWith(
      "post-1",
      expect.objectContaining({
        basePostVersion: 3,
      }),
    );
  });
});
