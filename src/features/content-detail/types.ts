import type { CommentItem, TopLevelCommentPageResp } from "@/api/comment";
import type { PostBodyResp } from "@/api/post";

export interface ArticleTocItem {
  label: string;
  href: string;
}

export interface ArticleStatusBadge {
  label: string;
  tone: "ok" | "warn";
}

export interface ContentDetailAuthorResponse {
  id: string;
  name: string;
  initial: string;
  role?: string;
}

export interface ContentDetailResponse {
  post: {
    id: string;
    category: string;
    readingMinutes: number;
    title: string;
    author: ContentDetailAuthorResponse;
    publishedAtLabel: string;
    viewCount: number;
    statuses: readonly (ArticleStatusBadge & { code: string })[];
    activeHeadingIndex: number;
    progressPercent: number;
  };
  body: PostBodyResp;
  engagement: {
    likeCount: number;
    bookmarkCount: number | null;
    bookmarkUnavailable: boolean;
    commentCount: number;
    shareLabel: string;
    note: string;
  };
  relatedPosts: readonly (RelatedPost & { id: string })[];
  comments: {
    page: TopLevelCommentPageResp;
    repliesByRootCommentId: Record<string, readonly CommentItem[]>;
    authorRolesByPublicId: Record<string, string>;
    title: string;
    eyebrow: string;
    totalLabel: string;
    sortTabs: readonly string[];
    draftInitialBody: string;
  };
}

export type ArticleBodyBlock =
  | {
      id: string;
      kind: "heading";
      text: string;
    }
  | {
      kind: "paragraph" | "quote";
      text: string;
    };

export interface RelatedPost {
  title: string;
  meta: string;
}

export interface ArticleReply {
  initial: string;
  author: string;
  role: string;
  time: string;
  body: string;
}

export interface ArticleComment {
  initial: string;
  author: string;
  role: string;
  time: string;
  body: string;
  likes: number;
  replies: readonly ArticleReply[];
}

export interface ArticleReadingActions {
  likeCountLabel: string;
  bookmarkCountLabel: string;
  bookmarkUnavailable: boolean;
  commentCountLabel: string;
  shareLabel: string;
  note: string;
}

export interface ArticleDetailData {
  tocItems: readonly ArticleTocItem[];
  activeTocLabel: string;
  progressPercent: number;
  eyebrow: string;
  title: string;
  authorInitial: string;
  authorMeta: string;
  statuses: readonly ArticleStatusBadge[];
  bodyBlocks: readonly ArticleBodyBlock[];
  readingActions: ArticleReadingActions;
  relatedPosts: readonly RelatedPost[];
  commentsTitle: string;
  commentsEyebrow: string;
  commentsTotalLabel: string;
  commentSortTabs: readonly string[];
  commentDraftInitialBody: string;
  comments: readonly ArticleComment[];
}
