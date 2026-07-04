# 知构纸面网格 UI 实现计划

> **给 agent 工作者：** REQUIRED SUB-SKILL: 使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐项实现本计划。步骤使用 checkbox（`- [ ]`）语法追踪。

**目标：** 将 `page-design/` 中已确认的“纸面网格”风格落到真实 Vue 前端，优先覆盖应用壳、首页、内容详情和现有编辑器入口。

**架构：** 保持当前简化 Feature-Sliced Design：route page 负责路由装配，`components/**` 负责展示组件，`features/editor` 继续拥有现有编辑器工作台。第一阶段以静态数据实现页面视觉和组件边界，不引入假 API；后续再接 Content/User/Search/Admin 等真实 provider。

**技术栈：** Vue 3 `<script setup>`、TypeScript、Vue Router、现有 CSS 变量系统、`@lucide/vue` 图标组件。

---

## 范围和顺序

本计划是探索性计划，保存于 `docs/plan/exploratory/`。如果后续进入完整多阶段开发，应提升到 `docs/plan/impl-plan/` 并绑定正式任务。

第一批实现只做可验证的前端展示骨架：

- 应用壳顶栏和全局 token 对齐纸面网格。
- 首页从占位卡片升级为发现流。
- 新增内容详情 route，包含正文、左侧文章导航、右侧阅读操作、文章下方评论区。
- `/editor` 保持现有 `EditorWorkspace`，不重做编辑器，只让应用壳和设计语言与平台统一。

第二批再补：

- 用户主页、搜索/排行、文件、认证、消息通知、管理/运维页面骨架。
- 将静态数据替换为真实 feature workflow 和 API adapter。

## 文件结构

- 修改：`package.json`、`pnpm-lock.yaml`
  - 增加 `@lucide/vue`，正式代码统一用图标库，不复制 `page-design` 的内联 SVG。
- 修改：`src/style.css`
  - 增加纸面网格所需语义 token：阅读背景、弱面板、强调色、成功/警告色、间距和圆角。
- 修改：`src/layouts/AppLayout.vue`
  - 顶栏从“读/写/构”改为正常平台导航：发现、文章、热榜、写作。
- 修改：`src/pages/home/HomeRoutePage.vue`
  - 装配首页发现流。
- 创建：`src/components/home/HomeDiscoveryFeed.vue`
  - 首页推荐流、筛选 tabs、推荐作者、知识结构侧栏。
- 创建：`src/router/routes/contentRoutes.ts`
  - 注册内容详情 route。
- 修改：`src/router/routes/appShellRoute.ts`
  - 引入 `contentRoutes`。
- 创建：`src/pages/content/ContentDetailRoutePage.vue`
  - 文章详情 route page，装配内容详情组件。
- 创建：`src/components/content/ArticleDetailView.vue`
  - 文章详情、TOC、阅读操作和评论区展示。
- 创建：`src/components/content/ArticleComments.vue`
  - 平铺评论列表和展开回复交互。第一阶段为本地静态状态，后续接 Comment feature。

## 测试策略分类

- 设计 token、应用壳、首页静态展示：No TDD，使用 typecheck 和浏览器/构建验证。
- 内容详情 route 注册：No TDD，路由结构简单，使用 typecheck 验证类型，后续有路由行为再补测试。
- 评论“展开回复”交互：Mixed。第一阶段使用原生 `<details>`，无自定义状态；No TDD。后续如果改为 Vue 状态、分页、异步加载回复，则必须补组件测试。

## 任务 1：依赖和全局设计 token

**测试立场：** No TDD - 依赖和纯样式 token。

**文件：**

- 修改：`package.json`
- 修改：`pnpm-lock.yaml`
- 修改：`src/style.css`

- [x] **步骤 1：安装图标库**

运行：`pnpm add @lucide/vue`

预期：`package.json` 和 `pnpm-lock.yaml` 增加 `@lucide/vue`。

- [x] **步骤 2：补充全局 token**

在 `src/style.css` 中增加纸面网格 token，保留现有变量兼容：

- `--color-bg-reading`
- `--color-bg-hover`
- `--color-accent`
- `--color-warning`
- `--space-*`
- `--radius-*`

- [x] **步骤 3：验证**

运行：`pnpm typecheck`

预期：类型检查通过。

## 任务 2：应用壳顶栏

**测试立场：** No TDD - 静态导航和样式改造。

**文件：**

- 修改：`src/layouts/AppLayout.vue`

- [x] **步骤 1：检查当前顶栏结构**

确认 `AppLayout.vue` 仍然只负责应用壳，不直接拥有页面业务状态。

- [x] **步骤 2：改成平台级导航**

导航项：

- 发现：`/`
- 文章：`/posts/demo`
- 热榜：`/ranking`
- 写作：`/editor`

右侧保留“写文章”和“退出”。`/ranking` 第一阶段可暂时指向设计后续 route，若 route 未实现则不要声明 active 依赖。

- [x] **步骤 3：应用纸面网格顶栏样式**

使用 `src/style.css` token，不在组件中堆硬编码色值。

- [x] **步骤 4：验证**

