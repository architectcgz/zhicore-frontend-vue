# 编辑器 Tiptap 引擎迁移方案

> **给 agentic workers：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务逐项执行本计划。步骤使用 checkbox（`- [ ]`）跟踪，达到预期后立即勾选。

**目标：** 将正式 `/editor` 正文编辑运行时从项目手写 ProseMirror `EditorView` 封装迁移到 Tiptap Vue 3 引擎，同时保持保存契约仍为 `PostBodyWriteInput`。

**架构：** Tiptap 只作为前端编辑器运行时和交互命令层；后端写入事实仍由编辑器 JSON 映射到 `schemaVersion + blocks`。组件层只持有 Tiptap 实例生命周期和 DOM 交互，正文草稿、保存、预览、撤销重做仍归 `src/features/editor/model`。

**技术栈：** Vue 3、TypeScript、Vite、Vitest、Tiptap 3.27.1、`@tiptap/vue-3`、`@tiptap/pm`、`@tiptap/starter-kit`、项目现有 `PostBodyWriteInput` contract。

---

## 适用范围

- 本方案只覆盖正式 `/editor`，不改 `/editor-document` 阅读器展示页入口。
- 不把 Tiptap JSON 提交给后端；Tiptap / ProseMirror JSON 仍只是前端运行时和本地草稿状态。
- 不新增 Markdown-like source、HTML 保存或旧 textarea adapter。
- 不为旧 ProseMirror 命名做长期兼容；迁移执行时如果没有明确用户数据持久化要求，可以直接改成 Tiptap-native JSON。

## 当前事实

- 当前 `/editor` 已经完全切到 ProseMirror doc / JSON，核心 owner 是：
  - `src/features/editor/model/editorProseMirrorEngine.ts`
  - `src/features/editor/model/editorProseMirrorToolbarCommands.ts`
  - `src/features/editor/model/useEditorDraft.ts`
  - `src/features/editor/model/useEditorWorkspaceController.ts`
  - `src/components/editor/useEditorWritingBodyEditor.ts`
  - `src/components/editor/EditorWritingPane.vue`
- 当前工作区已经有未提交的 quote/list block-children 契约改动。执行迁移前必须先确认这些改动是本次迁移基线还是另一个待提交任务，避免覆盖。
- Tiptap 3 仍基于 ProseMirror；迁移目标不是“完全移除 ProseMirror 事实”，而是让项目代码不再直接维护 `EditorView` / low-level keymap / command glue。

## 依赖与资料来源

- npm registry 当前版本（2026-07-03 查询）：`@tiptap/vue-3@3.27.1`、`@tiptap/pm@3.27.1`、`@tiptap/starter-kit@3.27.1`。
- Tiptap 官方 Vue 3 用法：`@tiptap/vue-3` 暴露 `EditorContent` / `useEditor`，编辑内容可通过 `editor.getJSON()` 读取。
- Tiptap 官方扩展机制：自定义 node / mark / command 通过 extension 定义，底层 ProseMirror plugin 可由 extension 注入。

## 文件结构目标

- 修改：`package.json`
  - 新增 Tiptap 依赖，移除源码不再直接 import 的 `prosemirror-*` 直接依赖；底层 ProseMirror 包由 `@tiptap/pm` 管理。
- 修改：`pnpm-lock.yaml`
  - 只由 `pnpm install --lockfile-only` 生成最小 lockfile 变更。
- 新增：`src/features/editor/model/editorTiptapEngine.ts`
  - 定义 `EditorTiptapDocumentJson`、默认内容、纯 JSON mapper、plain text、保存校验和 Tiptap extensions。
- 新增：`src/features/editor/model/editorTiptapExtensions.ts`
  - 放自定义 `math_block`、`external_embed`、保存契约 guard extension；如果文件过短，可并入 `editorTiptapEngine.ts`。
- 新增：`src/features/editor/model/editorTiptapToolbarCommands.ts`
  - 用 Tiptap `editor.chain()` / `commands` 实现 toolbar action。
