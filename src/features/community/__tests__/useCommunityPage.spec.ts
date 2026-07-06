import { flushPromises } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { listPosts, listTags } from "@/api/post";

import { useCommunityPage } from "../composables/useCommunityPage";

vi.mock("@/api/post", () => ({
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
  vi.mocked(listTags).mockReset();
  vi.mocked(listPosts).mockReset();
});

describe("useCommunityPage", () => {
  it("loads topic communities from Content tags and recent public posts", async () => {
    vi.mocked(listTags).mockResolvedValue({
      items: [
        { tagId: "tag-vue", name: "Vue", slug: "vue" },
        { tagId: "tag-go", name: "Go", slug: "go" },
      ],
      hasMore: false,
    });
    vi.mocked(listPosts).mockResolvedValue({
      items: [postSummary("post-1", "社区文章")],
      hasMore: false,
    });

    const page = useCommunityPage();
    await flushPromises();

    expect(listTags).toHaveBeenCalledWith({ limit: 24 });
    expect(listPosts).toHaveBeenCalledWith({ limit: 10, sort: "latest" });
    expect(page.topicState.value).toBe("ready");
    expect(page.feedState.value).toBe("ready");
    expect(page.topics).toEqual([
      { id: "tag-vue", label: "Vue", slug: "vue" },
      { id: "tag-go", label: "Go", slug: "go" },
    ]);
    expect(page.posts[0]?.title).toBe("社区文章");
  });

  it("loads posts for a selected topic and discards stale responses", async () => {
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
    vi.mocked(listTags).mockResolvedValue({
      items: [
        { tagId: "tag-vue", name: "Vue", slug: "vue" },
        { tagId: "tag-go", name: "Go", slug: "go" },
      ],
      hasMore: false,
    });
    vi.mocked(listPosts)
      .mockResolvedValueOnce({
        items: [postSummary("post-initial", "初始")],
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

    const page = useCommunityPage();
    await flushPromises();

    page.selectTopic("vue");
    page.selectTopic("go");
    resolveLatest?.({
      items: [postSummary("post-go", "Go 社区")],
      hasMore: false,
    });
    await flushPromises();
    resolveOld?.({
      items: [postSummary("post-vue", "Vue 社区")],
      hasMore: false,
    });
    await flushPromises();

    expect(listPosts).toHaveBeenNthCalledWith(2, {
      limit: 10,
      sort: "latest",
      tag: "vue",
    });
    expect(listPosts).toHaveBeenNthCalledWith(3, {
      limit: 10,
      sort: "latest",
      tag: "go",
    });
    expect(page.activeTopicSlug.value).toBe("go");
    expect(page.posts[0]?.title).toBe("Go 社区");
  });
});
