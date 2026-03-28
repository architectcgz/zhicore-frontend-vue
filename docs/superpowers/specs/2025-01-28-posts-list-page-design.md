# /posts 文章广场页面设计文档

**日期：** 2025-01-28
**状态：** 已实现
**项目：** zhicore-frontend-vue

---

## 1. 背景与目标

当前 `/posts` 路由是一个仅含子路由的父路由，没有 index 页面组件。用户无法通过访问 `/posts` 浏览全站文章。

**目标：** 新增 `/posts` 文章广场页面，让用户可以浏览、筛选、排序全站已发布文章。

---

## 2. 功能需求

### 2.1 文章列表
- 展示全站已发布文章（`status: PUBLISHED`）
- 默认按最新排序
- 支持排序：**最新**、**最热**（热度分）、**最多评论**
- 支持筛选：
  - **标签**（多选，TagId）
  - **时间范围**：今天 / 本周 / 本月 / 全部

### 2.2 卡片样式（混合有图/无图）
- **有封面图：** 左侧文字区（标题、摘要、作者、统计数据）+ 右侧固定尺寸缩略图（120×80px）
- **无封面图：** 纯文字卡片，全宽，摘要行数稍多（3 行）
- 两种卡片均显示：标签 chip、点赞数、评论数、发布时间、作者头像+昵称

### 2.3 分页策略（响应式）
- **PC 端（≥768px）：** 传统页码分页，使用 `usePostsQuery` + 页码 state
- **移动端（<768px）：** cursor 无限滚动，使用 `useInfinitePostsQuery`，滚动到底自动触发 `fetchNextPage`

### 2.4 侧边栏（PC 端）
- 热门标签（复用 `useHotTagsQuery`）
- 活跃作者 / 热门创作者（复用 `useHotCreatorsQuery`）
- 移动端隐藏侧边栏

---

## 3. 页面布局

```
┌─────────────────────────────────────────────────────────┐
│  筛选栏：排序 tabs + 标签筛选 + 时间范围下拉               │
├───────────────────────────────────┬─────────────────────┤
│                                   │                     │
│  文章卡片列表                      │  侧边栏（PC 端）     │
│  ┌─────────────────────────────┐  │  - 热门标签          │
│  │ [标题]          [缩略图]    │  │  - 热门创作者        │
│  │ 摘要...                     │  │                     │
│  │ 作者 · 时间 · 👍 · 💬       │  │                     │
│  └─────────────────────────────┘  │                     │
│  ┌─────────────────────────────┐  │                     │
│  │ [无图卡片：全宽标题+摘要]    │  │                     │
│  └─────────────────────────────┘  │                     │
│                                   │                     │
│  [分页器（PC）/ 无限滚动（移动）]  │                     │
└───────────────────────────────────┴─────────────────────┘
```

---

## 4. 组件结构

```
src/pages/post/PostList.vue              # 页面主组件（路由组件）
src/components/post/PostListFilter.vue   # 筛选/排序栏
src/components/post/PostListCard.vue     # 单篇文章卡片（处理有图/无图）
src/components/post/PostListSidebar.vue  # 右侧边栏
```

### 4.1 PostList.vue 职责
- 持有筛选状态（sort、tagIds、timeRange、page）
- 根据 `useBreakpoint` / `window.innerWidth` 判断 PC/移动端，选择分页策略
- PC：使用 `usePostsQuery(params)` + `ElPagination`
- 移动：使用 `useInfinitePostsQuery(params)` + IntersectionObserver 触底
- 将 posts 数据传给 `PostListCard`

### 4.2 PostListFilter.vue 职责
- 排序 tabs：最新 / 最热 / 最多评论
- 标签多选下拉（从 `useHotTagsQuery` 取候选标签）
- 时间范围 Select：今天 / 本周 / 本月 / 全部
- emit `filter-change` 事件给父组件

### 4.3 PostListCard.vue 职责
- props: `post: Post`
- 内部判断 `post.coverImage` 是否存在，渲染对应布局
- 点赞/收藏交互通过 emit 给父组件（复用已有 mutation hooks）

### 4.4 PostListSidebar.vue 职责
- 热门标签列表，点击标签触发筛选（emit 或路由 query）
- 热门创作者列表，头像 + 昵称 + 跳转用户主页

---

## 5. 路由配置变更

在 `src/router/routes.ts` 的 `/posts` 父路由中添加 index 子路由：

```typescript
{
  path: '/posts',
  name: 'Posts',
  children: [
    {
      path: '',           // index 路由
      name: 'PostList',
      component: () => import('@/pages/post/PostList.vue'),
      meta: {
        title: '文章广场',
        layout: 'default',
        showInMenu: true,
        showSidebar: false,  // 侧边栏由页面自己的 PostListSidebar 实现
        icon: 'list',
        order: 2,
      },
    },
    // ...existing children
  ]
}
```

---

## 6. 数据层复用

| 用途 | 复用的 Query/API |
|------|------------------|
| PC 分页文章列表 | `usePostsQuery({ sort, tagId, page, size })` |
| 移动端无限滚动 | `useInfinitePostsQuery({ sort, tagId, size })` |
| 热门标签（筛选候选 + 侧边栏） | `useHotTagsQuery` |
| 热门创作者（侧边栏） | `useHotCreatorsQuery` |
| 点赞 | `useLikePostMutation` |
| 收藏 | `useFavoritePostMutation` |

`PostQueryParams` 中 `sort` 字段现有值为 `'latest' | 'popular' | 'hot'`，对应最新/最热/最多评论。时间范围筛选通过前端在 filter 状态中转换为 `publishedAt` 范围参数（如 API 支持）或纯前端展示过滤（视后端能力而定）。

---

## 7. 不在本次范围内

- 文章搜索（已有 `/search` 页面）
- 分类筛选（已有 `/categories` 页面）
- 草稿管理（已有 `/drafts` 页面）

---

## 8. 验收标准

- [x] 访问 `/posts` 显示文章列表，不再是空白/404
- [x] 排序切换后列表刷新
- [x] 标签筛选、时间范围筛选生效
- [x] PC 端显示页码分页，移动端（<768px）自动无限滚动
- [x] 有封面图和无封面图的文章在同一列表中正确混合渲染
- [x] 侧边栏在移动端不显示
