import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import {
  createPost,
  getPostBody,
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
});
