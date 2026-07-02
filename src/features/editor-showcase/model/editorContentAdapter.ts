import type { PostBodyWriteInput } from "@/entities/post-body";

import {
  compileEditorContent,
  mapEditorCompiledDocumentToPostBodyWriteInput,
  mapEditorCompiledDocumentToPreviewReaderBlocks,
  type EditorPreviewReaderBlock,
} from "./editorContentCompiler";

export type EditorInternalDocumentKind = "textarea-source" | "prosemirror-doc";

export interface EditorUnsupportedContentReason {
  code:
    | "quote-list-v1-inline-only"
    | "system-media-requires-file-id"
    | "unsupported-internal-document";
  message: string;
  path?: string;
}

export interface EditorContentAdapterCapabilities {
  quote: {
    children: "inline-only";
    multiParagraph: false;
  };
  list: {
    itemChildren: "inline-only";
    nested: false;
  };
  persistence: {
    output: "post-body-write-input";
    storesInternalDocument: false;
  };
}

export interface EditorContentAdapter<TInternalDocument> {
  readonly kind: EditorInternalDocumentKind;
  readonly contentCapabilities: EditorContentAdapterCapabilities;
  toPostBodyWriteInput(document: TInternalDocument): PostBodyWriteInput;
  toPreviewReaderBlocks(
    document: TInternalDocument,
  ): EditorPreviewReaderBlock[];
  getUnsupportedContentReasons(
    document: TInternalDocument,
  ): EditorUnsupportedContentReason[];
}

export const contentV1InlineOnlyCapabilities: EditorContentAdapterCapabilities =
  {
    quote: {
      children: "inline-only",
      multiParagraph: false,
    },
    list: {
      itemChildren: "inline-only",
      nested: false,
    },
    persistence: {
      output: "post-body-write-input",
      storesInternalDocument: false,
    },
  };

export const textareaEditorContentAdapter: EditorContentAdapter<string> = {
  kind: "textarea-source",
  contentCapabilities: contentV1InlineOnlyCapabilities,
  toPostBodyWriteInput(source) {
    return mapEditorCompiledDocumentToPostBodyWriteInput(
      compileEditorContent(source),
    );
  },
  toPreviewReaderBlocks(source) {
    return mapEditorCompiledDocumentToPreviewReaderBlocks(
      compileEditorContent(source),
    );
  },
  getUnsupportedContentReasons() {
    // The textarea prototype can only produce Content V1 inline-only quote/list
    // shapes. Future ProseMirror adapters must report richer unsupported
    // structures here instead of flattening them into a lossy save payload.
    return [];
  },
};
