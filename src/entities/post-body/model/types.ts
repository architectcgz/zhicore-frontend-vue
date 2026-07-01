export type PostBodySchemaVersion = 1;

export interface PostBody {
  bodyId: string;
  schemaVersion: number;
  format: "blocks";
  blocks: PostBodyBlock[];
  plainText: string;
  contentHash: `sha256:${string}`;
  sizeBytes: number;
  createdAt: string;
}

export interface PostBodyWriteInput {
  schemaVersion: PostBodySchemaVersion;
  blocks: PostBodyBlock[];
}

export type PostBodyBlock =
  | ParagraphBlock
  | HeadingBlock
  | QuoteBlock
  | ListBlock
  | CodeBlock
  | TableBlock
  | CollapsibleBlock
  | MathBlock
  | ImageBlock
  | ExternalEmbedBlock
  | AttachmentGalleryBlock;

export interface ParagraphBlock {
  type: "paragraph";
  children: PostBodyInlineNode[];
}

export interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: PostBodyInlineNode[];
}

export interface QuoteBlock {
  type: "quote";
  children: PostBodyInlineNode[];
}

export interface ListBlock {
  type: "list";
  ordered: boolean;
  task: boolean;
  items: Array<{
    children: PostBodyInlineNode[];
    checked?: boolean;
  }>;
}

export interface CodeBlock {
  type: "code_block";
  language?: string;
  code: string;
}

export interface TableBlock {
  type: "table";
  headers: PostBodyTableCell[];
  rows: PostBodyTableCell[][];
}

export interface PostBodyTableCell {
  children: PostBodyInlineNode[];
}

export interface CollapsibleBlock {
  type: "collapsible";
  title: PostBodyInlineNode[];
  blocks: PostBodyBlock[];
  defaultOpen?: boolean;
}

export interface MathBlock {
  type: "math";
  latex: string;
}

export interface ImageBlock {
  type: "image";
  fileId: string;
  alt?: string;
  caption?: PostBodyInlineNode[];
  url?: string;
}

export interface ExternalEmbedBlock {
  type: "external_embed";
  provider: string;
  url: string;
  title?: string;
}

export interface AttachmentGalleryBlock {
  type: "attachment_gallery";
  items: Array<{
    fileId: string;
    caption?: PostBodyInlineNode[];
  }>;
}

export interface PostBodyInlineNode {
  type: "text";
  text: string;
  marks?: PostBodyInlineMark[];
}

export type PostBodyInlineMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "inline_code" }
  | { type: "link"; href: string };
