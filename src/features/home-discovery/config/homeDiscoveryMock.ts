import type { HomeDiscoveryData } from "../types";

export const homeDiscoveryMock: HomeDiscoveryData = {
  eyebrow: "构建知识，分享见解",
  title: "发现清楚、有出处、能继续延展的中文技术内容。",
  lede: "按主题、作者和热度浏览今日更新，从一篇文章进入完整的知识路径。",
  searchInitialQuery: "搜索 Vue、Go、微服务、架构",
  metrics: [
    { label: "今日发布", value: "128" },
    { label: "活跃作者", value: "42" },
    { label: "本周阅读", value: "9.8k" },
  ],
  contentCategories: ["全部", "前端", "架构", "后端", "写作体验"],
  posts: [
    {
      href: "/posts/demo",
      category: "架构",
      readingTime: "12 分钟阅读",
      title: "从网关到内容服务：一次请求如何被拆成可靠的事实层",
      summary:
        "主资源先返回，互动状态再分层加载。阅读体验不会被点赞、收藏或在线读者摘要拖慢。",
      tags: ["微服务", "降级", "可观测性"],
      author: "陈志峰",
      publishedAt: "2 小时前",
      likes: 18,
      comments: 6,
    },
    {
      href: "/posts/demo",
      category: "前端",
      readingTime: "8 分钟阅读",
      title: "编辑器为什么应该像一篇文章，而不是一组表单",
      summary:
        "连续文档是默认体验，block 结构只在插入、拖拽、校验和冲突定位时显露。",
      tags: ["Tiptap", "写作体验"],
      author: "Lin",
      publishedAt: "昨天",
      likes: 32,
      comments: 14,
    },
  ],
  authorsTitle: "推荐作者",
  authors: [
    { initial: "林", name: "Lin", bio: "前端工程化与编辑器" },
    { initial: "周", name: "周牧", bio: "Go 与服务治理" },
  ],
};
