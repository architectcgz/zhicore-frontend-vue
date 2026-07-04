export type EditorToolbarAction =
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

export interface EditorTextSelection {
  start: number;
  end: number;
}
