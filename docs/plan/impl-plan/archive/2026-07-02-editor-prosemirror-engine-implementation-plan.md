# 编辑器 ProseMirror 引擎切换实现计划

## 目标

把 `/editor` 正文输入从 `<textarea>` 切换为 ProseMirror `EditorView`，但保持长期保存事实仍为 `PostBodyWriteInput`，不把 ProseMirror JSON 写入草稿保存、预览或 API 请求。

## 非目标

- 本次不实现完整富文本 Content V1 schema。
- 本次不支持多段 quote、嵌套 list、表格单元格内 block 等 Content V2 能力。
- 本次不把 ProseMirror doc 作为服务端保存模型。

## 方案

- 新增 ProseMirror 依赖：`prosemirror-model`、`prosemirror-state`、`prosemirror-view`。
- 新增 `editorProseMirrorEngine`，负责 Markdown-like source 与 ProseMirror doc 的双向转换，以及 source offset 与 ProseMirror selection 的映射。
- 当前 ProseMirror schema 只开放 `doc`、`paragraph`、`text`，富文本 adapter 落地前粘贴内容显式降级为纯文本 source。
- `EditorWritingPane` 正文区域使用 ProseMirror contenteditable，输入后序列化为 source 并继续触发 `bodyInput`。
- 工具栏仍复用现有 source transform：通过 source offset selection 改写 body，再把新 source 回填 ProseMirror view。
- 滚动同步只依赖正文编辑元素的尺寸、line-height 和外层 scroll，不依赖 textarea 专有 API。

## 任务 1：ProseMirror source engine

- [x] 编写失败测试：source -> ProseMirror doc -> source 能保留普通文本、空行和 Markdown-like 标记。
- [x] 编写失败测试：source offset selection 与 ProseMirror selection 能双向映射。
- [x] 新增 `editorProseMirrorEngine.ts`。
- [x] 安装 ProseMirror 依赖。
- [x] 运行 engine 测试。

## 任务 2：正文输入切换为 ProseMirror view

- [x] 编写失败测试：`EditorWritingPane` 正文区域不再是 textarea，而是 `contenteditable` ProseMirror editor。
- [x] 编写失败测试：ProseMirror 变更会 emit `bodyInput`，暴露的选区 API 返回 source offset。
- [x] 替换 `EditorWritingPane.vue` 正文 textarea 为 ProseMirror view。
- [x] 更新 workspace ref 和 scroll sync 类型，从 textarea 收敛为通用正文编辑元素。
- [x] 运行 writing pane、workspace controller 和 scroll sync 测试。

## 任务 3：收口验证

- [x] 更新文档，记录 `/editor` 已切换为 ProseMirror 输入引擎，保存模型不变。
- [x] 运行 ProseMirror/编辑器定向测试。
- [x] 运行 `pnpm typecheck`。
- [x] 运行 `pnpm test:run`。
- [x] 运行 `git diff --check`。

## 风险

- 当前 ProseMirror doc 仍承载 Markdown-like source，而不是最终 Content V1 富文本 schema；这是为了先切换输入引擎，同时保留保存契约安全边界。
- source offset 与 ProseMirror position 的映射本轮只覆盖 line-based source 文档；后续富文本 schema 需要升级为 block/path/position mapping。
