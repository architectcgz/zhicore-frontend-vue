import {
  sanitizePostBodyExternalUrl,
  type PostBodyBlock,
  type PostBodyInlineMark,
  type PostBodyInlineNode,
  type PostBodyTableCell,
} from "@/entities/post-body";

export interface EditorDraftFromPostBodyInput {
  blocks: PostBodyBlock[];
}

export interface UnsupportedPostBodyEditorBlock {
  blockIndex: number;
  block: PostBodyBlock;
  reason: string;
}

export interface EditorDraftFromPostBody {
  body: string;
  unsupportedBlocks: UnsupportedPostBodyEditorBlock[];
}

interface PostBodyEditorDraftLoaderContext {
  serializeInlineNodes: (
    nodes: PostBodyInlineNode[],
    ownerType: PostBodyBlock["type"],
  ) => PostBodyBlockDraftLoadResult;
  serializeTableCell: (cell: PostBodyTableCell) => PostBodyBlockDraftLoadResult;
}

interface PostBodyBlockDraftLoadResult {
  source?: string;
  unsupportedReason?: string;
}

type PostBodyBlockDraftLoader<K extends PostBodyBlock["type"]> = (
  block: Extract<PostBodyBlock, { type: K }>,
  context: PostBodyEditorDraftLoaderContext,
) => PostBodyBlockDraftLoadResult;

type PostBodyBlockDraftLoaders = {
  [K in PostBodyBlock["type"]]: PostBodyBlockDraftLoader<K>;
};

function unsupported(reason: string): PostBodyBlockDraftLoadResult {
  return {
    unsupportedReason: reason,
  };
}

function source(value: string): PostBodyBlockDraftLoadResult {
  return {
    source: value,
  };
}

function hasMarkdownSyntax(value: string): boolean {
  const lines = value.split("\n");
  const hasBlockSyntax = lines.some((line) => {
    const trimmedLine = line.trimStart();

    return (
      /^#{1,6}\s+/.test(trimmedLine) ||
      /^>\s?/.test(trimmedLine) ||
      /^[-*]\s+/.test(trimmedLine) ||
      /^\d+[.)]\s+/.test(trimmedLine) ||
      trimmedLine.startsWith("```") ||
      trimmedLine.startsWith("$$") ||
      /^!\[[^\]\n]*]\([^)]+?\)$/.test(trimmedLine)
    );
  });

  return (
    hasBlockSyntax ||
    /`[^`\n]+`/.test(value) ||
    /\[[^\]\n]+]\([^)\s]+?\)/.test(value) ||
    /(\*\*|__|~~)[\s\S]+?\1/.test(value) ||
    /(^|[^\w])([*_])[^*_]+?\2($|[^\w])/.test(value)
  );
}

function hasInlineMarkDelimiterConflict(
  text: string,
  mark: PostBodyInlineMark,
): boolean {
  if (mark.type === "inline_code") {
    return text.includes("`") || text.includes("\n");
  }

  if (mark.type === "bold") {
    return text.includes("**");
  }

  if (mark.type === "italic") {
    return text.includes("*") || text.includes("_");
  }

  if (mark.type === "strike") {
    return text.includes("~~");
  }

  if (mark.type === "link") {
    return text.includes("]") || text.includes("\n");
  }

  return false;
}

function wrapInlineMark(
  text: string,
  mark: PostBodyInlineMark,
): PostBodyBlockDraftLoadResult {
  if (hasInlineMarkDelimiterConflict(text, mark)) {
    return unsupported(`${mark.type} mark text is not lossless in markdown`);
  }

  if (mark.type === "bold") {
    return source(`**${text}**`);
  }

  if (mark.type === "italic") {
    return source(`*${text}*`);
  }

  if (mark.type === "strike") {
    return source(`~~${text}~~`);
  }

  if (mark.type === "inline_code") {
    return source(`\`${text}\``);
  }

  if (mark.type === "link") {
    const href = sanitizePostBodyExternalUrl(mark.href);

    return href
      ? source(`[${text}](${href})`)
      : unsupported("link mark has an unsafe href");
  }

  return unsupported("underline mark is not editable in markdown source");
}

function serializeInlineNode(
  node: PostBodyInlineNode,
  ownerType: PostBodyBlock["type"],
): PostBodyBlockDraftLoadResult {
  const marks = node.marks ?? [];

  if (hasMarkdownSyntax(node.text)) {
    return unsupported(
      `${ownerType} contains markdown syntax that is not lossless in textarea source`,
    );
  }

  let markedText = node.text;

  for (const mark of marks) {
    const result = wrapInlineMark(markedText, mark);

    if (result.unsupportedReason) {
      return result;
    }

    markedText = result.source ?? "";
  }

  return source(markedText);
}

function serializeInlineNodes(
  nodes: PostBodyInlineNode[],
  ownerType: PostBodyBlock["type"],
): PostBodyBlockDraftLoadResult {
  const sourceParts: string[] = [];

  for (const node of nodes) {
    const result = serializeInlineNode(node, ownerType);

    if (result.unsupportedReason) {
      return result;
    }

    sourceParts.push(result.source ?? "");
  }

  return source(sourceParts.join(""));
}

