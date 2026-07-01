import { ref } from "vue";
import { describe, expect, it } from "vitest";

import { useEditorPreviewScrollSync } from "../useEditorPreviewScrollSync";
import type { EditorCompiledBlock } from "../editorContentCompiler";

function defineReadonlyNumberProperty(
  element: Element,
  propertyName: "clientHeight" | "scrollHeight",
  value: number,
): void {
  Object.defineProperty(element, propertyName, {
    configurable: true,
    value,
  });
}

function defineRectTop(element: Element, top: number): void {
  element.getBoundingClientRect = () =>
    ({
      top,
      bottom: top,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe("useEditorPreviewScrollSync", () => {
  it("resizes the body input without changing the editor scroll position", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");

    defineReadonlyNumberProperty(bodyInput, "scrollHeight", 420);
    writingEditor.scrollTop = 80;

    const { resizeBodyInput } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(null),
      previewBlocks: ref([]),
      isPreviewMode: ref(false),
    });

    resizeBodyInput();

    expect(bodyInput.style.height).toBe("420px");
    expect(writingEditor.scrollTop).toBe(80);
  });

  it("syncs the reader preview to the active source block", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");
    const firstBlock = document.createElement("div");
    const secondBlock = document.createElement("div");
    const previewBlocks: EditorCompiledBlock[] = [
      {
        type: "heading",
        label: "Heading",
        content: "标题",
        level: 1,
        sourceRange: {
          startLine: 0,
          endLine: 0,
        },
        inlineNodes: [],
      },
      {
        type: "text",
        label: "Text",
        content: "正文",
        sourceRange: {
          startLine: 2,
          endLine: 4,
        },
        inlineNodes: [],
      },
    ];

    bodyInput.style.lineHeight = "20px";
    writingEditor.scrollTop = 40;
    firstBlock.dataset.previewBlockIndex = "0";
    secondBlock.dataset.previewBlockIndex = "1";
    readerPreview.append(firstBlock, secondBlock);
    readerPreview.scrollTop = 20;
    defineRectTop(bodyInput, 0);
    defineRectTop(writingEditor, 0);
    defineRectTop(readerPreview, 100);
    defineRectTop(secondBlock, 260);
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);

    const { syncPreviewScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      previewBlocks: ref(previewBlocks),
      isPreviewMode: ref(true),
    });

    syncPreviewScroll();

    expect(readerPreview.scrollTop).toBe(180);
  });
});
