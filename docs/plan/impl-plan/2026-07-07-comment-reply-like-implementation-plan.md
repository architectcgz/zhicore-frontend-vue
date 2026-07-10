# 评论回复与点赞 Implementation Plan

> **给 agentic workers：** 必需子技能：使用 @subagent-driven-development（推荐）或 @executing-plans 按任务推进；API 和评论交互工作流使用 @test-driven-development。步骤使用 checkbox（`- [ ]`）追踪，完成一个预期结果后立即勾选；如需提交，提交前必须先使用 @committing-changes。

**目标：** 按 comment contract 补齐文章评论区的回复发布、回复列表、评论点赞、取消点赞和点赞状态。

**架构：** `src/api/comment.ts` 只封装 comment HTTP endpoint；`src/features/content-detail/composables/useContentDetailPage.ts` 拥有评论区 workflow 和本地提交状态；`ArticleComments.vue` 只通过 props/emits 渲染与发事件，不直接调用 API。

**技术栈：** Vue 3、TypeScript strict、Axios adapter、Vitest、happy-dom。

---

## 后端 contract 来源

- `zhicore-go/docs/contracts/http.md`
- `zhicore-go/docs/contracts/pagination.md`
- `zhicore-go/docs/contracts/errors.md`
- `zhicore-go/services/zhicore-comment/api/http/endpoints/create-comment.md`
- `zhicore-go/services/zhicore-comment/api/http/endpoints/list-comments-page.md`
- `zhicore-go/services/zhicore-comment/api/http/endpoints/list-replies-page.md`
- `zhicore-go/services/zhicore-comment/api/http/endpoints/like-comment.md`
- `zhicore-go/services/zhicore-comment/api/http/endpoints/unlike-comment.md`
- `zhicore-go/services/zhicore-comment/api/http/endpoints/get-like-status.md`

## contract 摘要

- 回复沿用 `POST /v1/posts/{postId}/comments`，body 增加 `parentCommentId`。
- `GET /v1/posts/{postId}/comments/{commentId}/replies/page`：query `page` 默认 `1`、`size` 默认 `20` 且范围 `1..100`、`sort` 为 `HOT|TIME`。
- `POST /v1/posts/{postId}/comments/{commentId}/like`：返回 `{ liked: true, changed, occurredAt }`。
- `DELETE /v1/posts/{postId}/comments/{commentId}/like`：返回 `{ liked: false, changed, occurredAt }`。
- `GET /v1/posts/{postId}/comments/{commentId}/liked`：返回 `{ liked }`。

## 文件结构

- 修改：`src/api/comment.ts`
  - 增加 replies page、like、unlike、liked adapter。
- 修改：`src/api/__tests__/comment.spec.ts`
  - 增加 comment interaction contract 测试。
- 修改：`src/features/content-detail/composables/useContentDetailPage.ts`
  - 增加每条评论的回复和点赞 workflow。
- 修改：`src/features/content-detail/__tests__/useContentDetailPage.spec.ts`
  - 覆盖 reply/like 状态机。
- 修改：`src/components/content/ArticleComments.vue`
  - 把按钮改为 emits，不在组件内做业务决策。
- 修改：`src/components/content/__tests__/ArticleComments.spec.ts`
  - 覆盖按钮可用性、emits 和草稿保留。

## 任务 1：扩展 comment API adapter

**测试立场：** TDD - adapter 路径、method、query 和 body 必须与后端 contract 对齐。

**验收清单：**

- [ ] `createComment()` 支持可选 `parentCommentId`，用于回复。
- [ ] `listRepliesPage()` 使用 replies page path，并传 `page`、`size`、`sort`。
- [ ] `likeComment()` 使用 `POST`，`unlikeComment()` 使用 `DELETE`。
- [ ] `getCommentLikeStatus()` 使用 `GET .../liked`。
- [ ] adapter 不假设 like/unlike 返回新计数。
- [ ] `sort` 只允许 `HOT|TIME`，前端小写状态在 feature 层转换。

- [ ] **步骤 1：写失败测试**

  修改 `src/api/__tests__/comment.spec.ts`，增加回复和点赞 endpoint 测试。

  运行：`pnpm exec vitest run src/api/__tests__/comment.spec.ts`

  预期：缺少 adapter 函数或字段失败。

