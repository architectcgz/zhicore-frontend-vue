# 编辑器 Tiptap 迁移复审 Gate

Review target: `zhicore-frontend-vue` 当前 `main` 工作树未提交 diff，重点审查 `/editor` 从手写 ProseMirror `EditorView` 迁到 Tiptap Vue 3 runtime，同时保持保存契约为 `PostBodyWriteInput`。

## Classification

- 分类：非平凡前端迁移 gate review。
- 审查范围：Tiptap lifecycle、mapper 契约、toolbar command、旧 ProseMirror 入口清理、review blocker 修复。
- 独立 reviewer：`019f2862-fdff-76d1-925a-5d03acfb34bb`。

## Gate Verdict

`pass`

上一轮剩余两个 finding 均已关闭：

1. `math_block` 保存映射现在只取可见文本，不再回退到 `attrs.latex`。
2. `external_embed.renderHTML` 先经过 `sanitizePostBodyExternalUrl()`；只有安全 `http/https` URL 才会渲染 `<a href=...>`，不安全 URL 降级成非链接文本。

## Findings

没有新的 material finding。

## Validation Evidence

实现方最终验证：

```bash
pnpm exec vitest run src/features/editor/model/__tests__/editorTiptapEngine.spec.ts src/features/editor/model/__tests__/editorDraftHistory.spec.ts src/features/editor/model/__tests__/useEditorDraft.spec.ts src/features/editor/model/__tests__/useEditorWorkspaceController.spec.ts src/components/editor/__tests__/EditorWritingPane.spec.ts src/features/editor/model/__tests__/editorArchitecture.spec.ts
```

结果：6 个测试文件 / 64 个测试通过。

```bash
pnpm typecheck
```

结果：`vue-tsc --noEmit` 通过。

```bash
pnpm test:run
```

结果：16 个测试文件 / 106 个测试通过。

```bash
pnpm build
```

结果：Vite 生产构建通过；仅出现 `@vueuse/core` 依赖内 `/* #__PURE__ */` 注释位置警告。

```bash
git diff --check
```

结果：通过，无 whitespace error。

独立 reviewer 补跑：

```bash
pnpm exec vitest run src/features/editor/model/__tests__/editorTiptapEngine.spec.ts src/components/editor/__tests__/EditorWritingPane.spec.ts
```

结果：2 个测试文件 / 32 个测试通过。

## Residual Risk

- `math_block` 的运行时 HTML 仍保留 `data-latex` 属性；当前保存模型不读取该属性。若未来引入 HTML round-trip / import 路径，需要继续确认不会把隐藏旧值重新带回运行时状态。
- `external_embed` 的安全性已在保存映射和 editor DOM 渲染两条主路径收口。后续新增直接消费 `node.attrs.url` 的 UI / 导出路径时，应继续复用同一个 sanitize helper。
- 浏览器手动验收仍未完成：移动端软键盘、长文底部输入滚动保持、table 内部原生交互和真实保存请求 payload 仍需人工在 `/editor` 路由确认。

## Touched Known Debt

本次迁移关闭了正式 `/editor` 直接维护手写 `EditorView` / low-level ProseMirror keymap / command glue 的结构债。Tiptap 底层仍使用 ProseMirror DOM class 和 plugin API，但项目源码不再直接依赖 `prosemirror-*` 包。
