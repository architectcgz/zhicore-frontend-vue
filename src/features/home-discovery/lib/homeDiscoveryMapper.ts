import type {
  PostEngagementBatchStatusItem,
  PostSummaryResp,
} from "@/api/post";

import type { HomePost } from "../types";

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

function formatPublishedAt(publishedAt?: string): string {
  if (!publishedAt) {
    return "发布时间未确认";
  }

  return dateTimeFormatter.format(new Date(publishedAt));
}

function estimateReadingTime(summary?: string): string {
  const textLength = Math.max(summary?.length ?? 0, 1);
  return `${Math.max(1, Math.ceil(textLength / 400))} 分钟阅读`;
}

export function mapPostSummaryToHomePost(
  post: PostSummaryResp,
  engagement?: PostEngagementBatchStatusItem,
): HomePost {
  const engagementUnknown =
    engagement?.degraded === true ||
    engagement?.liked === null ||
    engagement?.favorited === null;

  return {
    id: post.postId,
    href: `/posts/${post.postId}`,
    category: "文章",
    readingTime: estimateReadingTime(post.summary),
    title: post.title,
    summary: post.summary ?? "",
    tags: [],
    author: post.authorName ?? "已注销用户",
    authorAvatarUrl: post.authorAvatarUrl,
    publishedAt: formatPublishedAt(post.publishedAt),
    likes: post.stats.likeCount,
    comments: post.stats.commentCount,
    liked: engagement?.liked,
    favorited: engagement?.favorited,
    engagementUnavailable: engagementUnknown,
  };
}
