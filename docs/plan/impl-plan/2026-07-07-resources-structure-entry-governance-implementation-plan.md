# Resources 与 Structure 入口治理 Implementation Plan

> **给 agentic workers：** 必需子技能：使用 @subagent-driven-development（推荐）或 @executing-plans 按任务推进。步骤使用 checkbox（`- [ ]`）追踪，完成一个预期结果后立即勾选；如需提交，提交前必须先使用 @committing-changes。

**目标：** 在 Resources/Structure 尚无字段级后端 contract 前，治理首页、顶栏和页面里的可见入口，避免静态页面被误解为已上线功能。

**架构：** 不新增 Resources/Structure API adapter；页面可保留产品占位和说明，但不能出现可点击无 handler 的业务按钮。导航权重由 `AppLayout` 和 route page 统一处理，桌面与移动入口保持一致。

**技术栈：** Vue 3、TypeScript strict、Vue Router、Vitest、happy-dom。

---

## 来源文档

- `docs/todos/debt/2026-07-07-ui-only-functionality-audit.md`
- `AGENTS.md`：页面只装配，组件不做业务决策。
- `docs/design/css-style-guide.md`：入口降级时仍遵守现有 CSS owner。
- 当前未发现 Resources/Structure 对应服务级字段 contract。

## 文件结构

- 修改：`src/pages/resources/ResourcesRoutePage.vue`
  - 保留明确占位或降低误导性操作。
- 修改：`src/pages/structure/StructureRoutePage.vue`
  - 保留明确占位或降低误导性操作。
- 修改：`src/components/home/HomeOverviewWidget.vue`
  - 首页入口不暗示已可用生产能力。
- 修改：`src/components/home/__tests__/HomeOverviewWidget.spec.ts`
  - 覆盖入口文案/不可用状态。
- 修改：`src/layouts/AppLayout.vue`
  - 顶栏与移动导航一致地处理 Resources/Structure。
- 修改：`src/layouts/__tests__/AppLayout.spec.ts`
  - 覆盖导航入口一致性。

## 任务 1：梳理 Resources/Structure 可见入口

**测试立场：** 不使用 TDD - 这是入口治理和降级，不实现业务逻辑。

**验收清单：**

- [ ] 列出顶栏、移动菜单、首页 overview、`/resources`、`/structure` 中所有 Resources/Structure 入口。
- [ ] 每个入口只能是明确占位、降低权重、隐藏、或指向真实已实现功能。
- [ ] 没有 handler 的业务按钮必须移除或 disabled。
- [ ] 不新增 `src/api/resources.ts`、`src/api/structure.ts`。

- [ ] **步骤 1：运行入口扫描**

  运行：`rg "resources|structure|资源|结构|暂未接入|即将推出" src/layouts src/components/home src/pages/resources src/pages/structure`

  预期：得到所有可见入口和占位文案。

- [ ] **步骤 2：确定降级策略**

  对每个入口选择隐藏、降低权重或保留明确占位；记录在本任务执行说明中。

## 任务 2：治理页面占位和业务按钮

**测试立场：** 不使用 TDD - 页面静态降级用类型检查和组件渲染测试验证。

**验收清单：**

- [ ] `ResourcesRoutePage.vue` 不展示“上传”“管理”“收藏”等可误解为可用的业务按钮。
- [ ] 静态资源分类卡片若保留，状态必须是占位，不带生产数据。
- [ ] `StructureRoutePage.vue` 不展示“开始整理”“发布前检查”等可点击无 handler 的按钮。
- [ ] 页面说明不承诺当前不可用能力已接入。
- [ ] 页面样式沿用现有 owner，不做视觉重构。

- [ ] **步骤 1：修改 Resources 页面**

  删除或禁用可误解业务操作，保留明确的 contract gate/占位状态。

- [ ] **步骤 2：修改 Structure 页面**

  删除或禁用可误解业务操作，保留明确的 contract gate/占位状态。

- [ ] **步骤 3：运行页面最小验证**

  运行：`pnpm typecheck`

  预期：PASS。

## 任务 3：治理首页和全局导航入口

**测试立场：** 混合 - 导航一致性用组件测试，纯文案/样式直接修改。

**验收清单：**

- [ ] `AppLayout` 桌面导航和移动导航对 Resources/Structure 的展示一致。
- [ ] 如果保留入口，文案或状态不能暗示功能已完成。
- [ ] 如果隐藏入口，对应 route 可保留直接访问占位页，但导航不突出。
- [ ] `HomeOverviewWidget` 不把 Resources/Structure 放在与真实可用功能相同优先级，除非标明暂未接入。
- [ ] 不破坏已实现路由的导航测试。

- [ ] **步骤 1：写或更新导航测试**

  修改 `src/layouts/__tests__/AppLayout.spec.ts`，覆盖桌面和移动入口一致性。

  运行：`pnpm exec vitest run src/layouts/__tests__/AppLayout.spec.ts`

  预期：当前入口不一致或文案不符合时失败。

- [ ] **步骤 2：修改 AppLayout**

  按降级策略调整顶栏和移动菜单。

- [ ] **步骤 3：更新 HomeOverviewWidget**

  调整入口权重和占位状态；不要把静态占位展示成实时数据。

- [ ] **步骤 4：运行组件验证**

  运行：`pnpm exec vitest run src/layouts/__tests__/AppLayout.spec.ts src/components/home/__tests__/HomeOverviewWidget.spec.ts`

  预期：PASS。

## 集成检查

- [ ] 确认未新增 API adapter。

  运行：`test ! -f src/api/resources.ts && test ! -f src/api/structure.ts`

  预期：命令退出码为 `0`。

- [ ] 扫描剩余占位词。

  运行：`rg "暂未接入|即将推出|disabled|aria-disabled" src/pages/resources src/pages/structure src/components/home src/layouts`

  预期：剩余命中均为明确降级或测试断言。

- [ ] 运行类型检查。

  运行：`pnpm typecheck`

  预期：PASS。

## 架构适配评估

| 检查项 | 结论 |
| --- | --- |
| contract | 没有后端字段级 contract，不新增 Resources/Structure API。 |
| owner | 导航入口由 AppLayout/HomeOverview/page 控制，不引入 feature 假状态。 |
| UI 诚实性 | 入口不会把占位页伪装成可用生产功能。 |
| 二次返工风险 | 后端 contract 到位后可新增独立 feature/API，不需要撤销假接口。 |
