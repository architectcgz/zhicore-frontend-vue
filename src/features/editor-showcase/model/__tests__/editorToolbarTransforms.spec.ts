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

  it("wraps selected text with every supported inline toolbar mark", () => {
    expect(
      applyToolbarActionToBody("写作文本", "inlineCode", {
        start: 0,
        end: 2,
      }),
    ).toEqual({
      nextBody: "`写作`文本",
      nextSelection: {
        start: 1,
        end: 3,
      },
    });

    expect(
      applyToolbarActionToBody("写作文本", "underline", {
        start: 0,
        end: 2,
      }),
    ).toEqual({
      nextBody: "++写作++文本",
      nextSelection: {
        start: 2,
        end: 4,
      },
    });

    expect(
      applyToolbarActionToBody("写作文本", "strike", {
        start: 0,
        end: 2,
      }),
    ).toEqual({
      nextBody: "~~写作~~文本",
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
      nextBody: "前文\n```ts\n// 在这里输入代码\n```",
      nextSelection: {
        start: 9,
        end: 19,
      },
    });
  });

  it("inserts all heading levels supported by the compiler", () => {
    expect(
      applyToolbarActionToBody("前文", "heading6", {
        start: 2,
        end: 2,
      }),
    ).toEqual({
      nextBody: "前文\n###### 六级标题",
      nextSelection: {
        start: 10,
        end: 14,
      },
    });
  });

  it("formats multiline block selections for quote and lists", () => {
    expect(
      applyToolbarActionToBody("第一行\n第二行", "quote", {
        start: 0,
        end: 7,
      }),
    ).toEqual({
      nextBody: "> 第一行\n> 第二行",
      nextSelection: {
        start: 2,
        end: 11,
      },
    });

    expect(
      applyToolbarActionToBody("第一行\n第二行", "orderedList", {
        start: 0,
        end: 7,
      }),
    ).toEqual({
      nextBody: "1. 第一行\n2. 第二行",
      nextSelection: {
        start: 3,
        end: 13,
      },
    });

    expect(
      applyToolbarActionToBody("第一行\n第二行", "taskList", {
        start: 0,
        end: 7,
      }),
    ).toEqual({
      nextBody: "- [ ] 第一行\n- [ ] 第二行",
      nextSelection: {
        start: 6,
        end: 19,
      },
    });
  });

  it("inserts supported media and structure snippets", () => {
    expect(
      applyToolbarActionToBody("前文", "image", {
        start: 2,
        end: 2,
      }),
    ).toEqual({
      nextBody: "前文\n![图片说明](https://example.com/image.png)",
      nextSelection: {
        start: 5,
        end: 9,
      },
    });

    expect(
      applyToolbarActionToBody("前文", "table", {
        start: 2,
        end: 2,
      }),
    ).toEqual({
      nextBody: [
        "前文",
        "| 表头1 | 表头2 | 表头3 |",
        "| --- | --- | --- |",
        "| 内容1 | 内容2 | 内容3 |",
      ].join("\n"),
      nextSelection: {
        start: 5,
        end: 8,
      },
    });

    expect(
      applyToolbarActionToBody("前文", "math", {
        start: 2,
        end: 2,
      }),
    ).toEqual({
      nextBody: "前文\n$$\na^2 + b^2 = c^2\n$$",
      nextSelection: {
        start: 6,
        end: 21,
      },
    });
  });

  it("does not add extra blank lines when the cursor is already on its own line", () => {
    expect(
      applyToolbarActionToBody("前文\n\n后文", "heading2", {
        start: 3,
        end: 3,
      }),
    ).toEqual({
      nextBody: "前文\n## 二级标题\n后文",
      nextSelection: {
        start: 6,
        end: 10,
      },
    });
  });

  it("replaces a non-empty selection with the table template", () => {
    expect(
      applyToolbarActionToBody("前文abc后文", "table", {
        start: 2,
        end: 5,
      }),
    ).toEqual({
      nextBody: [
        "前文",
        "| 表头1 | 表头2 | 表头3 |",
        "| --- | --- | --- |",
        "| 内容1 | 内容2 | 内容3 |",
        "后文",
      ].join("\n"),
      nextSelection: {
        start: 5,
        end: 8,
      },
    });
  });
});