- [ ] **步骤 2：实现 adapter**

  修改 `src/api/comment.ts`，保持既有 axios/envelope 模式。

- [ ] **步骤 3：运行 adapter 验证**

  运行：`pnpm exec vitest run src/api/__tests__/comment.spec.ts`

  预期：PASS。

## 任务 2：实现 content-detail 评论 workflow

**测试立场：** TDD - 回复、点赞、提交防重、失败保留草稿和响应丢弃都是行为逻辑。

**验收清单：**

- [ ] 回复草稿按根评论 id 独立保存。
- [ ] 回复提交复用顶层评论的长度限制和登录要求。
- [ ] 回复提交中防重；失败保留对应 `replyDraft` 并显示错误。
- [ ] 回复列表按根评论独立 `loading/error/page/hasMore`。
- [ ] 点赞按钮根据 `viewer.liked` 调用 like 或 unlike。
- [ ] like/unlike 返回不含计数时，只在 `changed=true` 时本地 `+1/-1`，`changed=false` 不改计数；或者选择重载评论页，但不能凭空设置任意数。
- [ ] 旧的 replies 响应不能覆盖用户后来展开的目标状态。
- [ ] `2006` 未登录要走登录要求，不吞错误。

- [ ] **步骤 1：写失败测试**

  修改 `src/features/content-detail/__tests__/useContentDetailPage.spec.ts`，覆盖回复发布、回复加载、点赞、取消点赞、失败回滚和防重。

  运行：`pnpm exec vitest run src/features/content-detail/__tests__/useContentDetailPage.spec.ts`

  预期：当前 workflow 不具备这些命令，测试失败。

- [ ] **步骤 2：实现 workflow**

  在 `useContentDetailPage.ts` 增加 `replyDrafts`、`replyStates`、`submittingReplyIds`、`submittingLikeIds`、`loadReplies()`、`submitReply()`、`toggleCommentLike()`。

- [ ] **步骤 3：运行 feature 验证**

  运行：`pnpm exec vitest run src/features/content-detail/__tests__/useContentDetailPage.spec.ts`

  预期：PASS。

## 任务 3：接线 ArticleComments 组件

**测试立场：** TDD - 组件 props/emits 和可访问状态属于可回归行为。

**验收清单：**

- [ ] 回复按钮、提交回复、加载更多回复、点赞按钮通过 emits 通知 feature。
- [ ] `ArticleComments.vue` 不 import `@/api/comment`。
- [ ] 回复提交中禁用对应评论的提交按钮，但不影响其他评论。
- [ ] 点赞提交中只禁用对应评论点赞按钮。
- [ ] “关注讨论”“保存草稿”“引用”“复制链接”没有 contract 的入口移除或显示明确不可用，不保留可误解空按钮。

- [ ] **步骤 1：写组件失败测试**

  修改 `src/components/content/__tests__/ArticleComments.spec.ts`，断言回复和点赞事件。

- [ ] **步骤 2：改造组件 props/emits**

  修改 `ArticleComments.vue`，把当前本地按钮状态替换为 feature 传入的状态和事件。

- [ ] **步骤 3：运行组件和页面验证**

  运行：`pnpm exec vitest run src/components/content/__tests__/ArticleComments.spec.ts src/pages/content/__tests__/ContentDetailRoutePage.spec.ts`

  预期：PASS。

## 集成检查

- [ ] 运行受影响切片验证。

  运行：`pnpm exec vitest run src/api/__tests__/comment.spec.ts src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/components/content/__tests__/ArticleComments.spec.ts src/pages/content/__tests__/ContentDetailRoutePage.spec.ts`

  预期：PASS。

- [ ] 运行类型检查。

  运行：`pnpm typecheck`

  预期：PASS。

## 架构适配评估

| 检查项 | 结论 |
| --- | --- |
| contract | 只接 comment 已验证 endpoint，不实现无 contract 的关注讨论和草稿。 |
| owner | API、content-detail feature、ArticleComments 组件边界清晰。 |
| 状态一致性 | like/unlike 不伪造后端未返回的计数字段。 |
| 二次返工风险 | 后续若补 quote/link/follow contract，可作为独立 comment action 切片扩展。 |
