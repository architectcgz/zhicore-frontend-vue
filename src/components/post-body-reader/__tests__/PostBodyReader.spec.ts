import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import type { PostBody } from "@/entities/post-body";

import PostBodyReader from "../PostBodyReader.vue";

describe("PostBodyReader", () => {
  it("renders backend PostBody blocks without converting to editor showcase blocks", () => {
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
            {
              type: "text",
              text: "ZhiCore 文档",
              marks: [{ type: "bold" }],
            },
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
          type: "table",
          headers: [{ children: [{ type: "text", text: "字段" }] }],
          rows: [[{ children: [{ type: "text", text: "blocks" }] }]],
        },
        {
          type: "image",
          fileId: "file-1",
          url: "https://cdn.example.com/image.png",
          alt: "示例图",
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });

    expect(wrapper.find("h2").text()).toBe("ZhiCore 文档");
    expect(wrapper.find("a").attributes()).toMatchObject({
      href: "https://example.com/docs",
      target: "_blank",
      rel: "noopener noreferrer",
    });
    expect(wrapper.find("pre code").text()).toBe('console.log("<ok>")');
    expect(wrapper.find("table").text()).toContain("blocks");
    expect(wrapper.find("img").attributes()).toMatchObject({
      src: "https://cdn.example.com/image.png",
      alt: "示例图",
    });
  });

  it("sanitizes unsafe backend urls before rendering attrs", () => {
    const postBody: PostBody = {
      bodyId: "body-unsafe",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:unsafe",
      plainText: "unsafe",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "bad link",
              marks: [{ type: "link", href: "javascript:alert(1)" }],
            },
          ],
        },
        {
          type: "external_embed",
          provider: "image",
          url: "data:text/html,<script>alert(1)</script>",
          title: "bad embed",
        },
        {
          type: "image",
          fileId: "file-unsafe",
          url: "file:///etc/passwd",
          alt: "bad image",
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });

    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("bad link");
    expect(wrapper.text()).toContain("bad embed");
    expect(wrapper.text()).toContain("bad image");
  });

  it("renders stacked inline marks including underline", () => {
    const postBody: PostBody = {
      bodyId: "body-marks",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:marks",
      plainText: "marked",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "marked",
              marks: [
                { type: "bold" },
                { type: "italic" },
                { type: "underline" },
              ],
            },
          ],
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });

    const marked = wrapper.find(".reader-preview__inline--underline");
    expect(marked.exists()).toBe(true);
    expect(marked.classes()).toEqual(
      expect.arrayContaining([
        "reader-preview__inline--bold",
        "reader-preview__inline--italic",
        "reader-preview__inline--underline",
      ]),
    );
  });

  it("renders blank lines inside paragraph text as visible line breaks", () => {
    const postBody: PostBody = {
      bodyId: "body-blank-lines",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:blank",
      plainText: "第一行\n\n第三行",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "第一行\n\n第三行",
            },
          ],
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });

    expect(wrapper.findAll("br")).toHaveLength(2);
    expect(wrapper.text()).toContain("第一行");
    expect(wrapper.text()).toContain("第三行");
  });

  it("renders empty paragraph blocks as visible spacer lines", () => {
    const postBody: PostBody = {
      bodyId: "body-empty-paragraph",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:empty-paragraph",
      plainText: "第一段\n\n第三段",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "第一段" }],
        },
        {
          type: "paragraph",
          children: [],
        },
        {
          type: "paragraph",
          children: [{ type: "text", text: "第三段" }],
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });
    const paragraphBlocks = wrapper.findAll(".reader-preview__text-block");
    const spacer = paragraphBlocks[1];

    expect(paragraphBlocks).toHaveLength(3);
    expect(spacer.classes()).toContain("reader-preview__text-block--empty");
    expect(spacer.attributes("aria-hidden")).toBe("true");
    expect(spacer.text()).toBe("");
  });

  it("renders V1 quote and list items from nested block children", () => {
    const postBody: PostBody = {
      bodyId: "body-nested-blocks",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:nested",
      plainText: "引用段落\n列表段落",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "quote",
          blocks: [
            {
              type: "paragraph",
              children: [{ type: "text", text: "引用段落" }],
            },
            {
              type: "code_block",
              language: "ts",
              code: "const nested = true",
            },
            {
              type: "list",
              ordered: false,
              task: false,
              items: [
                {
                  blocks: [
                    {
                      type: "paragraph",
                      children: [{ type: "text", text: "引用内列表" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "list",
          ordered: false,
          task: false,
          items: [
            {
              checked: false,
              blocks: [
                {
                  type: "paragraph",
                  children: [{ type: "text", text: "列表段落" }],
                },
                {
                  type: "code_block",
                  language: "ts",
                  code: "const listItemBlock = true",
                },
              ],
            },
          ],
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });

    expect(wrapper.find(".reader-preview__quote p").text()).toBe("引用段落");
    expect(wrapper.find(".reader-preview__quote pre code").text()).toBe(
      "const nested = true",
    );
    expect(
      wrapper.find(".reader-preview__quote .reader-preview__list p").text(),
    ).toBe("引用内列表");
    expect(
      wrapper
        .findAll(".reader-preview__list li p")
        .map((paragraph) => paragraph.text()),
    ).toEqual(expect.arrayContaining(["引用内列表", "列表段落"]));
    expect(wrapper.find(".reader-preview__list li pre code").text()).toBe(
      "const listItemBlock = true",
    );
    expect(
      wrapper.find(".reader-preview__list input[type='checkbox']").exists(),
    ).toBe(false);
  });

  it("renders math blocks as typeset KaTeX output", () => {
    const postBody: PostBody = {
      bodyId: "body-math",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:math",
      plainText: "math",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "math",
          latex: "E = mc^2",
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });

    expect(wrapper.find(".katex").exists()).toBe(true);
    expect(wrapper.find(".reader-preview__math-source").exists()).toBe(false);
    expect(wrapper.text()).toContain("E");
    expect(wrapper.text()).toContain("m");
  });

  it("copies code block content from the formal reader", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });
    const postBody: PostBody = {
      bodyId: "body-code",
      schemaVersion: 1,
      format: "blocks",
      contentHash: "sha256:code",
      plainText: "code",
      sizeBytes: 128,
      createdAt: "2026-07-01T00:00:00Z",
      blocks: [
        {
          type: "code_block",
          language: "go",
          code: 'fmt.Println("ok")',
        },
      ],
    };

    const wrapper = mount(PostBodyReader, {
      props: {
        body: postBody,
      },
    });

    await wrapper.find("button").trigger("click");

    expect(writeText).toHaveBeenCalledWith('fmt.Println("ok")');
    expect(wrapper.find("button").text()).toBe("已复制");
  });
});
