# 通知中心真实工作流 Implementation Plan

> **给 agentic workers：** 必需子技能：使用 @subagent-driven-development（推荐）或 @executing-plans 按任务推进；API 和异步工作流切片使用 @test-driven-development。步骤使用 checkbox（`- [ ]`）追踪，完成一个预期结果后立即勾选；如需提交，提交前必须先使用 @committing-changes。

**目标：** 按 notification 后端 contract 接入通知列表、未读数、分类未读、单条已读和全部已读，让 `/notifications` 从 unavailable/local demo 变成真实工作流。

**架构：** `src/api/notification.ts` 只拥有 HTTP 路径、DTO 和 envelope 解包；`src/features/notification/**` 拥有列表状态、分类、分页、提交防重、错误和 stale response；页面只装配 feature 状态和组件事件。没有 contract 的搜索不进入本轮实现。

**技术栈：** Vue 3、TypeScript strict、Axios adapter、Vue Router、Vitest、happy-dom。

---

## 后端 contract 来源

- `zhicore-go/docs/contracts/http.md`：前端 `baseURL` 是 `/api`，adapter 内写 `/v1/...`。
- `zhicore-go/docs/contracts/pagination.md`：cursor page 语义。
- `zhicore-go/docs/contracts/errors.md`：`ApiError.code` 分支。
- `zhicore-go/services/zhicore-notification/api/http/README.md`：服务 contract 状态为 `Contract 草案`。
- `zhicore-go/services/zhicore-notification/api/http/endpoints/list-notifications.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/get-notification-unread-count.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/get-notification-unread-breakdown.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/mark-notification-read.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/mark-all-notifications-read.md`

## contract 摘要

- `GET /v1/notifications`：query `cursor?`、`size?` 默认 `20` 最大 `50`、`category?` 为 `INTERACTION|CONTENT|SOCIAL|SYSTEM|SECURITY`、`unreadOnly?` 为 bool；返回 cursor page。
- `GET /v1/notifications/unread-count`：返回 `{ unreadCount: number }`。
- `GET /v1/notifications/unread/breakdown`：返回 `{ total, interaction, content, social, system, security }`。
- `POST /v1/notifications/{notificationId}/read`：幂等，返回 `{ notificationId, read: true, readAt }`。
- `POST /v1/notifications/read-all`：幂等，返回 `{ readAll: true, readAt, affectedCount }`。
- 错误码：`1001` 参数错误、`2006` 未登录、`1004` 服务不可用；单条已读还包括 `1005` 不存在。

## 文件结构

- 新增：`src/api/notification.ts`
  - 导出 `Notification*Req` / `Notification*Resp` 类型和 adapter 函数。
- 新增：`src/api/__tests__/notification.spec.ts`
  - 覆盖路径、query、body、envelope 和错误透传。
- 修改：`src/features/notification/types.ts`
  - 增加前端 view model 类型，避免页面直接依赖 Resp。
- 新增：`src/features/notification/lib/notificationCenterMapper.ts`
  - 负责后端 DTO 到通知中心 view model 的字段映射。
- 修改：`src/features/notification/composables/useNotificationCenterPage.ts`
  - 持有真实异步状态和命令。
- 修改：`src/features/notification/__tests__/useNotificationCenterPage.spec.ts`
  - 覆盖加载、分页、分类、mark read、mark all 和 stale response。
- 修改：`src/pages/home/HomeNotificationsRoutePage.vue`
  - 接线按钮、分类、加载更多、错误重试。
- 修改：`src/pages/home/__tests__/HomeNotificationsRoutePage.spec.ts`
  - 覆盖页面不再展示 unavailable 作为默认生产状态。
- 修改：`src/layouts/AppLayout.vue`
  - 通知 badge 接真实 unread count。
- 修改：`src/layouts/__tests__/AppLayout.spec.ts`
  - 覆盖 badge 成功、失败隐藏。

## 任务 1：实现 notification API adapter

**测试立场：** TDD - adapter 是后端 contract 的前端边界。

**验收清单：**

- [ ] adapter 路径使用 `/v1/notifications`、`/v1/notifications/unread-count`、`/v1/notifications/unread/breakdown`、`/v1/notifications/{notificationId}/read`、`/v1/notifications/read-all`。
- [ ] DTO 类型使用 `Req` / `Resp` 后缀，不在 API 层引入页面 view model。
- [ ] `category` 只允许后端大写枚举；前端小写 tab 在 feature mapper 中转换。
- [ ] `size` 不超过 `50`；非法参数交给调用方前置限制或后端 `1001`。
- [ ] adapter 不实现搜索参数，因为后端 list contract 没有 search。
- [ ] local demo 如需保留，只能在 adapter 或现有 mock 边界，不能进入页面/feature。

