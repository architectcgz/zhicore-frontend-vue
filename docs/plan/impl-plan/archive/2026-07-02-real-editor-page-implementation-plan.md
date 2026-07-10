# 真实编辑器页面实现计划

## Plan Summary

- Objective：把 `/editor-showcase` 从 demo 展示页收敛为可用的编辑器工作台，默认专注写作，提供真实草稿脏状态、保存动作、编译后结构状态和发布前预览。
- Non-goals：本次不接后端 Content API，不实现上传图片、协同编辑、发布接口或历史版本合并。
- Source architecture or design docs：`docs/design/editor-design.md`、`docs/contracts/editor-content-contract.md`、`docs/architecture/frontend-engineering-guidelines.md`、`docs/design/css-style-guide.md`、`PRODUCT.md`。
- Dependency order：先补 feature model 行为，再改页面装配和 UI 组件，最后跑测试、类型检查和构建。
- Expected specialist skills：frontend product UI、TDD for composable state、focused visual verification。

## Task 1

- [x] 让编辑器默认进入专注写作，并在 feature model 中暴露真实草稿保存状态。
- Goal：让编辑器默认进入专注写作，并在 feature model 中暴露真实草稿保存状态。
- Touched modules or boundaries：`useEditorShowcaseDisplay.ts`、`useEditorShowcaseDraft.ts` 及对应测试。
- Dependencies：无。
- Validation：`pnpm exec vitest run src/features/editor-showcase/model/__tests__/useEditorShowcaseDisplay.spec.ts src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts`。
- Review focus：状态是否由 feature model 拥有，保存快照是否基于编译后的 `PostBodyWriteInput`，UI 不伪造后端已保存事实。
- Risk notes：当前没有真实后端 API，保存只能表示本地草稿快照，界面文案必须避免暗示服务端成功。

## Task 2

- [x] 把编辑器页面外壳改成工作台形态，移除 demo 链接和假状态，接入保存按钮、草稿状态和结构摘要。
- Goal：把编辑器页面外壳改成工作台形态，移除 demo 链接和假状态，接入保存按钮、草稿状态和结构摘要。
- Touched modules or boundaries：`EditorWorkspaceDemo.vue`、`EditorActionBar.vue`、`EditorWritingPane.vue`、`EditorPreviewPane.vue`。
- Dependencies：Task 1。
- Validation：组件相关测试和 `pnpm typecheck`。
- Review focus：route page 仍保持薄装配，组件只通过 props/emits 消费状态，不 deep import feature model。
- Risk notes：视觉改动需要覆盖桌面和窄屏，不引入嵌套卡片或展示页式 hero。

## Task 3

- [x] 完成集成验证和计划清单收口。
- Goal：完成集成验证和计划清单收口。
- Touched modules or boundaries：测试、类型检查、生产构建、必要时浏览器页面检查。
- Dependencies：Task 1、Task 2。
- Validation：`pnpm test:run`、`pnpm typecheck`、`pnpm build`，如启动 dev server 则检查 `/editor-showcase`。
- Review focus：编辑器工作流是否从输入、保存、预览到结构摘要闭环；是否保留 Content contract 的边界。
- Risk notes：无后端保存接口导致端到端只覆盖前端草稿状态，后续接 API 时需要扩展冲突处理。

## Integration Checks

- 默认进入专注写作，用户可切换到写作 + 预览。
- 修改标题或正文后出现未保存状态，保存草稿后回到已保存状态。
- 结构摘要来自编译后的 `PostBodyWriteInput`，不是硬编码 fake 数据。
- 预览仍通过 `PostBodyReaderBlock` 渲染结构化 blocks，不使用 `v-html`。

## Rollback / Recovery Notes

- 本次改动集中在编辑器 feature 和组件，可整体 revert。
- 未涉及接口、路由重定向、持久化存储、数据库或部署配置。

## Residual Risks

- 草稿保存仍是前端本地快照，不代表服务端持久化。
- 真实后端保存、冲突处理和不支持 block 的回填提示需在后续 API 接入任务中继续实现。
