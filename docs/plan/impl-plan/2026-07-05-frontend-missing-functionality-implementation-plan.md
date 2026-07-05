# 前端功能缺口补全 Implementation Plan

> **给 agentic workers：** 必需子技能：实现本计划时使用 @subagent-driven-development 或 @executing-plans 逐任务推进；逻辑切片按 @test-driven-development 执行。每个 checkbox 达到预期后立即更新；如需提交，提交前必须先使用 @committing-changes。

**目标：** 把当前只有 UI 或 local demo 的前端入口补成真实可交互流程，并保留后端 contract 尚未固化场景下的明确降级边界。

**架构：** 继续遵守简化 Feature-Sliced Design：route page 只装配，异步流程、表单状态、loading/error/empty/submitting 和 stale-response 防线进入 `src/features/**/composables`，provider HTTP adapter 放在 `src/api/**`。已达到后端 contract 草案或已验证的接口可以直接接入；Message、Notification、Search 仍停在“API 族已识别”的服务，必须先补字段级 contract，再创建前端 API adapter。

**技术栈：** Vue 3、TypeScript strict mode、Vue Router、Pinia、Axios、Vitest、happy-dom。

---

## 扫描结论

- `src/pages/auth/LoginRoutePage.vue`：登录使用 `useLoginForm()`，但注册仍是 route page 本地 state + `setTimeout`，没有调用 `register()`，也缺少后端要求的 `emailVerificationToken`。
- `src/features/home-discovery/composables/useHomeDiscoveryPage.ts`：首页发现流只返回 `homeDiscoveryMock`；`HomeDiscoveryFeed.vue` 的推荐/热门/关注/话题按钮、点赞、评论、收藏按钮没有真实 handler。
- `src/features/content-detail/composables/useContentDetailPage.ts`：文章详情固定读取 `contentDetailResponseMock`，没有使用 route `postId`，没有请求文章主资源、engagement 或评论；`ArticleDetailView.vue` 的相关链接是 `href="#"`。
- `src/features/editor/composables/useEditorWorkspaceController.ts`：`发布`按钮只尝试先保存草稿，未调用 `publishPost()`；正式入口未创建服务端草稿，也未注入 `saveDraftBody()` 的 server baseline。
- `src/features/message/composables/useMessageCenterPage.ts` 和 `src/features/notification/composables/useNotificationCenterPage.ts`：生产关闭 local demo 后返回 unavailable；Message composer 的发送按钮被 `disabled`，Notification 搜索、全部已读、查看详情没有真实工作流。
- `src/layouts/AppLayout.vue`：全局搜索只 `@submit.prevent`；导航有 `/explore`、`/resources`，但当前路由未注册这些路径。
- 后端事实：`zhicore-go/services/zhicore-message/api/http/README.md` 与 `zhicore-go/services/zhicore-notification/api/http/README.md` 明确写着“暂不创建前端 `src/api/message.ts` / `src/api/notification.ts`，直到 endpoint 达到 Contract 草案”。

## 计划边界

- 本计划补“可见入口的真实行为闭环”，不重做视觉风格和布局系统。
- 后端已验证或草案明确的接口直接进入前端实现：Auth register、Content create/save/publish、Comment page/create、Ranking hot scores、User profile、File。
- 后端只列出 API 族的接口先补 contract gate，再做前端 adapter 和 workflow：Message、Notification、Search、Content 公开列表/详情/engagement 若后端当前分支尚未完成对应 contract，也要先等 contract。
- local demo 可作为开发降级保留，但生产路径不能依赖 mock，也不能把 unknown 显示成确定的空数据或未读数 `0`。

## 文件结构

- 修改：`src/api/auth.ts`
  - 保持 `RegisterReq` / `RegisterResp` 与后端 `register.md` 对齐；必要时补 response mapping helper。
- 新增：`src/features/auth/composables/useRegisterForm.ts`
- 修改：`src/features/auth/index.ts`
- 新增：`src/features/auth/__tests__/useRegisterForm.spec.ts`
- 修改：`src/pages/auth/LoginRoutePage.vue`
- 修改：`src/features/auth/__tests__/useLoginForm.spec.ts`

