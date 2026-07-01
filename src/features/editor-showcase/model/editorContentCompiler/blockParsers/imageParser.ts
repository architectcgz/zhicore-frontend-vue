import { sanitizeLinkHref } from "../inlineParsers";
import type { BlockParser } from "../types";

interface ParsedImageLine {
  alt: string;
  src: string;
}

function parseImageLine(line: string): ParsedImageLine | null {
  const imageMatch = line.trim().match(/^!\[([^\]\n]*)]\(([^)\s]+)\)$/);

  if (!imageMatch) {
    return null;
  }

  const src = sanitizeLinkHref(imageMatch[2]);

  if (!src) {
    return null;
  }

  return {
    alt: imageMatch[1],
    src,
  };
}

export const imageParser: BlockParser = {
  parse({ line, nextIndex }) {
    const image = parseImageLine(line);

    if (!image) {
      return null;
    }

    return {
      kind: "block",
      block: {
        type: "media",
        label: "Image",
        content: line.trim(),
        alt: image.alt,
        src: image.src,
      },
      nextIndex,
    };
  },
};
