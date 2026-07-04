import type { ContentDetailResponse } from "../types";

export const contentDetailResponseMock: ContentDetailResponse = {
  post: {
    id: "post_demo_gateway_content_facts",
    category: "架构",
    readingMinutes: 12,
    title: "从网关到内容服务：一次请求如何被拆成可靠的事实层",
    author: {
      id: "user_chen_zhifeng",
      name: "陈志峰",
      initial: "陈",
    },
    publishedAtLabel: "发布于 2026-07-04",
    viewCount: 2431,
    statuses: [
      { code: "primary_resource", label: "主资源正常", tone: "ok" },
      { code: "bookmark_unknown", label: "收藏状态未知", tone: "warn" },
    ],
    activeHeadingIndex: 0,
    progressPercent: 42,
  },
  body: {
    bodyId: "body_demo_gateway_content_facts",
    schemaVersion: 1,
    format: "blocks",
    plainText:
      "请求事实层\n文章详情页遵循主资源优先原则。\n主资源优先\n当互动服务不可用时，页面不把未知状态显示成未点赞。\n互动状态降级\n设计重点：阅读路径不能被附加资源失败阻断。\n写路径确认\n相关阅读和评论入口放在正文之后。",
    contentHash: "sha256:demo-gateway-content-facts",
    sizeBytes: 1024,
    createdAt: "2026-07-04T10:00:00.000Z",
    blocks: [
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "请求事实层" }],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "文章详情页遵循主资源优先原则。标题、正文、作者和发布时间必须先可读；点赞、收藏、presence 和 viewer 状态属于附加信息。",
          },
        ],
      },
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "主资源优先" }],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "当互动服务不可用时，页面不把未知状态显示成“未点赞”，而是明确显示为中性状态。这样读者看到的是系统当前能确认的事实。",
          },
        ],
      },
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "互动状态降级" }],
      },
      {
        type: "quote",
        blocks: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: "设计重点：阅读路径不能被附加资源失败阻断；写路径必须等待服务确认后再更新事实状态。",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        level: 2,
        children: [{ type: "text", text: "写路径确认" }],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            text: "相关阅读和评论入口放在正文之后，避免主阅读区域被过多操作打断。",
          },
        ],
      },
    ],
  },
  engagement: {
    likeCount: 18,
    bookmarkCount: null,
    bookmarkUnavailable: true,
    commentCount: 6,
    shareLabel: "分享",
    note: "收藏状态暂不可用，稍后可重试。",
  },
  relatedPosts: [
    {
      id: "related_content_degradation",
      title: "内容服务降级设计",
      meta: "同一主题 · 8 分钟阅读",
    },
    {
      id: "related_editor_save_conflict",
      title: "编辑器保存冲突处理",
      meta: "写作工作流 · 11 分钟阅读",
    },
    {
      id: "related_gateway_tracing",
      title: "网关请求追踪实践",
      meta: "平台工程 · 9 分钟阅读",
    },
  ],
  comments: {
    page: {
      items: [
        {
          postId: "post_demo_gateway_content_facts",
          commentId: "comment_lin_frontend",
          author: {
            publicId: "user_lin",
            displayName: "Lin",
          },
          content:
            "如果互动统计暂时不可用，列表可以继续展示主内容，同时用很轻的提示告诉读者状态未确认，避免误解为未收藏。",
          status: "NORMAL",
          stats: {
            likeCount: 12,
            replyCount: 1,
          },
          viewer: {
            liked: false,
          },
          createdAt: "2026-07-04T10:42:00.000Z",
          updatedAt: "2026-07-04T10:42:00.000Z",
        },
        {
          postId: "post_demo_gateway_content_facts",
          commentId: "comment_zhou_service",
          author: {
            publicId: "user_zhou_mu",
            displayName: "周牧",
          },
          content:
            "评论删除失败时不能在本地先移除，需要保留可恢复状态。普通读者侧只展示可见评论，异常状态留给管理端处理。",
          status: "NORMAL",
          stats: {
            likeCount: 7,
            replyCount: 0,
          },
          viewer: {
            liked: false,
          },
          createdAt: "2026-07-04T10:54:00.000Z",
          updatedAt: "2026-07-04T10:54:00.000Z",
        },
      ],
      page: 1,
      size: 20,
      totalComments: 6,
      totalTopLevelComments: 2,
      pages: 1,
    },
    repliesByRootCommentId: {
      comment_lin_frontend: [
        {
          postId: "post_demo_gateway_content_facts",
          commentId: "reply_chen_author",
          rootCommentId: "comment_lin_frontend",
          parentCommentId: "comment_lin_frontend",
          author: {
            publicId: "user_chen_zhifeng",
            displayName: "陈志峰",
          },
          content:
            "对，详情页进入后仍需要重新加载 engagement，不能沿用列表状态。列表状态只作为轻量提示，不作为详情页最终事实。",
          status: "NORMAL",
          stats: {
            likeCount: 0,
            replyCount: 0,
          },
          viewer: {
            liked: false,
          },
          createdAt: "2026-07-04T10:48:00.000Z",
          updatedAt: "2026-07-04T10:48:00.000Z",
        },
      ],
    },
    authorRolesByPublicId: {
      user_lin: "前端工程化",
      user_chen_zhifeng: "作者",
      user_zhou_mu: "Go 与服务治理",
    },
    title: "评论区",
    eyebrow: "讨论",
    totalLabel: "6 条评论",
    sortTabs: ["最有价值", "最新", "只看作者"],
    draftInitialBody:
      "这篇文章对主资源和附加资源的区分很清楚，我想补充一个列表页 batch-status 的例子。",
  },
};