- 修改：`src/api/post.ts`
  - 增加公开文章列表、文章详情、batch get、engagement、like/favorite adapter；仅在后端 contract 已固化后实现。
- 新增或修改：`src/features/home-discovery/composables/useHomeDiscoveryPage.ts`
- 新增：`src/features/home-discovery/lib/homeDiscoveryMapper.ts`
- 修改：`src/features/home-discovery/types.ts`
- 修改：`src/features/home-discovery/index.ts`
- 修改：`src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts`
- 新增：`src/features/home-discovery/__tests__/homeDiscoveryMapper.spec.ts`
- 修改：`src/components/home/HomeDiscoveryFeed.vue`
- 修改：`src/components/home/__tests__/HomeDiscoveryFeed.spec.ts`
- 修改：`src/pages/home/HomeRoutePage.vue`

- 修改：`src/features/content-detail/composables/useContentDetailPage.ts`
- 修改：`src/features/content-detail/lib/contentDetailResponseMapper.ts`
- 修改：`src/features/content-detail/types.ts`
- 修改：`src/features/content-detail/__tests__/useContentDetailPage.spec.ts`
- 修改：`src/features/content-detail/__tests__/contentDetailResponseMapper.spec.ts`
- 修改：`src/components/content/ArticleDetailView.vue`
- 修改：`src/components/content/ArticleDetailMobileView.vue`
- 修改：`src/components/content/ArticleComments.vue`
- 修改：`src/components/content/__tests__/ArticleDetailView.spec.ts`
- 修改：`src/components/content/__tests__/ArticleDetailMobileView.spec.ts`
- 修改：`src/components/content/__tests__/ArticleComments.spec.ts`
- 修改：`src/pages/content/ContentDetailRoutePage.vue`
- 修改：`src/pages/content/__tests__/ContentDetailRoutePage.spec.ts`

- 修改：`src/features/editor/composables/useEditorDraftSaveWorkflow.ts`
- 修改：`src/features/editor/composables/useEditorWorkspaceController.ts`
- 新增：`src/features/editor/lib/editorPostWorkflowClient.ts`
- 新增：`src/features/editor/__tests__/editorPostWorkflowClient.spec.ts`
- 修改：`src/features/editor/__tests__/useEditorDraftSaveWorkflow.spec.ts`
- 修改：`src/features/editor/__tests__/useEditorWorkspaceController.spec.ts`
- 修改：`src/features/editor/ui/EditorWorkspace.vue`
- 修改：`src/features/editor/ui/__tests__/EditorWorkspace.spec.ts`

- 后端 contract gate 后新增：`src/api/message.ts`
- 修改：`src/features/message/composables/useMessageCenterPage.ts`
- 新增：`src/features/message/lib/messageCenterMapper.ts`
- 修改：`src/features/message/types.ts`
- 修改：`src/features/message/__tests__/useMessageCenterPage.spec.ts`
- 修改：`src/pages/home/HomeMessagesRoutePage.vue`
- 修改：`src/pages/home/HomeMessageDetailRoutePage.vue`
- 修改：`src/pages/home/__tests__/HomeMessagesRoutePage.spec.ts`

- 后端 contract gate 后新增：`src/api/notification.ts`
- 修改：`src/features/notification/composables/useNotificationCenterPage.ts`
- 新增：`src/features/notification/lib/notificationCenterMapper.ts`
- 修改：`src/features/notification/types.ts`
- 修改：`src/features/notification/__tests__/useNotificationCenterPage.spec.ts`
- 修改：`src/pages/home/HomeNotificationsRoutePage.vue`
- 修改：`src/pages/home/__tests__/HomeNotificationsRoutePage.spec.ts`

- 后端 contract gate 后新增：`src/api/search.ts`
- 新增：`src/features/search/composables/useSearchPage.ts`
- 新增：`src/features/search/__tests__/useSearchPage.spec.ts`
- 新增：`src/pages/search/SearchRoutePage.vue`
- 新增：`src/router/routes/searchRoutes.ts`
- 修改：`src/router/routes/appShellRoute.ts`
- 新增：`src/router/__tests__/search-routes.spec.ts`
- 修改：`src/layouts/AppLayout.vue`
- 修改：`src/layouts/__tests__/AppLayout.spec.ts`

