import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import ContentDetailRoutePage from "../ContentDetailRoutePage.vue";

vi.mock("@/components/content/ArticleDetailView.vue", () => ({
  default: {
    name: "ArticleDetailView",
    props: ["detail", "activeCommentSort", "commentDraftBody"],
    emits: ["selectCommentSort", "update:commentDraftBody"],
    template: '<section data-testid="desktop-article-detail" />',
  },
}));

vi.mock("@/components/content/ArticleDetailMobileView.vue", () => ({
  default: {
    name: "ArticleDetailMobileView",
    props: ["detail", "activeCommentSort", "commentDraftBody"],
    emits: ["selectCommentSort", "update:commentDraftBody"],
    template: '<section data-testid="mobile-article-detail" />',
  },
}));

function setViewportWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("ContentDetailRoutePage", () => {
  afterEach(() => {
    setViewportWidth(1024);
  });

  it("renders the desktop article page outside the mobile breakpoint", () => {
    setViewportWidth(1024);

    const wrapper = mount(ContentDetailRoutePage);

    expect(
      wrapper.find('[data-testid="desktop-article-detail"]').exists(),
    ).toBe(true);
    expect(wrapper.find('[data-testid="mobile-article-detail"]').exists()).toBe(
      false,
    );
  });

  it("renders the dedicated mobile article page at the mobile breakpoint", () => {
    setViewportWidth(375);

    const wrapper = mount(ContentDetailRoutePage);

    expect(wrapper.find('[data-testid="mobile-article-detail"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('[data-testid="desktop-article-detail"]').exists(),
    ).toBe(false);
  });

  it("switches to the mobile article page after resizing to iPhone SE width", async () => {
    setViewportWidth(1024);
    const wrapper = mount(ContentDetailRoutePage);

    setViewportWidth(375);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="mobile-article-detail"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('[data-testid="desktop-article-detail"]').exists(),
    ).toBe(false);
  });
});