- [ ] **步骤 1：写失败测试**

  新增 `src/api/__tests__/notification.spec.ts`，断言每个函数调用的 method、path、query/body 和返回数据。

  运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts`

  预期：因 `src/api/notification.ts` 不存在失败。

- [ ] **步骤 2：实现 adapter**

  在 `src/api/notification.ts` 使用 `getAxiosInstance()`；只做 request/response 解包，不做 UI fallback。

- [ ] **步骤 3：补错误透传测试**

  覆盖 `2006`、`1004` 不被 adapter 吞掉。

- [ ] **步骤 4：运行 adapter 验证**

  运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts`

  预期：PASS。

## 任务 2：实现通知中心 feature workflow

**测试立场：** TDD - 加载、分类、分页、未读状态和提交防重都是行为逻辑。

**验收清单：**

- [ ] 初次加载并行请求列表、未读总数、分类未读；列表失败进入 error，附加未读失败不能显示假 `0`。
- [ ] 分类切换重置 `cursor`、`hasMore` 和列表，并丢弃旧响应。
- [ ] 加载更多使用 `nextCursor`，`hasMore=false` 时不再发请求。
- [ ] 单条已读有 `submittingIds` 防重；失败保留原未读状态。
- [ ] 全部已读有 `submittingMarkAll` 防重；失败不清空未读状态。
- [ ] item 点击按 `targetType/targetId` 跳转：文章目标到 `/posts/:id`，未知目标只展示快照。
- [ ] 搜索框和高级筛选隐藏或禁用，不能发无 contract 请求。

- [ ] **步骤 1：写失败测试**

  修改 `src/features/notification/__tests__/useNotificationCenterPage.spec.ts`，覆盖初次加载、分类切换、加载更多、单条已读、全部已读和 stale response。

  运行：`pnpm exec vitest run src/features/notification/__tests__/useNotificationCenterPage.spec.ts`

  预期：当前生产路径返回 unavailable，新增测试失败。

- [ ] **步骤 2：实现 mapper**

  新增 `notificationCenterMapper.ts`，把后端 category、target、snapshot、readAt 映射为稳定 view model。

- [ ] **步骤 3：实现 composable**

  在 `useNotificationCenterPage.ts` 内维护 `state`、`items`、`error`、`selectedCategory`、`cursor`、`hasMore`、`unreadCount`、`breakdown`、`submittingIds`、`submittingMarkAll` 和 request id。

- [ ] **步骤 4：运行 feature 验证**

  运行：`pnpm exec vitest run src/features/notification/__tests__/useNotificationCenterPage.spec.ts`

  预期：PASS。

## 任务 3：接线页面和布局 badge

**测试立场：** TDD - 页面事件和 badge 展示属于集成行为。

**验收清单：**

- [ ] `/notifications` 默认不再显示 unavailable；真实 loading/error/empty/success 状态可区分。
- [ ] 分类、加载更多、重试、单条已读、全部已读按钮都从 feature 事件接线。
- [ ] 未实现搜索不展示为可用输入。
- [ ] `AppLayout` badge 成功时显示 unread count；请求失败时隐藏 badge，不显示 `0` 伪事实。

- [ ] **步骤 1：写页面失败测试**

  修改 `HomeNotificationsRoutePage.spec.ts` 和 `AppLayout.spec.ts`，覆盖页面事件与 badge。

- [ ] **步骤 2：接线页面**

  修改 `HomeNotificationsRoutePage.vue`，删除生产 unavailable 默认分支，绑定 feature state。

- [ ] **步骤 3：接线布局**

  修改 `AppLayout.vue`，通过 notification feature 或清晰的 layout composable 读取 unread count；不要让 layout 直接拼 HTTP 细节。

- [ ] **步骤 4：运行定向验证**

  运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts src/features/notification/__tests__/useNotificationCenterPage.spec.ts src/pages/home/__tests__/HomeNotificationsRoutePage.spec.ts src/layouts/__tests__/AppLayout.spec.ts`

  预期：PASS。

## 集成检查

- [ ] 运行 API 边界测试。

  运行：`pnpm exec vitest run src/__tests__/apiBoundary.spec.ts src/__tests__/pageLayerSeparation.spec.ts`

  预期：页面和组件不直接 import `@/api/notification`。

- [ ] 运行类型检查。

  运行：`pnpm typecheck`

  预期：PASS。

## 架构适配评估

| 检查项 | 结论 |
| --- | --- |
| contract | 只接 notification 已达到草案的 endpoint；搜索不伪造。 |
| owner | API、feature、page、layout 职责清晰分离。 |
| mock 边界 | local demo 不进入页面/feature 分支。 |
| 二次返工风险 | 搜索和详情深跳依赖后端补充 contract 时再扩展，不影响本轮列表和已读闭环。 |
