export type EditorShowcaseToolbarAction =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "inlineCode"
  | "link"
  | "heading1"
  | "heading2"
  | "heading3"
  | "heading4"
  | "heading5"
  | "heading6"
  | "quote"
  | "unorderedList"
  | "orderedList"
  | "taskList"
  | "image"
  | "code"
  | "table"
  | "math";

export interface EditorShowcaseTextSelection {
  start: number;
  end: number;
}

function normalizeSelection(
  selection: EditorShowcaseTextSelection | undefined,
  textLength: number,
): EditorShowcaseTextSelection {
  if (!selection) {
    return {
      start: textLength,
      end: textLength,
    };
  }

  const start = Math.min(Math.max(selection.start, 0), textLength);
  const end = Math.min(Math.max(selection.end, 0), textLength);

  return start <= end
    ? { start, end }
    : {
        start: end,
        end: start,
      };
}

function applyInlineToolbarAction(
  currentBody: string,
  selection: EditorShowcaseTextSelection,
  wrapper: { prefix: string; suffix: string; placeholder: string },
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const selectedText = currentBody.slice(selection.start, selection.end);
  const innerText = selectedText || wrapper.placeholder;
  const replacement = `${wrapper.prefix}${innerText}${wrapper.suffix}`;

  return {
    nextBody:
      currentBody.slice(0, selection.start) +
      replacement +
      currentBody.slice(selection.end),
    nextSelection: {
      start: selection.start + wrapper.prefix.length,
      end: selection.start + wrapper.prefix.length + innerText.length,
    },
  };
}

function getBlockPadding(
  before: string,
  after: string,
): { leadingBreak: string; trailingBreak: string } {
  const leadingBreak = before && !before.endsWith("\n") ? "\n" : "";
  const trailingBreak = after && !after.startsWith("\n") ? "\n" : "";

  return {
    leadingBreak,
    trailingBreak,
  };
}

function applyBlockToolbarAction(
  currentBody: string,
  selection: EditorShowcaseTextSelection,
  block: {
    prefix: string;
    suffix: string;
    placeholder: string;
    selectionStartOffset?: number;
    selectionEndOffset?: number;
    ignoreSelectedText?: boolean;
  },
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const before = currentBody.slice(0, selection.start);
  const after = currentBody.slice(selection.end);
  const selectedText = currentBody.slice(selection.start, selection.end).trim();
  const innerText = block.ignoreSelectedText
    ? block.placeholder
    : selectedText || block.placeholder;
  const { leadingBreak, trailingBreak } = getBlockPadding(before, after);
  const replacement = `${leadingBreak}${block.prefix}${innerText}${block.suffix}${trailingBreak}`;
  const selectionStartOffset =
    block.selectionStartOffset ?? block.prefix.length;
  const selectionEndOffset =
    block.selectionEndOffset ?? selectionStartOffset + innerText.length;
  const innerStart =
    selection.start + leadingBreak.length + selectionStartOffset;

  return {
    nextBody: before + replacement + after,
    nextSelection: {
      start: innerStart,
      end: selection.start + leadingBreak.length + selectionEndOffset,
    },
  };
}

function applyLinePrefixToolbarAction(
  currentBody: string,
  selection: EditorShowcaseTextSelection,
  block: {
    placeholder: string;
    createPrefix: (lineIndex: number) => string;
  },
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const before = currentBody.slice(0, selection.start);
  const after = currentBody.slice(selection.end);
  const selectedText = currentBody.slice(selection.start, selection.end).trim();
  const lines = (selectedText || block.placeholder).split("\n");
  const { leadingBreak, trailingBreak } = getBlockPadding(before, after);
  let replacement = leadingBreak;
  let firstLineStart = selection.start + leadingBreak.length;
  let lastLineEnd = firstLineStart;

  lines.forEach((line, index) => {
    const prefix = block.createPrefix(index);

    if (index > 0) {
      replacement += "\n";
    }

    const lineStart = selection.start + replacement.length + prefix.length;
    replacement += `${prefix}${line}`;

    if (index === 0) {
      firstLineStart = lineStart;
    }

    lastLineEnd = lineStart + line.length;
  });

  replacement += trailingBreak;

  return {
    nextBody: before + replacement + after,
    nextSelection: {
      start: firstLineStart,
      end: lastLineEnd,
    },
  };
}

const headingPlaceholders: Record<
  Extract<
    EditorShowcaseToolbarAction,
    "heading1" | "heading2" | "heading3" | "heading4" | "heading5" | "heading6"
  >,
  string
> = {
  heading1: "一级标题",
  heading2: "二级标题",
  heading3: "三级标题",
  heading4: "四级标题",
  heading5: "五级标题",
  heading6: "六级标题",
};

const headingPrefix: Record<keyof typeof headingPlaceholders, string> = {
  heading1: "# ",
  heading2: "## ",
  heading3: "### ",
  heading4: "#### ",
  heading5: "##### ",
  heading6: "###### ",
};

export function applyToolbarActionToBody(
  currentBody: string,
  action: EditorShowcaseToolbarAction,
  selection?: EditorShowcaseTextSelection,
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const normalizedSelection = normalizeSelection(selection, currentBody.length);

  switch (action) {
    case "bold":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "**",
        suffix: "**",
        placeholder: "加粗文本",
      });
    case "italic":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "_",
        suffix: "_",
        placeholder: "斜体文本",
      });
    case "underline":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "++",
        suffix: "++",
        placeholder: "下划线文本",
      });
    case "strike":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "~~",
        suffix: "~~",
        placeholder: "删除线文本",
      });
    case "inlineCode":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "`",
        suffix: "`",
        placeholder: "代码文本",
      });
    case "link":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "[",
        suffix: "](https://example.com)",
        placeholder: "链接文本",
      });
    case "heading1":
    case "heading2":
    case "heading3":
    case "heading4":
    case "heading5":
    case "heading6":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: headingPrefix[action],
        suffix: "",
        placeholder: headingPlaceholders[action],
      });
    case "quote":
      return applyLinePrefixToolbarAction(currentBody, normalizedSelection, {
        placeholder: "引用内容",
        createPrefix: () => "> ",
      });
    case "unorderedList":
      return applyLinePrefixToolbarAction(currentBody, normalizedSelection, {
        placeholder: "列表项",
        createPrefix: () => "- ",
      });
    case "orderedList":
      return applyLinePrefixToolbarAction(currentBody, normalizedSelection, {
        placeholder: "列表项",
        createPrefix: (lineIndex) => `${lineIndex + 1}. `,
      });
    case "taskList":
      return applyLinePrefixToolbarAction(currentBody, normalizedSelection, {
        placeholder: "待办项",
        createPrefix: () => "- [ ] ",
      });
    case "image":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "![",
        suffix: "](https://example.com/image.png)",
        placeholder: "图片说明",
      });
    case "table":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "",
        suffix: "",
        placeholder: [
          "| 表头1 | 表头2 | 表头3 |",
          "| --- | --- | --- |",
          "| 内容1 | 内容2 | 内容3 |",
        ].join("\n"),
        selectionStartOffset: 2,
        selectionEndOffset: 5,
        // 表格 action 插入结构模板，选中文本不能直接充当合法的表格源码。
        ignoreSelectedText: true,
      });
    case "math":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "$$\n",
        suffix: "\n$$",
        placeholder: "a^2 + b^2 = c^2",
      });
    case "code":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "```ts\n",
        suffix: "\n```",
        placeholder: "// 在这里输入代码",
      });
  }
}
