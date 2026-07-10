# 用户关系动作 Implementation Plan

> **给 agentic workers：** 必需子技能：使用 @subagent-driven-development（推荐）或 @executing-plans 按任务推进；API 和关系动作状态机使用 @test-driven-development。步骤使用 checkbox（`- [ ]`）追踪，完成一个预期结果后立即勾选；如需提交，提交前必须先使用 @committing-changes。

**目标：** 按 user contract 接入关注、取消关注、拉黑、解除拉黑，让具备 `publicId` 的用户动作不再停留在 UI-only。

**架构：** `src/api/user.ts` 拥有关系 endpoint；`src/features/user-profile/composables/useUserRelations.ts` 拥有提交防重、错误映射和乐观/非乐观策略；具体页面或 workspace 只在有 `publicId` 时展示动作并派发事件。Message 会话里的拉黑可复用 User block，删除会话、举报仍保持 Message gate。

**技术栈：** Vue 3、TypeScript strict、Axios adapter、Vitest、happy-dom。

---

## 后端 contract 来源

- `zhicore-go/docs/contracts/http.md`
- `zhicore-go/docs/contracts/pagination.md`
- `zhicore-go/docs/contracts/errors.md`
- `zhicore-go/services/zhicore-user/api/http/endpoints/follow-user.md`
- `zhicore-go/services/zhicore-user/api/http/endpoints/unfollow-user.md`
- `zhicore-go/services/zhicore-user/api/http/endpoints/block-user.md`
- `zhicore-go/services/zhicore-user/api/http/endpoints/unblock-user.md`
- `zhicore-go/services/zhicore-user/api/http/endpoints/list-following.md`
- `zhicore-go/services/zhicore-user/api/http/endpoints/update-profile.md`

## contract 摘要

- `POST /v1/users/{publicId}/follow`：返回 `{ following: true }`。
- `DELETE /v1/users/{publicId}/follow`：返回 `{ following: false }`。
- `POST /v1/users/{publicId}/block`：返回 `{ blocked: true }`。
- `DELETE /v1/users/{publicId}/block`：返回 `{ blocked: false }`。
- 常见错误：`2006` 未登录、`1001` 参数错误、`3001` 用户不存在、`3006` 用户不可用、`3007/3011` 不能操作自己、`3010` 拉黑阻止互动、`1004` 服务不可用。

## 文件结构

- 修改：`src/api/user.ts`
  - 增加 follow/unfollow/block/unblock/listFollowing adapter。
- 修改：`src/api/__tests__/user.spec.ts`
  - 覆盖关系 endpoint path、method 和错误透传。
- 新增：`src/features/user-profile/composables/useUserRelations.ts`
  - 关系动作 owner。
- 新增：`src/features/user-profile/__tests__/useUserRelations.spec.ts`
  - 覆盖防重、失败不更新、未登录处理。
- 按实际入口修改：`src/features/community/ui/CommunityWorkspace.vue`
  - 仅在 item 有 `author.publicId` 或明确用户对象时展示关注。
- 按实际入口修改：`src/features/message/composables/useMessageCenterPage.ts`
  - 仅接入 User block；不实现 Message 删除/举报。
- 按实际入口修改：`src/pages/home/HomeMessagesRoutePage.vue`
  - 会话菜单中的拉黑按钮接 User block 或保持 gate。

## 任务 1：扩展 user API adapter

**测试立场：** TDD - user relationship endpoint 是 contract 边界。

**验收清单：**

- [ ] adapter 入参使用公开 `publicId`，不接收内部 `userId`。
- [ ] follow 使用 `POST /v1/users/{publicId}/follow`。
- [ ] unfollow 使用 `DELETE /v1/users/{publicId}/follow`。
- [ ] block 使用 `POST /v1/users/{publicId}/block`。
- [ ] unblock 使用 `DELETE /v1/users/{publicId}/block`。
- [ ] `listFollowing()` 使用后端分页 contract，不伪造关注状态。
- [ ] adapter 不吞 `2006`、`3001`、`3007`、`3010`。

