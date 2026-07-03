# 编辑器 Block Children 契约调整 Review

日期：2026-07-03

范围：

- `PostBodyBlock` V1 contract 将 `quote` 和 `list` 调整为 block children。
- 阅读器递归渲染 `quote.blocks` 和 `list.items[].blocks`。
- 当前 ProseMirror schema / mapper 支持 quote 和 list item 内 block children。
- mapper 和 draft owner 拒绝超过 V1 容器嵌套深度的文档。

独立 review 结论：

- 第一轮发现：contract 已允许 block children，但旧 schema / mapper 仍只稳定处理 inline-only quote/list，存在静默压平或丢结构风险。
- 第二轮发现：block children 已保留，但缺少 V1 最大容器嵌套深度校验。
- 最终复查：阻塞项均已修复，当前 diff 通过 review。

验证证据：

- `pnpm vitest run src/features/editor/model/__tests__/editorProseMirrorEngine.spec.ts src/features/editor/model/__tests__/useEditorDraft.spec.ts src/components/editor/__tests__/EditorWritingPane.spec.ts src/components/post-body-reader/__tests__/PostBodyReader.spec.ts`
- `pnpm test:run`
- `pnpm typecheck`

残余风险：

- 如果未来绕过 `useEditorDraft` 直接向组件层注入超深度编辑器 JSON，组件层本身不会重复做后端 contract 校验；当前正式 owner 入口已守住该边界。
