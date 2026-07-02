# 编辑器移动端工作台实现计划

## Plan Summary

- Objective：在同一个 `/editor` 路由下，为编辑器增加移动端单面板工作台 shell，让窄屏用户在写作和预览之间切换，而不是上下堆叠写作区和预览区。
- Non-goals：不新增 `/editor-mobile` 路由，不拆分草稿保存、编译、撤销重做或预览滚动同步的业务状态，不接入后端 Content API。
- Source architecture or design docs：`PRODUCT.md`、`docs/design/editor-design.md`、`docs/design/css-style-guide.md`、`docs/architecture/frontend-engineering-guidelines.md`。
- Dependency order：先用组件/架构测试锁定边界，再拆分桌面和移动端 shell，最后做定向验证和类型检查。
- Expected specialist skills：frontend responsive adaptation、TDD for behavior-bearing component boundaries、focused product UI validation。

## Task 1

- [x] 用测试锁定同路由双 shell 边界。
- Goal：证明 `/editor` 仍通过统一 `EditorWorkspace` 进入，但内部存在桌面和移动端工作台 shell，并且移动端预览模式不再同时渲染写作面板。
- Touched modules or boundaries：`editorShowcaseArchitecture.spec.ts`、新增移动端 workspace 组件测试。
- Dependencies：无。
- Validation：相关测试先失败，再由实现通过。
- Review focus：测试应验证用户可见结构和 owner 边界，不绑定无意义的内部实现细节。
- Risk notes：响应式 CSS 本身不能在 happy-dom 中真实计算，测试只锁定组件结构；视觉仍需浏览器检查。

## Task 2

- [x] 拆分桌面和移动端工作台 shell，共用同一个 controller。
- Goal：`EditorWorkspace.vue` 只负责主题和状态装配，桌面保留原有左右预览能力，移动端提供 sticky 视图切换条和单活动面板。
- Touched modules or boundaries：`EditorWorkspace.vue`、`EditorDesktopWorkspace.vue`、`EditorMobileWorkspace.vue`、`EditorWritingPane.vue`、`EditorPreviewPane.vue`。
- Dependencies：Task 1。
- Validation：组件测试、架构测试、`pnpm typecheck`。
- Review focus：草稿、保存、选区、预览 blocks 和滚动同步仍由 `useEditorWorkspaceController` 拥有；移动端 shell 不复制业务状态。
- Risk notes：移动端隐藏写作面板时，预览页必须保留返回写作入口。

## Task 3

- [x] 完成验证、review 和计划收口。
- Goal：确保移动端适配没有破坏桌面编辑器和已有组件行为。
- Touched modules or boundaries：测试、类型检查、必要时浏览器页面检查。
- Dependencies：Task 1、Task 2。
- Validation：`pnpm exec vitest run ...` 定向测试、`pnpm typecheck`，如需要再启动 dev server 检查 `/editor`。
- Review focus：响应式结构是否符合产品文档，是否引入组件 owner 漂移。
- Risk notes：真实设备键盘弹出和 iOS Safari 地址栏行为需后续人工或真机确认。

## Architecture Fit Evaluation

- Target boundary：`EditorWorkspace.vue` 是 route feature 的统一入口；桌面/移动端 shell 是 UI 编排层；业务状态仍在 `useEditorWorkspaceController`。
- Reuse point：`EditorWritingPane` 和 `EditorPreviewPane` 继续作为渲染组件复用，移动端只改变 shell 和可见面板。
- Structural convergence：本次不仅改 CSS，也把桌面/移动端布局编排从单个工作台中拆出来，避免继续在一个组件里叠加响应式分支。
- Known debt：当前编辑器已完成工作台拆分，本次触及的结构债主要是移动端布局分支混在 `EditorWorkspace.vue` 内；Task 2 会收敛该分支。

## Integration Checks

- 桌面宽屏下仍可在专注写作和写作 + 预览之间切换。
- 窄屏下移动端工作台提供写作/预览切换条。
- 移动端预览模式只展示预览面板，不在下方继续堆叠写作面板。
- `/editor` 路由不变，首页和应用壳链接不需要改。

## Rollback / Recovery Notes

- 本次改动集中在编辑器 feature 和 editor-showcase 组件，可整体 revert。
- 未涉及后端接口、路由迁移、持久化格式或部署配置。

## Residual Risks

- CSS 媒体查询需要浏览器或真机确认；happy-dom 只能验证结构。
- 移动端键盘遮挡工具栏的体验可能还需要后续真机微调。
