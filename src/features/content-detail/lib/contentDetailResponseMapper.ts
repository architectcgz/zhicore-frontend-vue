import type { CommentItem } from "@/api/comment";
import type { PostBodyBlock, PostBodyInlineNode } from "@/entities/post-body";

import type {
  ArticleBodyBlock,
  ArticleComment,
  ArticleDetailData,
  ContentDetailResponse,
} from "../types";

const numberFormatter = new Intl.NumberFormat("en-US");

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "numeric",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

function getInlineText(nodes: readonly PostBodyInlineNode[] = []): string {
  return nodes.map((node) => node.text).join("");
}

function getBlockText(block: PostBodyBlock): string {
  if ("children" in block) {
    return getInlineText(block.children);
  }

  if (block.type === "quote") {
    return block.blocks.map(getBlockText).join("\n");
  }

  return "";
}

function getHeadingId(index: number): string {
  return `heading-${index + 1}`;
}

function mapBodyBlock(
  block: PostBodyBlock,
  headingIndex: number,
): ArticleBodyBlock {
  if (block.type === "heading") {
    return {
      id: getHeadingId(headingIndex),
      kind: "heading",
      text: getInlineText(block.children),
    };
  }

  return {
    kind: block.type === "quote" ? "quote" : "paragraph",
    text: getBlockText(block),
  };
}

function getAuthorName(comment: CommentItem): string {
  return comment.author.displayName ?? "已注销用户";
}

function getAuthorInitial(comment: CommentItem): string {
  return getAuthorName(comment).slice(0, 1);
}

function getAuthorRole(
  comment: CommentItem,
  authorRolesByPublicId: ContentDetailResponse["comments"]["authorRolesByPublicId"],
): string {
  const publicId = comment.author.publicId;
  return publicId
    ? (authorRolesByPublicId[publicId] ?? "社区成员")
    : "社区成员";
}

function formatCommentTime(createdAt: string): string {
  return dateTimeFormatter.format(new Date(createdAt));
}

function mapComment(
  comment: CommentItem,
  replies: readonly CommentItem[],
  authorRolesByPublicId: ContentDetailResponse["comments"]["authorRolesByPublicId"],
): ArticleComment {
  return {
    id: comment.commentId,
    initial: getAuthorInitial(comment),
    author: getAuthorName(comment),
    role: getAuthorRole(comment, authorRolesByPublicId),
    time: formatCommentTime(comment.createdAt),
    body: comment.content ?? "",
    likes: comment.stats.likeCount,
    replies: replies.map((reply) => ({
      id: reply.commentId,
      initial: getAuthorInitial(reply),
      author: getAuthorName(reply),
      role: getAuthorRole(reply, authorRolesByPublicId),
      time: formatCommentTime(reply.createdAt),
      body: reply.content ?? "",
    })),
  };
}

export function mapContentDetailResponse(
  response: ContentDetailResponse,
): ArticleDetailData {
  const headingBlocks = response.body.blocks.filter(
    (block) => block.type === "heading",
  );
  const activeHeading = headingBlocks[response.post.activeHeadingIndex];
  let headingIndex = -1;

  return {
    tocItems: [
      ...headingBlocks.map((block, index) => ({
        label: getInlineText(block.children),
        href: `#${getHeadingId(index)}`,
      })),
    ],
    activeTocLabel: activeHeading
      ? getInlineText(activeHeading.children)
      : headingBlocks[0]
        ? getInlineText(headingBlocks[0].children)
        : "",
    progressPercent: response.post.progressPercent,
    eyebrow: `${response.post.category} / ${response.post.readingMinutes} 分钟阅读`,
    title: response.post.title,
    authorInitial: response.post.author.initial,
    authorMeta: `${response.post.author.name} · ${response.post.publishedAtLabel} · 已读 ${numberFormatter.format(response.post.viewCount)} 次`,
    statuses: response.post.statuses.map(({ label, tone }) => ({
      label,
      tone,
    })),
    bodyBlocks: response.body.blocks.map((block) => {
      if (block.type === "heading") {
        headingIndex += 1;
      }

      return mapBodyBlock(block, headingIndex);
    }),
    readingActions: {
      likeCountLabel: String(response.engagement.likeCount),
      bookmarkCountLabel:
        response.engagement.bookmarkCount === null
          ? "--"
          : String(response.engagement.bookmarkCount),
      bookmarkUnavailable: response.engagement.bookmarkUnavailable,
      commentCountLabel: String(response.engagement.commentCount),
      shareLabel: response.engagement.shareLabel,
      note: response.engagement.note,
    },
    relatedPosts: response.relatedPosts.map(({ id, title, meta }) => ({
      id,
      title,
      meta,
    })),
    commentsTitle: response.comments.title,
    commentsEyebrow: response.comments.eyebrow,
    commentsTotalLabel: response.comments.totalLabel,
    commentSortTabs: response.comments.sortTabs,
    commentDraftInitialBody: response.comments.draftInitialBody,
    comments: response.comments.page.items.map((comment) =>
      mapComment(
        comment,
        response.comments.repliesByRootCommentId[comment.commentId] ?? [],
        response.comments.authorRolesByPublicId,
      ),
    ),
  };
}
