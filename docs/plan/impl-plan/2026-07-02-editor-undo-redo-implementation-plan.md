# 编辑器撤销与重做实现计划

> **给 agentic workers：** 必须按 TDD 执行。每个实现步骤完成并验证后，立即更新对应 checkbox。实现本计划前使用 `executing-plans` 或 `subagent-driven-development` 逐任务执行；如需提交，提交前必须先使用 `committing-changes`。

**目标：** 为 `/editor` 正式编辑器补齐稳定的撤销与重做能力，覆盖标题输入、正文输入、toolbar 程序化改写和保存状态回退。

**架构：** 撤销历史归属 `src/features/editor-showcase/model`，以纯 TypeScript history reducer 保存 `title/body/activeField/selection` 快照；`useEditorShowcaseDraft` 统一收口所有编辑 mutation，并暴露 `canUndo/canRedo/undoDraft/redoDraft`。组件只渲染按钮、发出快捷键事件和恢复 DOM 选区，不直接维护历史栈。

**技术栈：** Vue 3、TypeScript strict mode、Vitest、happy-dom。

---

## 背景依据

- 当前标题和正文是 `useEditorShowcaseDraft` 内的 `ref`，正文预览编译已在同一 composable 内做 `160ms` debounce。
- `EditorWorkspace.vue` 现在通过 `v-model:title` 和 `v-model:body` 直接写入 ref，撤销实现前需要改成显式事件入口，避免绕过 history。
- `applyToolbarAction` 会程序化重写正文并恢复选区，不能依赖浏览器 textarea 原生撤销栈。
- 编辑器设计要求“连续文档 + 隐形 blocks 结构层”，撤销能力应保持普通文档写作体验，不引入 block 卡片式编辑状态。

## 范围

- 覆盖标题 textarea、正文 textarea、toolbar markdown action。
- 支持 `undo` 和 `redo`，新编辑会清空 redo 栈。
- 支持正文选区快照，undo/redo 后恢复正文焦点和选区；标题暂不恢复精确选区。
- 普通连续输入合并为一个撤销步骤，toolbar action 单独成为一个撤销步骤。
- 撤销后保存状态由现有 `currentSourceHash` 与 `savedDraftSnapshot.sourceHash` 自然派生，不单独维护保存历史。

## 非目标

- 不实现跨刷新持久化 history。
- 不实现多人协同、服务端版本历史或内容合并。
- 不引入第三方富文本/Markdown 编辑器库。
- 不把浏览器原生 textarea history 与自定义 history 做深度同步。

## 文件结构

- 新增：`src/features/editor-showcase/model/editorDraftHistory.ts`
  - 纯 TypeScript history reducer，不依赖 Vue。
  - 负责快照类型、栈上限、连续输入合并、undo/redo 状态转换。
- 新增：`src/features/editor-showcase/model/__tests__/editorDraftHistory.spec.ts`
  - 覆盖纯 history 行为，避免复杂 DOM 测试承载核心规则。
- 修改：`src/features/editor-showcase/model/useEditorShowcaseDraft.ts`
  - 集成 history reducer，收口 `updateTitle`、`updateBody`、`applyToolbarAction`。
  - 暴露 `canUndo`、`canRedo`、`undoDraft`、`redoDraft`。
- 修改：`src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts`
  - 覆盖 composable 层撤销、重做、保存状态与预览编译关系。
- 修改：`src/features/editor-showcase/model/useEditorWorkspaceController.ts`
  - 把组件更新事件转成带选区的 draft mutation。
  - 执行 undo/redo 后恢复焦点、选区和预览滚动同步。
- 修改：`src/features/editor-showcase/ui/EditorWorkspace.vue`
  - 移除 `v-model:title` / `v-model:body` 直写，改显式 props + event 绑定。
  - 向 `EditorActionBar` 和 `EditorWritingPane` 传递 undo/redo 能力。
- 修改：`src/components/editor-showcase/EditorWritingPane.vue`
  - 暴露正文选区读取能力，发出 `titleInput`、`bodyInput`、`undo`、`redo` 事件。
  - 捕获 `Ctrl/Cmd+Z`、`Ctrl/Cmd+Shift+Z`、`Ctrl/Cmd+Y`。
