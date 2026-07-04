import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/vue-3";

import type { EditorToolbarAction } from "../lib/editorToolbarTypes";

type HeadingToolbarAction = Extract<
  EditorToolbarAction,
  "heading1" | "heading2" | "heading3" | "heading4" | "heading5" | "heading6"
>;

const headingToolbarLevels: Record<
  HeadingToolbarAction,
  1 | 2 | 3 | 4 | 5 | 6
> = {
  heading1: 1,
  heading2: 2,
  heading3: 3,
  heading4: 4,
  heading5: 5,
  heading6: 6,
};

function getSelectedText(editor: Editor): string {
  const { from, to } = editor.state.selection;

  return editor.state.doc.textBetween(from, to, "\n").trim();
}

function getSelectedTextOrPlaceholder(
  editor: Editor,
  placeholder: string,
): string {
  return getSelectedText(editor) || placeholder;
}

function insertInlineMark(
  editor: Editor,
  markName: string,
  placeholder: string,
  attrs: Record<string, unknown> = {},
): void {
  const { empty } = editor.state.selection;

  if (empty) {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .insertContent({
        type: "text",
        text: placeholder,
        marks: [{ type: markName, attrs }],
      } satisfies JSONContent)
      .run();
    return;
  }

  editor
    .chain()
    .focus(undefined, { scrollIntoView: false })
    .setMark(markName, attrs)
    .run();
}

function insertBlock(editor: Editor, content: JSONContent): void {
  editor
    .chain()
    .focus(undefined, { scrollIntoView: false })
    .insertContent(content)
    .run();
}

function findNodePositionNearSelection(
  editor: Editor,
  nodeName: string,
  selectionStart: number,
): number | null {
  let foundPosition: number | null = null;

  editor.state.doc.descendants((node, position) => {
    if (node.type.name !== nodeName) {
      return true;
    }

    const nodeStart = position;
    const nodeEnd = position + node.nodeSize;

    if (selectionStart >= nodeStart && selectionStart <= nodeEnd) {
      foundPosition = position;
      return false;
    }

    if (foundPosition === null && position >= selectionStart) {
      foundPosition = position;
    }

    return true;
  });

  return foundPosition;
}

function focusCodeBlockNearSelection(
  editor: Editor,
  selectionStart: number,
): void {
  const codeBlockPosition = findNodePositionNearSelection(
    editor,
    "codeBlock",
    selectionStart,
  );

  if (codeBlockPosition === null) {
    return;
  }

  editor
    .chain()
    .focus(undefined, { scrollIntoView: false })
    .setTextSelection(codeBlockPosition + 1)
    .run();
}

export function applyTiptapToolbarAction(
  editor: Editor | null,
  action: EditorToolbarAction,
): void {
  if (!editor) {
    return;
  }

  if (action === "bold") {
    insertInlineMark(editor, "bold", "加粗文本");
    return;
  }

  if (action === "italic") {
    insertInlineMark(editor, "italic", "斜体文本");
    return;
  }

  if (action === "underline") {
    insertInlineMark(editor, "underline", "下划线文本");
    return;
  }

  if (action === "strike") {
    insertInlineMark(editor, "strike", "删除线文本");
    return;
  }

  if (action === "inlineCode") {
    insertInlineMark(editor, "code", "code");
    return;
  }

  if (action === "link") {
    insertInlineMark(editor, "link", "链接文本", {
      href: "https://example.com",
    });
    return;
  }

  if (action in headingToolbarLevels) {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .toggleHeading({
        level: headingToolbarLevels[action as HeadingToolbarAction],
      })
      .run();
    return;
  }

  if (action === "quote") {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .toggleBlockquote()
      .run();
    return;
  }

  if (action === "unorderedList") {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .toggleBulletList()
      .run();
    return;
  }

  if (action === "orderedList") {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .toggleOrderedList()
      .run();
    return;
  }

  if (action === "taskList") {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .toggleTaskList()
      .run();
    return;
  }

  if (action === "code") {
    const insertionStart = editor.state.selection.from;

    insertBlock(editor, {
      type: "codeBlock",
      attrs: { language: "ts" },
      content: [
        {
          type: "text",
          text: getSelectedTextOrPlaceholder(editor, "// 在这里输入代码"),
        },
      ],
    });
    focusCodeBlockNearSelection(editor, insertionStart);
    return;
  }

  if (action === "table") {
    editor
      .chain()
      .focus(undefined, { scrollIntoView: false })
      .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
      .run();
    return;
  }

  if (action === "math") {
    insertBlock(editor, {
      type: "math_block",
      content: getSelectedText(editor)
        ? [{ type: "text", text: getSelectedText(editor) }]
        : [],
    });
    return;
  }

  if (action === "image") {
    insertBlock(editor, {
      type: "external_embed",
      attrs: {
        provider: "image",
        url: "https://example.com/image.png",
        title: "图片说明",
      },
    });
  }
}