- 修改：`docs/contracts/README.md`
  - 登记本次新增或引用的 Message、Notification、Search contract 文档；只在 contract 文件实际补齐时更新。

## 任务 1：注册表单接入真实 Auth API

**测试立场：** TDD - 表单校验、提交防重、错误映射、认证状态和跳转属于行为逻辑。

**验收清单：**

- [x] route page 不再持有注册业务 state；注册 owner 是 `useRegisterForm()`。
- [x] 注册表单字段与后端 `RegisterReq` 对齐：`email`、`nickname`、`password`、`confirmPassword`、`emailVerificationToken`。
- [x] 提交前校验 email 非空且形态合法、nickname 非空、password 非空、confirm 一致、emailVerificationToken 非空。
- [x] 重复提交被 `submitting` guard 拦截，不依赖按钮禁用这一层。
- [x] 成功且 `authenticated=true` 时调用 `authStore.setAuth()` 并跳转 redirect 或 `/`。
- [x] 成功但 `authenticated=false` 时显示“注册成功，可稍后登录”语义，并切回登录表单，不伪造登录态。
- [x] `2009` 映射为 email 字段错误；`2010` 映射 email 格式错误；`2011` 映射密码策略错误；`2012` 显示 pending 可重试；`2015` 显示限流；`1004` 显示服务暂不可用。
- [x] `LoginRoutePage.vue` 仍只是组合登录/注册 composable 和表单 UI。

- [x] **步骤 1：写失败测试**

  运行：`pnpm exec vitest run src/features/auth/__tests__/useRegisterForm.spec.ts`

  预期：新增测试因 `useRegisterForm()` 不存在或未调用 `register()` 失败。

- [x] **步骤 2：实现 `useRegisterForm()`**

  在 composable 内持有字段、field errors、form error、success message、`submitting` 和 `submit()`；捕获 API 错误并就近归属到字段或全局错误。

- [x] **步骤 3：更新登录页注册面板**

  把本地 `setTimeout` 注册逻辑替换为 `useRegisterForm()`；label、`aria-invalid`、`aria-describedby` 与错误区域同步。

- [x] **步骤 4：运行定向验证**

  运行：`pnpm exec vitest run src/features/auth/__tests__/useRegisterForm.spec.ts src/features/auth/__tests__/useLoginForm.spec.ts`

  预期：通过。

- [x] **步骤 5：运行类型检查**

  运行：`pnpm typecheck`

  预期：通过。

## 任务 2：首页发现流接入真实公开内容

**测试立场：** TDD - 列表加载、筛选、stale response、loading/error/empty 和互动入口属于行为逻辑。

**验收清单：**

- [x] 若 `GET /api/v1/posts` contract 尚未固化，先在后端或合同文档补齐字段，再实现 `src/api/post.ts` 的 list adapter。
- [x] 首页初次进入加载公开文章列表；loading 用稳定骨架或固定空位，不展示 mock 内容伪装成功。
- [x] 列表主资源失败显示页面级 retry，不请求 batch engagement。
- [x] 列表为空显示真实 empty，不展示 engagement。
- [x] 分类或搜索变化时归一分页并丢弃过期响应。
- [x] `HomeDiscoveryFeed.vue` 的推荐/热门/关注/话题按钮通过 props/emits 驱动，不使用硬编码 active class。
- [x] 文章卡片标题或评论按钮能进入 `/posts/:postId`；没有 postId 的项不渲染为可点击链接。
- [x] 点赞/收藏按钮：匿名用户跳登录并带 redirect；登录用户在 engagement contract 可用后调用 like/favorite，否则显示中性不可用状态。
- [x] local demo 只在 `isLocalDemoModeEnabled()` 时作为开发 fallback，生产关闭时走真实 loading/error/empty。

