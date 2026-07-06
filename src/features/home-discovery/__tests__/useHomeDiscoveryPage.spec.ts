import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  favoritePost,
  getPostEngagementBatchStatus,
  likePost,
  listPosts,
  listTags,
} from "@/api/post";

import { useHomeDiscoveryPage } from "../composables/useHomeDiscoveryPage";

vi.mock("@/api/post", () => ({
  favoritePost: vi.fn(),
  getPostEngagementBatchStatus: vi.fn(),
  likePost: vi.fn(),
  listPosts: vi.fn(),
  listTags: vi.fn(),
}));

function postSummary(postId: string, title: string) {
  return {
    postId,
    authorId: `${postId}-author`,
    authorName: "作者",
    title,
    summary: `${title} 摘要`,
    status: "PUBLISHED" as const,
    publishedAt: "2026-07-05T08:00:00Z",
    createdAt: "2026-07-05T07:00:00Z",
    updatedAt: "2026-07-05T08:00:00Z",
    stats: {
      viewCount: 12,
      likeCount: 3,
      favoriteCount: 2,
      commentCount: 1,
    },
  };
}

beforeEach(() => {
  vi.mocked(listPosts).mockReset();
  vi.mocked(listTags).mockReset();
  vi.mocked(getPostEngagementBatchStatus).mockReset();
  vi.mocked(likePost).mockReset();
  vi.mocked(favoritePost).mockReset();
  vi.mocked(listTags).mockResolvedValue({
    items: [],
    hasMore: false,
  });
  vi.mocked(listPosts).mockResolvedValue({
    items: [],
    hasMore: false,
  });
});

