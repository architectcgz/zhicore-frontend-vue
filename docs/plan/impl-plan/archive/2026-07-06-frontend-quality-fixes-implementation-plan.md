# 前端质量问题修复 Implementation Plan

> 来源：用户提供的上一轮 agent 计划。本文件用于本轮非平凡实现的仓库内执行记录；每个行为切片按 TDD 执行，拆分切片以保持行为不变和边界收敛为目标。

## 目标

- 修复测试 guardrail 误报、登录 redirect 未清洗、文章详情评论 stale 覆盖、local demo 个人资料/API 边界、大页面膨胀 5 项 review finding。
- 继续保留当前未提交的 local demo auth 改动，在其基础上补齐 API adapter mock 与测试。
- 不新增后端接口，不改变现有路由路径，不依赖 `Zone.Identifier` 文件。

## 非目标

- 不重做视觉设计或文案。
- 不提交本轮改动。
- 不为旧接口、旧参数或旧状态额外添加兼容逻辑。

## 架构边界

- `src/api/**` 负责本地 demo API-shaped mock DTO；页面、组件、feature workflow 不新增 demo 分支。
- `src/features/**/composables` 负责表单、异步流程、stale response 和用户动作。
- `src/features/**/ui` 可以承接 page-sized UI；`src/pages/**` 保留 route/context/workflow 装配和少量事件转发。
- 登录/注册 redirect 清洗使用共享 helper，登录和注册共用。

## 任务切片

### 1. 测试 guardrail 与 auth redirect

- [x] 调整 `src/__tests__/pageLayerSeparation.spec.ts`，避免用脆弱字符串误判 props 类型中的 `comments` 字段。
- [x] 提取 redirect 清洗 helper，登录和注册共用。
- [x] 为 `useLoginForm` 增加 unsafe redirect 回归测试，确认外部 URL、协议 URL、空值和非字符串回退 `/`。
- 验证：`pnpm test:run src/features/auth/__tests__/useLoginForm.spec.ts src/features/auth/__tests__/useRegisterForm.spec.ts src/__tests__/pageLayerSeparation.spec.ts`

### 2. 内容详情评论 stale response

- [x] 在 `useContentDetailPage()` 首屏评论请求中引入独立 comments request guard。
- [x] 评论排序切换后的新结果不得被旧首屏评论响应覆盖。
- [x] 主文章详情和 engagement degraded 路径继续进入 ready，不因丢弃旧评论响应卡住 loading。
- 验证：`pnpm test:run src/features/content-detail/__tests__/useContentDetailPage.spec.ts`

### 3. Local demo 个人资料/API 边界

- [x] `src/api/user.ts` 在 local demo 下返回真实 DTO shape，且不调用 axios。
- [x] `src/api/file.ts` 在 local demo 下返回真实 DTO shape，且不调用 axios。
- [x] 移除 `useUserProfile()` 内部直接设置 demo auth 的分支，依赖路由守卫已有 `setLocalDemoAuth()`。
- [x] 保存表单和头像上传仍走正常 feature workflow。
- 验证：`pnpm test:run src/api/__tests__/user.spec.ts src/api/__tests__/file.spec.ts src/pages/user/__tests__/UserProfileRoutePage.spec.ts`

### 4. 大页面拆分

- [x] `ExploreRoutePage` 保留 route/auth/redirect 装配，把展示模板、sidebar 和 derived display 数据迁移到 `features/home-discovery/ui`。
- [x] `CommunityRoutePage` 保留 `useCommunityPage()` 装配，把三栏布局、topic icon 映射、degraded UI 迁移到 `features/community/ui`。
- [x] `LoginRoutePage` 变成薄 route shell，把登录/注册 UI、密码可见性和模式展示迁移到 `features/auth/ui`。
- [x] 拆分后不改变 URL、props/emits 语义或用户可见文案。
- 验证：`pnpm test:run src/pages/explore/__tests__/ExploreRoutePage.spec.ts src/pages/auth/__tests__/LoginRoutePage.spec.ts src/features/community/__tests__/useCommunityPage.spec.ts`

## 集成验证

- [x] `pnpm typecheck`
- [x] `pnpm test:run`
- [x] 若全量测试出现 `ECONNREFUSED 127.0.0.1:3000`，定位触发测试并补 mock/隔离；交付说明 warning 是否消失。

验证结果：

- `pnpm test:run src/features/auth/__tests__/useLoginForm.spec.ts src/features/auth/__tests__/useRegisterForm.spec.ts src/__tests__/pageLayerSeparation.spec.ts src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/api/__tests__/user.spec.ts src/api/__tests__/file.spec.ts src/pages/user/__tests__/UserProfileRoutePage.spec.ts src/pages/explore/__tests__/ExploreRoutePage.spec.ts src/pages/community/__tests__/CommunityRoutePage.spec.ts src/pages/auth/__tests__/LoginRoutePage.spec.ts src/features/community/__tests__/useCommunityPage.spec.ts`：通过，11 个文件 / 44 个测试。
- `pnpm test:run src/layouts/__tests__/AppLayout.spec.ts`：通过，`ECONNREFUSED 127.0.0.1:3000` warning 已消失。
- `pnpm test:run`：通过，66 个文件 / 338 个测试，未再出现 `ECONNREFUSED 127.0.0.1:3000`。
- `pnpm typecheck`：通过。

## 回退说明

- 行为修复可按切片回退对应 helper/composable/API adapter 和测试。
- 页面拆分保持 route page contract 不变；如发现组件边界不合适，可回退到 route page 装配旧 UI，但保留已通过的行为修复。
