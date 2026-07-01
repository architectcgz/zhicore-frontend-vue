import type { BlockParser } from "../types";

export const mathParser: BlockParser = {
  parse({ line, nextIndex }) {
    if (!line.trimStart().startsWith("$$")) {
      return null;
    }

    return {
      kind: "block",
      block: {
        type: "math",
        label: "Math",
        content: line.trim(),
      },
      nextIndex,
    };
  },
};
