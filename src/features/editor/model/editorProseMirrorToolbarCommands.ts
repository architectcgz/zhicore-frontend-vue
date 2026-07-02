import type { EditorView } from "prosemirror-view";

import { editorProseMirrorSchema } from "./editorProseMirrorEngine";
import type { EditorToolbarAction } from "./editorToolbarTypes";

type HeadingToolbarAction = Extract<
  EditorToolbarAction,
  "heading1" | "heading2" | "heading3" | "heading4" | "heading5" | "heading6"
>;

type BodyToolbarCommandMap = Record<EditorToolbarAction, () => void>;

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

function getSelectedTextOrPlaceholder(
  view: EditorView,
  placeholder: string,
): string {
  const { from, to } = view.state.selection;
  const selectedText = view.state.doc.textBetween(from, to, "\n").trim();

  return selectedText || placeholder;
}

function getSelectedText(view: EditorView): string {
  const { from, to } = view.state.selection;

  return view.state.doc.textBetween(from, to, "\n").trim();
}

function applyInlineMark(
  view: EditorView,
  markName: string,
  placeholder: string,
  attrs: Record<string, unknown> = {},
): void {
  const markType = editorProseMirrorSchema.marks[markName];

  if (!markType) {
    return;
  }

  const { from, to, empty } = view.state.selection;
  let transaction = view.state.tr;
  const mark = markType.create(attrs);

  if (empty) {
    const text = editorProseMirrorSchema.text(placeholder, [mark]);
    transaction = transaction.replaceSelectionWith(text, false);
  } else {
    transaction = transaction.addMark(from, to, mark);
  }

  view.dispatch(transaction.scrollIntoView());
}

function setCurrentBlockType(
  view: EditorView,
  nodeName: string,
  attrs: Record<string, unknown> = {},
): void {
  const nodeType = editorProseMirrorSchema.nodes[nodeName];

  if (!nodeType) {
    return;
  }

  const { from, to } = view.state.selection;
  view.dispatch(view.state.tr.setBlockType(from, to, nodeType, attrs));
}

function replaceSelectionWithBlock(
  view: EditorView,
  nodeName: string,
  text: string,
  attrs: Record<string, unknown> = {},
): void {
  const nodeType = editorProseMirrorSchema.nodes[nodeName];

  if (!nodeType) {
    return;
  }

  view.dispatch(
    view.state.tr.replaceSelectionWith(
      nodeType.create(attrs, text ? editorProseMirrorSchema.text(text) : null),
    ),
  );
}

function replaceSelectionWithRawText(view: EditorView, text: string): void {
  view.dispatch(view.state.tr.insertText(text).scrollIntoView());
}

function wrapSelectionWithMarkdown(
  view: EditorView,
  before: string,
  after: string,
  placeholder: string,
): void {
  replaceSelectionWithRawText(
    view,
    `${before}${getSelectedTextOrPlaceholder(view, placeholder)}${after}`,
  );
}

function replaceSelectionWithList(
  view: EditorView,
  ordered: boolean,
  task: boolean,
  checked: boolean | null,
): void {
  const itemText = getSelectedTextOrPlaceholder(view, "列表项");
  const item = editorProseMirrorSchema.nodes.list_item.create(
    { checked },
    editorProseMirrorSchema.text(itemText),
  );
  const list = editorProseMirrorSchema.nodes.list.create(
    { ordered, task },
    item,
  );

  view.dispatch(view.state.tr.replaceSelectionWith(list));
}

function replaceSelectionWithTable(view: EditorView): void {
  const tableNode = editorProseMirrorSchema.nodes.table;
  const tableRowNode = editorProseMirrorSchema.nodes.table_row;
  const tableCellNode = editorProseMirrorSchema.nodes.table_cell;

  if (!tableNode || !tableRowNode || !tableCellNode) {
    return;
  }

  const createCell = (text: string) =>
    tableCellNode.create(null, editorProseMirrorSchema.text(text));
  const table = tableNode.create(null, [
    tableRowNode.create(null, [createCell("表头1"), createCell("表头2")]),
    tableRowNode.create(null, [createCell("内容1"), createCell("内容2")]),
  ]);

  view.dispatch(view.state.tr.replaceSelectionWith(table).scrollIntoView());
}