- [ ] **步骤 1：写失败测试**

  修改 `src/api/__tests__/user.spec.ts`，增加关系 endpoint 断言。

  运行：`pnpm exec vitest run src/api/__tests__/user.spec.ts`

  预期：缺少函数或路径不匹配导致失败。

- [ ] **步骤 2：实现 adapter**

  修改 `src/api/user.ts`，保持 existing user adapter 风格和 DTO 后缀。

- [ ] **步骤 3：运行 API 验证**

  运行：`pnpm exec vitest run src/api/__tests__/user.spec.ts`

  预期：PASS。

## 任务 2：实现关系动作 composable

**测试立场：** TDD - 提交防重、错误和状态更新是业务行为。

**验收清单：**

- [ ] 每个 `publicId` 独立维护 `submitting`，重复点击不发第二次请求。
- [ ] 关注成功才更新为 `following=true`；失败不乐观保留成功态。
- [ ] 取消关注成功才更新为 `following=false`。
- [ ] 拉黑成功更新 `blocked=true`，并按产品规则清理本地关注态或提示互动受限。
- [ ] 解除拉黑成功更新 `blocked=false`。
- [ ] `2006` 显示登录要求或交给 router/login flow，不吞掉。
- [ ] `3007/3011` 显示不能操作自己的错误。
- [ ] `3010` 显示互动被拉黑阻止，不改成功态。

- [ ] **步骤 1：写失败测试**

  新增 `src/features/user-profile/__tests__/useUserRelations.spec.ts`，覆盖 follow/unfollow/block/unblock 成功、失败和防重。

  运行：`pnpm exec vitest run src/features/user-profile/__tests__/useUserRelations.spec.ts`

  预期：因 composable 不存在失败。

- [ ] **步骤 2：实现 composable**

  新增 `useUserRelations.ts`，导出 `follow()`、`unfollow()`、`block()`、`unblock()`、`isSubmitting(publicId)`、`getError(publicId)`。

- [ ] **步骤 3：运行 feature 验证**

  运行：`pnpm exec vitest run src/features/user-profile/__tests__/useUserRelations.spec.ts`

  预期：PASS。

## 任务 3：接入有 publicId 的 UI 入口

**测试立场：** 混合 - 关系动作行为已有 composable 测试，入口展示用最小组件/页面验证。

**验收清单：**

- [ ] 只有拿到 `publicId` 的用户项才展示关注/拉黑可用按钮。
- [ ] 没有 `publicId` 时按钮隐藏或 disabled，不用内部 `id` 拼 path。
- [ ] Community 中若当前只有 post author 快照，关注按钮必须能拿到 author publicId 才启用。
- [ ] Message 会话菜单可先接入拉黑；删除会话、举报因 Message contract 缺失继续 gate。

- [ ] **步骤 1：梳理可接入口**

  检查 `CommunityWorkspace.vue`、message route page 和 user profile 页面，记录哪些对象已有 `publicId`。

- [ ] **步骤 2：接线最小入口**

  优先接入已经有 `publicId` 的入口；没有 publicId 的入口只做禁用/隐藏，不扩展 DTO 猜字段。

- [ ] **步骤 3：运行定向验证**

  运行：`pnpm exec vitest run src/api/__tests__/user.spec.ts src/features/user-profile/__tests__/useUserRelations.spec.ts`

  预期：PASS。

## 集成检查

- [ ] 运行类型检查。

  运行：`pnpm typecheck`

  预期：PASS。

## 架构适配评估

| 检查项 | 结论 |
| --- | --- |
| contract | 只使用 user 已验证 relationship endpoint。 |
| 标识 | 全程使用 `publicId`，不泄漏或猜测内部 user id。 |
| gate | Message 删除/举报不因接入 User block 而伪实现。 |
| 二次返工风险 | 后续用户卡片 DTO 补 publicId 后可扩大接入口，不需要改 adapter。 |
