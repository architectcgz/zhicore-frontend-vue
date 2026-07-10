# 编辑器 Markdown 常用语法实现计划

> **给 agentic workers：** 必须按 TDD 执行。每个实现步骤完成并验证后，立即更新对应 checkbox。

**目标：** 为 ZhiCore 编辑器补齐 inline code、italic、strikethrough、heading、blockquote、ul/ol/task list、image 的编译和预览能力。

**架构：** 解析逻辑仍归属 `src/features/editor-showcase/model/editorContentCompiler.ts`，输出 typed IR。Vue 组件只消费 IR 做展示，不在模板中解析 Markdown。HTML 输出继续由 compiler 统一转义，避免 `v-html` 和 XSS 风险。

**技术栈：** Vue 3、TypeScript、Vitest、Prettier。

---

## 范围

- 支持 inline：`` `code` ``、`*italic*`、`_italic_`、`~~delete~~`、`**strong**`、`[link](url)`。
- 支持 block：`#` 到 `######`、`>`、`-` / `*`、`1.`、`- [ ]` / `- [x]`、`![alt](url)`、代码块。
- 不引入第三方 Markdown parser；表格和数学渲染不在本次范围。

## 文件

- 修改：`src/features/editor-showcase/model/editorContentCompiler.ts`
- 修改：`src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts`
- 修改：`src/components/editor-showcase/EditorWorkspaceDemo.vue`

## 任务 1：用测试锁定新增语法

- [x] 编写 compiler 失败测试，覆盖 inline code、italic、strikethrough。
- [x] 编写 compiler 失败测试，覆盖 heading、blockquote、ul、ol、task list、image 的 IR 和 HTML。
- [x] 运行 `pnpm exec vitest run src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts`，确认失败来自缺失语法支持。

## 任务 2：扩展 compiler IR 和解析器

- [x] 扩展 `EditorCompiledInlineNode` 和 `EditorCompiledBlock` 类型，给 heading/list/image 等语法提供明确字段。
- [x] 将 inline 解析改成按规则从左到右扫描，保留文本顺序和安全链接过滤。
- [x] 将 block 创建逻辑补齐 heading、blockquote、list、task list、image。
- [x] 更新 HTML 编译输出，确保所有用户文本和属性都经过转义。
- [x] 运行目标 compiler 测试并通过。

## 任务 3：扩展 Vue 预览渲染

- [x] 在 `EditorWorkspaceDemo.vue` 中按 block / inline union 类型渲染新增语法。
- [x] 保持链接和图片地址只使用 compiler 已过滤后的安全 URL。
- [x] 运行 `pnpm exec vue-tsc --noEmit`。

## 任务 4：集成验证

- [x] 运行 `pnpm exec vitest run src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts`。
- [x] 运行 `pnpm exec vue-tsc --noEmit`。
- [x] 运行 `pnpm exec prettier --check src/features/editor-showcase/model/editorContentCompiler.ts src/features/editor-showcase/model/__tests__/editorContentCompiler.spec.ts src/components/editor-showcase/EditorWorkspaceDemo.vue`。
- [x] 运行 `git diff --check`，并对未跟踪新增文件补充运行 `git diff --no-index --check /dev/null <file>`。

## 任务 5：预览渲染策略化重构

- [x] 将重复 inline 节点渲染提取到 `EditorInlineNodes.vue`。
- [x] 将 block 预览提取到 `EditorReaderPreviewBlock.vue`，用 `block.type -> component` 的 registry 分发。
- [x] 从 `EditorWorkspaceDemo.vue` 移除重复 inline/block 条件分支，只保留页面装配。
- [x] 运行 `pnpm test:run`、`pnpm exec vue-tsc --noEmit`、Prettier 检查和空白检查。

## 架构适配评估

- owner 明确：compiler 负责 Markdown 源码到 IR 和 HTML；组件负责基于 IR 的展示。
- 复用点明确：未来 Go 后端可按同一 IR 字段实现对应编译器。
- 结构收敛：本次不会把解析逻辑扩散到 Vue 模板，也不会引入完整 CommonMark 复杂度。
- 风险：列表和引用只支持单层常见写法；嵌套列表、表格、复杂 inline 嵌套留到后续独立任务。
