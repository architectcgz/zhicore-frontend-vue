# 前端质量问题修复独立审查

## 审查范围

- 计划：`docs/plan/impl-plan/2026-07-06-frontend-quality-fixes-implementation-plan.md`
- 范围：测试 guardrail、auth redirect、content-detail comments stale guard、local demo user/file API 边界、Explore/Community/Login route page 拆分、AppLayout 测试隔离。

## 第一轮审查

审查 agent：`code-reviewer`，`gpt-5.5 high`。

Blocking finding：

- `src/features/content-detail/composables/useContentDetailPage.ts` 的首屏 comments stale guard 会保住排序后评论，但在首屏 engagement 晚于排序评论返回时，可能只更新 `lastEngagement` 而不重新 `applyDetail()`，导致 degraded/null engagement 未映射到 `detail.readingActions` / `statuses`。

建议项：

- 将新抽出的 `features/*/ui` workspace 纳入 `pageLayerSeparation` guardrail。
- 为 `sanitizeAuthRedirect()` 增加直接 helper 测试。
- `src/api/file.ts` 当前 local demo 覆盖头像流 `uploadImage()`；其余 file exports 不属于本轮个人资料头像工作流。

## 修复

- 在 `useContentDetailPage()` 的首屏 comments stale 分支中，若已有排序后的 `lastCommentsPage`，重新 `applyDetail(lastCommentsPage)`，刷新晚到的 engagement degraded 状态且不覆盖排序评论。
- 新增回归测试：首屏 comments 慢、排序 comments 先返回、首屏 engagement degraded 后到时，最终评论仍来自排序请求，同时收藏计数显示 `--` 并出现“互动状态未知”状态。
- `pageLayerSeparation` 纳入 `AuthRouteWorkspace`、`CommunityWorkspace`、`HomeDiscoveryExploreWorkspace`。
- 新增 `sanitizeAuthRedirect()` 直接测试。

## 修复后验证

- `pnpm test:run src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/__tests__/pageLayerSeparation.spec.ts src/features/auth/__tests__/redirect.spec.ts src/features/auth/__tests__/useLoginForm.spec.ts src/features/auth/__tests__/useRegisterForm.spec.ts`：通过，5 个文件 / 39 个测试。
- `pnpm test:run`：通过，67 个文件 / 346 个测试，无 `ECONNREFUSED 127.0.0.1:3000`。
- `pnpm typecheck`：通过。

## 复审结论

复审 agent：`code-reviewer`，`gpt-5.5 high`。

- Blocking issues：无。
- 复审确认上一轮 blocking 已修复：首屏 comments stale 且已有 `lastCommentsPage` 时会重新 `applyDetail(lastCommentsPage)`，晚到的 engagement degraded 能映射到 `detail.readingActions/statuses`，且不覆盖排序后的 comments。
- 复审额外验证：
  - `pnpm test:run src/features/content-detail/__tests__/useContentDetailPage.spec.ts src/__tests__/pageLayerSeparation.spec.ts src/features/auth/__tests__/redirect.spec.ts`：通过，28 个测试。
  - `pnpm typecheck`：通过。
- 非阻塞提醒：未跟踪的 `docs/design/401，403，404,500.png:Zone.Identifier` 不是本轮改动，提交前不要误纳入。
