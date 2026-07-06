import type { Editor } from "@tiptap/vue-3";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import {
  getTiptapPlainText,
  type EditorTiptapDocumentJson,
} from "@/features/editor";

import EditorCompactBodyComposer from "../EditorCompactBodyComposer.vue";
import editorCompactBodyComposerSource from "../EditorCompactBodyComposer.vue?raw";

enableAutoUnmount(afterEach);

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
    expect(editorCompactBodyComposerSource).not.toContain(
      "outline: 2px solid var(--color-accent)",
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
});
