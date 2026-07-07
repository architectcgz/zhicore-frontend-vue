import { readonly, ref, toValue, watch, type MaybeRef } from "vue";

import {
  createComment,
  listCommentsPage,
  type CommentSort,
  type TopLevelCommentPageResp,
} from "@/api/comment";
import {
  favoritePost as requestFavoritePost,
  getPostDetail,
  getPostEngagementBatchStatus,
  likePost as requestLikePost,
  type PostBodyResp,
  type PostDetailResp,
  type PostEngagementBatchStatusItem,
} from "@/api/post";

import { mapContentDetailResponse } from "../lib/contentDetailResponseMapper";
import type { ArticleDetailData, ContentDetailResponse } from "../types";

const commentSortLabels = ["最有价值", "最新", "热门"] as const;
const commentSortByLabel: Record<string, CommentSort> = {
  最有价值: "RECOMMENDED",
  最新: "TIME",
  热门: "HOT",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "文章详情加载失败";
}

function formatPublishedAtLabel(publishedAt?: string): string {
  if (!publishedAt) {
    return "发布时间未确认";
  }

  return `发布于 ${new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(new Date(publishedAt))}`;
}

function estimateReadingMinutes(plainText: string): number {
  return Math.max(1, Math.ceil(plainText.length / 400));
}

function createEmptyPostBody(): PostBodyResp {
  return {
    bodyId: "body_unavailable",
    schemaVersion: 1,
    format: "blocks",
    blocks: [],
    plainText: "",
    contentHash: "sha256:unavailable",
    sizeBytes: 0,
    createdAt: new Date(0).toISOString(),
  };
}

function buildContentDetailResponse(
  postDetail: PostDetailResp,
  commentsPage: TopLevelCommentPageResp,
  engagement?: PostEngagementBatchStatusItem,
): ContentDetailResponse {
  const body = postDetail.body ?? createEmptyPostBody();
  const authorName = postDetail.post.authorName ?? "已注销用户";
  const engagementUnavailable =
    engagement?.degraded === true ||
    engagement?.liked === null ||
    engagement?.favorited === null;

  return {
    post: {
      id: postDetail.post.postId,
      category: postDetail.tags?.[0]?.name ?? "文章",
      readingMinutes: estimateReadingMinutes(body.plainText),
      title: postDetail.post.title,
      author: {
        id: postDetail.post.authorId,
        name: authorName,
        initial: authorName.slice(0, 1),
      },
      publishedAtLabel: formatPublishedAtLabel(postDetail.post.publishedAt),
      viewCount: postDetail.post.stats.viewCount,
      statuses: [
        { code: "primary_resource", label: "主资源正常", tone: "ok" },
        ...(engagementUnavailable
          ? [
              {
                code: "engagement_unknown",
                label: "互动状态未知",
                tone: "warn" as const,
              },
            ]
          : []),
      ],
      activeHeadingIndex: 0,
      progressPercent: 0,
    },
    body,
    engagement: {
      likeCount: postDetail.post.stats.likeCount,
      bookmarkCount:
        engagement?.favorited === null
          ? null
          : postDetail.post.stats.favoriteCount,
      bookmarkUnavailable:
        engagement?.favorited === null || engagement?.degraded === true,
      commentCount: postDetail.post.stats.commentCount,
      shareLabel: "分享",
      note: engagementUnavailable
        ? "互动状态暂不可用，稍后可重试。"
        : "互动状态已同步。",
    },
    relatedPosts: [],
    comments: {
      page: commentsPage,
      repliesByRootCommentId: {},
      authorRolesByPublicId: {},
      title: "评论区",
      eyebrow: "讨论",
      totalLabel: `${commentsPage.totalComments} 条评论`,
      sortTabs: commentSortLabels,
      draftInitialBody: "",
    },
  };
}

function createEmptyCommentsPage(): TopLevelCommentPageResp {
  return {
    items: [],
    page: 1,
    size: 20,
    totalComments: 0,
    totalTopLevelComments: 0,
    pages: 0,
  };
}

export interface ContentDetailPageOptions {
  isLoggedIn?: () => boolean;
  redirectToLogin?: () => void | Promise<void>;
}

