import type { PostBodyBlock } from "@/entities/post-body";

export interface EditorPreviewReaderBlock {
  stableKey: string;
  block: PostBodyBlock;
  readerBlockIndex: number;
}