- [x] **步骤 1：补 API contract 前置检查**

  结果：已按后端架构文档 `zhicore-go/services/zhicore-content/api/http/endpoints/content-api.md` 的字段级草案推进前端实现；当前 Go handler / contract test 尚未验证 `GET /api/v1/posts`、`POST /api/v1/posts/engagement/batch-status`、like/favorite 命令，真实联调仍可能 404，需后端补 handler / contract test 后解除联调风险。

  已检查 `zhicore-go/services/zhicore-content/api/http/endpoints/content-api.md` 存在 `GET /api/v1/posts`、`PostSummary` 和 engagement batch-status 字段级草案；前端 adapter 以该草案为 source of truth。

- [x] **步骤 2：写失败测试：公开列表加载和失败态**

  运行：`pnpm exec vitest run src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts`

  预期：测试因当前 composable 固定返回 `homeDiscoveryMock` 失败。

- [x] **步骤 3：实现 `src/api/post.ts` list adapter 和 mapper**

  API 层只做 URL、参数、响应归一化；`homeDiscoveryMapper.ts` 做 API DTO 到首页 view model 的转换。

- [x] **步骤 4：改造 `useHomeDiscoveryPage()`**

  加入 `state`、`posts`、`error`、`retry()`、`selectContentCategory()`、`updateSearchQuery()`、请求版本号和 local demo fallback。

- [x] **步骤 5：改造 `HomeDiscoveryFeed.vue`**

  接收状态和事件；把 inert nav/action button 改为真实 emit 或 RouterLink；移除纯硬编码 topic/community 数据或改由 feature 输出。

- [x] **步骤 6：运行定向验证**

  运行：`pnpm exec vitest run src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts src/features/home-discovery/__tests__/homeDiscoveryMapper.spec.ts src/components/home/__tests__/HomeDiscoveryFeed.spec.ts`

  预期：通过。

  实际运行：
  - `pnpm exec vitest run src/api/__tests__/post.spec.ts src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts src/features/home-discovery/__tests__/homeDiscoveryMapper.spec.ts src/components/home/__tests__/HomeDiscoveryFeed.spec.ts` 通过，4 个文件 / 33 个测试。
  - `pnpm typecheck` 通过。
  - `pnpm build` 通过；仍有既有 `@vueuse/core` Rollup pure annotation warning。
  - `git diff --check` 通过。
  - subagent review 后已修复：engagement batch 不再阻塞公开列表、公开首页先恢复 session 再决定 viewer engagement、非 demo 不再展示硬编码热门话题 / 热门社区和 pravatar 假头像、`engagementUnavailable` / `liked` / `favorited` 进入组件按钮 contract。

## 任务 3：文章详情、评论和互动栏接入真实数据

**测试立场：** TDD - route 参数、主资源/附加资源分层、评论提交、错误状态和重复操作属于行为逻辑。

**验收清单：**

- [x] `ContentDetailRoutePage.vue` 从 route 读取 `postId` 并传入 `useContentDetailPage(postId)`。
- [x] 主资源加载失败时不请求 engagement 和 comments。
- [x] 主资源成功后再加载 engagement；engagement 失败只降级互动栏，不遮挡正文。
- [x] 评论列表在文章主资源成功后加载；失败是评论区局部错误，正文继续可读。
- [x] 评论排序变化重置分页并丢弃旧响应。
- [x] 评论提交前校验非空；未登录跳登录；提交中防重；失败保留草稿。
- [x] `ArticleDetailView.vue` 与 `ArticleDetailMobileView.vue` 的点赞、收藏、评论、分享动作均通过 props/emits 表达，不直接调用 API。
- [x] `relatedPosts` 包含真实 `id` 或 `href`；不再使用 `href="#"`。
- [x] engagement unknown 不显示成未点赞/未收藏；计数 unknown 显示中性占位，不显示 `0`。

- [x] **步骤 1：补 Content 详情和 engagement contract 前置检查**

  结果：已按后端架构文档中的 `content-api.md` 字段级草案推进前端实现；当前 Go handler 仍未注册 `GET /api/v1/posts/{postId}`、engagement batch-status、like/favorite 命令，真实联调仍可能 404，需后端补 handler / contract test 后解除联调风险。

  实现使用 `GET /api/v1/posts/{postId}`、`POST /api/v1/posts/engagement/batch-status`、`PUT / DELETE /api/v1/posts/{postId}/like`、`PUT / DELETE /api/v1/posts/{postId}/favorite`，以 `content-api.md` 的当前草案为前端 adapter source of truth。

