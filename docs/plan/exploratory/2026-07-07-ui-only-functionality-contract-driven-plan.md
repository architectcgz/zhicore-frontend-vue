# UI-only 功能补齐实施方案

> **给 agentic workers：** 必需子技能：使用 @subagent-driven-development（推荐）或 @executing-plans 按任务推进。步骤使用 checkbox（`- [ ]`）追踪，完成一个预期结果后立即勾选。

**目标：** 按后端 API contract 补齐当前“只有 UI、没有功能闭环”的前端入口，并把后端 contract 未达标的能力保持为明确 gate，不在前端伪造 API。

**架构：** 继续遵守简化 Feature-Sliced Design：route page 只装配，业务状态、异步请求、loading/error/empty/submitting、防重和 stale response 进入 `src/features/**/composables`；HTTP adapter 只放在 `src/api/**`，且字段以 `zhicore-go/services/*/api/http/**` contract 为事实源。Message/Search 仍未达到字段级 contract，不创建 `src/api/message.ts` 或 `src/api/search.ts`。

**技术栈：** Vue 3、TypeScript strict、Vue Router、Pinia、Axios envelope adapter、Vitest、happy-dom。

---

## 方案状态

本文件是探索性实施方案。当前仓库没有在 `AGENTS.md` 中显式声明 formal implementation plan marker；如果进入正式开发流，应提升到 `docs/plan/impl-plan/` 并绑定任务。

## 来源文档

| 来源 | 用途 |
| --- | --- |
| `docs/todos/debt/2026-07-07-ui-only-functionality-audit.md` | UI-only 缺口清单。 |
| `docs/architecture/frontend-engineering-guidelines.md` | 前端 FSD、API adapter、mock、并发和 route/page 边界。 |
| `zhicore-go/docs/contracts/http.md` | HTTP envelope、`/api/v1` 版本、认证 header 和错误响应基线。 |
| `zhicore-go/docs/contracts/pagination.md` | page/cursor 分页和过滤规则。 |
| `zhicore-go/docs/contracts/errors.md` | 错误码归属和 `ApiError.code` 分支规则。 |
| `zhicore-go/services/*/api/http/**` | 具体 endpoint 字段级 contract。 |

## API Contract 矩阵

前端 `getAxiosInstance()` 的 `baseURL` 是 `/api`，因此后端 contract 中的 `/api/v1/...` 在 adapter 内写成 `/v1/...`。

| 能力 | 后端 contract 状态 | 前端处理 |
| --- | --- | --- |
| Notification 列表、未读、已读、偏好、免打扰 | `Contract 草案`，见 `zhicore-notification/api/http/README.md` 与 `endpoints/*.md` | 可以新增 `src/api/notification.ts` 和 notification feature workflow。 |
| Comment 顶级评论、回复、点赞/取消点赞/点赞状态 | 已验证，见 `zhicore-comment/api/http/endpoints/*.md` | 可以扩展 `src/api/comment.ts`，接入回复和评论点赞。 |
| User 关注、取消关注、拉黑、解除拉黑、关注列表、资料更新 | 已验证，见 `zhicore-user/api/http/endpoints/*.md` | 可以扩展 `src/api/user.ts`，用于社区关注、会话拉黑等非 Message 写路径。 |
| Content 公开文章列表、批量摘要、文章详情、我的草稿/文章 | 已验证，见 `zhicore-content/api/http/endpoints/*.md` | 可以修正 Explore/Community 的分页与无 contract 筛选；可新增作者工作台列表。 |
| Content 标签/按标签过滤 | 主线 `list-posts.md` 写明 `tag`/`categoryId` 在任务 8 前返回 `1001` | 不把 tag/category 当成可用筛选；现有 topic UI 需降级或等待 taxonomy contract。 |
| Message 会话、发送、未读、mark read | 只有 `API 族已识别`，见 `zhicore-message/api/http/README.md` | 禁止新增 `src/api/message.ts`；消息页继续 contract gate 或只接 User block 等旁路能力。 |
| Search 文章搜索、建议、热门词、历史 | 只有 `API 族已识别`，见 `zhicore-search/api/http/README.md` | 禁止新增 `src/api/search.ts`；搜索页只能保留 degraded 状态。 |
| Resources / Structure | 未发现对应服务级字段 contract | 不实现假资源/结构 API；先做入口治理和 contract gate。 |

## 暂缓项：路由守卫和认证事实

当前阶段需要保持 UI 可直接访问，用于后端 contract 和页面联调；因此不把恢复 router guard 放入本轮实现队列，也不在 `docs/plan/impl-plan/` 保留对应实施计划。

