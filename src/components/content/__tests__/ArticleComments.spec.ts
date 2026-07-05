import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import type { ArticleComment } from "@/features/content-detail";

import ArticleComments from "../ArticleComments.vue";
import articleCommentsSource from "../ArticleComments.vue?raw";

function mountArticleComments(
  options: {
    draftBody?: string;
    submitting?: boolean;
    submitError?: string;
    commentsState?: "idle" | "loading" | "ready" | "error";
    commentsError?: string;
  } = {},
) {
  return mount(ArticleComments, {
    props: {
      title: "评论区",
      countLabel: "1 条评论",
      sortTabs: ["最有价值", "最新"],
      activeSort: "最有价值",
      draftBody: options.draftBody ?? "评论草稿",
      comments: [] satisfies ArticleComment[],
      submittingComment: options.submitting ?? false,
      commentSubmitError: options.submitError ?? "",
      commentsState: options.commentsState ?? "ready",
      commentsError: options.commentsError ?? "",
    },
    global: {
      stubs: {
        EditorCompactBodyComposer: {
          props: ["modelValue"],
          emits: ["update:modelValue"],
          template:
            '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
        },
      },
    },
  });
}

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

  it("emits submit intent from the primary comment action", async () => {
    const wrapper = mountArticleComments();

    await wrapper.get('[data-testid="comment-submit"]').trigger("click");

    expect(wrapper.emitted("submitComment")).toHaveLength(1);
  });

  it("disables duplicate comment submit while submitting", async () => {
    const wrapper = mountArticleComments({ submitting: true });

    const submitButton = wrapper.get('[data-testid="comment-submit"]');
    expect(submitButton.attributes("disabled")).toBeDefined();
    await submitButton.trigger("click");

    expect(wrapper.emitted("submitComment")).toBeUndefined();
  });

  it("shows local submit errors from the workflow owner", () => {
    const wrapper = mountArticleComments({ submitError: "评论内容不能为空" });

    expect(wrapper.get('[data-testid="comment-submit-error"]').text()).toBe(
      "评论内容不能为空",
    );
  });

  it("shows comment list errors as a local degraded state", async () => {
    const wrapper = mountArticleComments({
      commentsState: "error",
      commentsError: "comments failed",
    });

    expect(wrapper.get('[data-testid="comments-load-error"]').text()).toContain(
      "comments failed",
    );
    await wrapper.get('[data-testid="comments-retry"]').trigger("click");
    expect(wrapper.emitted("retryComments")).toHaveLength(1);
  });

  it("uses stable comment ids as rendered keys", () => {
    expect(articleCommentsSource).toContain(':key="comment.id"');
    expect(articleCommentsSource).toContain(':key="reply.id"');
    expect(articleCommentsSource).not.toContain(':key="comment.author"');
    expect(articleCommentsSource).not.toContain(':key="reply.author"');
  });
});