function replaceSelectionWithExternalImageEmbed(view: EditorView): void {
  const externalEmbedNode = editorProseMirrorSchema.nodes.external_embed;

  if (!externalEmbedNode) {
    return;
  }

  view.dispatch(
    view.state.tr
      .replaceSelectionWith(
        externalEmbedNode.create({
          provider: "image",
          url: "https://example.com/image.png",
          title: "图片说明",
        }),
      )
      .scrollIntoView(),
  );
}

function createBodyToolbarCommands(view: EditorView): BodyToolbarCommandMap {
  return {
    bold: () => wrapSelectionWithMarkdown(view, "**", "**", "加粗文本"),
    italic: () => wrapSelectionWithMarkdown(view, "*", "*", "斜体文本"),
    underline: () => wrapSelectionWithMarkdown(view, "++", "++", "下划线文本"),
    strike: () => wrapSelectionWithMarkdown(view, "~~", "~~", "删除线文本"),
    inlineCode: () => wrapSelectionWithMarkdown(view, "`", "`", "code"),
    link: () =>
      replaceSelectionWithRawText(
        view,
        `[${getSelectedTextOrPlaceholder(view, "链接文本")}](https://example.com)`,
      ),
    heading1: () =>
      replaceSelectionWithRawText(
        view,
        `# ${getSelectedTextOrPlaceholder(view, "一级标题")}`,
      ),
    heading2: () =>
      replaceSelectionWithRawText(
        view,
        `## ${getSelectedTextOrPlaceholder(view, "二级标题")}`,
      ),
    heading3: () =>
      replaceSelectionWithRawText(
        view,
        `### ${getSelectedTextOrPlaceholder(view, "三级标题")}`,
      ),
    heading4: () =>
      replaceSelectionWithRawText(
        view,
        `#### ${getSelectedTextOrPlaceholder(view, "四级标题")}`,
      ),
    heading5: () =>
      replaceSelectionWithRawText(
        view,
        `##### ${getSelectedTextOrPlaceholder(view, "五级标题")}`,
      ),
    heading6: () =>
      replaceSelectionWithRawText(
        view,
        `###### ${getSelectedTextOrPlaceholder(view, "六级标题")}`,
      ),
    quote: () =>
      replaceSelectionWithRawText(
        view,
        `> ${getSelectedTextOrPlaceholder(view, "引用内容")}`,
      ),
    unorderedList: () =>
      replaceSelectionWithRawText(
        view,
        `- ${getSelectedTextOrPlaceholder(view, "列表项")}`,
      ),
    orderedList: () =>
      replaceSelectionWithRawText(
        view,
        `1. ${getSelectedTextOrPlaceholder(view, "列表项")}`,
      ),
    taskList: () =>
      replaceSelectionWithRawText(
        view,
        `- [ ] ${getSelectedTextOrPlaceholder(view, "任务项")}`,
      ),
    image: () =>
      replaceSelectionWithRawText(
        view,
        `![图片说明](https://example.com/image.png)`,
      ),
    table: () =>
      replaceSelectionWithRawText(
        view,
        "| 表头1 | 表头2 |\n| --- | --- |\n| 内容1 | 内容2 |",
      ),
    code: () =>
      replaceSelectionWithRawText(
        view,
        `\`\`\` ts\n${getSelectedTextOrPlaceholder(view, "// 在这里输入代码")}\n\`\`\``,
      ),
    math: () =>
      replaceSelectionWithRawText(view, `$$\n${getSelectedText(view)}\n$$`),
  };
}

export function applyProseMirrorToolbarAction(
  view: EditorView | null,
  action: EditorToolbarAction,
): void {
  if (!view) {
    return;
  }

  createBodyToolbarCommands(view)[action]();
}
