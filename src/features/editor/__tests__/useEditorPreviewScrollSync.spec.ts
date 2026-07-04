import { ref } from "vue";
import { describe, expect, it } from "vitest";

import { useEditorPreviewScrollSync } from "../composables/useEditorPreviewScrollSync";

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
      isPreviewMode: ref(false),
    });

    resizeBodyInput();

    expect(bodyInput.style.height).toBe("420px");
    expect(writingEditor.scrollTop).toBe(80);
  });

  it("resizes a Tiptap body element without textarea-only caret assumptions", () => {
    const bodyInput = document.createElement("div");
    const writingEditor = document.createElement("main");

    bodyInput.contentEditable = "true";
    defineReadonlyNumberProperty(bodyInput, "scrollHeight", 520);
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 1200);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);
    writingEditor.scrollTop = 240;
    document.body.append(bodyInput);
    bodyInput.focus();

    const { resizeBodyInput } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(null),
      isPreviewMode: ref(false),
    });

    resizeBodyInput();

    expect(bodyInput.style.height).toBe("520px");
    expect(writingEditor.scrollTop).toBe(240);
    bodyInput.remove();
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
      isPreviewMode: ref(false),
    });

    resizeBodyInput();

    expect(bodyInput.scrollTop).toBe(0);
    expect(writingEditor.scrollTop).toBe(628);
    bodyInput.remove();
  });

  it("syncs the reader preview by scroll progress", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");

    writingEditor.scrollTop = 300;
    readerPreview.scrollTop = 20;
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 1000);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);

    const { syncPreviewScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      isPreviewMode: ref(true),
    });

    syncPreviewScroll();

    expect(readerPreview.scrollTop).toBe(300);
  });

  it("syncs the reader preview to the very top when the editor is at the top", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");

    writingEditor.scrollTop = 0;
    readerPreview.scrollTop = 180;
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);

    const { syncPreviewScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      isPreviewMode: ref(true),
    });

    syncPreviewScroll();

    expect(readerPreview.scrollTop).toBe(0);
  });

  it("syncs the reader preview to the bottom when the editor reaches the bottom", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");

    writingEditor.scrollTop = 600;
    readerPreview.scrollTop = 0;
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 1000);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);

    const { syncPreviewScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      isPreviewMode: ref(true),
    });

    syncPreviewScroll();

    expect(readerPreview.scrollTop).toBe(600);
  });

  it("syncs the editor by preview scroll progress", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");

    readerPreview.scrollTop = 300;
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 1600);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);

    const { syncEditorScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      isPreviewMode: ref(true),
    });

    syncEditorScroll();

    expect(writingEditor.scrollTop).toBe(600);
  });

  it("syncs the editor to the bottom when the reader preview reaches the bottom", () => {
    const bodyInput = document.createElement("textarea");
    const writingEditor = document.createElement("main");
    const readerPreview = document.createElement("aside");

    readerPreview.scrollTop = 600;
    defineReadonlyNumberProperty(readerPreview, "scrollHeight", 1000);
    defineReadonlyNumberProperty(readerPreview, "clientHeight", 400);
    defineReadonlyNumberProperty(writingEditor, "scrollHeight", 1200);
    defineReadonlyNumberProperty(writingEditor, "clientHeight", 400);

    const { syncEditorScroll } = useEditorPreviewScrollSync({
      bodyInputRef: ref(bodyInput),
      writingEditorRef: ref(writingEditor),
      readerPreviewRef: ref(readerPreview),
      isPreviewMode: ref(true),
    });

    syncEditorScroll();

    expect(writingEditor.scrollTop).toBe(800);
  });
});
