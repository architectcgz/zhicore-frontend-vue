import type { Editor } from "@tiptap/vue-3";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { nextTick } from "vue";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getTiptapPlainText,
  type EditorTiptapDocumentJson,
} from "@/features/editor";

import EditorCompactBodyComposer from "../EditorCompactBodyComposer.vue";
import editorCompactBodyComposerSource from "../EditorCompactBodyComposer.vue?raw";

const writingPaneTiptapBaseStyleSource = readFileSync(
  "src/components/editor/EditorWritingPaneTiptapBase.css",
  "utf8",
);

enableAutoUnmount(afterEach);

afterEach(() => {
  vi.restoreAllMocks();
});

function docFromText(text: string): EditorTiptapDocumentJson {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
}

function exposedEditor(wrapper: ReturnType<typeof mount>) {
  return wrapper.vm as unknown as {
    bodyEditor: Editor | null;
    bodyEditorElement: HTMLElement | null;
  };
}

function hasCodeBlock(editor: Editor): boolean {
  return (
    editor.getJSON().content?.some((node) => node.type === "codeBlock") ?? false
  );
}

describe("EditorCompactBodyComposer", () => {
  it("reuses the existing Tiptap body editor instead of a textarea", () => {
    expect(editorCompactBodyComposerSource).toContain("EditorContent");
    expect(editorCompactBodyComposerSource).toContain(
      "useEditorWritingBodyEditor",
    );
    expect(editorCompactBodyComposerSource).not.toContain("<textarea");
    expect(editorCompactBodyComposerSource).not.toContain("预览");
    expect(editorCompactBodyComposerSource).not.toContain("<select");
    expect(editorCompactBodyComposerSource).not.toContain("代码语言");
    expect(editorCompactBodyComposerSource).toContain("underline");
    expect(editorCompactBodyComposerSource).toContain("strike");
    expect(editorCompactBodyComposerSource).toContain(
      "editor-compact-body__toolbar-button--strike",
    );
    expect(editorCompactBodyComposerSource).toContain(
      "text-decoration: line-through;",
    );
    expect(editorCompactBodyComposerSource).toContain("unorderedList");
    expect(editorCompactBodyComposerSource).toContain("orderedList");
    expect(editorCompactBodyComposerSource).toContain("taskList");
    expect(editorCompactBodyComposerSource).toContain(
      "editor-compact-body__panel-actions button:focus-visible",
    );
  });

  it("emits plain draft text from Tiptap document updates", () => {
    const wrapper = mount(EditorCompactBodyComposer, {
      props: {
        modelValue: "已有评论",
        maxLength: 200,
      },
    });
    const editor = exposedEditor(wrapper).bodyEditor;

    expect(editor).not.toBeNull();
    expect(getTiptapPlainText(editor!.getJSON())).toBe("已有评论");

    editor!.commands.setContent(docFromText("更新后的评论"), {
      emitUpdate: true,
    });

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      "更新后的评论",
    ]);
  });

  it("keeps the inserted code block visible after the parent echoes plain draft text", async () => {
    const wrapper = mount(EditorCompactBodyComposer, {
      props: {
        modelValue: "已有评论",
        maxLength: 1000,
      },
    });
    const editor = exposedEditor(wrapper).bodyEditor;

    expect(editor).not.toBeNull();

    await wrapper.find('button[title="代码块"]').trigger("click");
    const emittedDraft = wrapper.emitted("update:modelValue")?.at(-1)?.[0];

    expect(typeof emittedDraft).toBe("string");
    expect(hasCodeBlock(editor!)).toBe(true);

    await wrapper.setProps({ modelValue: emittedDraft as string });
    await nextTick();

    expect(hasCodeBlock(editor!)).toBe(true);
  });

  it("edits link text and href from the compact link panel", async () => {
    const wrapper = mount(EditorCompactBodyComposer, {
      props: {
        modelValue: "",
        maxLength: 1000,
        toolbarActions: ["link"],
      },
    });

    await wrapper.get('[data-testid="compact-toolbar-link"]').trigger("click");
    await wrapper.get('[data-testid="compact-link-text"]').setValue("契约文档");
    await wrapper
      .get('[data-testid="compact-link-href"]')
      .setValue("https://example.com/contracts");
    await wrapper.get('[data-testid="compact-link-apply"]').trigger("click");

    const editor = exposedEditor(wrapper).bodyEditor;
    const paragraph = editor?.getJSON().content?.[0];
    const textNode = paragraph?.content?.[0];

    expect(textNode).toMatchObject({
      type: "text",
      text: "契约文档",
      marks: [
        {
          type: "link",
          attrs: { href: "https://example.com/contracts" },
        },
      ],
    });
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["契约文档"]);
  });

  it("closes the compact link panel when the editor selection moves elsewhere", async () => {
    const wrapper = mount(EditorCompactBodyComposer, {
      props: {
        modelValue: "已有评论",
        maxLength: 1000,
        toolbarActions: ["link"],
      },
    });
    const editor = exposedEditor(wrapper).bodyEditor;

    await wrapper.get('[data-testid="compact-toolbar-link"]').trigger("click");
    expect(wrapper.find('[data-testid="compact-link-text"]').exists()).toBe(
      true,
    );

    editor!.commands.setTextSelection(2);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="compact-link-text"]').exists()).toBe(
      false,
    );
  });

  it("uses the shared editor link open modifier state in comments", async () => {
    const wrapper = mount(EditorCompactBodyComposer, {
      props: {
        modelValue: "",
        maxLength: 1000,
        toolbarActions: ["link"],
      },
    });
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    await wrapper.get('[data-testid="compact-toolbar-link"]').trigger("click");
    await wrapper.get('[data-testid="compact-link-text"]').setValue("契约文档");
    await wrapper
      .get('[data-testid="compact-link-href"]')
      .setValue("https://example.com/contracts");
    await wrapper.get('[data-testid="compact-link-apply"]').trigger("click");

    const editorElement = exposedEditor(wrapper).bodyEditorElement;
    const link = editorElement?.querySelector<HTMLAnchorElement>("a");

    expect(link).not.toBeNull();
    expect(writingPaneTiptapBaseStyleSource).toContain(
      ".ProseMirror.editor-link-open-modifier a[href]",
    );

    link!.dispatchEvent(
      new MouseEvent("mousemove", {
        bubbles: true,
        ctrlKey: true,
      }),
    );
    expect(editorElement?.classList.contains("editor-link-open-modifier")).toBe(
      true,
    );

    link!.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      }),
    );

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/contracts",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("inserts a mention from the compact mention panel", async () => {
    const wrapper = mount(EditorCompactBodyComposer, {
      props: {
        modelValue: "",
        maxLength: 1000,
        toolbarActions: ["mention"],
      },
    });

    await wrapper
      .get('[data-testid="compact-toolbar-mention"]')
      .trigger("click");
    await wrapper
      .get('[data-testid="compact-mention-option-user-lin"]')
      .trigger("click");

    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["@Lin "]);
  });
});