- [x] **步骤 2：写失败测试：route postId 驱动主资源**

  运行：`pnpm exec vitest run src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/pages/content/__tests__/ContentDetailRoutePage.spec.ts`

  预期：测试因当前 composable 固定 mock 且不接 postId 失败。

- [x] **步骤 3：实现详情 API adapter 和 mapper**

  在 `src/api/post.ts` 补详情、engagement batch-status、like/favorite；在 `contentDetailResponseMapper.ts` 保持 DTO 到 UI view model 映射。

- [x] **步骤 4：接入评论列表和创建评论**

  使用现有 `listCommentsPage()`、`createComment()`；在 feature workflow 持有 `commentsState`、`commentDraftBody`、`submittingComment`、`submitComment()`。

- [x] **步骤 5：组件事件接线**

  更新 desktop/mobile 详情组件和 `ArticleComments.vue` 的 props/emits，移除 `href="#"` 和无 owner 的按钮。

- [x] **步骤 6：运行定向验证**

  运行：`pnpm exec vitest run src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/features/content-detail/__tests__/contentDetailResponseMapper.spec.ts src/components/content/__tests__/ArticleDetailView.spec.ts src/components/content/__tests__/ArticleDetailMobileView.spec.ts src/components/content/__tests__/ArticleComments.spec.ts src/pages/content/__tests__/ContentDetailRoutePage.spec.ts`

  预期：通过。

  实际运行：
  - `pnpm exec vitest run src/api/__tests__/post.spec.ts src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/features/content-detail/__tests__/contentDetailResponseMapper.spec.ts src/components/content/__tests__/ArticleDetailView.spec.ts src/components/content/__tests__/ArticleDetailMobileView.spec.ts src/components/content/__tests__/ArticleComments.spec.ts src/pages/content/__tests__/ContentDetailRoutePage.spec.ts` 通过，7 个文件 / 51 个测试。
  - `pnpm typecheck` 通过。
  - `pnpm build` 通过；仍有既有 `@vueuse/core` Rollup pure annotation warning。
  - `git diff --check` 通过。
  - subagent review 后已修复：`/posts/:postId` 组件复用时重新加载、评论列表失败局部错误和重试、点赞/收藏/分享失败归属与防重、评论排序“热门”语义、评论 key 使用 comment id。

## 任务 4：编辑器创建草稿、保存和发布闭环

**测试立场：** TDD - 草稿 baseline、保存冲突、发布命令、重复提交和错误保留属于行为逻辑。

**验收清单：**

- [x] 没有服务端草稿 baseline 时，首次保存先调用 `createPost()` 创建草稿，再调用或建立可保存 baseline。
- [x] 有 baseline 时 `saveDraftBody()` 请求只携带 `PostBodyWriteInput` 和服务端 baseline 字段，不提交 Tiptap JSON、selection 或本地 hash。
- [x] `publishPost()` 只在服务端 baseline 具备 `draftBodyId` 和 `draftBodyHash` 时调用。
- [x] 发布前若有 dirty draft，先保存；保存失败不调用发布。
- [x] 发布中使用 `isPublishingDraft` 防重；失败保留本地草稿和服务端 baseline。
- [x] 成功发布后展示明确状态，后续可跳转到 `/posts/:postId` 或保留在编辑器并显示已发布。
- [x] `createPost()`、`saveDraftBody()`、`publishPost()` 的错误就近由 editor workflow 处理，不进入全局 Vue error。

- [x] **步骤 1：写失败测试：首次保存创建服务端草稿**

  运行：`pnpm exec vitest run src/features/editor/__tests__/useEditorDraftSaveWorkflow.spec.ts src/features/editor/__tests__/editorPostWorkflowClient.spec.ts`

  预期：当前 workflow 没有创建草稿 client，测试失败。