运行：`pnpm typecheck`

预期：类型检查通过。

## 任务 3：首页发现流

**测试立场：** No TDD - 静态展示组件。

**文件：**

- 修改：`src/pages/home/HomeRoutePage.vue`
- 创建：`src/components/home/HomeDiscoveryFeed.vue`

- [x] **步骤 1：提取首页展示组件**

`HomeRoutePage.vue` 只装配 `HomeDiscoveryFeed`。

- [x] **步骤 2：实现发现流**

按 `page-design/home.html` 的信息结构实现：

- 搜索入口
- 推荐 / 最新 / 热门 / 关注 tabs
- 横向文章卡片
- 推荐作者
- 知识结构侧栏

- [x] **步骤 3：验证**

运行：`pnpm typecheck`

预期：类型检查通过，移动端无横向滚动。

## 任务 4：内容详情 route 和页面

**测试立场：** No TDD - 第一阶段为静态展示和路由装配。

**文件：**

- 创建：`src/router/routes/contentRoutes.ts`
- 修改：`src/router/routes/appShellRoute.ts`
- 创建：`src/pages/content/ContentDetailRoutePage.vue`
- 创建：`src/components/content/ArticleDetailView.vue`
- 创建：`src/components/content/ArticleComments.vue`

- [x] **步骤 1：注册内容详情 route**

新增 `/posts/:postId`，示例页面可使用 `/posts/demo`。

- [x] **步骤 2：实现 `ContentDetailRoutePage.vue`**

route page 只装配 `ArticleDetailView`，不直接写大型模板。

- [x] **步骤 3：实现 `ArticleDetailView.vue`**

按已确认规则实现：

- 顶部平台导航保持正常。
- 左侧只显示文章 TOC，不放评论。
- 右侧阅读操作为图标按钮：心形点赞、收藏、评论、分享。
- 评论按钮锚点跳转到文章下方 `#comments`。
- 正文下方展示评论区。

- [x] **步骤 4：实现 `ArticleComments.vue`**

按用户确认规则实现：

- 评论平铺显示。
- 不显式卡片外框，只用细分隔线。
- 回复默认折叠，通过“展开 N 条回复”显示。
- 用户侧不展示审核状态。

- [x] **步骤 5：验证**

运行：`pnpm typecheck`

预期：类型检查通过。

## 任务 5：编辑器入口对齐

**测试立场：** No TDD - 不改编辑器逻辑，只检查应用壳和页面设计一致性。

**文件：**

- 检查：`src/pages/editor/EditorRoutePage.vue`
- 检查：`src/features/editor/ui/EditorWorkspace.vue`
- 可选修改：仅在应用壳改动影响 `/editor` 时修正样式。

- [x] **步骤 1：确认 `/editor` 仍直接渲染 `EditorWorkspace`**

不替换现有编辑器，不复制 `page-design/editor.html`。

- [x] **步骤 2：检查 `appShellFlush` 行为**

确保 `/editor` 仍然使用沉浸式布局，不被普通内容页 padding 干扰。

- [x] **步骤 3：验证**

运行：

- `pnpm typecheck`
- `pnpm test:run src/components/editor/__tests__/EditorWritingPane.spec.ts src/features/editor/ui/__tests__/EditorDesktopWorkspace.spec.ts src/features/editor/ui/__tests__/EditorMobileWorkspace.spec.ts`

预期：类型检查通过，编辑器相关测试通过。

## 任务 6：后续页面骨架

**测试立场：** No TDD - 静态页面骨架；后续接 API 时再进入 TDD。

**文件：**

- 后续创建：`src/pages/user/**`
- 后续创建：`src/pages/search/**`
- 后续创建：`src/pages/file/**`
- 后续创建：`src/pages/message/**`
- 后续创建：`src/pages/admin/**`

- [ ] **步骤 1：按页面 owner 分批新增 route**

不要一次性注册所有空页面。每个页面必须有明确导航入口和后续接入数据的 owner。

- [ ] **步骤 2：从 `page-design` 迁移静态骨架**

每个页面只迁移结构，不把说明性文案当成运行时文案。

- [ ] **步骤 3：验证**

运行：`pnpm typecheck`

预期：类型检查通过。

## 架构适配评估

- 计划遵循项目中文文档规则。
- 当前实现不绕过现有 `features/editor`，避免重做已经存在的编辑器。
- 首页和内容详情用 `components/**` 承载展示组件，route page 保持装配面。
- 第一阶段只使用静态本地数据，不伪造 API owner；接真实数据时再在 `features/**` 和 `api/**` 中建立 workflow。
- 评论折叠当前用原生 `<details>`，无需引入额外状态；以后若变为分页/异步回复，需要转为 TDD。

## 验证清单

- [x] `pnpm typecheck`
- [ ] 首页在 375px、768px、1024px 不横向溢出。
- [x] 内容详情左侧 TOC 不包含评论区。
- [x] 右侧评论图标跳到正文下方评论区。
- [x] 评论平铺显示，回复默认折叠。
- [x] `/editor` 仍使用现有 `EditorWorkspace`。
