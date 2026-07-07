import { flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createComment,
  listCommentsPage,
  type TopLevelCommentPageResp,
} from "@/api/comment";
import { getPostDetail, getPostEngagementBatchStatus } from "@/api/post";
import { favoritePost, likePost } from "@/api/post";

import { useContentDetailPage } from "../composables/useContentDetailPage";
import { contentDetailResponseMock } from "../config/contentDetailResponseMock";

vi.mock("@/api/comment", () => ({
  createComment: vi.fn(),
  listCommentsPage: vi.fn(),
}));

vi.mock("@/api/post", () => ({
  favoritePost: vi.fn(),
  getPostDetail: vi.fn(),
  getPostEngagementBatchStatus: vi.fn(),
  likePost: vi.fn(),
}));

function mockPostDetail() {
  return {
    post: {
      postId: contentDetailResponseMock.post.id,
      authorId: contentDetailResponseMock.post.author.id,
      authorName: contentDetailResponseMock.post.author.name,
      title: contentDetailResponseMock.post.title,
      status: "PUBLISHED" as const,
      publishedAt: "2026-07-04T10:00:00.000Z",
      createdAt: "2026-07-04T09:00:00.000Z",
      updatedAt: "2026-07-04T10:00:00.000Z",
      stats: {
        viewCount: contentDetailResponseMock.post.viewCount,
        likeCount: contentDetailResponseMock.engagement.likeCount,
        favoriteCount: 0,
        commentCount: contentDetailResponseMock.engagement.commentCount,
      },
    },
    body: contentDetailResponseMock.body,
  };
}

beforeEach(() => {
  vi.mocked(getPostDetail).mockReset();
  vi.mocked(getPostEngagementBatchStatus).mockReset();
  vi.mocked(favoritePost).mockReset();
  vi.mocked(likePost).mockReset();
  vi.mocked(createComment).mockReset();
  vi.mocked(listCommentsPage).mockReset();
});

function commentPageWith(
  commentId: string,
  author: string,
): TopLevelCommentPageResp {
  return {
    ...contentDetailResponseMock.comments.page,
    items: [
      {
        postId: "post-1",
        commentId,
        author: {
          publicId: `${commentId}-author`,
          displayName: author,
        },
        content: `${author} 的评论`,
        status: "NORMAL",
        stats: {
          likeCount: 0,
          replyCount: 0,
        },
        createdAt: "2026-07-05T08:00:00.000Z",
        updatedAt: "2026-07-05T08:00:00.000Z",
      },
    ],
    totalComments: 1,
    totalTopLevelComments: 1,
  };
}

