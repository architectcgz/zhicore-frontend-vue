import { describe, expect, it, vi } from "vitest";

import { getAxiosInstance } from "../request";
import {
  createComment,
  listCommentsPage,
  type CreateCommentReq,
  type ListCommentsPageReq,
} from "../comment";

vi.mock("../request", () => ({
  getAxiosInstance: vi.fn(),
}));

describe("comment api", () => {
  it("creates a comment under a post", async () => {
    const response = {
      postId: "post-1",
      commentId: "comment-1",
      createdAt: "2026-07-02T00:00:00Z",
    };
    const post = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      post,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: CreateCommentReq = {
      content: "第一条评论",
      imageFileIds: ["file_1"],
    };

    await expect(createComment("post-1", input)).resolves.toEqual(response);
    expect(post).toHaveBeenCalledWith("/v1/posts/post-1/comments", input);
  });

  it("lists top-level comments with page params", async () => {
    const response = {
      items: [],
      page: 1,
      size: 20,
      totalComments: 0,
      totalTopLevelComments: 0,
      pages: 0,
    };
    const get = vi.fn().mockResolvedValue({ data: response });
    vi.mocked(getAxiosInstance).mockReturnValue({
      get,
    } as unknown as ReturnType<typeof getAxiosInstance>);
    const input: ListCommentsPageReq = {
      page: 1,
      size: 20,
      sort: "RECOMMENDED",
    };

    await expect(listCommentsPage("post-1", input)).resolves.toEqual(response);
    expect(get).toHaveBeenCalledWith("/v1/posts/post-1/comments/page", {
      params: input,
    });
  });
});
