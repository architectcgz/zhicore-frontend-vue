import { describe, expect, it } from "vitest";

import { mapPostSummaryToHomePost } from "../lib/homeDiscoveryMapper";

describe("mapPostSummaryToHomePost", () => {
  it("maps Content post summary into a home discovery card", () => {
    const post = mapPostSummaryToHomePost(
      {
        postId: "post-1",
        authorId: "user-1",
        authorName: "作者",
        title: "文章标题",
        summary: "摘要",
        status: "PUBLISHED",
        publishedAt: "2026-07-05T08:00:00Z",
        createdAt: "2026-07-05T07:00:00Z",
        updatedAt: "2026-07-05T08:00:00Z",
        stats: {
          viewCount: 12,
          likeCount: 3,
          favoriteCount: 2,
          commentCount: 1,
        },
      },
      {
        postId: "post-1",
        liked: null,
        favorited: false,
        degraded: true,
      },
    );

    expect(post).toMatchObject({
      id: "post-1",
      href: "/posts/post-1",
      title: "文章标题",
      summary: "摘要",
      author: "作者",
      likes: 3,
      comments: 1,
      engagementUnavailable: true,
    });
  });
});