- 删除：`src/features/editor/model/editorProseMirrorEngine.ts`
- 删除：`src/features/editor/model/editorProseMirrorToolbarCommands.ts`
- 修改：`src/features/editor/model/editorFixtures.ts`
  - 默认文档改成 Tiptap JSON / Tiptap extension 支持的节点名。
- 修改：`src/features/editor/model/editorDraftHistory.ts`
  - history snapshot 字段从 `bodyDocumentJson` 的 ProseMirror 类型改成 Tiptap 类型。
- 修改：`src/features/editor/model/useEditorDraft.ts`
  - 改用 Tiptap mapper 和 plain text helper。
- 修改：`src/features/editor/model/useEditorWorkspaceController.ts`
  - writing pane ref 从 `EditorView` 语义改成 Tiptap `Editor` 语义，保留 `focusBody/getBodySelection/setBodySelection/applyBodyToolbarAction` contract。
- 修改：`src/features/editor/model/index.ts`
  - 导出 Tiptap 类型，移除 ProseMirror engine public API。
- 修改：`src/components/editor/useEditorWritingBodyEditor.ts`
  - 改成 Tiptap 实例 owner；如果改名更清晰，迁移为 `useEditorWritingTiptapEditor.ts`。
- 修改：`src/components/editor/EditorWritingPane.vue`
  - 使用 `EditorContent` 渲染正文区，保留当前 toolbar、标题、状态栏和暴露方法。
- 修改：`src/components/editor/EditorWritingPaneProseMirrorBase.css`
  - 改名为 `EditorWritingPaneTiptapBase.css`，但继续覆盖 `.ProseMirror` class，因为 Tiptap 输出仍使用该类。
- 修改测试：
  - `src/features/editor/model/__tests__/editorProseMirrorEngine.spec.ts` -> `editorTiptapEngine.spec.ts`
  - `src/components/editor/__tests__/EditorWritingPane.spec.ts`
  - `src/features/editor/model/__tests__/useEditorDraft.spec.ts`
  - `src/features/editor/model/__tests__/editorDraftHistory.spec.ts`
  - `src/features/editor/model/__tests__/editorArchitecture.spec.ts`
- 修改文档：
  - `docs/contracts/editor-content-contract.md`
  - `docs/design/editor-design.md`

## 迁移策略

推荐使用 Tiptap-native 节点名和命令，而不是在 Tiptap 上复刻当前手写 ProseMirror schema 名称：

- `blockquote` 映射到后端 `quote`。
- `bulletList` / `orderedList` / `taskList` 映射到后端 `list`。
- `listItem` / `taskItem` 映射到后端 `PostBodyListItem`。
- `codeBlock` 映射到后端 `code_block`。
- `table` / `tableRow` / `tableCell` / `tableHeader` 映射到后端 `table`。
- 自定义 `math_block` 和 `external_embed` 保持项目语义。

理由：Tiptap 的价值主要在 extension 和 command 生态。如果继续强行保留当前 `quote/list/list_item` 自定义 schema 名称，会显著削弱 StarterKit、list、task、table command 的收益，并把项目重新带回“自己维护编辑器引擎”的状态。

## 任务 0：执行前基线确认

**测试立场：** 无需 TDD - 只确认工作区和迁移基线。

**文件：**

- 只读：当前 `git status --short`

- [x] **步骤 1：确认当前未提交改动**

运行：`git status --short`

预期：明确哪些文件属于 quote/list block-children 契约改动，哪些文件可以由 Tiptap 迁移接手。

- [x] **步骤 2：确认是否需要隔离 worktree**

如果主工作区仍有其他任务改动，执行迁移前创建独立 worktree；如果这些改动就是迁移前置基线，先由用户或任务 owner 决定提交/保留。

预期：Tiptap 迁移不会覆盖不属于本任务的未提交内容。

## 任务 1：依赖和架构护栏

**测试立场：** 混合 - 依赖变更本身不 TDD，架构边界需要先写失败测试。

**文件：**

- 修改：`package.json`
- 修改：`pnpm-lock.yaml`
- 修改：`src/features/editor/model/__tests__/editorArchitecture.spec.ts`

- [x] **步骤 1：先写架构失败测试**

