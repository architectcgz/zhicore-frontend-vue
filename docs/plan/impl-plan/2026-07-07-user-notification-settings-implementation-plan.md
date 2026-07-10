# 用户通知设置 Implementation Plan

> **给 agentic workers：** 必需子技能：使用 @subagent-driven-development（推荐）或 @executing-plans 按任务推进；API、表单状态和保存流程使用 @test-driven-development。步骤使用 checkbox（`- [ ]`）追踪，完成一个预期结果后立即勾选；如需提交，提交前必须先使用 @committing-changes。

**目标：** 把个人设置中的“通知设置”从禁用导航变成可加载、可编辑、可保存的真实设置面板。

**架构：** notification preferences 和 DND 的 HTTP 细节进入 `src/api/notification.ts`；设置页状态、dirty/saving/error、SMS 禁用、时间校验进入 `src/features/user-profile/composables/useNotificationSettings.ts`；`UserProfileSettingsWorkspace.vue` 只接收状态并派发事件。

**技术栈：** Vue 3、TypeScript strict、Axios adapter、Vitest、happy-dom。

---

## 后端 contract 来源

- `zhicore-go/docs/contracts/http.md`
- `zhicore-go/docs/contracts/errors.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/get-notification-preferences.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/update-notification-preferences.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/get-notification-dnd.md`
- `zhicore-go/services/zhicore-notification/api/http/endpoints/update-notification-dnd.md`

## contract 摘要

- `GET /v1/notification-preferences`：返回 `preferences[]`，每项包含 `notificationType` 和 `channels.inApp/websocket/email/sms`。
- `PUT /v1/notification-preferences`：提交完整或后端要求的 preferences payload；第一阶段 `sms` 禁止提交 `true`。
- `GET /v1/notification-dnd`：返回 `enabled`、`startTime`、`endTime`、`timezone`、`categories`、`channels`。
- `PUT /v1/notification-dnd`：`startTime == endTime` 返回 `1001`，前端应先做本地阻止。
- 常见错误：`1001` 参数错误、`2006` 未登录、`1004` 服务不可用。

## 文件结构

- 修改：`src/api/notification.ts`
  - 在通知中心 adapter 基础上增加 preferences/DND 函数。
- 修改：`src/api/__tests__/notification.spec.ts`
  - 增加设置接口 contract 测试。
- 新增：`src/features/user-profile/composables/useNotificationSettings.ts`
  - 拥有加载、草稿、dirty、保存、错误、字段校验。
- 新增：`src/features/user-profile/__tests__/useNotificationSettings.spec.ts`
  - 覆盖加载、编辑、保存、失败保留草稿、SMS 禁止、时间冲突。
- 修改：`src/features/user-profile/ui/UserProfileSettingsWorkspace.vue`
  - 启用通知设置 tab 并接线 composable。
- 修改：`src/pages/user/__tests__/UserProfileRoutePage.spec.ts`
  - 视现有覆盖范围补页面集成断言。

## 任务 1：补 notification settings API

**测试立场：** TDD - adapter 是 contract 边界。

**验收清单：**

- [ ] `getNotificationPreferences()` 使用 `GET /v1/notification-preferences`。
- [ ] `updateNotificationPreferences()` 使用 `PUT /v1/notification-preferences`。
- [ ] `getNotificationDnd()` 使用 `GET /v1/notification-dnd`。
- [ ] `updateNotificationDnd()` 使用 `PUT /v1/notification-dnd`。
- [ ] adapter 类型保留后端字段名，不把 `inApp` 改成页面专用字段。
- [ ] adapter 不静默改写 `sms`；SMS 禁用规则由 feature 明确处理。

- [ ] **步骤 1：写失败测试**

  在 `src/api/__tests__/notification.spec.ts` 增加四个 endpoint 的 method/path/body 断言。

  运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts`

  预期：缺少对应函数导致失败。

- [ ] **步骤 2：实现 adapter 函数和类型**

  修改 `src/api/notification.ts`，复用 notification adapter 的 axios/envelope 模式。

- [ ] **步骤 3：运行 adapter 验证**

  运行：`pnpm exec vitest run src/api/__tests__/notification.spec.ts`

  预期：PASS。

## 任务 2：实现通知设置 composable

**测试立场：** TDD - 表单状态、校验和保存失败语义是行为逻辑。

**验收清单：**

- [ ] 初次进入并行或顺序加载 preferences 和 DND；任一失败展示对应错误，不把 unknown 当成默认关闭。
- [ ] 草稿和服务端 baseline 分离，修改后 `dirty=true`。
- [ ] 保存 preferences 时 payload 永远不发送 `sms: true`。
- [ ] UI 可显示 SMS 开关但必须不可启用，并给出不可用状态。
- [ ] `startTime == endTime` 本地阻止保存并设置字段错误，不发送请求。
- [ ] 保存失败保留草稿，不切 tab、不重置为 baseline。
- [ ] 保存成功更新 baseline、`dirty=false`、显示 saved 状态。

- [ ] **步骤 1：写失败测试**

  新增 `src/features/user-profile/__tests__/useNotificationSettings.spec.ts`，覆盖加载、dirty、SMS、时间冲突、保存成功和失败。

  运行：`pnpm exec vitest run src/features/user-profile/__tests__/useNotificationSettings.spec.ts`

  预期：因 composable 不存在失败。

- [ ] **步骤 2：实现 composable**

  新增 `useNotificationSettings.ts`，导出状态、草稿、字段错误、`load()`、`toggleChannel()`、`updateDndDraft()`、`savePreferences()`、`saveDnd()`。

- [ ] **步骤 3：运行 feature 验证**

  运行：`pnpm exec vitest run src/features/user-profile/__tests__/useNotificationSettings.spec.ts`

  预期：PASS。

## 任务 3：接线个人设置 UI

**测试立场：** 混合 - tab 接线直接实现，保存行为已由 composable 测试覆盖。

**验收清单：**

- [ ] `settingNavigation` 中“通知设置”有可进入的 `tabId`，不再 disabled。
- [ ] 面板展示 loading、error、dirty、saving、saved 状态。
- [ ] 保存按钮在无 dirty 或 saving 时禁用。
- [ ] 字段错误与 `aria-invalid`/错误提示关联。
- [ ] 账户设置、隐私设置、安全设置、日志管理不在本轮伪实现。

- [ ] **步骤 1：检查现有 settings workspace 结构**

  阅读 `UserProfileSettingsWorkspace.vue`，确认 tab 状态 owner 和样式 owner。

- [ ] **步骤 2：接入通知设置 tab**

  添加通知设置面板，绑定 composable 状态和事件；未实现 tab 保持明确 disabled。

- [ ] **步骤 3：运行页面验证**

  运行：`pnpm exec vitest run src/features/user-profile/__tests__/useNotificationSettings.spec.ts src/pages/user/__tests__/UserProfileRoutePage.spec.ts`

  预期：PASS。

## 集成检查

- [ ] 运行类型检查。

  运行：`pnpm typecheck`

  预期：PASS。

## 架构适配评估

| 检查项 | 结论 |
| --- | --- |
| contract | 只使用 notification preferences/DND 草案字段。 |
| owner | 设置行为在 user-profile feature，HTTP 在 notification API。 |
| UI 降级 | 未实现的其他设置 tab 不伪装完成。 |
| 二次返工风险 | SMS 禁用按当前 contract 显式封装，后端开放后可移除单点规则。 |
