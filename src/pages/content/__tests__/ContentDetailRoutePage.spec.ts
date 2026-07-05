import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useContentDetailPage } from "@/features/content-detail";

import ContentDetailRoutePage from "../ContentDetailRoutePage.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({
    fullPath: "/posts/post-from-route",
    params: {
      postId: "post-from-route",
    },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/stores/auth", () => ({
  useAuthStore: () => ({
    isLoggedIn: true,
  }),
}));

vi.mock("@/features/content-detail", () => ({
  useContentDetailPage: vi.fn(() => ({
    detail: {
      value: {
        title: "文章",
      },
    },
    pageState: {
      value: "ready",
    },
    pageError: {
      value: "",
    },
    activeCommentSort: {
      value: "最新",
    },
    commentDraftBody: {
      value: "",
    },
    commentsState: {
      value: "ready",
    },
    commentsError: {
      value: "",
    },
    submittingLike: {
      value: false,
    },
    submittingFavorite: {
      value: false,
    },
    readingActionError: {
      value: "",
    },
    selectCommentSort: vi.fn(),
    updateCommentDraftBody: vi.fn(),
    submitComment: vi.fn(),
    retryComments: vi.fn(),
    likePost: vi.fn(),
    favoritePost: vi.fn(),
    sharePost: vi.fn(),
  })),
}));

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

  it("passes the route postId into the content detail workflow", () => {
    setViewportWidth(1024);

    mount(ContentDetailRoutePage);

    expect(useContentDetailPage).toHaveBeenCalledWith(
      expect.objectContaining({
        value: "post-from-route",
      }),
      expect.objectContaining({
        isLoggedIn: expect.any(Function),
        redirectToLogin: expect.any(Function),
      }),
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
