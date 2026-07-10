# Explore 与 Community 内容契约对齐 Implementation Plan

> **给 agentic workers：** 必需子技能：使用 @subagent-driven-development（推荐）或 @executing-plans 按任务推进；列表、分页和筛选状态使用 @test-driven-development。步骤使用 checkbox（`- [ ]`）追踪，完成一个预期结果后立即勾选；如需提交，提交前必须先使用 @committing-changes。

**目标：** 让 `/explore` 和 `/community` 只展示 content contract 已支持的真实能力，并移除或降级没有 contract 的静态控件。

**架构：** `src/api/post.ts` 拥有公开文章列表和批量摘要 DTO；`home-discovery` 与 `community` feature 分别拥有页面状态、分页和降级入口；UI workspace 只渲染 props 和触发 emits。没有 taxonomy contract 前，不把 tag/category 当成真实请求筛选。

**技术栈：** Vue 3、TypeScript strict、Axios adapter、Vitest、happy-dom。

---

## 后端 contract 来源

- `zhicore-go/docs/contracts/http.md`
- `zhicore-go/docs/contracts/pagination.md`
- `zhicore-go/services/zhicore-content/api/http/endpoints/list-posts.md`
- `zhicore-go/services/zhicore-content/api/http/endpoints/batch-get-posts.md`
- `zhicore-go/services/zhicore-content/api/http/endpoints/get-post-detail.md`
- `zhicore-go/services/zhicore-content/api/http/endpoints/list-my-drafts.md`
- `zhicore-go/services/zhicore-content/api/http/endpoints/list-my-posts.md`

## contract 摘要

- `GET /v1/posts`：支持 `cursor`、`limit`、`sort=latest`；返回 cursor page。
- `tag` / `categoryId` 在 taxonomy 任务前返回 `1001`，不能作为默认可用筛选。
- `POST /v1/posts/batch-get`：最多 100 个公开文章 ID。
- `GET /v1/me/drafts` 和 `GET /v1/me/posts` 可用于作者工作台，不属于公开探索页默认数据源。

## 文件结构

- 修改：`src/api/post.ts`
  - 校准公开列表 cursor page 类型和 batch get 类型。
- 修改：`src/api/__tests__/post.spec.ts`
  - 覆盖 `cursor`、`limit`、`sort` 和禁止默认 tag/category 请求。
- 修改：`src/features/home-discovery/composables/useHomeDiscoveryPage.ts`
  - 增加加载更多和真实 cursor 状态。
- 修改：`src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts`
  - 覆盖分页、失败、stale response。
- 修改：`src/features/home-discovery/ui/HomeDiscoveryExploreWorkspace.vue`
  - 收口无 contract 筛选面板、推荐社区和作者数。
- 修改：`src/features/community/composables/useCommunityPage.ts`
  - 保留公开内容列表，降级 topic/filter 误导入口。
- 修改：`src/features/community/__tests__/useCommunityPage.spec.ts`
  - 覆盖 topic 不触发 tag/category 请求。
- 修改：`src/features/community/ui/CommunityWorkspace.vue`
  - 收口“更多主题”“热门/待回复”“关注社区”等无 contract 控件。

## 任务 1：校准公开内容 API 和分页

**测试立场：** TDD - API query 和 cursor page 是 contract 行为。

**验收清单：**

- [ ] `listPosts()` 支持 `cursor`、`limit`、`sort`，并返回 `nextCursor`、`hasMore`。
- [ ] `limit` 默认遵循后端 contract，不在前端塞任意固定大值。
- [ ] 默认请求不包含 `tag` 或 `categoryId`。
- [ ] 若 UI 中仍展示 topic，topic 不能触发 `tag/categoryId` 请求。
- [ ] `batchGetPosts()` 限制最多 100 个 id；超限在调用前拆分或阻止。

- [ ] **步骤 1：写失败测试**

  修改 `src/api/__tests__/post.spec.ts`，覆盖 cursor page 和无 taxonomy 参数。

  运行：`pnpm exec vitest run src/api/__tests__/post.spec.ts`

  预期：当前类型或请求行为不满足新增断言时失败。

- [ ] **步骤 2：实现 API 校准**

  修改 `src/api/post.ts` 的 list response 类型和 query 组装；保留既有后端字段名。