describe("useHomeDiscoveryPage", () => {
  it("loads the feed through the API adapter so article links use API post ids", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-design-ia", "API mock 文章")],
      hasMore: false,
    });

    const page = useHomeDiscoveryPage();
    await flushPromises();

    expect(page.feedState.value).toBe("ready");
    expect(listPosts).toHaveBeenCalledWith({ limit: 20, sort: "latest" });
    expect(page.discovery.posts[0]?.href).toBe("/posts/post-design-ia");
  });

  it("loads public posts in non-demo mode", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "真实文章")],
      hasMore: false,
    });
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({
      items: [
        {
          postId: "post-1",
          liked: true,
          favorited: null,
          degraded: true,
        },
      ],
    });

    const page = useHomeDiscoveryPage({
      isLoggedIn: () => true,
    });

    expect(page.feedState.value).toBe("loading");
    await flushPromises();

    expect(page.feedState.value).toBe("ready");
    expect(page.discovery.posts[0]?.title).toBe("真实文章");
    expect(page.discovery.posts[0]?.href).toBe("/posts/post-1");
    expect(listPosts).toHaveBeenCalledWith({ limit: 20, sort: "latest" });
    expect(getPostEngagementBatchStatus).toHaveBeenCalledWith(["post-1"]);
  });

  it("loads discovery categories from Content tags in non-demo mode", async () => {
    vi.mocked(listTags).mockResolvedValue({
      items: [
        { tagId: "tag-1", name: "Vue", slug: "vue" },
        { tagId: "tag-2", name: "Go", slug: "go" },
      ],
      hasMore: false,
    });
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "真实文章")],
      hasMore: false,
    });

    const page = useHomeDiscoveryPage();
    await flushPromises();

    expect(listTags).toHaveBeenCalledWith({ limit: 20 });
    expect(page.discovery.contentCategories).toEqual(["全部", "Vue", "Go"]);
  });

  it("does not request login-only engagement status for anonymous readers", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "公开文章")],
      hasMore: false,
    });

    const page = useHomeDiscoveryPage({
      isLoggedIn: () => false,
    });
    await flushPromises();

    expect(page.feedState.value).toBe("ready");
    expect(page.discovery.posts[0]?.title).toBe("公开文章");
    expect(getPostEngagementBatchStatus).not.toHaveBeenCalled();
  });

  it("renders the main list before a slow engagement batch resolves", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "公开文章")],
      hasMore: false,
    });
    vi.mocked(getPostEngagementBatchStatus).mockImplementation(
      () => new Promise(() => undefined),
    );

    const page = useHomeDiscoveryPage({
      isLoggedIn: () => true,
    });
    await flushPromises();

    expect(page.feedState.value).toBe("ready");
    expect(page.discovery.posts[0]?.title).toBe("公开文章");
  });

  it("restores the session before deciding whether to load viewer engagement", async () => {
    let restored = false;
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "公开文章")],
      hasMore: false,
    });
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({
      items: [
        {
          postId: "post-1",
          liked: true,
          favorited: false,
          degraded: false,
        },
      ],
    });

    const page = useHomeDiscoveryPage({
      isLoggedIn: () => restored,
      restoreSession: async () => {
        restored = true;
      },
    });
    await flushPromises();

    expect(getPostEngagementBatchStatus).toHaveBeenCalledWith(["post-1"]);
    expect(page.discovery.posts[0]?.liked).toBe(true);
  });

  it("keeps the list readable and marks engagement unavailable when batch status fails", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "公开文章")],
      hasMore: false,
    });
    vi.mocked(getPostEngagementBatchStatus).mockRejectedValue(
      new Error("engagement failed"),
    );

    const page = useHomeDiscoveryPage({
      isLoggedIn: () => true,
    });
    await flushPromises();

    expect(page.feedState.value).toBe("ready");
    expect(page.discovery.posts[0]?.title).toBe("公开文章");
    expect(page.discovery.posts[0]?.engagementUnavailable).toBe(true);
  });

  it("shows page-level retry state and skips engagement when the main list fails", async () => {
    vi.mocked(listPosts).mockRejectedValue(new Error("list failed"));

    const page = useHomeDiscoveryPage();
    await flushPromises();

    expect(page.feedState.value).toBe("error");
    expect(page.feedError.value).toBe("list failed");
    expect(page.discovery.posts).toEqual([]);
    expect(getPostEngagementBatchStatus).not.toHaveBeenCalled();
  });

  it("shows real empty state and skips engagement for an empty list", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [],
      hasMore: false,
    });

    const page = useHomeDiscoveryPage();
    await flushPromises();

    expect(page.feedState.value).toBe("empty");
    expect(page.discovery.posts).toEqual([]);
    expect(getPostEngagementBatchStatus).not.toHaveBeenCalled();
  });

  it("resets list params and discards stale responses after category changes", async () => {
    let resolveOld:
      | ((value: {
          items: ReturnType<typeof postSummary>[];
          hasMore: boolean;
        }) => void)
      | undefined;
    let resolveLatest:
      | ((value: {
          items: ReturnType<typeof postSummary>[];
          hasMore: boolean;
        }) => void)
      | undefined;
    vi.mocked(listPosts)
      .mockResolvedValueOnce({
        items: [postSummary("post-a", "初始")],
        hasMore: false,
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveLatest = resolve;
          }),
      );
    vi.mocked(listTags).mockResolvedValue({
      items: [
        { tagId: "tag-1", name: "Vue", slug: "vue" },
        { tagId: "tag-2", name: "Go", slug: "go" },
      ],
      hasMore: false,
    });
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    const page = useHomeDiscoveryPage();
    await flushPromises();

    page.selectContentCategory("Vue");
    page.selectContentCategory("Go");
    resolveLatest?.({
      items: [postSummary("post-latest", "最终")],
      hasMore: false,
    });
    await flushPromises();
    resolveOld?.({
      items: [postSummary("post-old", "旧响应")],
      hasMore: false,
    });
    await flushPromises();

    expect(listPosts).toHaveBeenNthCalledWith(2, {
      limit: 20,
      sort: "latest",
      tag: "vue",
    });
    expect(listPosts).toHaveBeenNthCalledWith(3, {
      limit: 20,
      sort: "latest",
      tag: "go",
    });
    expect(page.discovery.posts[0]?.title).toBe("最终");
  });

  it("owns content category and search state outside the UI component", () => {
    const page = useHomeDiscoveryPage();

    expect(page.activeContentCategory.value).toBe("全部");
    expect(page.searchQuery.value).toBe("");

    page.discovery.contentCategories = ["全部", "Vue"];

    page.selectContentCategory("Vue");
    page.updateSearchQuery("内容服务");

    expect(page.activeContentCategory.value).toBe("Vue");
    expect(page.searchQuery.value).toBe("内容服务");
  });

  it("ignores categories that are not part of the mock discovery data", () => {
    const page = useHomeDiscoveryPage();

    page.selectContentCategory("不存在");

    expect(page.activeContentCategory.value).toBe("全部");
  });

  it("redirects anonymous like and favorite actions to login", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "公开文章")],
      hasMore: false,
    });
    const redirectToLogin = vi.fn();
    const page = useHomeDiscoveryPage({
      isLoggedIn: () => false,
      redirectToLogin,
    });
    await flushPromises();

    await page.likePost("post-1");
    await page.favoritePost("post-1");

    expect(redirectToLogin).toHaveBeenCalledTimes(2);
    expect(likePost).not.toHaveBeenCalled();
    expect(favoritePost).not.toHaveBeenCalled();
  });

  it("restores the session before redirecting engagement actions", async () => {
    let restored = false;
    const redirectToLogin = vi.fn();
    vi.mocked(likePost).mockResolvedValue({
      postId: "post-1",
      liked: true,
      likeCount: 4,
    });
    const page = useHomeDiscoveryPage({
      isLoggedIn: () => restored,
      redirectToLogin,
      restoreSession: async () => {
        restored = true;
      },
    });

    await page.likePost("post-1");

    expect(redirectToLogin).not.toHaveBeenCalled();
    expect(likePost).toHaveBeenCalledWith("post-1");
  });

  it("updates local counts after authenticated like and favorite actions", async () => {
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "公开文章")],
      hasMore: false,
    });
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(likePost).mockResolvedValue({
      postId: "post-1",
      liked: true,
      likeCount: 4,
    });
    vi.mocked(favoritePost).mockResolvedValue({
      postId: "post-1",
      favorited: true,
      favoriteCount: 3,
    });
    const page = useHomeDiscoveryPage({
      isLoggedIn: () => true,
    });
    await flushPromises();

    await page.likePost("post-1");
    await page.favoritePost("post-1");

    expect(likePost).toHaveBeenCalledWith("post-1");
    expect(favoritePost).toHaveBeenCalledWith("post-1");
    expect(page.discovery.posts[0]?.likes).toBe(4);
  });
});
