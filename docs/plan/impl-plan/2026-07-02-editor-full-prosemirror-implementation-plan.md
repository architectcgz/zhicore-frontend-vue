# 编辑器完全切换 ProseMirror 实现计划

## 目标

让 `/editor` 正文运行时事实从 Markdown-like source 完全切换为 ProseMirror document：

- 正文状态以 ProseMirror JSON / doc 为事实。
- toolbar 直接操作 ProseMirror marks / nodes，不再插入 `**`、`##`、``` 等 Markdown-like 标记。
- 预览和保存由 ProseMirror mapper 直接输出 `PostBodyWriteInput` / reader preview blocks。
- `**加粗**` 只作为普通文本存在；加粗必须是 ProseMirror `bold` mark。

## 非目标

- 本轮删除旧 Markdown-like compiler / textarea adapter / source-map validation mapper，避免正式 editor 留下双轨入口。
- 本轮不实现 Content V2 的多段 quote、嵌套 list、表格单元格内 block。
- 本轮不把 ProseMirror JSON 提交给后端；后端保存事实仍是 `PostBodyWriteInput`。

## 方案

- 扩展 `editorProseMirrorEngine` 为富文本 schema：paragraph、heading、quote、code_block、list/list_item、math、table，以及 bold / italic / underline / strike / inline_code / link marks。
- 新增 ProseMirror mapper，将 doc 直接映射为 `PostBodyWriteInput`、reader preview blocks、plain text 和字数统计。
- 将 `useEditorDraft` 的正文状态从 source string 改为 ProseMirror JSON；历史快照记录 ProseMirror JSON 和 ProseMirror selection。
- `EditorWritingPane` 接收 ProseMirror JSON，变更时 emit ProseMirror JSON；组件只挂载和同步 `EditorView`。
- toolbar 入口改为调用 ProseMirror command，操作 marks / block node；toolbar action / selection 类型独立放在 `editorToolbarTypes`。

## 任务 1：ProseMirror schema 和 mapper

- [x] 编写失败测试：bold mark doc 输出 `PostBodyWriteInput` 的 `bold` mark，而 `**text**` 输出普通文本。
- [x] 编写失败测试：heading、quote、code、list 从 ProseMirror doc 映射为 Content V1 blocks。
- [x] 扩展 `editorProseMirrorEngine` schema。
- [x] 新增 ProseMirror -> `PostBodyWriteInput` / preview blocks mapper。

## 任务 2：Draft 状态切换到 ProseMirror doc

- [x] 编写失败测试：`useEditorDraft` 以 ProseMirror doc 更新正文、预览和保存请求，不再调用 Markdown-like compiler。
- [x] 编写失败测试：撤销 / 重做恢复 ProseMirror doc 和 ProseMirror selection。
- [x] 修改 draft history 和 workspace controller 的正文类型。
- [x] 保持标题、保存状态、字数和正文长度限制行为。

## 任务 3：Toolbar 切换到 ProseMirror commands

- [x] 编写失败测试：加粗 toolbar 产生 ProseMirror `bold` mark，正文不出现 `**`。
- [x] 编写失败测试：heading / quote / code / list toolbar 产生对应 ProseMirror node。
- [x] 在 `EditorWritingPane` 暴露 ProseMirror command 入口。
- [x] 让 controller 调用 ProseMirror command，不再调用 Markdown-like source transform。

## 任务 4：文档、验证和 review

- [x] 更新设计/契约文档，记录 `/editor` 正文事实已完全切到 ProseMirror。
- [x] 运行 ProseMirror / draft / writing pane 定向测试。
- [x] 运行 `pnpm typecheck`。
- [x] 运行 `pnpm test:run`。
- [x] 运行 `git diff --check`。
- [ ] 独立 code review gate。

## 风险

- 这是跨 feature model、组件和保存 mapper 的结构性迁移；测试需要同时覆盖编辑态、预览态、保存态。
- 旧 Markdown-like compiler / textarea adapter 已删除；后续不得重新从 source string compiler 接入 `/editor` runtime。