后续若切回生产鉴权验收，再另开独立计划处理 `setupRouterGuards(router)` 注册、`meta.requiresAuth` 跳转、local demo 登录事实和路由测试。

## 任务 2：Notification API adapter 与通知中心真实 workflow

**测试立场：** TDD - 列表加载、分类、分页、未读、全部已读、单条已读、错误和 stale response 都是行为逻辑。

**文件：**
- 新增：`src/api/notification.ts`
- 新增：`src/api/__tests__/notification.spec.ts`
- 修改：`src/features/notification/types.ts`
- 修改：`src/features/notification/composables/useNotificationCenterPage.ts`
- 新增：`src/features/notification/lib/notificationCenterMapper.ts`
- 修改：`src/features/notification/__tests__/useNotificationCenterPage.spec.ts`
- 修改：`src/pages/home/HomeNotificationsRoutePage.vue`
- 修改：`src/pages/home/__tests__/HomeNotificationsRoutePage.spec.ts`
- 修改：`src/layouts/AppLayout.vue`
- 修改：`src/layouts/__tests__/AppLayout.spec.ts`

**后端 contract 摘要：**
- `GET /v1/notifications`：query `cursor?`、`size?` 默认 `20` 最大 `50`、`category?` 取 `INTERACTION|CONTENT|SOCIAL|SYSTEM|SECURITY`、`unreadOnly?` bool；返回 cursor page，items 为聚合通知组。
- `GET /v1/notifications/unread-count`：返回 `{ unreadCount: number }`。
- `GET /v1/notifications/unread/breakdown`：返回 `{ total, interaction, content, social, system, security }`。
- `POST /v1/notifications/{notificationId}/read`：幂等；返回 `{ notificationId, read: true, readAt }`。
- `POST /v1/notifications/read-all`：幂等；返回 `{ readAll: true, readAt, affectedCount }`。
- 错误：`1001` 参数错误、`2006` 未登录、`1004` 服务不可用、单条已读还包括 `1005` 不存在。

**验收清单：**
- [ ] API adapter 使用 `Req`/`Resp` 后缀类型，路径和字段完全来自 contract，不新增未登记字段。
- [ ] local demo 分支只存在于 adapter 或现有 mock 边界；页面和 feature 不新增 mock 开关。
- [ ] feature 初次加载并行拉取列表、未读总数、分类未读；任一附加资源失败不把 unknown 显示为 `0`。
- [ ] 分类切换把 page/cursor 重置并丢弃旧响应；category 映射为后端大写枚举。
- [ ] `unreadOnly`、搜索框当前无后端 contract，不实现搜索；搜索 UI 先隐藏或明确禁用。
- [ ] 全部已读和单条已读都有 submitting guard；失败不做假成功，保留原未读状态并显示错误。
- [ ] 列表 item 点击根据 `targetType`/`targetId` 跳转：`post` 到 `/posts/:id`；未知 target 仅展示快照。
- [ ] `AppLayout` 的通知 badge 读真实 unread count；失败时隐藏 badge，不显示 `0` 伪事实。

- [ ] **步骤 1：写 adapter 失败测试**

运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts`

预期：测试因 `src/api/notification.ts` 不存在失败。

- [ ] **步骤 2：实现 `src/api/notification.ts`**

实现 `listNotifications()`、`getNotificationUnreadCount()`、`getNotificationUnreadBreakdown()`、`markNotificationRead()`、`markAllNotificationsRead()`，并覆盖 canonical path；alias 不作为前端默认路径。

- [ ] **步骤 3：写 feature 失败测试**

运行：`pnpm exec vitest run src/features/notification/__tests__/useNotificationCenterPage.spec.ts`

预期：非 demo 当前返回 unavailable，新增真实加载测试失败。

- [ ] **步骤 4：实现 notification mapper 和 workflow**

在 composable 内持有 `state/error/items/unreadCount/breakdown/selectedCategory/cursor/hasMore/submittingMarkAll/submittingIds`，用 request id 防 stale response。

- [ ] **步骤 5：接线页面 UI**

启用分类、列表点击、全部已读和分页/加载更多；移除或明确禁用没有 contract 的搜索和高级筛选。

- [ ] **步骤 6：接线 Layout badge**

让 Layout 读取 notification feature 的 unread owner；失败隐藏 badge。

- [ ] **步骤 7：运行定向验证**

运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts src/features/notification/__tests__/useNotificationCenterPage.spec.ts src/pages/home/__tests__/HomeNotificationsRoutePage.spec.ts src/layouts/__tests__/AppLayout.spec.ts`

