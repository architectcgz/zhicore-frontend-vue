import { describe, expect, it } from "vitest";

import articleCommentsSource from "../ArticleComments.vue?raw";

describe("ArticleComments", () => {
  it("keeps the comment count beside the title without an outlined badge", () => {
    expect(articleCommentsSource).toContain('<h2 id="comments-title">');
    expect(articleCommentsSource).toContain(
      '<span class="article-comments__count">{{ countLabel }}</span>',
    );
    expect(articleCommentsSource).not.toContain("article-comments__eyebrow");
    expect(articleCommentsSource).not.toContain("eyebrow: string;");
    expect(articleCommentsSource).not.toContain(
      ".article-comments__count {\n  display: inline-flex;\n  align-items: center;\n  min-height: 28px;",
    );
  });

  it("uses the compact editor composer without a preview action", () => {
    expect(articleCommentsSource).toContain("<EditorCompactBodyComposer");
    expect(articleCommentsSource).not.toContain("<textarea");
    expect(articleCommentsSource).not.toContain("预览");
  });

  it("keeps expanded reply avatars visually lighter than root comment avatars", () => {
    expect(articleCommentsSource).toContain(
      ".article-comments__reply {\n  grid-template-columns: 32px minmax(0, 1fr);",
    );
    expect(articleCommentsSource).toContain(
      ".article-comments__reply .article-comments__avatar",
    );
    expect(articleCommentsSource).toContain("width: 32px;");
    expect(articleCommentsSource).toContain("height: 32px;");
  });

  it("places comment and reply timestamps at the end of the action row", () => {
    expect(articleCommentsSource).toContain(
      '<span class="article-comments__time">{{ comment.time }}</span>',
    );
    expect(articleCommentsSource).toContain(
      '<span class="article-comments__time">{{ reply.time }}</span>',
    );
    expect(articleCommentsSource).toContain("margin-left: auto;");
    expect(articleCommentsSource).not.toContain(
      "{{ comment.role }} · {{ comment.time }}",
    );
    expect(articleCommentsSource).not.toContain(
      "{{ reply.role }} · {{ reply.time }}",
    );
  });

  it("keeps author role on the same line as the author name", () => {
    expect(articleCommentsSource).toContain(
      '<div class="article-comments__author-line">',
    );
    expect(articleCommentsSource).toContain(
      '<span class="article-comments__role">{{ comment.role }}</span>',
    );
    expect(articleCommentsSource).toContain(
      '<span class="article-comments__role">{{ reply.role }}</span>',
    );
    expect(articleCommentsSource).toContain(
      ".article-comments__author-line {\n  display: flex;",
    );
    expect(articleCommentsSource).not.toContain(
      ".article-comments__item-head strong,\n.article-comments__item-head span",
    );
  });

  it("keeps mobile comment avatars in the same row as author names", () => {
    expect(articleCommentsSource).toContain("@media (max-width: 640px)");
    expect(articleCommentsSource).toContain(
      ".article-comments__composer {\n    grid-template-columns: 1fr;",
    );
    expect(articleCommentsSource).toContain(
      ".article-comments__item {\n    grid-template-columns: 40px minmax(0, 1fr);",
    );
    expect(articleCommentsSource).toContain(
      ".article-comments__reply {\n    grid-template-columns: 32px minmax(0, 1fr);",
    );
    expect(articleCommentsSource).not.toContain(
      ".article-comments__composer,\n  .article-comments__item,\n  .article-comments__reply",
    );
  });

  it("does not render separate header badges in comment headers", () => {
    expect(articleCommentsSource).not.toContain("comment.badge");
    expect(articleCommentsSource).not.toContain("reply.badge");
    expect(articleCommentsSource).not.toContain("article-comments__badge");
  });

  it("renders comment action buttons as borderless icon text controls", () => {
    expect(articleCommentsSource).toContain("MessageCircle");
    expect(articleCommentsSource).toContain("Quote");
    expect(articleCommentsSource).toContain("Link2");
    expect(articleCommentsSource).toContain(
      ".article-comments__actions button {\n  display: inline-flex;",
    );
    expect(articleCommentsSource).toContain("column-gap: var(--space-4);");
    expect(articleCommentsSource).toContain("gap: var(--space-1);");
    expect(articleCommentsSource).toContain("border: 0;");
    expect(articleCommentsSource).toContain("background: transparent;");
    expect(articleCommentsSource).not.toContain(
      ".article-comments__submit button,\n.article-comments__actions button",
    );
  });
});
