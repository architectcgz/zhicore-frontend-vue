import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import {
  createPost,
  favoritePost,
  getPostDetail,
  getPostEngagementBatchStatus,
  getPostBody,
  listPosts,
  listTags,
  likePost,
  publishPost,
  saveDraftBody,
  type CreatePostReq,
  type PublishPostReq,
  type SaveDraftBodyReq,
} from "../post";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

describe("post api", () => {
  it("creates a draft post through the Content endpoint", async () => {
    const response = {
      postId: "post-1",
      postVersion: 1,
    };
    const post = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: CreatePostReq = {
      title: "草稿标题",
      tags: ["go"],
    };

    await expect(createPost(input)).resolves.toEqual(response);
    expect(post).toHaveBeenCalledWith("/v1/posts", input);
  });

  it("saves draft body through the Content envelope endpoint", async () => {
    const response = {
      postId: "post-1",
      postVersion: 8,
      draftBodyId: "body-2",
      draftBodyHash: "sha256:next",
      savedAt: "2026-07-02T00:00:00Z",
      wordCount: 12,
    };
    const put = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      put,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: SaveDraftBodyReq = {
      schemaVersion: 1,
      blocks: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "正文" }],
        },
      ],
      basePostVersion: 7,
      baseDraftBodyId: "body-1",
      baseDraftBodyHash: "sha256:base",
    };

    await expect(saveDraftBody("post-1", input)).resolves.toEqual(response);
    expect(put).toHaveBeenCalledWith("/v1/posts/post-1/draft/body", input);
  });

  it("publishes a post with draft body baseline", async () => {
    const response = {
      postId: "post-1",
      postVersion: 9,
      publishedAt: "2026-07-02T01:00:00Z",
    };
    const post = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: PublishPostReq = {
      basePostVersion: 8,
      draftBodyId: "body-2",
      draftBodyHash: "sha256:next",
      idempotencyKey: "publish-1",
    };

    await expect(publishPost("post-1", input)).resolves.toEqual(response);
    expect(post).toHaveBeenCalledWith("/v1/posts/post-1/publish", input);
  });

  it("reads published post body through the Content endpoint", async () => {
    const response = {
      bodyId: "body-2",
      schemaVersion: 1,
      format: "blocks",
      blocks: [
        {
          type: "paragraph",
          children: [{ type: "text", text: "正文" }],
        },
      ],
      plainText: "正文",
      contentHash: "sha256:body",
      sizeBytes: 12,
      createdAt: "2026-07-02T00:00:00Z",
    } as const;
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(getPostBody("post-1")).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/posts/post-1/body");
  });

  it("reads public post detail through the Content detail endpoint", async () => {
    const response = {
      post: {
        postId: "post-1",
        authorId: "user-1",
        authorName: "作者",
        title: "文章标题",
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
      body: {
        bodyId: "body-1",
        schemaVersion: 1,
        format: "blocks",
        blocks: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "正文" }],
          },
        ],
        plainText: "正文",
        contentHash: "sha256:body",
        sizeBytes: 12,
        createdAt: "2026-07-05T08:00:00Z",
      },
    } as const;
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(getPostDetail("post-1")).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/posts/post-1");
  });

  it("lists public posts with cursor params through the Content endpoint", async () => {
    const response = {
      items: [
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
      ],
      nextCursor: "cursor-2",
      hasMore: true,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(
      listPosts({
        categoryId: "frontend",
        cursor: "cursor-1",
        limit: 20,
        sort: "latest",
      }),
    ).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/posts", {
      params: {
        categoryId: "frontend",
        cursor: "cursor-1",
        limit: 20,
        sort: "latest",
      },
    });
  });

  it("lists content tags through the Content endpoint", async () => {
    const response = {
      items: [
        {
          tagId: "tag-1",
          name: "Vue",
          slug: "vue",
        },
      ],
      nextCursor: "cursor-2",
      hasMore: true,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(listTags({ cursor: "cursor-1", limit: 20 })).resolves.toEqual(
      response,
    );
    expect(get).toHaveBeenCalledWith("/v1/tags", {
      params: {
        cursor: "cursor-1",
        limit: 20,
      },
    });
  });

  it("queries engagement batch status through the Content endpoint", async () => {
    const response = {
      items: [
        {
          postId: "post-1",
          liked: true,
          favorited: null,
          degraded: true,
        },
      ],
    };
    const post = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(getPostEngagementBatchStatus(["post-1"])).resolves.toEqual(
      response,
    );
    expect(post).toHaveBeenCalledWith("/v1/posts/engagement/batch-status", {
      postIds: ["post-1"],
    });
  });

  it("updates post like and favorite through idempotent Content commands", async () => {
    const put = vi
      .fn()
      .mockResolvedValueOnce({
        data: { postId: "post-1", liked: true, likeCount: 4 },
      })
      .mockResolvedValueOnce({
        data: { postId: "post-1", favorited: true, favoriteCount: 3 },
      });
    vi.mocked(getAxiosInstance).mockReturnValue({
      put,
    } as unknown as ReturnType<typeof getAxiosInstance>);

    await expect(likePost("post-1")).resolves.toEqual({
      postId: "post-1",
      liked: true,
      likeCount: 4,
    });
    await expect(favoritePost("post-1")).resolves.toEqual({
      postId: "post-1",
      favorited: true,
      favoriteCount: 3,
    });
    expect(put).toHaveBeenNthCalledWith(1, "/v1/posts/post-1/like");
    expect(put).toHaveBeenNthCalledWith(2, "/v1/posts/post-1/favorite");
  });
});