- [x] **步骤 2：实现 `editorPostWorkflowClient.ts`**

  封装 `createPost()`、`saveDraftBody()`、`publishPost()` 的 editor-specific port；API adapter 仍在 `src/api/post.ts`。

- [x] **步骤 3：扩展 `useEditorDraftSaveWorkflow()`**

  支持 `ensureServerDraft()` 或等价流程；服务端返回的 `postVersion/draftBodyId/draftBodyHash` 更新 baseline。

- [x] **步骤 4：扩展 `useEditorWorkspaceController()` 的发布流程**

  发布按钮调用真实 `publishPost()`，处理保存失败、发布失败、发布成功和重复点击。

- [x] **步骤 5：运行定向验证**

  运行：`pnpm exec vitest run src/features/editor/__tests__/useEditorDraftSaveWorkflow.spec.ts src/features/editor/__tests__/useEditorWorkspaceController.spec.ts src/features/editor/__tests__/editorPostWorkflowClient.spec.ts src/features/editor/ui/__tests__/EditorWorkspace.spec.ts`

  预期：通过。

## 任务 5：Message contract gate 和私信真实流程

**测试立场：** Mixed - contract gate 是文档/架构前置；私信列表、线程、发送、mark read 是 TDD 行为切片。

**验收清单：**

- [ ] 在后端 Message endpoint 达到 `Contract 草案` 前，不新增 `src/api/message.ts`。
- [ ] contract 固定后，前端 API 覆盖：会话列表、会话详情、未读数、发送私信、标记已读。
- [ ] 会话列表失败时列表区域显示 retry，线程清空。
- [ ] 会话为空时显示 empty 和新建私信入口。
- [ ] 进入线程后加载历史；provider 未接入时显示历史暂不可用，不伪造消息。
- [ ] 打开线程后尝试 mark read；失败保留未读 badge 或显示同步失败。
- [ ] composer 发送前校验非空；guard 不可确认时 disabled 并说明原因；发送中防重。
- [ ] 发送失败时消息保留本地失败态，可重试或删除。
- [ ] `HomeMessagesRoutePage.vue` 与 `HomeMessageDetailRoutePage.vue` 共享同一个 feature workflow，避免两份消息页面逻辑分叉。

- [x] **步骤 1：完成 contract gate**

  结果：阻塞。`zhicore-message/api/http/README.md` 仍为计划化占位，endpoint 状态是“API 族已识别”，并明确“暂不创建前端 `src/api/message.ts`，直到 endpoint 达到 `Contract 草案`”。

  等待或补齐 `zhicore-go/services/zhicore-message/api/http/endpoints/*.md`；状态至少从“API 族已识别”进入“Contract 草案”。

- [ ] **步骤 2：写失败测试：非 demo 下加载会话列表**

  运行：`pnpm exec vitest run src/features/message/__tests__/useMessageCenterPage.spec.ts`

  预期：当前非 demo 返回 unavailable，测试失败。

- [ ] **步骤 3：实现 `src/api/message.ts` 和 mapper**

  API 层只做请求和响应归一化；`messageCenterMapper.ts` 处理 DTO 到会话/线程 view model。

- [ ] **步骤 4：改造 `useMessageCenterPage()`**

  加入 list/detail/send/mark-read workflow、loading/error/empty、stale response 和 local demo fallback。

- [ ] **步骤 5：接线消息页面**

  移除 disabled composer；输入框使用 feature draft state；发送按钮和重试动作接 feature handler。

- [ ] **步骤 6：运行定向验证**

  运行：`pnpm exec vitest run src/features/message/__tests__/useMessageCenterPage.spec.ts src/pages/home/__tests__/HomeMessagesRoutePage.spec.ts`

  预期：通过。

## 任务 6：Notification contract gate 和通知中心真实流程

**测试立场：** Mixed - contract gate 是文档/架构前置；通知列表、未读、已读、过滤和搜索是 TDD 行为切片。

**验收清单：**

