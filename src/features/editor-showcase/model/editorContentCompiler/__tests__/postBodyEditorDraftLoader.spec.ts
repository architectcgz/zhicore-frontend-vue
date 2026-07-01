import { describe, expect, it } from "vitest";

import type { PostBody } from "@/entities/post-body";

import { createEditorDraftFromPostBody } from "../postBodyEditorDraftLoader";

describe("createEditorDraftFromPostBody", () => {
  it("loads supported backend PostBody blocks into editable draft body", () => {
    const postBody: PostBody = {
      bodyId: "body-1",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:abc",
      plainText: "ZhiCore 文档",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "heading",
          level: 2,
          children: [
            { type: "text", text: "ZhiCore " },
            { type: "text", text: "文档", marks: [{ type: "bold" }] },
          ],
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "阅读 " },
            {
              type: "text",
              text: "contract",
              marks: [{ type: "link", href: "https://example.com/docs" }],
            },
            { type: "text", text: "。" },
          ],
        },
        {
          type: "code_block",
          language: "ts",
          code: 'console.log("<ok>")',
        },
        {
          type: "list",
          ordered: false,
          task: true,
          items: [
            {
              checked: true,
              children: [{ type: "text", text: "已完成" }],
            },
            {
              checked: false,
              children: [{ type: "text", text: "待处理" }],
            },
          ],
        },
        {
          type: "table",
          headers: [
            { children: [{ type: "text", text: "字段" }] },
            { children: [{ type: "text", text: "说明" }] },
          ],
          rows: [
            [
              { children: [{ type: "text", text: "blocks" }] },
              { children: [{ type: "text", text: "正文结构" }] },
            ],
          ],
        },
      ],
    };

    expect(createEditorDraftFromPostBody(postBody)).toEqual({
      body: [
        "## ZhiCore **文档**",
        "",
        "阅读 [contract](https://example.com/docs)。",
        "",
        "```ts",
        'console.log("<ok>")',
        "```",
        "",
        "- [x] 已完成",
        "- [ ] 待处理",
        "",
        "| 字段 | 说明 |",
        "| --- | --- |",
        "| blocks | 正文结构 |",
      ].join("\n"),
      unsupportedBlocks: [],
    });
  });

  it("loads paragraph blank lines and safe external image embeds", () => {
    const postBody: PostBody = {
      bodyId: "body-2",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:def",
      plainText: "第一行\n\n第三行",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "第一行\n\n第三行" }],
        },
        {
          type: "external_embed",
          provider: "image",
          url: "https://example.com/image.png",
          title: "示例图",
        },
      ],
    };

    expect(createEditorDraftFromPostBody(postBody)).toEqual({
      body: [
        "第一行\n\n第三行",
        "",
        "![示例图](https://example.com/image.png)",
      ].join("\n"),
      unsupportedBlocks: [],
    });
  });

  it("does not load markdown-like plain text that would compile into a different structure", () => {
    const postBody: PostBody = {
      bodyId: "body-with-markdown-like-text",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:markdown-like",
      plainText: "# 不是标题\n**不是加粗**\n[不是链接](https://example.com)",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "# 不是标题\n**不是加粗**\n[不是链接](https://example.com)",
            },
          ],
        },
      ],
    };

    expect(createEditorDraftFromPostBody(postBody)).toEqual({
      body: "",
      unsupportedBlocks: [
        {
          blockIndex: 0,
          block: postBody.blocks[0],
          reason:
            "paragraph contains markdown syntax that is not lossless in textarea source",
        },
      ],
    });
  });

  it("keeps empty block source instead of treating it as missing", () => {
    const postBody: PostBody = {
      bodyId: "body-with-empty-paragraph",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:empty",
      plainText: "",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [],
        },
        {
          type: "paragraph",
          children: [{ type: "text", text: "后续正文" }],
        },
      ],
    };

    expect(createEditorDraftFromPostBody(postBody)).toEqual({
      body: "\n\n后续正文",
      unsupportedBlocks: [],
    });
  });

  it("does not load code blocks that contain closing markdown fences", () => {
    const postBody: PostBody = {
      bodyId: "body-with-fence-code",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:fence",
      plainText: "```",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "code_block",
          language: "md",
          code: "```",
        },
      ],
    };

    expect(createEditorDraftFromPostBody(postBody)).toEqual({
      body: "",
      unsupportedBlocks: [
        {
          blockIndex: 0,
          block: postBody.blocks[0],
          reason: "code_block contains markdown fence text",
        },
      ],
    });
  });

  it("reports backend blocks that the markdown-like editor cannot edit losslessly", () => {
    const postBody: PostBody = {
      bodyId: "body-with-upload-image",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:image",
      plainText: "带图正文",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "带图正文" }],
        },
        {
          type: "image",
          fileId: "file-1",
          url: "https://cdn.example.com/image.png",
          alt: "系统内图片",
          caption: [{ type: "text", text: "图片说明" }],
        },
      ],
    };

    expect(createEditorDraftFromPostBody(postBody)).toEqual({
      body: "带图正文",
      unsupportedBlocks: [
        {
          blockIndex: 1,
          block: postBody.blocks[1],
          reason: "image blocks keep Upload fileId/caption outside markdown",
        },
      ],
    });
  });
});