在 `editorArchitecture.spec.ts` 中加入断言：

```ts
expect(packageJsonSource).toContain('"@tiptap/vue-3"');
expect(packageJsonSource).toContain('"@tiptap/starter-kit"');
expect(writingPaneSource).toContain("@tiptap/vue-3");
expect(writingPaneSource).not.toContain("prosemirror-view");
expect(writingBodyEditorSource).not.toContain("new EditorView");
expect(featureIndexSource).not.toContain("editorProseMirrorEngine");
```

- [x] **步骤 2：运行失败测试**

运行：`pnpm exec vitest run src/features/editor/model/__tests__/editorArchitecture.spec.ts`

预期：失败，原因是当前仍是 ProseMirror engine。

- [x] **步骤 3：安装 Tiptap 依赖**

运行：

```bash
pnpm add @tiptap/vue-3@3.27.1 @tiptap/core@3.27.1 @tiptap/pm@3.27.1 @tiptap/starter-kit@3.27.1 @tiptap/extension-link@3.27.1 @tiptap/extension-underline@3.27.1 @tiptap/extension-table@3.27.1 @tiptap/extension-table-row@3.27.1 @tiptap/extension-table-cell@3.27.1 @tiptap/extension-table-header@3.27.1 @tiptap/extension-task-list@3.27.1 @tiptap/extension-task-item@3.27.1
```

预期：`package.json` 和 `pnpm-lock.yaml` 出现最小依赖变更。

- [x] **步骤 4：移除不再直接使用的 ProseMirror 直接依赖**

运行：

```bash
pnpm remove prosemirror-commands prosemirror-keymap prosemirror-model prosemirror-state prosemirror-view
```

预期：源码不再直接 import 这些包；需要底层类型或 plugin 时从 `@tiptap/pm/*` 进入。

## 任务 2：Tiptap engine 与 mapper

**测试立场：** TDD - 这是正文事实、保存契约和校验边界。

**文件：**

- 新增：`src/features/editor/model/editorTiptapEngine.ts`
- 可选新增：`src/features/editor/model/editorTiptapExtensions.ts`
- 删除：`src/features/editor/model/editorProseMirrorEngine.ts`
- 修改：`src/features/editor/model/editorFixtures.ts`
- 新增/重命名测试：`src/features/editor/model/__tests__/editorTiptapEngine.spec.ts`

- [x] **步骤 1：写失败测试：Tiptap JSON 映射为后端 blocks**

覆盖 paragraph、heading、blockquote、codeBlock、bulletList、orderedList、taskList、table、math_block、external_embed。

- [x] **步骤 2：写失败测试：Markdown-like 标记保持普通文本**

输入 `**普通星号**` 的 Tiptap paragraph JSON，预期输出普通 text，不产生 `bold` mark。

- [x] **步骤 3：写失败测试：超过容器深度会拒绝保存**

构造 `blockquote -> bulletList -> blockquote` 这类超过 `editorPostBodyMaxContainerDepth = 2` 的 JSON，预期 `mapTiptapJsonToPostBodyWriteInput` 抛 `EditorPostBodyMappingError`。

- [x] **步骤 4：实现 Tiptap JSON 类型和 mapper**

核心接口命名：

```ts
import type { JSONContent } from "@tiptap/core";

export type EditorTiptapDocumentJson = JSONContent;

export function createDefaultEditorDocumentJson(): EditorTiptapDocumentJson;
export function getTiptapPlainText(
  documentJson: EditorTiptapDocumentJson,
): string;
export function mapTiptapJsonToPostBodyWriteInput(
  documentJson: EditorTiptapDocumentJson,
): PostBodyWriteInput;
```

业务规则：

- mapper 只接受 Tiptap JSON，不接收 HTML。
- 空 paragraph 输出 `{ type: "paragraph", children: [] }`。
- `blockquote.content` 映射为 `quote.blocks`。
- list item 的 block children 映射为 `PostBodyListItem.blocks`。
- `link.href` 必须复用现有 URL sanitize / allowlist 规则。
- 不安全 `external_embed` 降级或拒绝的策略保持当前代码注释语义；如果用户看不见保存失败原因，优先拒绝并暴露校验状态。

