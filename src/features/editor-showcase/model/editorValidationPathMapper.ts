import type { EditorCompiledSourceRange } from "./editorContentCompiler";
import type { PostBodyWriteInputWithSourceMap } from "./editorContentCompiler";

export interface EditorValidationPathTarget {
  kind: "source-range" | "global";
  path: string;
  blockIndex?: number;
  sourceRange?: EditorCompiledSourceRange;
  reason?: string;
}

function parsePostBodyBlockIndex(path: string): number | null {
  const match = /^blocks\[(\d+)](?:\.|$)/.exec(path);

  return match ? Number(match[1]) : null;
}

function createGlobalTarget(
  path: string,
  reason: string,
  blockIndex?: number,
): EditorValidationPathTarget {
  return {
    kind: "global",
    path,
    ...(blockIndex === undefined ? {} : { blockIndex }),
    reason,
  };
}

export function mapPostBodyValidationPathToEditorTarget(
  path: string,
  sourceMap: PostBodyWriteInputWithSourceMap,
): EditorValidationPathTarget {
  const blockIndex = parsePostBodyBlockIndex(path);

  if (blockIndex === null) {
    return createGlobalTarget(path, "path is not a post body block path");
  }

  if (
    blockIndex < 0 ||
    blockIndex >= sourceMap.blockSourceRanges.length ||
    blockIndex >= sourceMap.writeInput.blocks.length
  ) {
    return createGlobalTarget(
      path,
      "block index is outside the post body source map",
      blockIndex,
    );
  }

  const sourceRange = sourceMap.blockSourceRanges[blockIndex];

  if (!sourceRange) {
    return createGlobalTarget(
      path,
      "block source range is unavailable",
      blockIndex,
    );
  }

  // Backend validation paths point at the formal save model. Reader preview
  // spacers can shift readerBlockIndex, so they must not participate here.
  return {
    kind: "source-range",
    path,
    blockIndex,
    sourceRange,
  };
}