- 修改：`src/components/editor-showcase/EditorActionBar.vue`
  - 增加撤销、重做按钮，按钮禁用态由 feature model 提供。
- 修改：`src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts`
  - 覆盖快捷键事件和 toolbar 按钮列表更新。

## 任务 1：建立纯 history reducer

**文件：**

- 新增：`src/features/editor-showcase/model/editorDraftHistory.ts`
- 新增：`src/features/editor-showcase/model/__tests__/editorDraftHistory.spec.ts`

- [x] 编写失败测试：初始 history 不能撤销或重做。

  预期测试形态：

  ```ts
  const state = createEditorDraftHistory({
    title: "标题",
    body: "正文",
    activeField: "body",
    selection: { start: 0, end: 0 },
    changedAt: 0,
  });

  expect(canUndoEditorDraftHistory(state)).toBe(false);
  expect(canRedoEditorDraftHistory(state)).toBe(false);
  ```

- [x] 编写失败测试：记录一次正文输入后可以 undo，再 redo 回新正文。

  预期断言：

  ```ts
  const changed = recordEditorDraftHistoryChange(state, nextSnapshot, {
    merge: false,
  });
  const undone = undoEditorDraftHistory(changed);
  const redone = redoEditorDraftHistory(undone);

  expect(undone.present.body).toBe("正文");
  expect(redone.present.body).toBe("正文新增");
  ```

- [x] 编写失败测试：普通连续输入在合并窗口内只生成一个撤销步骤。

  规则：同一 `activeField`、`kind: "typing"`、两次 `changedAt` 差值小于等于 `500`，且没有显式 `forceBoundary` 时合并。

- [x] 编写失败测试：toolbar action 不合并，并且清空 redo 栈。

- [x] 实现 history 类型和 reducer。

  建议 API：

  ```ts
  export type EditorDraftHistoryField = "title" | "body";
  export type EditorDraftHistoryChangeKind =
    "typing" | "toolbar" | "programmatic";

  export interface EditorDraftHistorySnapshot {
    title: string;
    body: string;
    activeField: EditorDraftHistoryField;
    selection?: EditorShowcaseTextSelection;
    changedAt: number;
  }

  export interface EditorDraftHistoryState {
    past: EditorDraftHistorySnapshot[];
    present: EditorDraftHistorySnapshot;
    future: EditorDraftHistorySnapshot[];
    lastChangeKind?: EditorDraftHistoryChangeKind;
  }
  ```

- [x] 加入 `maxEntries` 上限，默认 `100`，超过时丢弃最旧 `past`。

- [x] 运行 history 单测确认通过。

  运行：`pnpm exec vitest run src/features/editor-showcase/model/__tests__/editorDraftHistory.spec.ts`

  预期：新增 history 测试全部通过。

## 任务 2：把 history 接入 `useEditorShowcaseDraft`

**文件：**

- 修改：`src/features/editor-showcase/model/useEditorShowcaseDraft.ts`
- 修改：`src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts`

- [x] 编写失败测试：`updateBody` 后 `canUndo=true`，执行 `undoDraft()` 回到旧正文。

- [x] 编写失败测试：`undoDraft()` 后 `canRedo=true`，执行 `redoDraft()` 恢复正文。

- [x] 编写失败测试：`applyToolbarAction("bold")` 是单独撤销步骤，撤销后正文回到 toolbar 前。

- [x] 编写失败测试：undo 回到已保存快照时 `hasUnsavedChanges=false` 且 `draftSaveStatus="saved"`。

- [x] 编写失败测试：undo/redo 不直接绕过预览编译；`previewCompileDebounceMs: 0` 时预览同步更新。

- [x] 修改 `UseEditorShowcaseDraftOptions`，增加可测试的 `historyMergeWindowMs?: number`，默认 `500`。

- [x] 新增内部函数 `createCurrentHistorySnapshot(activeField, selection)`。

- [x] 改造 `updateTitle(nextTitle)`，先比较是否变化，再调用 history 记录，最后写入 `title.value`。

  业务注释要求：说明 history 快照记录的是用户编辑边界，不是保存事实，保存状态仍由 hash 派生。