describe("useContentDetailPage", () => {
  it("loads the route post as the main resource before engagement and comments", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({
      items: [
        {
          postId: contentDetailResponseMock.post.id,
          liked: true,
          favorited: null,
          degraded: true,
        },
      ],
    });
    vi.mocked(listCommentsPage).mockResolvedValue(
      contentDetailResponseMock.comments.page,
    );

    const page = useContentDetailPage("post-1");

    expect(page.pageState.value).toBe("loading");
    expect(getPostDetail).toHaveBeenCalledWith("post-1");

    await flushPromises();

    expect(page.pageState.value).toBe("ready");
    expect(page.detail.value?.title).toBe(contentDetailResponseMock.post.title);
    expect(getPostEngagementBatchStatus).toHaveBeenCalledWith(["post-1"]);
    expect(listCommentsPage).toHaveBeenCalledWith("post-1", {
      page: 1,
      size: 20,
      sort: "RECOMMENDED",
    });
  });

  it("reloads the workflow when the route post id changes", async () => {
    const postId = ref("post-a");
    vi.mocked(getPostDetail)
      .mockResolvedValueOnce({
        ...mockPostDetail(),
        post: {
          ...mockPostDetail().post,
          postId: "post-a",
          title: "第一篇",
        },
      })
      .mockResolvedValueOnce({
        ...mockPostDetail(),
        post: {
          ...mockPostDetail().post,
          postId: "post-b",
          title: "第二篇",
        },
      });
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );

    const page = useContentDetailPage(postId);
    await flushPromises();
    expect(page.detail.value?.title).toBe("第一篇");

    postId.value = "post-b";
    await flushPromises();

    expect(getPostDetail).toHaveBeenLastCalledWith("post-b");
    expect(page.detail.value?.title).toBe("第二篇");
  });

  it("does not load engagement or comments when the main resource fails", async () => {
    vi.mocked(getPostDetail).mockRejectedValue(new Error("detail unavailable"));

    const page = useContentDetailPage("post-1");

    await flushPromises();

    expect(page.pageState.value).toBe("error");
    expect(page.pageError.value).toBe("detail unavailable");
    expect(getPostEngagementBatchStatus).not.toHaveBeenCalled();
    expect(listCommentsPage).not.toHaveBeenCalled();
  });

  it("keeps the article readable when engagement loading fails", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockRejectedValue(
      new Error("engagement failed"),
    );
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );

    const page = useContentDetailPage("post-1");
    await flushPromises();

    expect(page.pageState.value).toBe("ready");
    expect(page.detail.value?.title).toBe(contentDetailResponseMock.post.title);
    expect(page.detail.value?.readingActions.bookmarkCountLabel).toBe("--");
  });

  it("keeps the article readable when comments loading fails", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockRejectedValue(new Error("comments failed"));

    const page = useContentDetailPage("post-1");
    await flushPromises();

    expect(page.pageState.value).toBe("ready");
    expect(page.commentsState.value).toBe("error");
    expect(page.commentsError.value).toBe("comments failed");
    expect(page.detail.value?.comments).toEqual([]);
  });

  it("does not fall back to demo body when the detail response omits body", async () => {
    vi.mocked(getPostDetail).mockResolvedValue({
      ...mockPostDetail(),
      body: undefined,
    });
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );

    const page = useContentDetailPage("post-1");
    await flushPromises();

    expect(page.detail.value?.bodyBlocks).toEqual([]);
    expect(page.detail.value?.title).toBe(contentDetailResponseMock.post.title);
  });

  it("resets comment paging on sort change and discards stale responses", async () => {
    let resolveOldSort: ((page: TopLevelCommentPageResp) => void) | undefined;
    let resolveLatestSort:
      ((page: TopLevelCommentPageResp) => void) | undefined;
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage)
      .mockResolvedValueOnce(commentPageWith("initial", "初始"))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOldSort = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveLatestSort = resolve;
          }),
      );
    const page = useContentDetailPage("post-1");
    await flushPromises();

    page.selectCommentSort("最新");
    page.selectCommentSort("最有价值");
    resolveLatestSort?.(commentPageWith("latest-wins", "最终"));
    await flushPromises();
    resolveOldSort?.(commentPageWith("old-loses", "旧响应"));
    await flushPromises();

    expect(listCommentsPage).toHaveBeenNthCalledWith(2, "post-1", {
      page: 1,
      size: 20,
      sort: "TIME",
    });
    expect(listCommentsPage).toHaveBeenNthCalledWith(3, "post-1", {
      page: 1,
      size: 20,
      sort: "RECOMMENDED",
    });
    expect(page.detail.value?.comments[0]?.author).toBe("最终");
  });

  it("does not let a late initial comments response overwrite comments loaded after a sort change", async () => {
    let resolveInitialComments:
      ((page: TopLevelCommentPageResp) => void) | undefined;
    let resolveSortedComments:
      ((page: TopLevelCommentPageResp) => void) | undefined;
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveInitialComments = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSortedComments = resolve;
          }),
      );

    const page = useContentDetailPage("post-1");
    await flushPromises();

    expect(listCommentsPage).toHaveBeenCalledTimes(1);

    page.selectCommentSort("最新");
    resolveSortedComments?.(commentPageWith("sorted-wins", "新排序"));
    await flushPromises();
    expect(page.detail.value?.comments[0]?.author).toBe("新排序");

    resolveInitialComments?.(commentPageWith("initial-loses", "首屏旧响应"));
    await flushPromises();

    expect(listCommentsPage).toHaveBeenNthCalledWith(2, "post-1", {
      page: 1,
      size: 20,
      sort: "TIME",
    });
    expect(page.pageState.value).toBe("ready");
    expect(page.detail.value?.comments[0]?.author).toBe("新排序");
  });

  it("keeps late initial engagement degradation while preserving sorted comments", async () => {
    let resolveInitialComments:
      ((page: TopLevelCommentPageResp) => void) | undefined;
    let resolveEngagement:
      | ((
          value: Awaited<ReturnType<typeof getPostEngagementBatchStatus>>,
        ) => void)
      | undefined;
    let resolveSortedComments:
      ((page: TopLevelCommentPageResp) => void) | undefined;
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveEngagement = resolve;
        }),
    );
    vi.mocked(listCommentsPage)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveInitialComments = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSortedComments = resolve;
          }),
      );

    const page = useContentDetailPage("post-1");
    await flushPromises();

    page.selectCommentSort("最新");
    resolveSortedComments?.(commentPageWith("sorted-wins", "新排序"));
    await flushPromises();
    expect(page.detail.value?.comments[0]?.author).toBe("新排序");
    expect(page.detail.value?.readingActions.bookmarkCountLabel).toBe("0");

    resolveEngagement?.({
      items: [
        {
          postId: "post-1",
          liked: true,
          favorited: null,
          degraded: true,
        },
      ],
    });
    resolveInitialComments?.(commentPageWith("initial-loses", "首屏旧响应"));
    await flushPromises();

    expect(page.pageState.value).toBe("ready");
    expect(page.detail.value?.comments[0]?.author).toBe("新排序");
    expect(page.detail.value?.readingActions.bookmarkCountLabel).toBe("--");
    expect(page.detail.value?.statuses).toContainEqual(
      expect.objectContaining({
        label: "互动状态未知",
      }),
    );
  });

  it("validates comment submit and keeps the draft after a failure", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );
    vi.mocked(createComment).mockRejectedValue(new Error("comment failed"));
    const page = useContentDetailPage("post-1", {
      isLoggedIn: () => true,
      redirectToLogin: vi.fn(),
    });
    await flushPromises();

    page.updateCommentDraftBody("   ");
    await page.submitComment();
    expect(page.commentSubmitError.value).toBe("评论内容不能为空");
    expect(createComment).not.toHaveBeenCalled();

    page.updateCommentDraftBody("提交失败后保留这段草稿");
    await page.submitComment();

    expect(createComment).toHaveBeenCalledWith("post-1", {
      content: "提交失败后保留这段草稿",
    });
    expect(page.commentSubmitError.value).toBe("comment failed");
    expect(page.commentDraftBody.value).toBe("提交失败后保留这段草稿");
  });

  it("redirects anonymous comment submit to login", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );
    const redirectToLogin = vi.fn();
    const page = useContentDetailPage("post-1", {
      isLoggedIn: () => false,
      redirectToLogin,
    });
    await flushPromises();

    page.updateCommentDraftBody("需要登录后提交");
    await page.submitComment();

    expect(redirectToLogin).toHaveBeenCalledTimes(1);
    expect(createComment).not.toHaveBeenCalled();
    expect(page.commentDraftBody.value).toBe("需要登录后提交");
  });

  it("prevents duplicate comment submit while the previous submit is in flight", async () => {
    let resolveSubmit: (() => void) | undefined;
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );
    vi.mocked(createComment).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSubmit = () =>
            resolve({
              postId: "post-1",
              commentId: "created",
              createdAt: "2026-07-05T08:30:00.000Z",
            });
        }),
    );
    const page = useContentDetailPage("post-1", {
      isLoggedIn: () => true,
      redirectToLogin: vi.fn(),
    });
    await flushPromises();

    page.updateCommentDraftBody("只提交一次");
    const firstSubmit = page.submitComment();
    const duplicateSubmit = page.submitComment();
    resolveSubmit?.();
    await Promise.all([firstSubmit, duplicateSubmit]);

    expect(createComment).toHaveBeenCalledTimes(1);
  });

  it("updates reading action counts after like and favorite commands", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );
    vi.mocked(likePost).mockResolvedValue({
      postId: "post-1",
      liked: true,
      likeCount: 19,
    });
    vi.mocked(favoritePost).mockResolvedValue({
      postId: "post-1",
      favorited: true,
      favoriteCount: 7,
    });
    const page = useContentDetailPage("post-1");
    await flushPromises();

    await page.likePost();
    await page.favoritePost();

    expect(likePost).toHaveBeenCalledWith("post-1");
    expect(favoritePost).toHaveBeenCalledWith("post-1");
    expect(page.detail.value?.readingActions.likeCountLabel).toBe("19");
    expect(page.detail.value?.readingActions.bookmarkCountLabel).toBe("7");
  });

  it("redirects anonymous like and favorite actions to login", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );
    const redirectToLogin = vi.fn();
    const page = useContentDetailPage("post-1", {
      isLoggedIn: () => false,
      redirectToLogin,
    });
    await flushPromises();

    await page.likePost();
    await page.favoritePost();

    expect(redirectToLogin).toHaveBeenCalledTimes(2);
    expect(likePost).not.toHaveBeenCalled();
    expect(favoritePost).not.toHaveBeenCalled();
  });

  it("keeps interaction failures local and prevents duplicate like commands", async () => {
    let resolveLike: (() => void) | undefined;
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );
    vi.mocked(likePost)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveLike = () =>
              resolve({
                postId: "post-1",
                liked: true,
                likeCount: 19,
              });
          }),
      )
      .mockRejectedValueOnce(new Error("like failed"));
    const page = useContentDetailPage("post-1", {
      isLoggedIn: () => true,
      redirectToLogin: vi.fn(),
    });
    await flushPromises();

    const firstLike = page.likePost();
    const duplicateLike = page.likePost();
    expect(page.submittingLike.value).toBe(true);
    resolveLike?.();
    await Promise.all([firstLike, duplicateLike]);
    expect(likePost).toHaveBeenCalledTimes(1);

    await page.likePost();
    expect(page.readingActionError.value).toBe("like failed");
  });

  it("keeps share failures local", async () => {
    const originalShare = navigator.share;
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error("share cancelled")),
    });
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      commentPageWith("initial", "初始"),
    );
    const page = useContentDetailPage("post-1");
    await flushPromises();

    try {
      await page.sharePost();

      expect(page.readingActionError.value).toBe("share cancelled");
    } finally {
      Object.defineProperty(navigator, "share", {
        configurable: true,
        value: originalShare,
      });
    }
  });

  it("owns comment sort and draft state outside the UI component", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      contentDetailResponseMock.comments.page,
    );

    const page = useContentDetailPage("post-1");
    await flushPromises();

    expect(page.detail.value?.comments.length).toBeGreaterThan(0);
    expect(page.activeCommentSort.value).toBe("最有价值");
    expect(page.commentDraftBody.value).toBe("");

    page.selectCommentSort("最新");
    page.updateCommentDraftBody("新的评论草稿");

    expect(page.activeCommentSort.value).toBe("最新");
    expect(page.commentDraftBody.value).toBe("新的评论草稿");
  });

  it("ignores unknown comment sort values", () => {
    const page = useContentDetailPage("post-1");

    page.selectCommentSort("不存在");

    expect(page.activeCommentSort.value).toBe("最有价值");
  });

  it("keeps article toc links backed by rendered heading anchors", async () => {
    vi.mocked(getPostDetail).mockResolvedValue(mockPostDetail());
    vi.mocked(getPostEngagementBatchStatus).mockResolvedValue({ items: [] });
    vi.mocked(listCommentsPage).mockResolvedValue(
      contentDetailResponseMock.comments.page,
    );

    const page = useContentDetailPage("post-1");
    await flushPromises();
    const headingAnchorIds = new Set(
      page.detail.value?.bodyBlocks
        .filter((block) => block.kind === "heading")
        .map((block) => ("id" in block ? block.id : undefined))
        .filter((id): id is string => typeof id === "string"),
    );
    for (const tocItem of page.detail.value?.tocItems ?? []) {
      expect(headingAnchorIds.has(tocItem.href.replace("#", ""))).toBe(true);
    }
  });
});
