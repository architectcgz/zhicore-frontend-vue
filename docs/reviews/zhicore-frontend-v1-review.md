# Architecture Review: zhicore-frontend-vue 现有代码审查

Date: 2026-02-25
Reviewer: Claude (架构 Review)
Scope: 全量前端代码审查（组件、页面、路由、状态管理、API、样式）

---

## 偏离架构（必须改）

### R-01 [高] PostCard 直接修改 props（Vue 反模式）

- **文件**: `src/components/post/PostCard.vue:436-437, 469-470`
- **问题**: `handleLike` 和 `handleFavorite` 中直接修改 `props.post.isLiked`、`props.post.likeCount` 等属性
- **影响**: 违反 Vue 单向数据流原则。当前因 props 是对象引用所以"能跑"，但会导致父组件状态与子组件不同步、调试困难、未来升级风险
- **建议**: 删除直接赋值，仅通过 `emit('like-change', ...)` 通知父组件更新数据；或使用 `defineModel` / `v-model` 模式

### R-02 [高] 路由守卫逻辑完整重复

- **文件**: `src/router/guards.ts`
- **问题**: L28-237 定义了 `requiresAuth`、`requiresAdmin`、`requiresPermissions`、`requiresRoles`、`requiresGuest` 等独立守卫函数，但 L333-474 的 `setupRouterGuards` 中又把完全相同的逻辑重写了一遍
- **影响**: 两套逻辑并行维护，修改一处容易遗漏另一处，是 bug 温床
- **建议**: `setupRouterGuards` 内部直接调用已定义的独立守卫函数，或删除独立函数只保留 `setupRouterGuards`

### R-03 [高] 页面标题硬编码为"博客系统"而非"知构"

- **文件**: `src/router/guards.ts:253, 257`
- **问题**: `updatePageTitle` 中 `siteTitle = '博客系统'`，与产品品牌"知构"不一致
- **影响**: 用户在浏览器标签页看到的是"博客系统"而非品牌名
- **建议**: 改为 `const siteTitle = '知构'`，或从全局配置/环境变量读取

### R-04 [高] Home.vue 存在语法错误 — `</style>` 后有游离 CSS 代码

- **文件**: `src/pages/Home.vue:577-606`
- **问题**: L576 `</style>` 标签已关闭，但 L577-606 仍有 `.error-card` 相关 CSS 和 `@keyframes fadeIn` 代码游离在外。这些代码不在任何 `<style>` 块内，属于语法错误
- **影响**: 这段 CSS 不会生效，错误提示卡片和淡入动画样式丢失；Vite 编译时可能产生警告
- **建议**: 将游离 CSS 移入 `<style scoped>` 块内，或确认是否为重复代码直接删除

---

## 设计缺口（需要补 docs/architecture 或 docs/tasks）

### D-01 [中] 骨架屏暗色主题机制不一致

- **文件**: `src/pages/Home.vue:549-562`
- **问题**: 骨架屏使用 `@media (prefers-color-scheme: dark)` 检测暗色模式，但项目主题切换使用 `[data-theme='dark']` 属性
- **影响**: 用户手动切换暗色主题时，骨架屏颜色不跟随，出现亮色骨架屏在暗色背景上的视觉割裂
- **建议**: 已在 Task 3.3 中覆盖，确认实施时统一替换为 `[data-theme='dark']` 选择器

### D-02 [中] 样式体系混用：Tailwind vs CSS 变量 vs 硬编码

- **文件**: `PostCard.vue`（Tailwind 为主）、`Home.vue`（CSS 变量为主）、骨架屏（硬编码 `#1f2937` 等）
- **问题**: 三种样式方案并存，无统一规范
- **影响**: 维护成本高，暗色主题适配容易遗漏，新开发者上手困难
- **建议**: 已在设计文档 §3.4 和 Task 1.4 中定义统一规范（Tailwind 负责布局，CSS 变量负责 token），需在 tasks 中补充"渐进迁移"子任务

### D-03 [中] 字体系统不适配中文

- **文件**: `src/assets/styles/variables.css` (`--font-heading: 'Caveat', cursive`; `--font-body: 'Quicksand', sans-serif`)
- **问题**: Caveat 和 Quicksand 均为纯拉丁字体，中文字符回退到系统默认，标题和正文字体风格割裂
- **影响**: 中文内容平台的核心阅读体验受损
- **建议**: 已在 Task 1.1 中覆盖，切换到 Noto Serif SC + Noto Sans SC

### D-04 [中] Auth Store 暴露了应为内部的方法

- **文件**: `src/stores/auth.ts:688-689`
- **问题**: `setAuthData` 和 `clearAuth` 作为 public API 暴露，任何组件都可以直接调用来篡改认证状态
- **影响**: 绕过正常的 login/logout 流程修改认证状态，可能导致状态不一致（如跳过 tabSync 广播、跳过服务端登出）
- **建议**: 从 return 对象中移除 `setAuthData` 和 `clearAuth`，仅在 store 内部使用；如外部确需清除状态，统一走 `logout()`

### D-05 [低] PostCard 重复定义 Tailwind 已有的工具类

- **文件**: `src/components/post/PostCard.vue:506-518, 540-548`
- **问题**: `<style scoped>` 中手动定义了 `.line-clamp-2`、`.line-clamp-3`、`.animate-spin`，这些 Tailwind CSS 3.4 已内置
- **影响**: 冗余代码，且可能与 Tailwind 生成的类产生优先级冲突
- **建议**: 删除手动定义，直接使用 Tailwind 内置的 `line-clamp-2`、`line-clamp-3`、`animate-spin`

---

## 风险（可接受/需确认）

### W-01 [中] 路由错误处理泄露错误信息到 URL

