import { Schema, Slice, type Node as ProseMirrorNode } from "prosemirror-model";

import type { EditorShowcaseTextSelection } from "./editorToolbarTransforms";

export interface EditorProseMirrorSelection {
  from: number;
  to: number;
}

export const editorProseMirrorSchema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: {
      content: "text*",
      group: "block",
      parseDOM: [
        { tag: "p" },
        { tag: "div" },
        { tag: "li" },
        { tag: "h1" },
        { tag: "h2" },
        { tag: "h3" },
        { tag: "h4" },
        { tag: "h5" },
        { tag: "h6" },
        { tag: "blockquote" },
      ],
      toDOM() {
        return ["p", 0];
      },
    },
    text: {
      group: "inline",
    },
  },
  marks: {},
});

export function createProseMirrorDocFromSource(
  source: string,
): ProseMirrorNode {
  const lines = source.split("\n");
  const paragraphs = lines.map((line) =>
    editorProseMirrorSchema.nodes.paragraph.create(
      null,
      line ? editorProseMirrorSchema.text(line) : undefined,
    ),
  );

  return editorProseMirrorSchema.nodes.doc.create(null, paragraphs);
}

export function serializeProseMirrorDocToSource(doc: ProseMirrorNode): string {
  const lines: string[] = [];

  doc.forEach((child) => {
    lines.push(child.textContent);
  });

  return lines.join("\n");
}

export function createProseMirrorSliceFromSource(source: string): Slice {
  return new Slice(createProseMirrorDocFromSource(source).content, 0, 0);
}

export function serializeProseMirrorSliceToSource(slice: Slice): string {
  return slice.content.textBetween(0, slice.content.size, "\n");
}

function clampSourceOffset(offset: number, sourceLength: number): number {
  return Math.min(Math.max(offset, 0), sourceLength);
}

function getProseMirrorPositionFromSourceOffset(
  doc: ProseMirrorNode,
  sourceOffset: number,
): number {
  const source = serializeProseMirrorDocToSource(doc);
  const targetOffset = clampSourceOffset(sourceOffset, source.length);
  let traversedSourceOffset = 0;
  let childStartPosition = 0;

  for (let index = 0; index < doc.childCount; index += 1) {
    const child = doc.child(index);
    const textLength = child.textContent.length;
    const paragraphTextStart = childStartPosition + 1;
    const paragraphTextEnd = paragraphTextStart + textLength;

    if (targetOffset <= traversedSourceOffset + textLength) {
      return paragraphTextStart + (targetOffset - traversedSourceOffset);
    }

    traversedSourceOffset += textLength;

    if (index < doc.childCount - 1) {
      if (targetOffset === traversedSourceOffset) {
        return paragraphTextEnd;
      }

      traversedSourceOffset += 1;
    }

    childStartPosition += child.nodeSize;
  }

  return Math.max(0, doc.content.size - 1);
}

function getSourceOffsetFromProseMirrorPosition(
  doc: ProseMirrorNode,
  position: number,
): number {
  const resolvedPosition = doc.resolve(
    Math.min(Math.max(position, 0), doc.content.size),
  );
  let sourceOffset = 0;
  let childStartPosition = 0;

  for (let index = 0; index < doc.childCount; index += 1) {
    const child = doc.child(index);
    const textLength = child.textContent.length;
    const paragraphTextStart = childStartPosition + 1;
    const paragraphTextEnd = paragraphTextStart + textLength;

    if (resolvedPosition.pos <= paragraphTextEnd) {
      return (
        sourceOffset + Math.max(0, resolvedPosition.pos - paragraphTextStart)
      );
    }

    sourceOffset += textLength;

    if (index < doc.childCount - 1) {
      sourceOffset += 1;
    }

    childStartPosition += child.nodeSize;
  }

  return serializeProseMirrorDocToSource(doc).length;
}

export function mapSourceSelectionToProseMirrorSelection(
  doc: ProseMirrorNode,
  selection: EditorShowcaseTextSelection,
): EditorProseMirrorSelection {
  const from = getProseMirrorPositionFromSourceOffset(doc, selection.start);
  const to = getProseMirrorPositionFromSourceOffset(doc, selection.end);

  return from <= to ? { from, to } : { from: to, to: from };
}

export function mapProseMirrorSelectionToSourceSelection(
  doc: ProseMirrorNode,
  selection: EditorProseMirrorSelection,
): EditorShowcaseTextSelection {
  const start = getSourceOffsetFromProseMirrorPosition(doc, selection.from);
  const end = getSourceOffsetFromProseMirrorPosition(doc, selection.to);

  return start <= end ? { start, end } : { start: end, end: start };
}
