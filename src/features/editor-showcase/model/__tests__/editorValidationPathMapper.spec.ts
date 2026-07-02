import { describe, expect, it } from "vitest";

import {
  compileEditorContent,
  mapEditorCompiledDocumentToPostBodyWriteInputWithSourceMap,
} from "../editorContentCompiler";
import { mapPostBodyValidationPathToEditorTarget } from "../editorValidationPathMapper";

describe("editorValidationPathMapper", () => {
  it("maps backend block paths to the matching formal save block source range", () => {
    const sourceMap =
      mapEditorCompiledDocumentToPostBodyWriteInputWithSourceMap(
        compileEditorContent(
          ["## 标题", "", "阅读 [ZhiCore](https://example.com/docs)。"].join(
            "\n",
          ),
        ),
      );

    expect(
      mapPostBodyValidationPathToEditorTarget(
        "blocks[1].children[0].marks[0].href",
        sourceMap,
      ),
    ).toEqual({
      kind: "source-range",
      path: "blocks[1].children[0].marks[0].href",
      blockIndex: 1,
      sourceRange: {
        startLine: 2,
        endLine: 2,
      },
    });
  });

  it("does not let reader preview spacers offset formal block indexes", () => {
    const sourceMap =
      mapEditorCompiledDocumentToPostBodyWriteInputWithSourceMap(
        compileEditorContent(
          [
            "```go",
            "package main",
            "```",
            "",
            "",
            "| A | B |",
            "| --- | --- |",
            "| 1 | 2 |",
          ].join("\n"),
        ),
      );

    expect(sourceMap.writeInput.blocks.map((block) => block.type)).toEqual([
      "code_block",
      "table",
    ]);
    expect(
      mapPostBodyValidationPathToEditorTarget(
        "blocks[1].headers[0]",
        sourceMap,
      ),
    ).toEqual({
      kind: "source-range",
      path: "blocks[1].headers[0]",
      blockIndex: 1,
      sourceRange: {
        startLine: 5,
        endLine: 7,
      },
    });
  });

  it("falls back to a global body target for unmappable paths", () => {
    const sourceMap = {
      writeInput: {
        schemaVersion: 1 as const,
        blocks: [
          {
            type: "paragraph" as const,
            children: [{ type: "text" as const, text: "正文" }],
          },
        ],
      },
      blockSourceRanges: [undefined],
    };

    expect(
      mapPostBodyValidationPathToEditorTarget("title", sourceMap),
    ).toMatchObject({
      kind: "global",
      path: "title",
      reason: "path is not a post body block path",
    });
    expect(
      mapPostBodyValidationPathToEditorTarget(
        "blocks[3].children[0]",
        sourceMap,
      ),
    ).toMatchObject({
      kind: "global",
      path: "blocks[3].children[0]",
      blockIndex: 3,
      reason: "block index is outside the post body source map",
    });
    expect(
      mapPostBodyValidationPathToEditorTarget(
        "blocks[0].children[0]",
        sourceMap,
      ),
    ).toMatchObject({
      kind: "global",
      path: "blocks[0].children[0]",
      blockIndex: 0,
      reason: "block source range is unavailable",
    });
  });
});
