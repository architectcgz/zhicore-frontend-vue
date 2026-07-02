import { describe, expect, it } from "vitest";

import {
  buildBlockLineAnchors,
  getActiveBlockIndexFromLine,
  getPreviewToEditorScrollTarget,
  getSyncedScrollTop,
} from "../editorScrollSync";

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

  it("builds source line anchors from compiled block metadata", () => {
    expect(
      buildBlockLineAnchors([
        {
          type: "heading",
          label: "Heading",
          level: 1,
          content: "标题",
          sourceRange: {
            startLine: 0,
            endLine: 0,
          },
          inlineNodes: [],
        },
        {
          type: "text",
          label: "Text",
          content: "普通正文",
          sourceRange: {
            startLine: 2,
            endLine: 2,
          },
          inlineNodes: [],
        },
        {
          type: "code",
          label: "Code",
          language: "go",
          content: "fmt.Println(1)",
          sourceRange: {
            startLine: 4,
            endLine: 6,
          },
        },
        {
          type: "table",
          label: "Table",
          content: "| A | B |\n| --- | --- |\n| 1 | 2 |",
          sourceRange: {
            startLine: 8,
            endLine: 10,
          },
          headers: [],
          rows: [],
        },
      ]),
    ).toEqual([
      {
        blockIndex: 0,
        startLine: 0,
        endLine: 0,
      },
      {
        blockIndex: 1,
        startLine: 2,
        endLine: 2,
      },
      {
        blockIndex: 2,
        startLine: 4,
        endLine: 6,
      },
      {
        blockIndex: 3,
        startLine: 8,
        endLine: 10,
      },
    ]);
  });

  it("keeps blank lines anchored to the previous block", () => {
    const anchors = [
      {
        blockIndex: 0,
        startLine: 0,
        endLine: 0,
      },
      {
        blockIndex: 1,
        startLine: 2,
        endLine: 4,
      },
    ];

    expect(getActiveBlockIndexFromLine(anchors, 1)).toBe(0);
    expect(getActiveBlockIndexFromLine(anchors, 3)).toBe(1);
  });

  it("prioritizes the document bottom when preview-to-editor sync reaches the bottom", () => {
    expect(
      getPreviewToEditorScrollTarget({
        previewScrollTop: 600,
        previewScrollHeight: 1000,
        previewClientHeight: 400,
        editorScrollHeight: 1200,
        editorClientHeight: 400,
        activeAnchorScrollTop: 400,
      }),
    ).toEqual({
      strategy: "bottom",
      scrollTop: 800,
    });
  });

  it("uses the active source anchor when preview-to-editor sync is inside the document", () => {
    expect(
      getPreviewToEditorScrollTarget({
        previewScrollTop: 180,
        previewScrollHeight: 1000,
        previewClientHeight: 400,
        editorScrollHeight: 1200,
        editorClientHeight: 400,
        activeAnchorScrollTop: 160,
      }),
    ).toEqual({
      strategy: "anchor",
      scrollTop: 160,
    });
  });

  it("falls back to scroll progress when preview-to-editor sync has no active source anchor", () => {
    expect(
      getPreviewToEditorScrollTarget({
        previewScrollTop: 300,
        previewScrollHeight: 1000,
        previewClientHeight: 400,
        editorScrollHeight: 1600,
        editorClientHeight: 400,
        activeAnchorScrollTop: null,
      }),
    ).toEqual({
      strategy: "progress",
      scrollTop: 600,
    });
  });
});
