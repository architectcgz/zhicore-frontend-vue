import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ArticleComment } from "@/features/content-detail";

import ArticleComments from "../ArticleComments.vue";
import articleCommentsSource from "../ArticleComments.vue?raw";

enableAutoUnmount(afterEach);

function mountArticleComments(
  options: {
    draftBody?: string;
    submitting?: boolean;
    submitError?: string;
    commentsState?: "idle" | "loading" | "ready" | "error";
    commentsError?: string;
    variant?: "full" | "dock";
    comments?: ArticleComment[];
    stubComposer?: boolean;
  } = {},
) {
  return mount(ArticleComments, {
    props: {
      title: "评论区",
      countLabel: "1 条评论",
      sortTabs: ["最有价值", "最新"],
      activeSort: "最有价值",
      draftBody: options.draftBody ?? "评论草稿",
      comments: options.comments ?? ([] satisfies ArticleComment[]),
      submittingComment: options.submitting ?? false,
      commentSubmitError: options.submitError ?? "",
      commentsState: options.commentsState ?? "ready",
      commentsError: options.commentsError ?? "",
      variant: options.variant ?? "full",
    },
    global: {
      stubs:
        options.stubComposer === false
          ? {}
          : {
              EditorCompactBodyComposer: {
                props: ["modelValue"],
                emits: ["update:modelValue"],
                template:
                  '<textarea class="stub-compact-composer" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
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

  it("expands the dock composer before rendering the rich comment editor", async () => {
    const wrapper = mountArticleComments({
      draftBody: "",
      variant: "dock",
    });

    expect(wrapper.find(".stub-compact-composer").exists()).toBe(false);

    await wrapper.get('[data-testid="dock-comment-expand"]').trigger("click");

    expect(wrapper.find(".stub-compact-composer").exists()).toBe(true);
  });

  it("keeps the expanded dock composer wired to the same draft and submit events", async () => {
    const wrapper = mountArticleComments({
      draftBody: "已有草稿",
      variant: "dock",
    });

    const input = wrapper.get<HTMLInputElement>(".stub-compact-composer");
    expect(input.element.value).toBe("已有草稿");

    await input.setValue("更新后的草稿");
    await wrapper.get('[data-testid="comment-submit"]').trigger("click");

    expect(wrapper.emitted("update:draftBody")).toEqual([["更新后的草稿"]]);
    expect(wrapper.emitted("submitComment")).toHaveLength(1);
    expect(wrapper.text()).not.toContain("关注讨论");
  });

  it("keeps the real comment editor wired to shared modifier-link behavior", async () => {
    const wrapper = mountArticleComments({
      draftBody: "",
      stubComposer: false,
    });
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    await wrapper.get('[data-testid="compact-toolbar-link"]').trigger("click");
    await wrapper.get('[data-testid="compact-link-text"]').setValue("契约文档");
    await wrapper
      .get('[data-testid="compact-link-href"]')
      .setValue("https://example.com/contracts");
    await wrapper.get('[data-testid="compact-link-apply"]').trigger("click");

    const editorElement = wrapper.get(
      ".article-comments__composer .ProseMirror",
    ).element as HTMLElement;
    const link = editorElement.querySelector<HTMLAnchorElement>("a");

    expect(link).not.toBeNull();

    link!.dispatchEvent(
      new MouseEvent("mousemove", {
        bubbles: true,
        ctrlKey: true,
      }),
    );
    expect(editorElement.classList.contains("editor-link-open-modifier")).toBe(
      true,
    );

    link!.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      }),
    );

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/contracts",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("keeps the real dock comment editor wired to shared modifier-link behavior", async () => {
    const wrapper = mountArticleComments({
      draftBody: "",
      variant: "dock",
      stubComposer: false,
    });
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    await wrapper.get('[data-testid="dock-comment-expand"]').trigger("click");
    await wrapper.get('[data-testid="compact-toolbar-link"]').trigger("click");
    await wrapper.get('[data-testid="compact-link-text"]').setValue("契约文档");
    await wrapper
      .get('[data-testid="compact-link-href"]')
      .setValue("https://example.com/contracts");
    await wrapper.get('[data-testid="compact-link-apply"]').trigger("click");

    const editorElement = wrapper.get(
      ".article-comments__dock-editor .ProseMirror",
    ).element as HTMLElement;
    const link = editorElement.querySelector<HTMLAnchorElement>("a");

    expect(link).not.toBeNull();

    link!.dispatchEvent(
      new MouseEvent("mousemove", {
        bubbles: true,
        ctrlKey: true,
      }),
    );
    expect(editorElement.classList.contains("editor-link-open-modifier")).toBe(
      true,
    );

    link!.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      }),
    );

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com/contracts",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("opens the same rich editor when replying to a comment", async () => {
    const wrapper = mountArticleComments({
      comments: [
        {
          id: "comment-1",
          author: "Alice",
          role: "作者",
          initial: "A",
          body: "根评论",
          likes: 3,
          time: "刚刚",
          replies: [],
        },
      ],
    });

    await wrapper
      .get('[data-testid="comment-reply-comment-1"]')
      .trigger("click");

    expect(
      wrapper.find('[data-testid="reply-editor-comment-1"]').exists(),
    ).toBe(true);
    expect(wrapper.find(".stub-compact-composer").exists()).toBe(true);
  });

  it("opens the same rich editor when replying to a nested reply", async () => {
    const wrapper = mountArticleComments({
      comments: [
        {
          id: "comment-1",
          author: "Alice",
          role: "作者",
          initial: "A",
          body: "根评论",
          likes: 3,
          time: "刚刚",
          replies: [
            {
              id: "reply-1",
              author: "Bob",
              role: "读者",
              initial: "B",
              body: "子回复",
              time: "刚刚",
            },
          ],
        },
      ],
    });

    await wrapper.get("summary").trigger("click");
    await wrapper.get('[data-testid="comment-reply-reply-1"]').trigger("click");

    expect(wrapper.find('[data-testid="reply-editor-reply-1"]').exists()).toBe(
      true,
    );
    expect(wrapper.find(".stub-compact-composer").exists()).toBe(true);
  });

  it("collapses the expanded dock composer on outside click without dropping the draft", async () => {
    const wrapper = mountArticleComments({
      draftBody: "已有草稿",
      variant: "dock",
    });

    document.body.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: true }),
    );
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".stub-compact-composer").exists()).toBe(false);
    expect(wrapper.text()).toContain("继续编辑评论");
    expect(wrapper.text()).toContain("草稿已保留");

    await wrapper.get('[data-testid="dock-comment-expand"]').trigger("click");

    const input = wrapper.get<HTMLInputElement>(".stub-compact-composer");
    expect(input.element.value).toBe("已有草稿");
  });

  it("keeps dock comments in document flow instead of overlaying article body", () => {
    expect(articleCommentsSource).toContain(".article-comments--dock {");
    expect(articleCommentsSource).toContain("margin-top: var(--space-8);");
    expect(articleCommentsSource).toContain("padding: var(--space-5) 0 0;");
    expect(articleCommentsSource).not.toContain("position: absolute;");
    expect(articleCommentsSource).not.toContain("backdrop-filter: blur(18px);");
  });

  it("keeps the readable comment thread in dock mode", () => {
    const wrapper = mountArticleComments({
      variant: "dock",
      comments: [
        {
          id: "comment-1",
          author: "Alice",
          role: "作者",
          initial: "A",
          body: "桌面详情页仍应展示评论内容。",
          likes: 3,
          time: "刚刚",
          replies: [],
        },
      ],
    });

    expect(wrapper.text()).toContain("桌面详情页仍应展示评论内容。");
    expect(wrapper.text()).toContain("最有价值");
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
