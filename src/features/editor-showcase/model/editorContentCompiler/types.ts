export type EditorCompiledHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface EditorCompiledSourceRange {
  startLine: number;
  endLine: number;
}

export type EditorCompiledInlineMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "inline_code" }
  | { type: "link"; href: string };

export interface EditorCompiledInlineNode {
  type: "text";
  text: string;
  marks?: EditorCompiledInlineMark[];
}

export interface EditorCompiledListItem {
  content: string;
  inlineNodes: EditorCompiledInlineNode[];
  checked?: boolean;
}

export interface EditorCompiledTableCell {
  content: string;
  inlineNodes: EditorCompiledInlineNode[];
}

interface EditorCompiledBlockBase {
  label: string;
  content: string;
  sourceRange?: EditorCompiledSourceRange;
}

export type EditorCompiledBlock =
  | (EditorCompiledBlockBase & {
      type: "text";
      inlineNodes: EditorCompiledInlineNode[];
    })
  | (EditorCompiledBlockBase & {
      type: "heading";
      level: EditorCompiledHeadingLevel;
      inlineNodes: EditorCompiledInlineNode[];
    })
  | (EditorCompiledBlockBase & {
      type: "quote";
      inlineNodes: EditorCompiledInlineNode[];
    })
  | (EditorCompiledBlockBase & {
      type: "code";
      language?: string;
    })
  | (EditorCompiledBlockBase & {
      type: "list";
      ordered: boolean;
      task: boolean;
      items: EditorCompiledListItem[];
    })
  | (EditorCompiledBlockBase & {
      type: "table";
      headers: EditorCompiledTableCell[];
      rows: EditorCompiledTableCell[][];
    })
  | (EditorCompiledBlockBase & {
      type: "media";
      alt: string;
      src: string;
    })
  | (EditorCompiledBlockBase & {
      type: "math";
    });

export type EditorCompiledBlockType = EditorCompiledBlock["type"];

export interface EditorCompiledDocument {
  blocks: EditorCompiledBlock[];
}

export interface BlockParserContext {
  line: string;
  lines: string[];
  nextIndex: number;
  parseInlineNodes: (content: string) => EditorCompiledInlineNode[];
}

export type BlockParserResult =
  | {
      kind: "block";
      block: EditorCompiledBlock;
      nextIndex: number;
      pendingLine?: string | null;
    }
  | {
      kind: "text";
      lines: string[];
      nextIndex: number;
      pendingLine?: string | null;
    };

export interface BlockParser {
  parse(context: BlockParserContext): BlockParserResult | null;
}