- [x] 改造 `updateBody(nextBody, selection?)`，支持正文选区记录和连续输入合并。

- [x] 改造 `applyToolbarAction(action, selection)`，用 `kind: "toolbar"` 强制创建 history 边界。

- [x] 实现 `undoDraft()` / `redoDraft()`。

  返回值建议：

  ```ts
  interface EditorDraftHistoryRestoreResult {
    activeField: EditorDraftHistoryField;
    selection?: EditorShowcaseTextSelection;
  }
  ```

  用于 controller 恢复焦点和选区。

- [x] 暴露 `canUndo`、`canRedo`、`undoDraft`、`redoDraft`。

- [x] 运行目标 composable 测试。

  运行：`pnpm exec vitest run src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts src/features/editor-showcase/model/__tests__/editorDraftHistory.spec.ts`

  预期：history 和 draft 测试全部通过。

## 任务 3：收口工作台事件，恢复焦点和选区

**文件：**

- 修改：`src/features/editor-showcase/model/useEditorWorkspaceController.ts`
- 修改：`src/features/editor-showcase/ui/EditorWorkspace.vue`

- [x] 将 `EditorWorkspace.vue` 的写作区绑定从 `v-model:title` / `v-model:body` 改为显式 props 和事件。

  目标形态：

  ```vue
  <EditorWritingPane
    :title="title"
    :body="body"
    @title-input="handleTitleInput"
    @body-input="handleBodyInput"
    @undo="handleUndoDraft"
    @redo="handleRedoDraft"
  />
  ```

- [x] 在 controller 中新增 `handleTitleInput(nextTitle: string)`。

  行为：调用 `draft.updateTitle(nextTitle)`，再同步布局。

- [x] 修改 `handleBodyInput(nextBody: string)`。

  行为：读取 `writingPaneRef.value?.getBodySelection()`，传给 `draft.updateBody(nextBody, selection)`，再同步布局。

- [x] 新增 `restoreEditorHistoryTarget(result)`。

  行为：

  - `activeField === "body"` 时 `focusBody()` 并 `setBodySelection(result.selection)`。
  - `activeField === "title"` 时优先只保持当前焦点策略，不做精确标题选区恢复。
  - `nextTick()` 后调用 `resizeBodyInput()` 和 `syncPreviewScroll()`。

- [x] 新增 `handleUndoDraft()` 和 `handleRedoDraft()`。

  行为：调用 draft 对应方法；没有可恢复结果时直接返回。

- [x] 暴露 `canUndo`、`canRedo`、`handleUndoDraft`、`handleRedoDraft` 给 UI。

- [x] 运行类型检查。

  运行：`pnpm exec vue-tsc --noEmit`

  预期：没有 TypeScript 错误。

## 任务 4：补 UI 按钮和快捷键

**文件：**

- 修改：`src/components/editor-showcase/EditorActionBar.vue`
- 修改：`src/components/editor-showcase/EditorWritingPane.vue`
- 修改：`src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts`

- [x] 修改 `EditorActionBar.vue` props 和 emits，加入：

  ```ts
  canUndo: boolean;
  canRedo: boolean;
  ```

  emits：

  ```ts
  undo: [];
  redo: [];
  ```

- [x] 在 `EditorActionBar.vue` 的 actions 区域加入撤销和重做按钮。

  文案建议：

  - 按钮文本：`撤销`、`重做`
  - `aria-label`：`撤销上一步编辑`、`重做上一步编辑`
  - 禁用条件：`!canUndo`、`!canRedo`

- [x] 修改 `EditorWritingPane.vue` emits。

  从：

  ```ts
  "update:title": [value: string];
  "update:body": [value: string];
  bodyInput: [];
  ```

  改为：

  ```ts
  titleInput: [value: string];
  bodyInput: [value: string];
  undo: [];
  redo: [];
  ```

- [x] 给标题和正文 textarea 增加 `@keydown="handleEditorKeydown"`。

- [x] 实现快捷键处理。

  规则：

  - `Ctrl/Cmd + Z` 且没有 `Shift`：`preventDefault()` 后 emit `undo`。
  - `Ctrl/Cmd + Shift + Z`：`preventDefault()` 后 emit `redo`。
  - `Ctrl/Cmd + Y`：`preventDefault()` 后 emit `redo`。