预期：PASS。

## 任务 3：个人设置中的通知设置与免打扰

**测试立场：** Mixed - API/workflow 用 TDD；把禁用 tab 接成设置面板属于 UI 接线。

**文件：**
- 修改：`src/api/notification.ts`
- 修改：`src/api/__tests__/notification.spec.ts`
- 新增：`src/features/user-profile/composables/useNotificationSettings.ts`
- 新增：`src/features/user-profile/__tests__/useNotificationSettings.spec.ts`
- 修改：`src/features/user-profile/ui/UserProfileSettingsWorkspace.vue`

**后端 contract 摘要：**
- `GET/PUT /v1/notification-preferences`：`preferences[].notificationType`、`channels.inApp/websocket/email/sms`；`sms` 第一阶段禁止提交 `true`。
- `GET/PUT /v1/notification-dnd`：`enabled`、`startTime`、`endTime`、`timezone`、`categories`、`channels`；`startTime == endTime` 返回参数错误。

**验收清单：**
- [ ] “通知设置”从 disabled tab 变成可进入 tab。
- [ ] 偏好和免打扰分别有 loading/error/dirty/saving/saved 状态。
- [ ] SMS 开关显示为不可启用；提交 payload 永远不发送 `sms: true`。
- [ ] `startTime == endTime` 在本地先阻止并显示字段错误。
- [ ] 保存失败保留草稿，不关闭或重置 tab。

- [ ] **步骤 1：写 notification settings composable 失败测试**
- [ ] **步骤 2：补 `src/api/notification.ts` preferences/DND adapter**
- [ ] **步骤 3：实现 `useNotificationSettings()`**
- [ ] **步骤 4：接入 `UserProfileSettingsWorkspace.vue` 的通知设置 tab**
- [ ] **步骤 5：运行验证**

