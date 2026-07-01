export type EditorShowcaseToolbarAction =
  "bold" | "italic" | "link" | "code" | "heading2";

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
  const leadingBreak = before.trim()
    ? before.endsWith("\n\n")
      ? ""
      : before.endsWith("\n")
        ? "\n"
        : "\n\n"
    : "";
  const trailingBreak = after.trim()
    ? after.startsWith("\n\n")
      ? ""
      : after.startsWith("\n")
        ? "\n"
        : "\n\n"
    : "";

  return {
    leadingBreak,
    trailingBreak,
  };
}

function applyBlockToolbarAction(
  currentBody: string,
  selection: EditorShowcaseTextSelection,
  block: { prefix: string; suffix: string; placeholder: string },
): { nextBody: string; nextSelection: EditorShowcaseTextSelection } {
  const before = currentBody.slice(0, selection.start);
  const after = currentBody.slice(selection.end);
  const selectedText = currentBody.slice(selection.start, selection.end).trim();
  const innerText = selectedText || block.placeholder;
  const { leadingBreak, trailingBreak } = getBlockPadding(before, after);
  const replacement = `${leadingBreak}${block.prefix}${innerText}${block.suffix}${trailingBreak}`;
  const innerStart =
    selection.start + leadingBreak.length + block.prefix.length;

  return {
    nextBody: before + replacement + after,
    nextSelection: {
      start: innerStart,
      end: innerStart + innerText.length,
    },
  };
}

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
    case "link":
      return applyInlineToolbarAction(currentBody, normalizedSelection, {
        prefix: "[",
        suffix: "](https://example.com)",
        placeholder: "链接文本",
      });
    case "heading2":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "## ",
        suffix: "",
        placeholder: "小标题",
      });
    case "code":
      return applyBlockToolbarAction(currentBody, normalizedSelection, {
        prefix: "```ts\n",
        suffix: "\n```",
        placeholder: "// 在这里输入代码",
      });
  }
}