export function useContentDetailPage(
  postId: MaybeRef<string>,
  options: ContentDetailPageOptions = {},
) {
  const detail = ref<ArticleDetailData | null>(null);
  const pageState = ref<"loading" | "ready" | "error">("loading");
  const pageError = ref("");
  const commentsState = ref<"idle" | "loading" | "ready" | "error">("idle");
  const commentsError = ref("");
  const activeCommentSort = ref<string>(commentSortLabels[0]);
  const commentDraftBody = ref("");
  const submittingComment = ref(false);
  const commentSubmitError = ref("");
  const submittingLike = ref(false);
  const submittingFavorite = ref(false);
  const readingActionError = ref("");
  let lastPostDetail: PostDetailResp | null = null;
  let lastEngagement: PostEngagementBatchStatusItem | undefined;
  let lastCommentsPage: TopLevelCommentPageResp | null = null;
  let pageRequestId = 0;
  let commentsRequestId = 0;

  function getCurrentPostId(): string {
    return toValue(postId);
  }

  function applyDetail(commentsPage: TopLevelCommentPageResp): void {
    if (!lastPostDetail) {
      return;
    }

    lastCommentsPage = commentsPage;
    detail.value = mapContentDetailResponse(
      buildContentDetailResponse(lastPostDetail, commentsPage, lastEngagement),
    );
  }

  async function loadComments(): Promise<void> {
    const requestId = ++commentsRequestId;
    const requestPostId = getCurrentPostId();
    commentsState.value = "loading";
    commentsError.value = "";

    try {
      const commentsPage = await listCommentsPage(requestPostId, {
        page: 1,
        size: 20,
        sort: commentSortByLabel[activeCommentSort.value],
      });
      if (requestId !== commentsRequestId) {
        return;
      }

      applyDetail(commentsPage);
      commentsState.value = "ready";
    } catch (error) {
      if (requestId !== commentsRequestId) {
        return;
      }

      commentsError.value = getErrorMessage(error);
      commentsState.value = "error";
    }
  }

  async function loadPage(): Promise<void> {
    const requestId = ++pageRequestId;
    const requestPostId = getCurrentPostId();
    const initialCommentsRequestId = ++commentsRequestId;
    pageState.value = "loading";
    pageError.value = "";
    commentsState.value = "idle";
    commentsError.value = "";
    detail.value = null;
    lastPostDetail = null;
    lastEngagement = undefined;
    lastCommentsPage = null;
    readingActionError.value = "";

    try {
      const postDetail = await getPostDetail(requestPostId);
      if (requestId !== pageRequestId) {
        return;
      }

      lastPostDetail = postDetail;
      const [engagementResult, commentsResult] = await Promise.allSettled([
        getPostEngagementBatchStatus([requestPostId]),
        listCommentsPage(requestPostId, {
          page: 1,
          size: 20,
          sort: commentSortByLabel[activeCommentSort.value],
        }),
      ]);
      if (requestId !== pageRequestId) {
        return;
      }

      if (engagementResult.status === "fulfilled") {
        lastEngagement = engagementResult.value.items.find(
          (item) => item.postId === requestPostId,
        );
      } else {
        lastEngagement = {
          postId: requestPostId,
          liked: null,
          favorited: null,
          degraded: true,
        };
      }

      if (initialCommentsRequestId === commentsRequestId) {
        const commentsPage =
          commentsResult.status === "fulfilled"
            ? commentsResult.value
            : createEmptyCommentsPage();
        if (commentsResult.status === "rejected") {
          commentsError.value = getErrorMessage(commentsResult.reason);
          commentsState.value = "error";
        } else {
          commentsState.value = "ready";
        }
        applyDetail(commentsPage);
      } else if (!detail.value) {
        // 用户在首屏评论返回前切换排序时，首屏响应只负责让正文完成 ready，不再覆盖新排序评论。
        applyDetail(lastCommentsPage ?? createEmptyCommentsPage());
      } else if (lastCommentsPage) {
        // 首屏 engagement 可能晚于排序后的评论返回；复用最新评论页刷新互动降级状态。
        applyDetail(lastCommentsPage);
      }
      pageState.value = "ready";
    } catch (error) {
      if (requestId !== pageRequestId) {
        return;
      }

      pageError.value = getErrorMessage(error);
      pageState.value = "error";
    }
  }

  function selectCommentSort(sort: string): void {
    if (
      !commentSortLabels.includes(sort as (typeof commentSortLabels)[number])
    ) {
      return;
    }

    activeCommentSort.value = sort;
    if (lastPostDetail) {
      void loadComments();
    }
  }

  function updateCommentDraftBody(nextBody: string): void {
    commentDraftBody.value = nextBody;
  }

  async function submitComment(): Promise<void> {
    if (submittingComment.value) {
      return;
    }

    const content = commentDraftBody.value.trim();
    commentSubmitError.value = "";
    if (!content) {
      commentSubmitError.value = "评论内容不能为空";
      return;
    }

    if (options.isLoggedIn && !options.isLoggedIn()) {
      await options.redirectToLogin?.();
      return;
    }

    submittingComment.value = true;
    try {
      await createComment(getCurrentPostId(), { content });
      commentDraftBody.value = "";
      await loadComments();
    } catch (error) {
      commentSubmitError.value = getErrorMessage(error);
    } finally {
      submittingComment.value = false;
    }
  }

  async function likePost(): Promise<void> {
    if (!lastPostDetail || !lastCommentsPage) {
      return;
    }
    if (submittingLike.value) {
      return;
    }
    if (options.isLoggedIn && !options.isLoggedIn()) {
      await options.redirectToLogin?.();
      return;
    }

    submittingLike.value = true;
    readingActionError.value = "";
    try {
      const response = await requestLikePost(getCurrentPostId());
      lastPostDetail = {
        ...lastPostDetail,
        post: {
          ...lastPostDetail.post,
          stats: {
            ...lastPostDetail.post.stats,
            likeCount: response.likeCount,
          },
        },
      };
      lastEngagement = {
        postId: getCurrentPostId(),
        liked: response.liked,
        favorited: lastEngagement?.favorited ?? null,
        degraded: false,
      };
      applyDetail(lastCommentsPage);
    } catch (error) {
      readingActionError.value = getErrorMessage(error);
    } finally {
      submittingLike.value = false;
    }
  }

  async function favoritePost(): Promise<void> {
    if (!lastPostDetail || !lastCommentsPage) {
      return;
    }
    if (submittingFavorite.value) {
      return;
    }
    if (options.isLoggedIn && !options.isLoggedIn()) {
      await options.redirectToLogin?.();
      return;
    }

    submittingFavorite.value = true;
    readingActionError.value = "";
    try {
      const response = await requestFavoritePost(getCurrentPostId());
      lastPostDetail = {
        ...lastPostDetail,
        post: {
          ...lastPostDetail.post,
          stats: {
            ...lastPostDetail.post.stats,
            favoriteCount: response.favoriteCount,
          },
        },
      };
      lastEngagement = {
        postId: getCurrentPostId(),
        liked: lastEngagement?.liked ?? null,
        favorited: response.favorited,
        degraded: false,
      };
      applyDetail(lastCommentsPage);
    } catch (error) {
      readingActionError.value = getErrorMessage(error);
    } finally {
      submittingFavorite.value = false;
    }
  }

  async function sharePost(): Promise<void> {
    readingActionError.value = "";
    try {
      if (navigator.share && detail.value) {
        await navigator.share({
          title: detail.value.title,
          url: window.location.href,
        });
      }
    } catch (error) {
      readingActionError.value = getErrorMessage(error);
    }
  }

  watch(() => toValue(postId), loadPage, { immediate: true });

  return {
    detail: readonly(detail),
    pageState: readonly(pageState),
    pageError: readonly(pageError),
    commentsState: readonly(commentsState),
    commentsError: readonly(commentsError),
    activeCommentSort: readonly(activeCommentSort),
    commentDraftBody: readonly(commentDraftBody),
    submittingComment: readonly(submittingComment),
    commentSubmitError: readonly(commentSubmitError),
    submittingLike: readonly(submittingLike),
    submittingFavorite: readonly(submittingFavorite),
    readingActionError: readonly(readingActionError),
    selectCommentSort,
    updateCommentDraftBody,
    retryComments: loadComments,
    submitComment,
    likePost,
    favoritePost,
    sharePost,
  };
}