运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts src/features/user-profile/__tests__/useNotificationSettings.spec.ts src/pages/user/__tests__/UserProfileRoutePage.spec.ts`

预期：PASS。

## 任务 4：Article Comments 回复和点赞闭环

**测试立场：** TDD - 回复、点赞、取消点赞、提交防重和错误保留属于交互行为。

**文件：**
- 修改：`src/api/comment.ts`
- 修改：`src/api/__tests__/comment.spec.ts`
- 修改：`src/features/content-detail/composables/useContentDetailPage.ts`
- 修改：`src/features/content-detail/__tests__/useContentDetailPage.spec.ts`
- 修改：`src/components/content/ArticleComments.vue`
- 修改：`src/components/content/__tests__/ArticleComments.spec.ts`

**后端 contract 摘要：**
- 回复仍使用 `POST /v1/posts/{postId}/comments`，body 加 `parentCommentId`。
- `GET /v1/posts/{postId}/comments/{commentId}/replies/page`：`page` 默认 1，`size` 默认 20 范围 `1..100`，`sort` 为 `HOT|TIME`。
- `POST /v1/posts/{postId}/comments/{commentId}/like`：返回 `{ liked: true, changed, occurredAt }`，不返回新计数。
- `DELETE /v1/posts/{postId}/comments/{commentId}/like`：返回 `{ liked: false, changed, occurredAt }`。
- `GET /v1/posts/{postId}/comments/{commentId}/liked`：返回 `{ liked }`。

**验收清单：**
- [ ] `src/api/comment.ts` 增加 `listRepliesPage()`、`likeComment()`、`unlikeComment()`、`getCommentLikeStatus()`。
- [ ] 评论点赞按钮根据 `viewer.liked` 决定 like/unlike；返回不含计数时，用 `changed` 做本地 +/-1 或重载评论页，不能凭空改成任意数。
- [ ] 回复发布使用同一个 `commentDraftMaxLength` 和 `parentCommentId`，提交中防重，失败保留 reply draft。
- [ ] 回复列表按根评论独立 loading/error/hasMore，旧响应不能覆盖新目标。
- [ ] “保存草稿”“关注讨论”“引用”“复制链接”没有对应 contract，本轮移除或禁用并记录 owner，不保留可误解空按钮。

- [ ] **步骤 1：写 API 失败测试**
- [ ] **步骤 2：实现 comment adapter**
- [ ] **步骤 3：写 content-detail workflow 失败测试**
- [ ] **步骤 4：实现 reply/like workflow**
- [ ] **步骤 5：接线 ArticleComments props/emits**
- [ ] **步骤 6：运行验证**

运行：`pnpm exec vitest run src/api/__tests__/comment.spec.ts src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/components/content/__tests__/ArticleComments.spec.ts src/pages/content/__tests__/ContentDetailRoutePage.spec.ts`

预期：PASS。

## 任务 5：Explore / Community 与 Content contract 对齐

**测试立场：** Mixed - 列表、分页、排序状态为 TDD；移除无 contract 静态 UI 为直接 UI 收口。

**文件：**
- 修改：`src/api/post.ts`
- 修改：`src/api/__tests__/post.spec.ts`
- 修改：`src/features/home-discovery/composables/useHomeDiscoveryPage.ts`
- 修改：`src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts`
- 修改：`src/features/home-discovery/ui/HomeDiscoveryExploreWorkspace.vue`
- 修改：`src/features/community/composables/useCommunityPage.ts`
- 修改：`src/features/community/__tests__/useCommunityPage.spec.ts`
- 修改：`src/features/community/ui/CommunityWorkspace.vue`

**后端 contract 摘要：**
- `GET /v1/posts` 已验证，query 支持 `cursor`、`limit`、`sort=latest`；`tag`/`categoryId` 在 taxonomy 任务前返回 `1001`。
- `POST /v1/posts/batch-get` 支持最多 100 个公开文章 ID。
- `GET /v1/me/drafts`、`GET /v1/me/posts` 已验证，可用于作者工作台，但不是公开探索页。

**验收清单：**
- [ ] `listPosts()` 的前端类型包含 `nextCursor`、`hasMore`、`limit`；加载更多不再 disabled。
- [ ] `tag`/`categoryId` 不作为默认请求参数；没有 taxonomy contract 前，Community topic 筛选降级为纯展示或移除。
- [ ] Explore 的筛选面板、推荐社区、作者数不再来自 `homeDiscoveryMock` 伪生产事实。
- [ ] Community 中“更多主题”“热门”“待回复”“关注社区”“喜欢/收藏统计”“计数/回复流”没有 contract 的控件移除或明确 disabled，并在 UI 文案中不暗示已实现。
- [ ] 主列表失败显示 retry；附加统计失败不遮挡主列表。

- [ ] **步骤 1：写 listPosts cursor 失败测试**
- [ ] **步骤 2：调整 `src/api/post.ts` cursor page 类型**
- [ ] **步骤 3：实现 Explore 加载更多 workflow**
- [ ] **步骤 4：收口无 contract 静态侧栏**
- [ ] **步骤 5：收口 Community topic/filter 误导入口**
- [ ] **步骤 6：运行验证**

运行：`pnpm exec vitest run src/api/__tests__/post.spec.ts src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts src/features/community/__tests__/useCommunityPage.spec.ts`

预期：PASS。

## 任务 6：User 关系 API 接入可用的用户动作

**测试立场：** TDD - 关注/取消关注/拉黑/解除拉黑都有权限、错误和幂等语义。

**文件：**
- 修改：`src/api/user.ts`
- 修改：`src/api/__tests__/user.spec.ts`
- 新增：`src/features/user-profile/composables/useUserRelations.ts`
- 新增：`src/features/user-profile/__tests__/useUserRelations.spec.ts`
- 按实际入口修改：`src/features/community/ui/CommunityWorkspace.vue` 或用户相关页面

**后端 contract 摘要：**
- `POST/DELETE /v1/users/{publicId}/follow`：返回 `{ following: true|false }`。
- `POST/DELETE /v1/users/{publicId}/block`：返回 `{ blocked: true|false }`。
- 错误：`2006` 未登录、`1001` 参数、`3001` 用户不存在、`3006` 用户不可用、`3007/3011` 不能操作自己、`3010` 拉黑阻止互动、`1004` 服务不可用。

**验收清单：**
- [ ] adapter 不接收内部 `userId`，只使用公开 `publicId`。
- [ ] 重复点击有 submitting guard。
- [ ] 未登录跳登录或显示登录要求，不吞掉 `2006`。
- [ ] 关注/拉黑失败不更新 UI 为成功态。
- [ ] Message 会话菜单中的拉黑可以先接 User block；删除会话、举报仍因 Message contract 缺失保持 gate。

- [ ] **步骤 1：写 user adapter 失败测试**
- [ ] **步骤 2：实现 user relation adapter**
- [ ] **步骤 3：实现 relation composable**
- [ ] **步骤 4：接入有 publicId 的 UI 入口**
- [ ] **步骤 5：运行验证**

运行：`pnpm exec vitest run src/api/__tests__/user.spec.ts src/features/user-profile/__tests__/useUserRelations.spec.ts`

预期：PASS。

## 任务 7：Message / Search contract gate 收口

**测试立场：** No TDD - 不实现缺 contract 的业务逻辑；只做入口和文档收口。

**文件：**
- 修改：`src/features/message/composables/useMessageCenterPage.ts`
- 修改：`src/pages/home/HomeMessagesRoutePage.vue`
- 修改：`src/pages/home/HomeMessageDetailRoutePage.vue`
- 修改：`src/pages/search/SearchRoutePage.vue`
- 修改：`docs/todos/debt/2026-07-07-ui-only-functionality-audit.md`

**验收清单：**
- [ ] 不新增 `src/api/message.ts`。
- [ ] 不新增 `src/api/search.ts`。
- [ ] Message 页面标出 contract gate，不再把本地发送当作真实发送；若保留 local demo，必须只作为开发态示例。
- [ ] Search 页面继续显示 degraded 状态；不展示假热门词、假结果或假历史。
- [ ] debt 文档中保留 Message/Search 的后端 contract 阻塞 owner 和退出条件。

- [ ] **步骤 1：检查后端 README gate**
- [ ] **步骤 2：移除或降级前端误导性可用控件**
- [ ] **步骤 3：更新 debt 记录**
- [ ] **步骤 4：运行最小验证**

运行：`pnpm typecheck`

预期：PASS。

## 任务 8：Resources / Structure 入口治理

**测试立场：** No TDD - 当前无后端字段级 contract，先做产品入口治理和明确降级。

**文件：**
- 修改：`src/pages/resources/ResourcesRoutePage.vue`
- 修改：`src/pages/structure/StructureRoutePage.vue`
- 修改：`src/components/home/HomeOverviewWidget.vue`
- 修改：`src/layouts/AppLayout.vue`
- 修改：`src/layouts/__tests__/AppLayout.spec.ts`

**验收清单：**
- [ ] 没有资源/结构 contract 前，不新增 API adapter。
- [ ] 首页和顶栏不把 Resources/Structure 暗示成已可用生产能力；保留入口时必须明确“暂未接入”。
- [ ] 如果降低导航权重，桌面和移动入口保持一致。
- [ ] 页面保留静态说明时，不出现可点击但无 handler 的业务按钮。

- [ ] **步骤 1：列出所有 Resources/Structure 可见入口**
- [ ] **步骤 2：按产品优先级降级或保留入口**
- [ ] **步骤 3：更新 Layout/HomeOverview 测试**
- [ ] **步骤 4：运行验证**

运行：`pnpm exec vitest run src/layouts/__tests__/AppLayout.spec.ts src/components/home/__tests__/HomeOverviewWidget.spec.ts`

预期：PASS。

## 集成验证

- [ ] 运行架构边界测试。

运行：`pnpm exec vitest run src/__tests__/apiBoundary.spec.ts src/__tests__/pageLayerSeparation.spec.ts`

预期：页面、组件、layout 不直接 import `@/api/*`；mock 不进入 UI 组件。

- [ ] 运行受影响切片测试。

运行：`pnpm exec vitest run src/api/__tests__ src/features/notification/__tests__ src/features/content-detail/__tests__ src/features/home-discovery/__tests__ src/features/community/__tests__ src/features/user-profile/__tests__ src/pages/home/__tests__ src/router/__tests__ src/layouts/__tests__`

预期：PASS。

- [ ] 运行类型检查。

运行：`pnpm typecheck`

预期：PASS。

- [ ] 视改动范围运行生产构建。

运行：`pnpm build`

预期：PASS；若仍有既有 Rollup pure annotation warning，在 handoff 中说明。

## 架构适配评估

| 检查项 | 结论 |
| --- | --- |
| 文档语言 | 本方案正文使用中文；代码标识、路径、命令、HTTP 字段保持原文。 |
| API owner | 只把后端字段级 contract 达标的 endpoint 写入 adapter；Message/Search 明确禁止前端先造假 API。 |
| 分层边界 | route page 只装配，feature 拥有 workflow，API adapter 拥有 DTO 和 transport，组件只收 props/emits。 |
| Mock 边界 | local demo 只能留在 adapter/runtime/session 边界，不进入 page/component/feature 分支。 |
| 结构收敛 | Notification、Comment、User、Content 按真实 owner 收敛；无 contract 的 Resources/Structure/Search/Message 不伪装完成。 |
| 二次返工风险 | Search/Message 的功能实现依赖后端 contract；本方案用 gate 避免立即返工。 |
