import { ref } from "vue";
import { describe, expect, it } from "vitest";

import { useEditorPreviewScrollSync } from "../useEditorPreviewScrollSync";

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

function defineReadonlyNumberGetter(
  element: Element,
  propertyName: "clientHeight" | "scrollHeight",
  getter: () => number,
): void {
  Object.defineProperty(element, propertyName, {
    configurable: true,
    get: getter,
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
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 900);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);
    writingEditor.scrollTop = 80;

    const { resizeBodyInput } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(null),
      previewBlockAnchors: ref([]),
      isPreviewMode: ref(false),
    });

    resizeBodyInput();

    expect(bodyInput.style.height).toBe("420px");
    expect(writingEditor.scrollTop).toBe(80);
  });

  it("keeps the new trailing line visible when the focused body input grows at the editor bottom", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");

    bodyInput.value = "最后一行\n";
    bodyInput.selectionStart = bodyInput.value.length;
    bodyInput.selectionEnd = bodyInput.value.length;
    document.body.append(bodyInput);
    bodyInput.focus();
    defineReadonlyNumberProperty(bodyInput, "scrollHeight", 520);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);
    defineReadonlyNumberGetter(writingEditor, "scrollHeight", () => {
      const bodyHeight = Number.parseFloat(bodyInput.style.height);
      return Number.isFinite(bodyHeight) ? bodyHeight + 300 : 800;
    });
    writingEditor.scrollTop = 400;

    const { resizeBodyInput } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(null),
      previewBlockAnchors: ref([]),
      isPreviewMode: ref(false),
    });

    resizeBodyInput();

    expect(bodyInput.style.height).toBe("520px");
    expect(writingEditor.scrollTop).toBe(420);
    bodyInput.remove();
  });

  it("moves the editor viewport downward instead of leaving the focused body input internally scrolled", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");

    bodyInput.value = "倒数第二行\n最后一行\n";
    bodyInput.selectionStart = bodyInput.value.length;
    bodyInput.selectionEnd = bodyInput.value.length;
    bodyInput.scrollTop = 28;
    bodyInput.style.lineHeight = "28px";
    document.body.append(bodyInput);
    bodyInput.focus();
    defineReadonlyNumberProperty(bodyInput, "scrollHeight", 520);
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 1200);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);
    defineRectTop(bodyInput, -500);
    defineRectTop(writingEditor, 0);
    writingEditor.scrollTop = 600;

    const { resizeBodyInput } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(null),
      previewBlockAnchors: ref([]),
      isPreviewMode: ref(false),
    });

    resizeBodyInput();

    expect(bodyInput.scrollTop).toBe(0);
    expect(writingEditor.scrollTop).toBe(628);
    bodyInput.remove();
  });

  it("syncs the reader preview to the active source block", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");
    const firstBlock = document.createElement("div");
    const secondBlock = document.createElement("div");
    const previewBlockAnchors = [
      {
        readerBlockIndex: 0,
        sourceRange: {
          startLine: 0,
          endLine: 0,
        },
      },
      {
        readerBlockIndex: 1,
        sourceRange: {
          startLine: 2,
          endLine: 4,
        },
      },
    ];

    bodyInput.style.lineHeight = "20px";
    writingEditor.scrollTop = 40;
    firstBlock.dataset.previewReaderBlockIndex = "0";
    secondBlock.dataset.previewReaderBlockIndex = "1";
    readerPreview.append(firstBlock, secondBlock);
    readerPreview.scrollTop = 20;
    defineRectTop(bodyInput, -40);
    defineRectTop(writingEditor, 0);
    defineRectTop(readerPreview, 100);
    defineRectTop(secondBlock, 260);
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);

    const { syncPreviewScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      previewBlockAnchors: ref(previewBlockAnchors),
      isPreviewMode: ref(true),
    });

    syncPreviewScroll();

    expect(readerPreview.scrollTop).toBe(180);
  });

  it("uses reader block indexes when spacer blocks make compiled and reader indexes diverge", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");
    const codeBlock = document.createElement("div");
    const spacerBlock = document.createElement("div");
    const tableBlock = document.createElement("div");
    const previewBlockAnchors = [
      {
        readerBlockIndex: 0,
        sourceRange: {
          startLine: 0,
          endLine: 2,
        },
      },
      {
        readerBlockIndex: 2,
        sourceRange: {
          startLine: 5,
          endLine: 7,
        },
      },
    ];

    bodyInput.style.lineHeight = "20px";
    writingEditor.scrollTop = 100;
    codeBlock.dataset.previewReaderBlockIndex = "0";
    spacerBlock.dataset.previewReaderBlockIndex = "1";
    tableBlock.dataset.previewReaderBlockIndex = "2";
    readerPreview.append(codeBlock, spacerBlock, tableBlock);
    readerPreview.scrollTop = 15;
    defineRectTop(bodyInput, -100);
    defineRectTop(writingEditor, 0);
    defineRectTop(readerPreview, 100);
    defineRectTop(tableBlock, 340);
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);

    const { syncPreviewScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      previewBlockAnchors: ref(previewBlockAnchors),
      isPreviewMode: ref(true),
    });

    syncPreviewScroll();

    expect(readerPreview.scrollTop).toBe(255);
  });
});
