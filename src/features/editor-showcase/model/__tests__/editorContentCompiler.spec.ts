import { describe, expect, it } from "vitest";

import { compileEditorContent } from "../editorContentCompiler";

describe("editorContentCompiler", () => {
  it("compiles editor source into blocks and escaped html", () => {
    const compiledDocument = compileEditorContent(
      '阅读 [ZhiCore](https://example.com/docs)。\n\n```ts\nconsole.log("<ok>")\n```后续正文',
    );

    expect(compiledDocument.blocks).toEqual([
      {
        type: "text",
        label: "Text",
        content: "阅读 [ZhiCore](https://example.com/docs)。",
        inlineNodes: [
          {
            type: "text",
            text: "阅读 ",
          },
          {
            type: "link",
            text: "ZhiCore",
            href: "https://example.com/docs",
          },
          {
            type: "text",
            text: "。",
          },
        ],
      },
      {
        type: "code",
        label: "Code",
        language: "ts",
        content: 'console.log("<ok>")',
      },
      {
        type: "text",
        label: "Text",
        content: "后续正文",
        inlineNodes: [
          {
            type: "text",
            text: "后续正文",
          },
        ],
      },
    ]);
    expect(compiledDocument.html).toBe(
      '<p>阅读 <a href="https://example.com/docs" target="_blank" rel="noreferrer">ZhiCore</a>。</p><pre><code class="language-ts">console.log(&quot;&lt;ok&gt;&quot;)</code></pre><p>后续正文</p>',
    );
  });

  it("keeps an unclosed code fence as plain text", () => {
    const compiledDocument = compileEditorContent("```go\n123213");

    expect(compiledDocument.blocks).toEqual([
      {
        type: "text",
        label: "Text",
        content: "```go\n123213",
        inlineNodes: [
          {
            type: "text",
            text: "```go\n123213",
          },
        ],
      },
    ]);
    expect(compiledDocument.html).toBe("<p>```go<br>123213</p>");
  });

  it("compiles bold inline markdown into strong nodes and html", () => {
    const compiledDocument = compileEditorContent("这是 **123123** 文本。");

    expect(compiledDocument.blocks).toEqual([
      {
        type: "text",
        label: "Text",
        content: "这是 **123123** 文本。",
        inlineNodes: [
          {
            type: "text",
            text: "这是 ",
          },
          {
            type: "strong",
            text: "123123",
          },
          {
            type: "text",
            text: " 文本。",
          },
        ],
      },
    ]);
    expect(compiledDocument.html).toBe(
      "<p>这是 <strong>123123</strong> 文本。</p>",
    );
  });

  it("compiles common inline markdown marks into typed nodes and html", () => {
    const compiledDocument = compileEditorContent(
      "这是 `code <x>`、*斜体*、_强调_、~~删除~~ 和 **加粗**。",
    );

    expect(compiledDocument.blocks).toEqual([
      {
        type: "text",
        label: "Text",
        content: "这是 `code <x>`、*斜体*、_强调_、~~删除~~ 和 **加粗**。",
        inlineNodes: [
          {
            type: "text",
            text: "这是 ",
          },
          {
            type: "inlineCode",
            text: "code <x>",
          },
          {
            type: "text",
            text: "、",
          },
          {
            type: "emphasis",
            text: "斜体",
          },
          {
            type: "text",
            text: "、",
          },
          {
            type: "emphasis",
            text: "强调",
          },
          {
            type: "text",
            text: "、",
          },
          {
            type: "strikethrough",
            text: "删除",
          },
          {
            type: "text",
            text: " 和 ",
          },
          {
            type: "strong",
            text: "加粗",
          },
          {
            type: "text",
            text: "。",
          },
        ],
      },
    ]);
    expect(compiledDocument.html).toBe(
      "<p>这是 <code>code &lt;x&gt;</code>、<em>斜体</em>、<em>强调</em>、<del>删除</del> 和 <strong>加粗</strong>。</p>",
    );
  });

  it("compiles common block markdown into typed blocks and semantic html", () => {
    const compiledDocument = compileEditorContent(
      [
        "## 标题 **加粗**",
        "",
        "> 引用 `code`",
        "",
        "- 无序项",
        "- 第二项 **粗**",
        "",
        "1. 第一步",
        "2. 第二步",
        "",
        "- [x] 完成项",
        "- [ ] 待办项",
        "",
        "![架构图](/assets/diagram.png)",
      ].join("\n"),
    );

    expect(compiledDocument.blocks).toEqual([
      {
        type: "heading",
        label: "Heading",
        level: 2,
        content: "标题 **加粗**",
        inlineNodes: [
          {
            type: "text",
            text: "标题 ",
          },
          {
            type: "strong",
            text: "加粗",
          },
        ],
      },
      {
        type: "quote",
        label: "Quote",
        content: "引用 `code`",
        inlineNodes: [
          {
            type: "text",
            text: "引用 ",
          },
          {
            type: "inlineCode",
            text: "code",
          },
        ],
      },
      {
        type: "list",
        label: "List",
        ordered: false,
        task: false,
        content: "- 无序项\n- 第二项 **粗**",
        items: [
          {
            content: "无序项",
            inlineNodes: [
              {
                type: "text",
                text: "无序项",
              },
            ],
          },
          {
            content: "第二项 **粗**",
            inlineNodes: [
              {
                type: "text",
                text: "第二项 ",
              },
              {
                type: "strong",
                text: "粗",
              },
            ],
          },
        ],
      },
      {
        type: "list",
        label: "List",
        ordered: true,
        task: false,
        content: "1. 第一步\n2. 第二步",
        items: [
          {
            content: "第一步",
            inlineNodes: [
              {
                type: "text",
                text: "第一步",
              },
            ],
          },
          {
            content: "第二步",
            inlineNodes: [
              {
                type: "text",
                text: "第二步",
              },
            ],
          },
        ],
      },
      {
        type: "list",
        label: "Task List",
        ordered: false,
        task: true,
        content: "- [x] 完成项\n- [ ] 待办项",
        items: [
          {
            checked: true,
            content: "完成项",
            inlineNodes: [
              {
                type: "text",
                text: "完成项",
              },
            ],
          },
          {
            checked: false,
            content: "待办项",
            inlineNodes: [
              {
                type: "text",
                text: "待办项",
              },
            ],
          },
        ],
      },
      {
        type: "media",
        label: "Image",
        content: "![架构图](/assets/diagram.png)",
        alt: "架构图",
        src: "/assets/diagram.png",
      },
    ]);
    expect(compiledDocument.html).toBe(
      '<h2>标题 <strong>加粗</strong></h2><blockquote>引用 <code>code</code></blockquote><ul><li>无序项</li><li>第二项 <strong>粗</strong></li></ul><ol><li>第一步</li><li>第二步</li></ol><ul class="task-list"><li><input type="checkbox" checked disabled> 完成项</li><li><input type="checkbox" disabled> 待办项</li></ul><figure><img src="/assets/diagram.png" alt="架构图"><figcaption>架构图</figcaption></figure>',
    );
  });
});
