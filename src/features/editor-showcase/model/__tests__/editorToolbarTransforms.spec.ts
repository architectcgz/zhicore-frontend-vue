import { describe, expect, it } from "vitest";

import { applyToolbarActionToBody } from "../editorToolbarTransforms";

describe("editorToolbarTransforms", () => {
  it("wraps selected text with inline toolbar marks", () => {
    expect(
      applyToolbarActionToBody("写作文本", "bold", {
        start: 0,
        end: 2,
      }),
    ).toEqual({
      nextBody: "**写作**文本",
      nextSelection: {
        start: 2,
        end: 4,
      },
    });
  });

  it("inserts block toolbar marks with paragraph padding", () => {
    expect(
      applyToolbarActionToBody("前文", "code", {
        start: 2,
        end: 2,
      }),
    ).toEqual({
      nextBody: "前文\n\n```ts\n// 在这里输入代码\n```",
      nextSelection: {
        start: 10,
        end: 20,
      },
    });
  });
});
