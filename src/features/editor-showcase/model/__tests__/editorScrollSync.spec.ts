import { describe, expect, it } from "vitest";

import {
  buildBlockLineAnchors,
  getActiveBlockIndexFromLine,
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

  it("builds source line anchors for compiled blocks", () => {
    const source = [
      "# 标题",
      "",
      "普通正文",
      "",
      "```go",
      "fmt.Println(1)",
      "```",
      "",
      "| A | B |",
      "| --- | --- |",
      "| 1 | 2 |",
    ].join("\n");

    expect(
      buildBlockLineAnchors(source, [
        {
          type: "heading",
          label: "Heading",
          level: 1,
          content: "标题",
          inlineNodes: [],
        },
        {
          type: "text",
          label: "Text",
          content: "普通正文",
          inlineNodes: [],
        },
        {
          type: "code",
          label: "Code",
          language: "go",
          content: "fmt.Println(1)",
        },
        {
          type: "table",
          label: "Table",
          content: "| A | B |\n| --- | --- |\n| 1 | 2 |",
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
});
