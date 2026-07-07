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
      name: "产品设计",
      slug: "product-design",
    },
    {
      tagId: "tag_system_design",
      name: "系统架构",
      slug: "system-design",
    },
    { tagId: "tag_frontend", name: "前端工程", slug: "frontend" },
    { tagId: "tag_backend", name: "后端服务", slug: "backend" },
    { tagId: "tag_ai_ml", name: "AI 应用", slug: "ai-ml" },
    { tagId: "tag_devops", name: "DevOps", slug: "devops" },
  ],
  hasMore: false,
};

const mockPosts: PostSummaryResp[] = [
  {
    postId: "post-design-ia",
    authorId: "user_liam_chen",
    authorName: "陈立",
    title: "信息架构落地指南：从导航到知识路径",
    summary:
      "从栏目、标签、搜索和相关推荐入手，梳理复杂产品中可扩展的内容组织方法。",
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
    authorName: "王雨熙",
    title: "让新用户更快进入写作状态的引导设计",
    summary:
      "把引导拆成目标确认、模板选择和首个可保存草稿，让用户更快获得明确反馈。",
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
    authorName: "朴一川",
    title: "组件库的边界：设计系统的可维护实践",
    summary:
      "从组件 API、设计 token 和业务组合层三个角度，复盘大型设计系统的维护经验。",
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
    "引言 信息架构是复杂内容产品的骨架。核心原则 好的信息架构建立在清晰、一致和可扩展之上。导航模式 导航帮助用户在信息之间移动。实践示例 真实案例能让这些原则更容易落地。",
  contentHash: "sha256:design-ia-demo",
  sizeBytes: 1024,
  createdAt: publishedAt,
  blocks: [
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "引言" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "信息架构是复杂内容产品的骨架。它决定用户如何找到内容、理解内容，并在不同知识节点之间继续探索。",
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "核心原则" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "好的信息架构建立在清晰、一致和可扩展之上。每个原则都要让复杂产品保持可理解，同时不隐藏关键细节。",
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
              text: "为增长预留空间，但不要牺牲可用性。",
            },
          ],
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "导航模式" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "顶部导航适合承载宽泛分类，侧边导航更适合层级较深、信息密度较高的知识结构。",
        },
      ],
    },
    {
      type: "heading",
      level: 2,
      children: [{ type: "text", text: "实践示例" }],
    },
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          text: "示例应当展示原则如何落到真实界面，并把读者连接到相邻资源。",
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
          displayName: "苏然",
        },
        content: "结构和阅读路径都很清楚。",
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