- [x] **步骤 5：实现 Tiptap extensions**

使用 StarterKit 作为基础，补充：

- `Underline`
- `Link`
- `Table` / `TableRow` / `TableCell` / `TableHeader`
- `TaskList` / `TaskItem`
- 自定义 `math_block`
- 自定义 `external_embed`
- 自定义保存契约 guard extension：通过 ProseMirror `filterTransaction` 在 transaction doc 进入 editor state 前检查正文长度和 mapper 兼容性。

- [x] **步骤 6：运行 engine 定向测试**

运行：`pnpm exec vitest run src/features/editor/model/__tests__/editorTiptapEngine.spec.ts`

预期：通过。最终复审修复后实际通过：6 个测试文件 / 64 个测试。

## 任务 3：组件内 Tiptap 实例 owner

**测试立场：** TDD - 涉及第三方实例生命周期、输入事件、选区、长度拒绝和卸载清理。

**文件：**

- 修改/重命名：`src/components/editor/useEditorWritingBodyEditor.ts`
- 修改：`src/components/editor/EditorWritingPane.vue`
- 修改/重命名：`src/components/editor/EditorWritingPaneProseMirrorBase.css`
- 修改：`src/components/editor/__tests__/EditorWritingPane.spec.ts`

- [x] **步骤 1：写失败测试：正文区由 Tiptap `EditorContent` 渲染**

断言不再手写 `contenteditable="true"` 的 `.body-input`，组件导入并使用 `EditorContent`。

- [x] **步骤 2：写失败测试：Tiptap 输入会 emit `bodyDocumentInput`**

通过 exposed `bodyEditor.commands.insertContent("追加")` 或 `chain().insertContent()` 触发更新，预期 emit 的 JSON 纯文本为 `追加草稿正文`。

- [x] **步骤 3：写失败测试：超长或不支持结构不会进入 draft**

用 guard extension 拒绝超长文本或超过容器深度的插入，预期不 emit 更新。

- [x] **步骤 4：实现 Tiptap lifecycle composable**

保留对外 contract：

```ts
interface EditorWorkspaceWritingPaneRef {
  bodyInputElement: HTMLElement | null;
  writingEditorElement: HTMLElement | null;
  focusBody: () => void;
  getBodySelection: () => EditorTextSelection | undefined;
  setBodySelection: (selection: EditorTextSelection) => void;
  applyBodyToolbarAction: (action: EditorToolbarAction) => void;
}
```

内部改为 Tiptap：

- `bodyEditor` 类型为 `Editor | null`。
- `onUpdate` 中读取 `editor.getJSON()` 并 emit。
- `onSelectionUpdate` 维护 `lastBodySelection`。
- props 更新时用 `editor.commands.setContent(nextJson, { emitUpdate: false })` 同步。
- `onBeforeUnmount` / `onScopeDispose` 销毁 editor，清理 scroll timers。

- [x] **步骤 5：保留移动端 toolbar 选区和滚动恢复**

迁移 `preserveBodySelectionBeforeToolbarCommand`、`focusBody`、`setBodySelection` 中的 scroll restore 行为；Tiptap 聚焦必须继续使用 `preventScroll` 或等价滚动恢复。

- [x] **步骤 6：运行 writing pane 定向测试**

运行：`pnpm exec vitest run src/components/editor/__tests__/EditorWritingPane.spec.ts`

预期：通过。最终复审修复后实际通过。

## 任务 4：Toolbar 命令迁移

**测试立场：** TDD - toolbar 是用户动作入口，必须覆盖每个命令产生的文档结构。

**文件：**

- 新增：`src/features/editor/model/editorTiptapToolbarCommands.ts`
- 删除：`src/features/editor/model/editorProseMirrorToolbarCommands.ts`
- 修改：`src/components/editor/useEditorWritingBodyEditor.ts`
- 修改：`src/components/editor/__tests__/EditorWritingPane.spec.ts`

- [x] **步骤 1：写失败测试：inline marks 由 Tiptap marks 表达**

覆盖 `bold`、`italic`、`underline`、`strike`、`inlineCode`、`link`。

