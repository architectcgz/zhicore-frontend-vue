import { describe, expect, it } from "vitest";

import {
  getPreviewToEditorScrollTarget,
  getSyncedScrollTop,
} from "../lib/editorScrollSync";

describe("editorScrollSync", () => {
  it("maps the source scroll progress to target scroll top", () => {
    expect(
      getSyncedScrollTop({
        sourceScrollTop: 300,
        sourceScrollHeight: 1000,
        sourceClientHeight: 400,
        targetScrollHeight: 1600,
        targetClientHeight: 400,
      }),
    ).toBe(600);
  });

  it("returns zero when either side cannot scroll", () => {
    expect(
      getSyncedScrollTop({
        sourceScrollTop: 300,
        sourceScrollHeight: 400,
        sourceClientHeight: 400,
        targetScrollHeight: 1600,
        targetClientHeight: 400,
      }),
    ).toBe(0);

    expect(
      getSyncedScrollTop({
        sourceScrollTop: 300,
        sourceScrollHeight: 1000,
        sourceClientHeight: 400,
        targetScrollHeight: 400,
        targetClientHeight: 400,
      }),
    ).toBe(0);
  });

  it("prioritizes the document bottom when preview-to-editor sync reaches the bottom", () => {
    expect(
      getPreviewToEditorScrollTarget({
        previewScrollTop: 600,
        previewScrollHeight: 1000,
        previewClientHeight: 400,
        editorScrollHeight: 1200,
        editorClientHeight: 400,
      }),
    ).toEqual({
      strategy: "bottom",
      scrollTop: 800,
    });
  });

  it("syncs preview-to-editor scroll by progress inside the document", () => {
    expect(
      getPreviewToEditorScrollTarget({
        previewScrollTop: 300,
        previewScrollHeight: 1000,
        previewClientHeight: 400,
        editorScrollHeight: 1600,
        editorClientHeight: 400,
      }),
    ).toEqual({
      strategy: "progress",
      scrollTop: 600,
    });
  });
});