- [x] 更新组件测试：按钮列表新增撤销/重做时，toolbar 测试仍只查询 `.selection-toolbar button`，避免误把 action bar 按钮纳入格式工具断言。

- [x] 新增组件测试：正文 textarea 触发 `Ctrl+Z` 会 emit `undo`。

- [x] 新增组件测试：正文 textarea 触发 `Ctrl+Shift+Z` 和 `Ctrl+Y` 会 emit `redo`。

- [x] 运行组件测试。

  运行：`pnpm exec vitest run src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts`

  预期：组件测试全部通过。

## 任务 5：集成验证和收口

**文件：**

- 修改：必要时更新 `src/features/editor-showcase/model/index.ts` public API。
- 修改：本计划 checkbox。

- [x] 运行编辑器相关 model 与组件测试。

  运行：

  ```bash
  pnpm exec vitest run \
    src/features/editor-showcase/model/__tests__/editorDraftHistory.spec.ts \
    src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts \
    src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts
  ```

  预期：目标测试全部通过。

- [x] 运行完整测试。

  运行：`pnpm test:run`

  预期：全部通过。

- [x] 运行类型检查。

  运行：`pnpm typecheck`

  预期：无类型错误。

- [x] 运行生产构建。

  运行：`pnpm build`

  预期：构建成功。

- [x] 运行格式检查。

  运行：

  ```bash
  pnpm exec prettier --check \
    src/features/editor-showcase/model/editorDraftHistory.ts \
    src/features/editor-showcase/model/__tests__/editorDraftHistory.spec.ts \
    src/features/editor-showcase/model/useEditorShowcaseDraft.ts \
    src/features/editor-showcase/model/__tests__/useEditorShowcaseDraft.spec.ts \
    src/features/editor-showcase/model/useEditorWorkspaceController.ts \
    src/features/editor-showcase/ui/EditorWorkspace.vue \
    src/components/editor-showcase/EditorActionBar.vue \
    src/components/editor-showcase/EditorWritingPane.vue \
    src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts
  ```

  预期：格式检查通过；如失败，运行 `pnpm exec prettier --write <具体文件>` 后重跑检查。

- [x] 运行空白错误检查。

  运行：`git diff --check`

  预期：无 trailing whitespace 或 conflict marker。

- [ ] 手动检查 `/editor`。

  运行：`pnpm dev`

  检查：

  - 输入正文，点击撤销后正文回退。
  - 点击重做后正文恢复。
  - 选中文本点击 `B`，点击撤销后 markdown 标记消失。
  - `Ctrl/Cmd+Z` 和 `Ctrl/Cmd+Shift+Z` 在正文 textarea 内生效。
  - undo 回到保存点时状态显示已保存。

## 架构适配评估

- owner 明确：history reducer 和编辑状态属于 `features/editor-showcase/model`，组件不持有历史栈。
- 复用点明确：纯 reducer 可在未来真实后端草稿加载后复用，只需用服务端草稿创建初始 snapshot。
- 结构收敛：本计划会移除 `v-model` 对 feature ref 的直接写入，把标题、正文、toolbar 都收束到显式 mutation 入口，避免第二轮再重构。
- 性能边界明确：history 保存 source text 快照，默认最多 100 条；预览编译继续使用现有 debounce 和 hash 跳过逻辑。
- 风险：超长正文保存 100 条完整快照会占用内存；第一版接受该成本，后续如正文体量明显增长，再独立评估 diff-based history。

## 回滚与恢复

- 改动集中在编辑器 feature model 和 editor-showcase 组件，可整体 revert。
- 未改 API contract、路由、后端、数据库或部署配置。
- 如果 history 行为出现问题，可以临时隐藏 UI 按钮并禁用快捷键，保留原有输入和保存流程。

## 实现准备清单

- [x] 实现前确认当前工作区无未识别冲突：`git status --short`。
- [x] 从任务 1 开始按 TDD 执行，不先写 UI。
- [x] 每完成一个任务更新本计划 checkbox。
- [x] 如用户要求提交，先使用 `committing-changes`，并按项目提交规则组织最小可审阅提交。