- [ ] **步骤 3：运行 API 验证**

  运行：`pnpm exec vitest run src/api/__tests__/post.spec.ts`

  预期：PASS。

## 任务 2：Explore 加载更多和降级收口

**测试立场：** 混合 - 分页状态用 TDD，移除静态 UI 直接实现并用组件/类型验证。

**验收清单：**

- [ ] 初次加载公开文章列表，失败显示 retry，空列表显示 empty。
- [ ] “加载更多”在 `hasMore=true` 时可用，使用 `nextCursor` 请求下一页。
- [ ] 加载更多失败不清空已有列表。
- [ ] 排序仅保留 `latest` 或 contract 已支持项；未支持排序不展示为可用控件。
- [ ] 筛选面板静态项、推荐社区、作者数不再来自 `homeDiscoveryMock` 伪生产事实。
- [ ] 热门标签若只是当前页本地聚合，文案不得暗示服务端全局热度。

- [ ] **步骤 1：写失败测试**

  修改 `src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts`，增加加载更多、失败保留旧列表和 stale response。

  运行：`pnpm exec vitest run src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts`

  预期：当前加载更多 disabled 或无 cursor 行为导致失败。

- [ ] **步骤 2：实现分页 workflow**

  修改 `useHomeDiscoveryPage.ts`，增加 `cursor`、`hasMore`、`loadingMore`、`loadMore()`、request id。

- [ ] **步骤 3：收口 Explore UI**

  修改 `HomeDiscoveryExploreWorkspace.vue`，启用真实加载更多；移除或禁用无 contract 筛选和推荐社区。

- [ ] **步骤 4：运行 Explore 验证**

  运行：`pnpm exec vitest run src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts`

  预期：PASS。

## 任务 3：Community topic/filter 治理

**测试立场：** 混合 - 请求行为用 TDD，UI 降级用最小组件验证。

**验收清单：**

- [ ] Community 主列表继续使用公开 `listPosts()`。
- [ ] topic 点击不发送 `tag` 或 `categoryId` 请求，除非后端 taxonomy contract 已补齐。
- [ ] “更多主题”“浏览社区”“关注”“更多社区操作”不展示为可用生产操作。
- [ ] “热门”“待回复”tab 没有排序/回复流 contract 前移除或 disabled。
- [ ] 喜欢、收藏、计数、回复流没有 contract 前不显示成真实统计。

- [ ] **步骤 1：写失败测试**

  修改 `src/features/community/__tests__/useCommunityPage.spec.ts`，断言 topic 选择不会把 `tag/categoryId` 传给 API。

  运行：`pnpm exec vitest run src/features/community/__tests__/useCommunityPage.spec.ts`

  预期：若当前实现发送无效筛选，测试失败。

- [ ] **步骤 2：调整 Community workflow**

  修改 `useCommunityPage.ts`，把 topic 状态降级为展示态或本地高亮，不影响后端请求。

- [ ] **步骤 3：收口 Community UI**

  修改 `CommunityWorkspace.vue`，移除或明确 disabled 无 contract 控件。

- [ ] **步骤 4：运行 Community 验证**

  运行：`pnpm exec vitest run src/features/community/__tests__/useCommunityPage.spec.ts src/pages/community/__tests__/CommunityRoutePage.spec.ts`

  预期：PASS。

## 集成检查

- [ ] 运行受影响切片验证。

  运行：`pnpm exec vitest run src/api/__tests__/post.spec.ts src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts src/features/community/__tests__/useCommunityPage.spec.ts`

  预期：PASS。

- [ ] 运行类型检查。

  运行：`pnpm typecheck`

  预期：PASS。

## 架构适配评估

| 检查项 | 结论 |
| --- | --- |
| contract | 使用 content 已验证公开列表和批量摘要；taxonomy 未完成前不实现筛选。 |
| owner | API、feature、workspace 各自只做自己的职责。 |
| UI 诚实性 | 无数据源的推荐社区、作者数和互动统计不伪装为真实生产数据。 |
| 二次返工风险 | 后续 taxonomy/community contract 到位后，可新增独立筛选切片，不需要重写主列表分页。 |
