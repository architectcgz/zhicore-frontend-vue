import type {
  CreateCommentResp,
  ListCommentsPageReq,
  TopLevelCommentPageResp,
} from "../comment";
import type {
  FavoritePostResp,
  LikePostResp,
  ListPostsReq,
  ListPostsResp,
  ListTagsReq,
  ListTagsResp,
  PostDetailResp,
  PostEngagementBatchStatusResp,
  PostSummaryResp,
} from "../post";
import type { PostBody } from "@/entities/post-body";

const publishedAt = "2026-07-06T05:00:00.000Z";

function cloneDto<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const mockTagsResp: ListTagsResp = {
  items: [
    {
      tagId: "tag_product_design",
      name: "Product Design",
      slug: "product-design",
    },
    {
      tagId: "tag_system_design",
      name: "System Design",
      slug: "system-design",
    },
    { tagId: "tag_frontend", name: "Frontend", slug: "frontend" },
    { tagId: "tag_backend", name: "Backend", slug: "backend" },
    { tagId: "tag_ai_ml", name: "AI & ML", slug: "ai-ml" },
    { tagId: "tag_devops", name: "DevOps", slug: "devops" },
  ],
  hasMore: false,
};

const mockPosts: PostSummaryResp[] = [
  {
    postId: "post-design-ia",
    authorId: "user_liam_chen",
    authorName: "Liam Chen",
    title: "Mastering Information Architecture: A Guide",
    summary:
      "A practical guide to building scalable information architecture for complex products.",
    status: "PUBLISHED",
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    stats: {
      viewCount: 1200,
      likeCount: 128,
      favoriteCount: 348,
      commentCount: 24,
    },
  },
  {
    postId: "post-onboarding-activation",
    authorId: "user_yuxi_wang",
    authorName: "Yuxi Wang",
    title: "Designing Onboarding Experiences That Drive Activation",
    summary:
      "How to design onboarding flows that help users reach their first aha moment.",
    status: "PUBLISHED",
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    stats: {
      viewCount: 986,
      likeCount: 86,
      favoriteCount: 120,
      commentCount: 17,
    },
  },
  {
    postId: "post-component-library",
    authorId: "user_ethan_park",
    authorName: "Ethan Park",
    title: "Component Libraries: Best Practices and Pitfalls",
    summary:
      "Sharing lessons from building and maintaining a design system at scale.",
    status: "PUBLISHED",
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    stats: {
      viewCount: 764,
      likeCount: 74,
      favoriteCount: 92,
      commentCount: 12,
    },
  },
];

const postTagSlugsByPostId: Record<string, string[]> = {
  "post-design-ia": ["product-design", "system-design"],
  "post-onboarding-activation": ["product-design", "frontend"],
  "post-component-library": ["frontend", "devops"],
};

export const mockBody: PostBody = {
  bodyId: "body-design-ia",
  schemaVersion: 1,
  format: "blocks",
  plainText:
    "Introduction Information Architecture is the backbone of any successful digital product. Core Principles Great IA is built on clarity consistency and scalability. Navigation Patterns Navigation helps users move through your information. Practical Examples Real world examples demonstrate these principles.",
  contentHash: "sha256:design-ia-demo",
  sizeBytes: 1024,
  createdAt: publishedAt,
  blocks: [
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "Introduction" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "Information Architecture (IA) is the backbone of any successful digital product. It shapes how users find, understand, and interact with content.",
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "Core Principles" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "Great IA is built on clarity, consistency, and scalability. Each principle keeps complex products understandable without hiding important details.",
        },
      ],
    },
    {
      type: "quote",
      blocks: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: "Design for growth without compromising usability.",
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "Navigation Patterns" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "Top navigation works well for broad categories, while sidebar navigation supports deep hierarchies and dense knowledge structures.",
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "Practical Examples" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "Use examples that demonstrate the principles in action and connect readers to adjacent resources.",
        },
      ],
    },
  ],
};

export function getMockListTagsResp(input?: ListTagsReq): ListTagsResp {
  return {
    ...cloneDto(mockTagsResp),
    items: cloneDto(mockTagsResp.items).slice(0, input?.limit),
  };
}

export function getMockListPostsResp(input?: ListPostsReq): ListPostsResp {
  const filteredPosts = input?.tag
    ? mockPosts.filter((post) =>
        postTagSlugsByPostId[post.postId]?.includes(input.tag ?? ""),
      )
    : mockPosts;

  return {
    items: cloneDto(filteredPosts).slice(0, input?.limit),
    hasMore: false,
  };
}

export function getMockPostDetailResp(postId: string): PostDetailResp {
  const post =
    mockPosts.find((candidate) => candidate.postId === postId) ?? mockPosts[0];
  return {
    post: cloneDto(post),
    body: cloneDto(mockBody),
    tags: cloneDto(
      mockTagsResp.items.filter((tag) =>
        postTagSlugsByPostId[post.postId]?.includes(tag.slug),
      ),
    ),
  };
}

export function getMockEngagementBatchStatusResp(
  postIds: string[],
): PostEngagementBatchStatusResp {
  return {
    items: postIds.map((postId) => ({
      postId,
      liked: postId === "post-design-ia" ? false : null,
      favorited: null,
      degraded: true,
    })),
  };
}

export function getMockLikePostResp(postId: string): LikePostResp {
  const post =
    mockPosts.find((candidate) => candidate.postId === postId) ?? mockPosts[0];
  return {
    postId,
    liked: true,
    likeCount: post.stats.likeCount + 1,
  };
}

export function getMockFavoritePostResp(postId: string): FavoritePostResp {
  const post =
    mockPosts.find((candidate) => candidate.postId === postId) ?? mockPosts[0];
  return {
    postId,
    favorited: true,
    favoriteCount: post.stats.favoriteCount + 1,
  };
}

export function getMockListCommentsPageResp(
  postId: string,
  input?: ListCommentsPageReq,
): TopLevelCommentPageResp {
  const requestedPage = input?.page ?? 1;
  const requestedSize = input?.size ?? 20;
  return {
    items: [
      {
        postId,
        commentId: "comment_design_review",
        author: {
          publicId: "user_sophia_moore",
          displayName: "Sophia Moore",
        },
        content: "The structure and reading path are clear.",
        status: "NORMAL",
        stats: {
          likeCount: 12,
          replyCount: 0,
        },
        viewer: {
          liked: false,
        },
        createdAt: publishedAt,
        updatedAt: publishedAt,
      },
    ],
    page: requestedPage,
    size: requestedSize,
    totalComments: 24,
    totalTopLevelComments: 1,
    pages: 1,
  };
}

export function getMockCreateCommentResp(postId: string): CreateCommentResp {
  return {
    postId,
    commentId: `comment_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}
