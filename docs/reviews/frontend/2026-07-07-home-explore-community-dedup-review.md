# 首页、发现、社区职责去重 Review

## 范围

- 首页从公开文章 Feed 改为产品总览入口。
- 删除无生产 owner 的 `HomeDiscoveryFeed`。
- 社区页文案和侧栏职责从“内容列表”收敛为“主题社区 / 近期讨论”。
- 发现页保留公开内容浏览、分类筛选和互动 owner。

## 独立 Review

- Reviewer：`code-reviewer` subagent `019f3ae6-88f6-7290-9fb7-9027b0f99ca1`
- 结果：首次 review 不通过，修复后通过本地验证。

## Findings

### Blocking

1. `src/__tests__/pageLayerSeparation.spec.ts` 仍 `?raw` 导入已删除的 `HomeDiscoveryFeed.vue`，并断言首页继续使用 `useHomeDiscoveryRoutePage`。
   - 影响：`pnpm test:run` 会失败；架构测试与“首页不再承载发现流”的目标冲突。
   - 处理：改为导入 `HomeOverviewWidget.vue`，断言首页使用 `HomeOverviewWidget` 且不再接入 `useHomeDiscoveryRoutePage`，同时保留 `/explore` 对 `useHomeDiscoveryRoutePage` 的断言。

### Non-Blocking

1. `useHomeDiscoveryPage` 返回 `showSupplementarySidebar`、`searchQuery`、`updateSearchQuery`，但删除首页 Feed 后没有生产 UI owner。
   - 处理：移除这些返回项和无 owner 搜索状态；更新 `useHomeDiscoveryPage` 测试。
2. `HomeOverviewWidget.vue` 存在未使用的 `BookOpenText` 导入。
   - 处理：移除未使用导入。
3. `HomeOverviewWidget.spec.ts` 的入口断言会先命中 hero CTA，不能证明 entry grid 完整。
   - 处理：改为断言 `.home-overview__entry` 的 href 集合。

## Re-Validation

- `pnpm exec vitest run src/__tests__/pageLayerSeparation.spec.ts src/components/home/__tests__/HomeOverviewWidget.spec.ts src/features/home-discovery/__tests__/useHomeDiscoveryPage.spec.ts src/pages/community/__tests__/CommunityRoutePage.spec.ts src/features/community/__tests__/useCommunityPage.spec.ts src/pages/explore/__tests__/ExploreRoutePage.spec.ts src/features/editor/__tests__/editorArchitecture.spec.ts`：7 files / 40 tests passed。
- `pnpm typecheck`：passed。
- `pnpm test:run`：67 files / 349 tests passed。
- `node /home/azhi/.codex/skills/frontend-engineer/scripts/check-alias-paths.mjs --cwd /home/azhi/workspace/projects/zhicore-frontend-vue`：passed。
- `git diff --check`：passed。

## Verdict

通过。阻塞测试残留已修复，旧首页 Feed 的生产调用点、测试引用和无 owner composable contract 已收敛。
