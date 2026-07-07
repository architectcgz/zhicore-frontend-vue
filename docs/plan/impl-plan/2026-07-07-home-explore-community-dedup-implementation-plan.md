# 首页、发现、社区职责去重实施计划

## 目标

让三个入口职责更清晰，减少重复内容：

- `/` 首页：平台总览、关键入口和当前能力状态，不再渲染完整公开文章流。
- `/explore` 发现：保留公开内容浏览、分类筛选、热门标签和文章互动。
- `/community` 社区：保留主题社区、按主题文章聚合和社区 degraded 状态。

## 非目标

- 不新增后端 API、DTO 或真实社区成员统计。
- 不改变 `/explore` 的文章筛选、点赞、收藏、评论跳转工作流。
- 不把社区页的 degraded 数据伪装成真实热度或成员数。
- 不做全站视觉重设计。

## 当前依据

- `HomeRoutePage.vue` 当前直接渲染 `HomeDiscoveryFeed`，与 `/explore` 同属 `home-discovery` 数据流，导致首页和发现页重复展示文章列表。
- `docs/design/ui-style-baseline.md` 已记录：首页侧栏本地热门话题 / 社区是设计债；内容浏览页应避免做成主页复刻。
- `CommunityWorkspace.vue` 当前复用公开文章，但以主题筛选为 owner；保留此数据流，减少英文和说明性噪音即可。

## 任务切片

### 任务 1：首页改为入口总览

- 修改 `src/pages/home/HomeRoutePage.vue`：改用 `HomeOverviewWidget`，不再接入 `useHomeDiscoveryRoutePage()`。
- 修改 `src/components/home/HomeOverviewWidget.vue`：扩展为首页总览组件，提供写作、发现、社区、资源等入口，以及少量不依赖伪造热度的数据摘要。
- 删除无生产 owner 的 `HomeDiscoveryFeed.vue` 和对应测试。
- 新增/更新首页组件测试，验证首页不再渲染文章列表，且入口路由存在。

验证：

- `pnpm exec vitest run src/components/home/__tests__/HomeOverviewWidget.spec.ts src/features/editor/__tests__/editorArchitecture.spec.ts`

### 任务 2：社区页减少重复和英文噪音

- 修改 `src/features/community/ui/CommunityWorkspace.vue`：把英文文案改为中文；右侧栏强调“主题”和“近期讨论”，避免像发现页一样重复“最新公开文章”。
- 更新社区路由测试断言。

验证：

- `pnpm exec vitest run src/pages/community/__tests__/CommunityRoutePage.spec.ts src/features/community/__tests__/useCommunityPage.spec.ts`

## 计划评估

- 边界清晰：首页只改 route 装配和展示组件；发现页工作流不动；社区页不改 composable 数据流。
- 结构收敛：删除 `HomeDiscoveryFeed`，避免无生产调用点的重复 Feed 组件遗留。
- 风险：首页不再展示文章流，依赖用户从“发现内容”入口进入浏览；这是本次去重的预期行为。
- 回滚：单个提交可恢复 `HomeRoutePage` 对 `HomeDiscoveryFeed` 的引用和删除文件。

## 检查清单

- [x] 首页不再渲染公开文章 Feed。
- [x] 首页入口覆盖写作、发现、社区、资源。
- [x] `/explore` 内容浏览职责保持不变。
- [x] `/community` 文案和侧栏职责与发现页区分。
- [x] 删除无生产 owner 的旧首页 Feed 组件与测试。
- [x] 定向测试和 `pnpm typecheck` 通过。
