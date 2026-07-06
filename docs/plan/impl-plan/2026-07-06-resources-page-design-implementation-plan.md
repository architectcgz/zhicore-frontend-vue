# 资源中心设计还原 Implementation Plan

> **给 agent 工作者：** REQUIRED SUB-SKILL: 使用 `superpowers:executing-plans` 按任务逐项实现本计划。步骤使用 checkbox（`- [ ]`）语法追踪。

**目标：** 按 `docs/design/资源.png` 将 `/resources` 从普通占位页还原为资源中心首屏空态设计，同时保持当前“暂未接入”产品事实。

**架构：** `/resources` 目前是单一路由展示页，不拥有业务请求、状态机或 API 调用。本次只修改 route page 内的静态展示和 scoped 样式，不新增 feature、store、API mock 或全局样式，避免把未接入能力伪装成真实资源数据。

**技术栈：** Vue 3 `<script setup>`、TypeScript、Vue Router、`@lucide/vue`、现有 CSS token、scoped CSS。

---

## 代码分析结论

- 已做：`src/router/routes/resourcesRoutes.ts` 已注册 `/resources`，`AppLayout.vue` 已有资源导航，路由会渲染 `ResourcesRoutePage.vue`。
- 已做：`ResourcesRoutePage.vue` 已包含设计图中的主空态、四个资源类型入口和底部提示，图标使用 `@lucide/vue`，没有 API 或业务状态。
- 未做：当前页面没有设计图中的首屏深色画布比例、页面级极光/星点背景、主卡片背后的光晕、卡片半透明层级和更贴近设计稿的垂直节奏。
- 未做：特性卡片的尺寸、内边距、边框透明度、按钮弱化态、图标比例和 hover/focus 反馈仍偏通用，没有形成资源页自己的视觉系统。
- 未做：移动端只是简单改列数，尚未处理首屏最小高度、卡片网格收口、底部提示换行和减少动效偏好。

## 范围

本计划只覆盖 `/resources` 设计还原：

- 保留“资源中心暂未接入”和四类资源入口的产品语义。
- 不新增真实资源列表、上传、收藏、搜索筛选或异步加载。
- 不修改 `AppLayout.vue`、全局 token、路由结构或 API 层。

## 文件结构

- 修改：`src/pages/resources/ResourcesRoutePage.vue`
  - 将静态入口配置抽为本页局部常量，减少模板重复。
  - 调整资源页 DOM 分区：背景层、主空态、入口网格、底部提示。
  - 用 scoped CSS 实现设计图中的光场、玻璃卡片、入口卡片、响应式收口，并避免非交互卡片暗示可点击。
- 修改：本计划文件
  - 实施时按步骤勾选，作为本次设计还原的执行记录。

## 测试策略

**测试立场：** No TDD - 本次是纯展示、静态文案和 scoped 样式改造，不改变路由、API、状态、权限或异步流程。

最小充分验证：

- `pnpm typecheck`：验证 Vue SFC、`@lucide/vue` 动态组件类型和 TS 编译。
- `pnpm build`：验证生产构建和 CSS 编译。
- 如需要真实视觉确认，可启动 dev server 后检查 `/resources`，但本计划不默认启动长期服务。

## 任务 1：资源页结构与静态配置

**测试立场：** No TDD - route page 内静态展示结构整理。

**文件：**

- 修改：`src/pages/resources/ResourcesRoutePage.vue`

- [x] **步骤 1：保留页面 owner 并抽取入口配置**

将四个入口的标题、说明、图标和状态抽为本页局部 `resourceCategories` 常量；页面仍不 import API、不新增 feature workflow。

预期：模板不再重复四段几乎相同的卡片结构，入口数量和内容仍与设计图一致。

- [x] **步骤 2：调整模板分区**

增加背景层元素、主视觉空态容器、入口网格和底部提示容器；保持 `aria-labelledby="resources-route-title"`。

预期：DOM 结构能承载设计图的背景光场和卡片层级，不改变用户可见文案语义。

## 任务 2：设计图视觉还原

**测试立场：** No TDD - 纯样式实现。

**文件：**

- 修改：`src/pages/resources/ResourcesRoutePage.vue`

- [x] **步骤 1：实现首屏画布**

用页面 scoped CSS 实现接近设计图的深色背景、双侧青绿色光场、细星点、内容最大宽度和首屏垂直居中。

预期：资源页有独立的沉浸式空态画布，但不修改全局 `body` 或其他页面。

- [x] **步骤 2：实现主空态卡片**

调整主卡片宽度、内边距、透明背景、边框、背后光晕、图标尺寸、标题和说明层级。

预期：主卡片与 `资源.png` 中的视觉中心一致，文本在桌面和移动端不溢出。

- [x] **步骤 3：实现四类入口卡片**

调整四列网格、卡片高度、图标、标题、说明、弱按钮和 hover/focus-visible 状态。

预期：四个入口在桌面保持一行四列，窄屏降为两列和单列，交互反馈不造成布局跳动。

- [x] **步骤 4：实现底部提示与非交互状态收口**

对底部提示增加细分隔线和弱强调；入口卡片保持静态展示，不使用会暗示可点击的 hover 位移。

预期：底部提示与设计图一致，未接入入口不被误认为可点击操作。

## 任务 3：验证与计划收口

**测试立场：** No TDD - 构建和类型验证。

**文件：**

- 修改：`docs/plan/impl-plan/2026-07-06-resources-page-design-implementation-plan.md`

- [x] **步骤 1：运行类型检查**

运行：`pnpm typecheck`

预期：通过。

- [x] **步骤 2：运行生产构建**

运行：`pnpm build`

预期：通过。

- [x] **步骤 3：勾选计划完成项并自查**

确认计划 checkbox 反映实际完成状态；检查变更只触达资源页和计划文档。

预期：`git diff -- src/pages/resources/ResourcesRoutePage.vue docs/plan/impl-plan/2026-07-06-resources-page-design-implementation-plan.md` 能清楚展示本次设计还原范围。

## 架构适配评估

- 边界清晰：资源页目前没有真实业务能力，本计划不新增 API/mock/store，符合 route page 只做装配和展示的边界。
- 复用点清晰：图标继续来自 `@lucide/vue`；颜色、字号、间距优先使用现有 token，页面特有光场限定在 scoped CSS。
- 结构收敛：当前页面不是大型控制器，也没有状态 owner 混杂；本次不需要抽组件，避免过早引入 `components/resources`。
- 隐藏重构风险：未来资源中心接入真实文件/资料/素材/收藏时，应另开 feature/API 计划；本次只实现未接入空态，不把后续业务接入混入样式任务。