- [x] **步骤 2：写失败测试：block actions 由 Tiptap nodes 表达**

覆盖 `heading1` 到 `heading6`、`quote`、`unorderedList`、`orderedList`、`taskList`、`code`、`table`、`math`、`image`。

- [x] **步骤 3：实现命令 adapter**

命名建议：

```ts
export function applyTiptapToolbarAction(
  editor: Editor | null,
  action: EditorToolbarAction,
): void;
```

规则：

- 空选区的 inline mark 插入带 mark 的 placeholder 文本。
- 非空选区使用 Tiptap toggle / set command。
- `quote` 使用 `toggleBlockquote()` 或插入 blockquote content。
- `unorderedList` / `orderedList` / `taskList` 使用 Tiptap list commands。
- `table` 使用 `insertTable({ rows: 2, cols: 2, withHeaderRow: true })`。
- `math` 和 `external_embed` 使用自定义 command 插入自定义节点。

- [x] **步骤 4：运行 toolbar 相关测试**

运行：`pnpm exec vitest run src/components/editor/__tests__/EditorWritingPane.spec.ts src/features/editor/model/__tests__/editorTiptapEngine.spec.ts`

预期：通过。最终复审修复后实际通过：15 个测试文件 / 100 个测试。

## 任务 5：Draft、history、controller 接入 Tiptap JSON

**测试立场：** TDD - 涉及状态事实、撤销重做、保存 dirty 判断、预览和服务端保存请求。

**文件：**

- 修改：`src/features/editor/model/editorDraftHistory.ts`
- 修改：`src/features/editor/model/useEditorDraft.ts`
- 修改：`src/features/editor/model/useEditorWorkspaceController.ts`
- 修改：`src/features/editor/model/index.ts`
- 修改测试：
  - `src/features/editor/model/__tests__/editorDraftHistory.spec.ts`
  - `src/features/editor/model/__tests__/useEditorDraft.spec.ts`
  - `src/features/editor/model/__tests__/useEditorWorkspaceController.spec.ts`

- [x] **步骤 1：写失败测试：draft 初始正文是 Tiptap JSON**

断言 `bodyDocumentJson` 的根节点和默认内容来自 `editorTiptapEngine`，不再 import ProseMirror engine。

- [x] **步骤 2：写失败测试：保存请求仍是 `PostBodyWriteInput`**

使用 rich Tiptap JSON 更新正文，保存后断言请求体只有 `schemaVersion + blocks + base* + clientSavedAt`，不含 Tiptap JSON、HTML、selection。

- [x] **步骤 3：写失败测试：undo/redo 恢复 Tiptap JSON 和正文选区**

保留现有 selection `start/end` 语义；Tiptap selection 仍按 document position 保存。

- [x] **步骤 4：替换 draft 依赖**

将 `useEditorDraft` 内部调用替换为：

- `getTiptapPlainText`
- `mapTiptapJsonToPostBodyWriteInput`
- `EditorTiptapDocumentJson`
- `EditorPostBodyMappingError`

- [x] **步骤 5：替换 controller 类型**

`handleBodyDocumentInput` 接收 `EditorTiptapDocumentJson`，其余 workspace shell contract 不扩散 Tiptap 细节。

- [x] **步骤 6：运行 feature model 定向测试**

运行：

```bash
pnpm exec vitest run \
  src/features/editor/model/__tests__/editorDraftHistory.spec.ts \
  src/features/editor/model/__tests__/useEditorDraft.spec.ts \
  src/features/editor/model/__tests__/useEditorWorkspaceController.spec.ts
```

预期：通过。

## 任务 6：文档、命名和旧入口清理

**测试立场：** 混合 - 文档不 TDD，架构防线和类型检查必须覆盖。

**文件：**

- 修改：`docs/contracts/editor-content-contract.md`
- 修改：`docs/design/editor-design.md`
- 修改：`src/features/editor/model/__tests__/editorArchitecture.spec.ts`
- 删除/重命名所有 `editorProseMirror*` 残留文件。

- [x] **步骤 1：更新契约文档**

说明：