- **文件**: `src/router/guards.ts:510-516`
- **问题**: `router.onError` 将 `error.message` 直接放入 URL query 参数 `?message=xxx`
- **影响**: 错误堆栈信息可能包含内部路径、组件名、API 地址等敏感信息，暴露在浏览器地址栏和服务端日志中
- **建议**: 移除 `message` 参数，仅保留 `error: 'router_error'` 错误码；详细错误信息通过 console.error 或监控系统上报

### W-02 [中] afterEach 中 console.info 记录路由变化

- **文件**: `src/router/guards.ts:499`
- **问题**: `console.info('Route changed: ${from.fullPath} -> ${to.fullPath}')` 在生产环境也会输出
- **影响**: 生产环境控制台噪音，且暴露内部路由结构
- **建议**: 移除或改为仅在 `import.meta.env.DEV` 下输出

### W-03 [中] AppHeader 全局 click 事件监听器未清理

- **文件**: `src/components/common/AppHeader.vue`
- **问题**: 用户下拉菜单通过 `document.addEventListener('click', ...)` 实现点击外部关闭，但未在 `onUnmounted` 中移除监听器
- **影响**: 组件卸载后监听器仍存在，造成内存泄漏；多次挂载/卸载后累积多个监听器
- **建议**: 在 `onMounted` 中注册，`onUnmounted` 中移除；或使用 VueUse 的 `onClickOutside` composable

### W-04 [低] Header 导航使用 emoji 图标

- **文件**: `src/components/common/AppHeader.vue:48-52`
- **问题**: 导航链接使用 emoji（🏠📝🏷️🏆）作为图标
- **影响**: 不同操作系统/浏览器渲染差异大，视觉不专业
- **建议**: 已在 Task 2.1 中覆盖，替换为 Lucide Icons

### W-05 [低] requiresGuest 守卫的开放重定向风险

- **文件**: `src/router/guards.ts:227, 361`
- **问题**: `const redirectTo = (to.query.redirect as string) || '/'` 直接使用 URL query 中的 `redirect` 参数进行跳转，未校验是否为站内路径
- **影响**: 攻击者可构造 `?redirect=https://evil.com` 实现开放重定向（Open Redirect），用于钓鱼攻击
- **建议**: 校验 `redirect` 参数必须以 `/` 开头且不包含 `//`（排除 `//evil.com` 形式）

### W-06 [低] PostCard 阅读时间估算逻辑不准确

- **文件**: `src/components/post/PostCard.vue:319-324`
- **问题**: `wordsPerMinute = 200` 基于英文阅读速度，中文阅读速度约 300-500 字/分钟；且使用 `content.length`（字符数）而非词数
- **影响**: 中文文章的阅读时间估算偏高
- **建议**: 中文按 400 字/分钟计算，或根据 locale 动态调整

### W-07 [低] routeLoadingGuard 为空实现

- **文件**: `src/router/guards.ts:267-279`
- **问题**: 函数体只有注释，没有实际逻辑，直接 `next()`
- **影响**: 死代码，增加阅读负担
- **建议**: 删除该函数，待实际需要时再添加

---

## 问题汇总

| 编号 | 级别 | 类别 | 摘要 |
|------|------|------|------|
| R-01 | 高 | 偏离架构 | PostCard 直接修改 props，违反单向数据流 |
| R-02 | 高 | 偏离架构 | 路由守卫逻辑完整重复（独立函数 vs setupRouterGuards） |
| R-03 | 高 | 偏离架构 | 页面标题硬编码"博客系统"而非"知构" |
| R-04 | 高 | 偏离架构 | Home.vue `</style>` 后有游离 CSS 代码（语法错误） |
| D-01 | 中 | 设计缺口 | 骨架屏暗色主题使用 `prefers-color-scheme` 而非 `data-theme` |
| D-02 | 中 | 设计缺口 | 样式体系混用（Tailwind / CSS 变量 / 硬编码） |
| D-03 | 中 | 设计缺口 | 字体系统不适配中文（Caveat + Quicksand） |
| D-04 | 中 | 设计缺口 | Auth Store 暴露内部方法 setAuthData / clearAuth |
| D-05 | 低 | 设计缺口 | PostCard 重复定义 Tailwind 已有的工具类 |
| W-01 | 中 | 风险 | 路由错误处理泄露 error.message 到 URL |
| W-02 | 中 | 风险 | afterEach 生产环境 console.info 路由变化 |
| W-03 | 中 | 风险 | AppHeader 全局 click 监听器未清理（内存泄漏） |
| W-04 | 低 | 风险 | Header 导航使用 emoji 图标 |
| W-05 | 低 | 风险 | requiresGuest 开放重定向风险 |
| W-06 | 低 | 风险 | 阅读时间估算不适配中文 |
| W-07 | 低 | 风险 | routeLoadingGuard 空实现死代码 |

---

## 结论

❌ 不可直接合并（存在 4 个高级别问题需先修复）

**必须在 UI 优化前修复的问题**:

1. **R-01** PostCard props 直接修改 — 这是数据流根基问题，UI 重构时如果不修会被放大
2. **R-04** Home.vue 游离 CSS — 语法错误，必须清理
3. **R-03** 页面标题"博客系统" → "知构" — 品牌一致性

**可与 UI 优化任务合并修复的问题**:

- R-02（守卫重复）可在路由重构时一并处理
- D-01 ~ D-03 已被 UI 优化 Task 覆盖
- W-01、W-05 属于安全类问题，建议单独提 hotfix

**整体评价**: 项目技术栈选型合理，Composition API + TanStack Query + Pinia 的组合成熟。主要问题集中在样式体系不统一、部分代码重复、以及中文适配缺失。这些问题大部分已被 `docs/tasks/zhicore-ui-tasks.md` 的任务覆盖，建议按 Phase 顺序推进。