- [ ] 在后端 Notification endpoint 达到 `Contract 草案` 前，不新增 `src/api/notification.ts`。
- [ ] contract 固定后，前端 API 覆盖：通知列表、未读数、单条已读、全部已读。
- [ ] 未读数 unknown 不参与本地递减；mark read 成功后若原 count unknown，则重新拉取。
- [ ] 切换分类或搜索时重置分页并丢弃旧响应。
- [ ] 列表失败显示页面主体错误和 retry；未读数失败隐藏 badge 或显示 `--`，不显示 `0`。
- [ ] 全部已读 pending 时防重；失败回滚或重新拉取。
- [ ] `查看详情` 根据通知 payload 跳转目标路由；目标详情仍由源服务重新加载。
- [ ] WebSocket 不可用只显示轻量离线状态，HTTP 列表仍可用。

- [x] **步骤 1：完成 contract gate**

  结果：阻塞。`zhicore-notification/api/http/README.md` 仍为计划化占位，endpoint 状态是“API 族已识别”，并明确“暂不创建前端 `src/api/notification.ts`，直到 endpoint 达到 `Contract 草案`”。

  等待或补齐 `zhicore-go/services/zhicore-notification/api/http/endpoints/*.md`；状态至少从“API 族已识别”进入“Contract 草案”。

- [ ] **步骤 2：写失败测试：非 demo 下加载通知列表和未读数**

  运行：`pnpm exec vitest run src/features/notification/__tests__/useNotificationCenterPage.spec.ts`

  预期：当前非 demo 返回 unavailable，测试失败。

- [ ] **步骤 3：实现 `src/api/notification.ts` 和 mapper**

  保持 Notification DTO 与源服务对象 DTO 分离；payload 只作为展示快照和跳转参数。

- [ ] **步骤 4：改造 `useNotificationCenterPage()`**

  加入列表、未读、mark read、mark all read、搜索、分类、分页和 stale response。

- [ ] **步骤 5：接线通知页面**

  搜索输入、全部已读、查看详情、分页都调用 feature handler；移除页面本地业务状态。

- [ ] **步骤 6：运行定向验证**

  运行：`pnpm exec vitest run src/features/notification/__tests__/useNotificationCenterPage.spec.ts src/pages/home/__tests__/HomeNotificationsRoutePage.spec.ts`

  预期：通过。

## 任务 7：导航、搜索和未注册入口收口

**测试立场：** TDD - route 注册、搜索提交、redirect 清洗和可见导航入口属于行为逻辑。

**验收清单：**

- [x] `AppLayout.vue` 中所有可见 RouterLink 都能被 router.resolve 到已注册路由，或被替换为已实现页面入口。
- [x] `/explore` 和 `/resources` 不再是悬空链接；第一阶段可指向真实首页分类/搜索/结构页，或新增最小 route page。
- [x] 全局搜索提交空 query 不跳转；非空 query 跳转 `/search?q=...`。
- [ ] `SearchRoutePage.vue` 进入无 query 时加载热门词；有 query 时调用 `GET /api/v1/search/posts`，搜索服务未达 contract 时停在 gate。
  结果：阻塞。Search contract gate 未满足，本次只显示明确 degraded 状态，不创建 `src/api/search.ts`，也不展示假热门词或假结果。
- [ ] 搜索建议/结果的旧响应被丢弃；搜索失败显示结果区域错误和 retry。
  结果：阻塞。Search contract gate 未满足，未实现请求 workflow，因此不存在旧响应或请求失败分支；页面停在 degraded 状态。
- [x] 移动端和桌面端搜索入口语义一致。
  结果：桌面搜索表单提交到 `/search`；移动端“发现”入口 `/explore` 注册为搜索页入口，不再落入 NotFound。

- [x] **步骤 1：写失败测试：导航链接都有 route match**

  运行：`pnpm exec vitest run src/layouts/__tests__/AppLayout.spec.ts src/router/__tests__/search-routes.spec.ts`

  预期：`/explore`、`/resources` 或 `/search` 缺路由导致失败。