- `/editor` 运行时使用 Tiptap。
- Tiptap JSON 不进入后端 API。
- 保存 mapper 仍输出 `PostBodyWriteInput`。
- Markdown-like 字符串仍不具备格式语义。

- [x] **步骤 2：更新设计文档**

说明：

- toolbar 命令归 Tiptap command adapter。
- CSS 仍可覆盖 `.ProseMirror`，因为这是 Tiptap 编辑 DOM 的稳定 class，不代表项目仍在手写 ProseMirror engine。

- [x] **步骤 3：补架构测试防止旧入口回流**

断言：

- `src/components/editor/useEditorWritingBodyEditor.ts` 不 import `prosemirror-view`、`prosemirror-state`、`prosemirror-keymap`。
- feature public API 不导出 `editorProseMirrorEngine`。
- `useEditorDraft.ts` 不出现 `createProseMirrorDocFromJson`。
- `EditorWritingPane.vue` 使用 `EditorContent`。

- [x] **步骤 4：运行架构测试**

运行：`pnpm exec vitest run src/features/editor/model/__tests__/editorArchitecture.spec.ts`

预期：通过。

## 任务 7：最终验证

**测试立场：** 无需 TDD - 聚合验证。

- [x] **步骤 1：运行编辑器定向测试**

运行：

```bash
pnpm exec vitest run \
  src/features/editor/model/__tests__/editorTiptapEngine.spec.ts \
  src/features/editor/model/__tests__/editorDraftHistory.spec.ts \
  src/features/editor/model/__tests__/useEditorDraft.spec.ts \
  src/features/editor/model/__tests__/useEditorWorkspaceController.spec.ts \
  src/components/editor/__tests__/EditorWritingPane.spec.ts \
  src/features/editor/model/__tests__/editorArchitecture.spec.ts
```

预期：通过。

- [x] **步骤 2：运行类型检查**

运行：`pnpm typecheck`

预期：通过。

- [x] **步骤 3：必要时运行全量测试**

触发条件：依赖迁移、mapper 重命名、reader blocks contract 同时变化或定向测试无法覆盖回归面。

运行：`pnpm test:run`

预期：通过。

- [x] **步骤 4：运行 diff 检查**

运行：`git diff --check`

预期：无 whitespace error。最终复审修复后实际通过。

- [ ] **步骤 5：手动检查 `/editor`**

运行：`pnpm dev`

手动检查：

- 输入中文和英文正文，字数、字符数、dirty 状态更新。
- `B/I/U/S/Link/Code` 能产生格式，不插入 Markdown 标记。
- H1-H6、quote、list、task list、table、math、image placeholder 能进入预览。
- 撤销 / 重做恢复正文和选区。
- 保存草稿请求仍是 `PostBodyWriteInput`。
- 移动端宽度下 toolbar 不遮挡正文关键内容，点击 toolbar 不导致编辑区滚动跳动。

## 架构适配评估

- 计划把 Tiptap 放在组件实例 owner 和 feature mapper owner 之间，没有让 route page、reader 或 API 层接触 Tiptap 细节。
- 保存契约仍由 `PostBodyWriteInput` 约束，避免把前端编辑器 JSON 变成后端事实源。
- 采用 Tiptap-native 节点名会带来一次测试和 fixture 更新，但能换来更低的后续命令维护成本。
- 最大风险是 Tiptap extension 默认 schema 与当前 Content V1 的 quote/list block children 细节不完全一致；这个风险已经放在 engine mapper 和 guard extension 测试中。
- 当前主工作区有未提交编辑器契约改动，执行前必须先决定基线，否则迁移 diff 会混入两类结构变化。

## 残余风险

- Tiptap history extension 和项目自定义 draft history 可能都参与撤销语义。迁移时应禁用或明确绕开 Tiptap 自带 history，继续让项目 `editorDraftHistory` 作为 `/editor` 的撤销事实。
- Tiptap table / task list extension 的 JSON 细节需要以实际测试输出为准；计划中的节点名是目标适配方向，不替代 implementation-time verification。
- 计划阶段未运行测试；测试命令在执行阶段逐项运行。
