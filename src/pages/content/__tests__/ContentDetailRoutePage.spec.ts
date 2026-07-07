import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import { useContentDetailRoutePage } from "@/features/content-detail";

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
  useContentDetailRoutePage: vi.fn(() => ({
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
    submittingComment: {
      value: false,
    },
    commentSubmitError: {
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

describe("ContentDetailRoutePage", () => {
  it("renders the responsive article detail through the route workflow owner", () => {
    const wrapper = mount(ContentDetailRoutePage);

    expect(
      wrapper.find('[data-testid="desktop-article-detail"]').exists(),
    ).toBe(true);
    expect(useContentDetailRoutePage).toHaveBeenCalledTimes(1);
  });

  it("keeps route parameter and auth redirect logic out of the route component", () => {
    mount(ContentDetailRoutePage);

    expect(useContentDetailRoutePage).toHaveBeenCalledWith();
  });
});
