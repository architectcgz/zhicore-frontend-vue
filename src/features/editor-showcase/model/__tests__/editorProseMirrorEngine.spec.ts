import { describe, expect, it } from "vitest";

import {
  createProseMirrorDocFromSource,
  editorProseMirrorSchema,
  mapProseMirrorSelectionToSourceSelection,
  mapSourceSelectionToProseMirrorSelection,
  serializeProseMirrorDocToSource,
} from "../editorProseMirrorEngine";

describe("editorProseMirrorEngine", () => {
  it("exposes only plain source document nodes before the rich adapter exists", () => {
    expect(Object.keys(editorProseMirrorSchema.nodes)).toEqual([
      "doc",
      "paragraph",
      "text",
    ]);
    expect(Object.keys(editorProseMirrorSchema.marks)).toEqual([]);
  });

  it("round-trips markdown-like source through a ProseMirror doc", () => {
    const source = [
      "## 标题 ++重点++",
      "",
      "正文第一段",
      "```ts",
      "console.log('ok')",
      "```",
    ].join("\n");
    const doc = createProseMirrorDocFromSource(source);

    expect(serializeProseMirrorDocToSource(doc)).toBe(source);
    expect(doc.type.name).toBe("doc");
  });

  it("maps source offsets to ProseMirror text selections and back", () => {
    const source = ["第一行", "", "第三行 ++重点++"].join("\n");
    const doc = createProseMirrorDocFromSource(source);
    const sourceSelection = {
      start: source.indexOf("第三行"),
      end: source.indexOf("++") - 1,
    };

    const prosemirrorSelection = mapSourceSelectionToProseMirrorSelection(
      doc,
      sourceSelection,
    );

    expect(prosemirrorSelection.from).toBeLessThan(prosemirrorSelection.to);
    expect(
      mapProseMirrorSelectionToSourceSelection(doc, prosemirrorSelection),
    ).toEqual(sourceSelection);
  });
});