- [x] **步骤 2：完成 Search contract gate**

  若 `zhicore-search` 仍无字段级 contract，先只做 route/navigation 收口，不创建 `src/api/search.ts`。

  结果：阻塞。`zhicore-search/api/http/README.md` 仍为计划化占位，endpoint 状态是“API 族已识别”，并明确“暂不创建前端 `src/api/search.ts`，直到至少一个 endpoint 达到 `Contract 草案`”。

- [x] **步骤 3：实现搜索 route 和 layout submit**

  新增 `searchRoutes.ts`，接入 `appShellRoute.ts`；`AppLayout` 表单持有本地 query 并提交到 router。

- [ ] **步骤 4：实现搜索 feature workflow**

  contract 可用时新增 `useSearchPage()`；contract 不可用时页面显示明确“搜索服务暂未接入”的 degraded 状态，不能展示假结果。

  结果：阻塞。未创建 `src/features/search/**`；本次只实现 `SearchRoutePage.vue` degraded route。

- [x] **步骤 5：运行定向验证**

  运行：`pnpm exec vitest run src/layouts/__tests__/AppLayout.spec.ts src/router/__tests__/search-routes.spec.ts src/features/search/__tests__/useSearchPage.spec.ts`

  预期：通过；若 search contract gate 未满足，跳过 feature 测试并在计划 checkbox 注明阻塞原因。

  实际运行：`pnpm exec vitest run src/layouts/__tests__/AppLayout.spec.ts src/router/__tests__/search-routes.spec.ts` 通过；因 Search contract gate 未满足，未创建 `src/features/search/__tests__/useSearchPage.spec.ts`。

## 集成验证

- [x] 运行架构边界测试。

  运行：`pnpm exec vitest run src/__tests__/apiBoundary.spec.ts src/__tests__/pageLayerSeparation.spec.ts`

  预期：页面、组件、layout 不直接 import `@/api/*`；mock 不进入 UI 组件。

- [x] 运行受影响 feature 和页面测试。

  运行：`pnpm exec vitest run src/features/auth/__tests__ src/features/home-discovery/__tests__ src/features/content-detail/__tests__ src/features/editor/__tests__ src/features/message/__tests__ src/features/notification/__tests__ src/pages/content/__tests__ src/pages/home/__tests__ src/layouts/__tests__ src/router/__tests__`

  预期：通过。

  实际运行：`pnpm exec vitest run src/features/auth/__tests__ src/features/editor/__tests__ src/features/editor/ui/__tests__/EditorWorkspace.spec.ts src/layouts/__tests__/AppLayout.spec.ts src/router/__tests__/search-routes.spec.ts` 通过；Home/Content/Message/Notification 因对应 contract gate 阻塞未执行新增实现切片。

- [x] 运行类型检查。

  运行：`pnpm typecheck`

  预期：通过。

- [x] 视风险运行全量测试。

  运行：`pnpm test:run`

  预期：通过；如果后端 contract gate 未满足导致部分切片未执行，只运行已执行切片相关测试并在最终 handoff 说明。

- [x] 运行生产构建。

  运行：`pnpm build`

  预期：通过。

## 回滚与恢复

- Auth、Home、Content、Editor、Message、Notification、Search 切片应分开提交，便于单独 revert。
- Message、Notification、Search 若 contract gate 未满足，不应留下半成品 adapter；只允许保留明确 degraded 页面或文档记录。
- 任何真实写路径失败都必须保留用户输入：注册字段、评论草稿、编辑器草稿、私信草稿。

## 架构适配评估

- 目标边界明确：route page 装配，feature workflow 拥有状态和异步流程，API adapter 只做 transport 和 DTO 边界归一化。
- 共享复用点明确：文章 provider 能力进入 `src/api/post.ts`；Message/Notification/Search 在后端 contract gate 前不创建 adapter。
- 本计划不只对齐输出行为，也要求移除 route page 本地业务 state、mock 生产依赖、inert button 和悬空 route。
- 结构性债务没有被默认为后续：凡本计划触达的 mock / disabled / href="#" / 空 submit 都在相应切片内闭合或被 contract gate 明确阻塞。
- 风险集中点是后端 contract 不齐。对应切片的完成条件不是“前端先造假 API”，而是 contract gate 达成后再实现。
