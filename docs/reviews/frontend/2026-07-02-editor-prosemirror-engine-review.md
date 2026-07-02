# 编辑器 ProseMirror 引擎切换 Review

## 范围

- 目标：审查 `/editor` 正文输入从 textarea 切换到 ProseMirror `EditorView` 的未提交 diff。
- 重点：输入引擎是否真实切换、保存模型是否仍为 `PostBodyWriteInput`、source selection 映射、滚动/焦点回归和测试覆盖。

## 结论

独立 reviewer 初审结论为 `Changes requested`。

阻塞问题：

- 当前实现直接使用 `schema-basic`，但序列化只按顶层 block `textContent` 拼回 source。富文本粘贴可能让 ProseMirror doc 进入 heading/list/mark 等结构，再被静默压平为纯文本。

处理结果：

- 改为极简 ProseMirror schema，只开放 `doc`、`paragraph`、`text`。
- `EditorWritingPane` 对 ProseMirror paste 执行 source/plain-text 规范化，富文本 adapter 落地前不允许 rich document 结构进入当前保存管线。
- 补充外部 `body` 同步后选区 clamp、ProseMirror 长度限制和 `HTMLElement` scroll sync 路径测试。

## 验证

已重新运行：

- `pnpm exec vitest run src/features/editor-showcase/model/__tests__/editorProseMirrorEngine.spec.ts src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts src/features/editor-showcase/model/__tests__/useEditorWorkspaceController.spec.ts src/features/editor-showcase/model/__tests__/useEditorPreviewScrollSync.spec.ts`
- `pnpm typecheck`
- `pnpm test:run`
- `pnpm exec prettier --check src/components/editor-showcase/EditorWritingPane.vue src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts src/features/editor-showcase/model/editorProseMirrorEngine.ts src/features/editor-showcase/model/__tests__/editorProseMirrorEngine.spec.ts src/features/editor-showcase/model/useEditorPreviewScrollSync.ts src/features/editor-showcase/model/useEditorWorkspaceController.ts docs/design/editor-design.md docs/contracts/editor-content-contract.md docs/plan/impl-plan/2026-07-02-editor-prosemirror-engine-implementation-plan.md`
- `git diff --check`
