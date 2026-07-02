# 编辑器移动端工作台 Review

## Review Scope

- 变更范围：`/editor` 同一路由下拆分桌面/移动端编辑器工作台 shell，移动端采用写作/预览单面板切换。
- Review agent：`019f21c6-e0e6-78a2-8e41-49d1cbbc167f`。
- Review verdict：初审 `Changes requested`，修复后通过本次影响范围验证。

## Findings

### Blocking: shell 重建后未恢复编辑器布局

- 位置：`src/features/editor-showcase/model/useEditorWorkspaceController.ts`、`src/features/editor-showcase/ui/EditorWorkspace.vue`。
- 问题：`EditorWorkspace` 在 `980px` 断点两侧用 `v-if` 切换桌面和移动端 shell。shell 被销毁重建后，controller 原本只在初次 `onMounted` 和预览 blocks 变化时执行 `resizeBodyInput()` / `syncPreviewScroll()`，导致长文 textarea 可能回到默认高度。
- 处理：新增 `workspaceShellRef` watcher，在 shell ref 更新后通过 `syncEditorLayoutOnNextFrame()` 重新恢复正文高度和预览同步。
- 回归测试：`src/features/editor-showcase/model/__tests__/useEditorWorkspaceController.spec.ts` 覆盖 shell ref 重建后按 `scrollHeight` 恢复 textarea 高度。

### Non-blocking: ref contract 重复定义

- 位置：`src/features/editor-showcase/ui/editorWorkspaceShellTypes.ts`。
- 问题：UI 层重复定义了 `EditorWorkspaceShellRef`，容易与 model owner 中的 ref contract 漂移。
- 处理：删除 UI 层重复 ref interface，保留 `useEditorWorkspaceController.ts` 中的 owner 定义。

## Validation

- `pnpm exec vitest run src/features/editor-showcase/model/__tests__/useEditorWorkspaceController.spec.ts src/features/editor-showcase/ui/__tests__/EditorMobileWorkspace.spec.ts src/features/editor-showcase/model/__tests__/editorShowcaseArchitecture.spec.ts src/components/editor-showcase/__tests__/EditorWritingPane.spec.ts src/features/editor-showcase/model/__tests__/useEditorPreviewScrollSync.spec.ts`
- `pnpm typecheck`
- `pnpm build`
- `curl -I http://localhost:5175/editor`

## Residual Risk

- happy-dom 不能证明真实移动浏览器下 sticky 切换条、键盘弹出和地址栏折叠的全部滚动行为；后续仍建议真机或浏览器设备模拟检查。