function serializeTableCell(
  cell: PostBodyTableCell,
): PostBodyBlockDraftLoadResult {
  const result = serializeInlineNodes(cell.children, "table");

  if (result.unsupportedReason) {
    return result;
  }

  if (result.source?.includes("|")) {
    return unsupported("table cell contains pipe text");
  }

  return source(result.source ?? "");
}

const postBodyBlockDraftLoaders: PostBodyBlockDraftLoaders = {
  paragraph(block, context) {
    return context.serializeInlineNodes(block.children, block.type);
  },

  heading(block, context) {
    const children = context.serializeInlineNodes(block.children, block.type);

    return children.unsupportedReason
      ? children
      : source(`${"#".repeat(block.level)} ${children.source ?? ""}`);
  },

  quote(block, context) {
    const children = context.serializeInlineNodes(block.children, block.type);

    if (children.unsupportedReason) {
      return children;
    }

    return source(
      (children.source ?? "")
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n"),
    );
  },

  list(block, context) {
    const lines: string[] = [];

    for (const [index, item] of block.items.entries()) {
      const content = context.serializeInlineNodes(item.children, block.type);

      if (content.unsupportedReason) {
        return content;
      }

      if (block.task) {
        lines.push(`- [${item.checked ? "x" : " "}] ${content.source ?? ""}`);
      } else {
        lines.push(
          block.ordered
            ? `${index + 1}. ${content.source ?? ""}`
            : `- ${content.source ?? ""}`,
        );
      }
    }

    return source(lines.join("\n"));
  },

  code_block(block) {
    if (block.code.includes("```")) {
      return unsupported("code_block contains markdown fence text");
    }

    return source(
      [`\`\`\`${block.language ?? ""}`, block.code, "```"].join("\n"),
    );
  },

  table(block, context) {
    const headers: string[] = [];
    const rows: string[] = [];

    for (const header of block.headers) {
      const result = context.serializeTableCell(header);

      if (result.unsupportedReason) {
        return result;
      }

      headers.push(result.source ?? "");
    }

    for (const row of block.rows) {
      const cells: string[] = [];

      for (const cell of row) {
        const result = context.serializeTableCell(cell);

        if (result.unsupportedReason) {
          return result;
        }

        cells.push(result.source ?? "");
      }

      rows.push(`| ${cells.join(" | ")} |`);
    }

    return source(
      [
        `| ${headers.join(" | ")} |`,
        `| ${headers.map(() => "---").join(" | ")} |`,
        ...rows,
      ].join("\n"),
    );
  },

  math(block) {
    if (block.latex.includes("$$")) {
      return unsupported("math block contains markdown math fence text");
    }

    return source(["$$", block.latex, "$$"].join("\n"));
  },

  external_embed(block) {
    const url = sanitizePostBodyExternalUrl(block.url);

    if (!url) {
      return unsupported("external_embed has an unsafe url");
    }

    if (block.provider !== "image") {
      return unsupported("external_embed provider is not editable as markdown");
    }

    if (block.title?.includes("]") || block.title?.includes("\n")) {
      return unsupported(
        "external_embed image title is not editable as markdown",
      );
    }

    return source(`![${block.title ?? ""}](${url})`);
  },

  image() {
    return unsupported(
      "image blocks keep Upload fileId/caption outside markdown",
    );
  },

  collapsible() {
    return unsupported(
      "collapsible blocks are not editable in markdown source",
    );
  },

  attachment_gallery() {
    return unsupported(
      "attachment_gallery blocks are not editable in markdown source",
    );
  },
};

function loadPostBodyBlockSource(
  block: PostBodyBlock,
): PostBodyBlockDraftLoadResult {
  const loader = postBodyBlockDraftLoaders[block.type] as (
    block: PostBodyBlock,
    context: PostBodyEditorDraftLoaderContext,
  ) => PostBodyBlockDraftLoadResult;

  return loader(block, {
    serializeInlineNodes,
    serializeTableCell,
  });
}

export function createEditorDraftFromPostBody(
  postBody: EditorDraftFromPostBodyInput,
): EditorDraftFromPostBody {
  const sourceBlocks: string[] = [];
  const unsupportedBlocks: UnsupportedPostBodyEditorBlock[] = [];

  postBody.blocks.forEach((block, blockIndex) => {
    const result = loadPostBodyBlockSource(block);

    if (result.source !== undefined) {
      sourceBlocks.push(result.source);
    }

    if (result.unsupportedReason) {
      unsupportedBlocks.push({
        blockIndex,
        block,
        reason: result.unsupportedReason,
      });
    }
  });

  // 后端 blocks 是保存事实；当前编辑器草稿仍是 Markdown-like textarea。
  // 不能无损进入 textarea 的 block 会进入 unsupportedBlocks，避免静默丢失结构事实。
  return {
    body: sourceBlocks.join("\n\n"),
    unsupportedBlocks,
  };
}
