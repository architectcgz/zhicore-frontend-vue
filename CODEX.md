# CODEX 索引

## 0. 前端编码规范（必须遵守）

### 技术基线
- 默认技术栈：Vue 3 + Composition API + `<script setup lang="ts">`。
- 新增或重构 `.vue` 文件时，不使用 Options API，除非该目录已有明确历史约束且本次任务只做局部修复。
- 所有前端新增代码默认开启 TypeScript 严格思维，不能依赖 `any` 兜底。

### 组件职责与拆分
- 路由页组件只负责页面装配、路由参数接入、查询组合和子组件编排，不承载完整 feature 实现。
- 公共组件只做单一职责，不同时承担“数据获取 + 业务编排 + 大段展示模板”三类职责。
- 满足任一条件时必须拆分组件或抽 composable：
  - 一个组件同时包含数据编排和多个独立展示区块。
  - 一个页面含有表单、筛选、列表、分页、侧栏等 3 个及以上独立区块。
  - 同类模板片段已经出现重复，或明显具备复用价值。
- 默认拆分方向：
  - 页面保留在 `src/pages/**`
  - 可复用展示块放入 `src/components/<feature>/**`
  - 状态、副作用、事件监听、数据整形放入 `src/composables/useXxx.ts`
- 拆分优先按“稳定职责边界”进行，而不是按视觉行数或机械单一职责切碎：
  - 页面层：保留路由参数接入、页面级查询装配、子组件编排。
  - feature composable 层：保留该页面独有的状态编排、派生数据、事件分发。
  - 通用/子 composable 层：仅在某段状态逻辑可独立复用、可独立测试、或明显形成单独状态域时再抽离。
  - 展示组件层：按完整展示区块拆分，如 Header、Tabs、List、Sidebar、Toolbar；不要把一个自然连续的信息块继续切成没有独立复用价值的微组件。
- 明确禁止过度细化。出现以下情况时应停止继续拆分：
  - 拆分后的子文件只是把少量模板原样搬走，没有形成新契约、新复用或新的测试价值。
  - 父组件只是增加 import、透传 props/emits，复杂度没有下降。
  - 一个子组件只服务单一父组件、内容很短、结构稳定，且没有第二种展示形态或复用预期。
  - 为了满足行数软上限而把同一个语义完整区块硬拆成多个 50-100 行小文件。
- 允许保留在同一文件中的情况：
  - 一个组件内部只有一个连续展示块，且脚本/模板阅读成本仍然低。
  - 一个展示块的子部分高度耦合，拆开后会引入大量 props、slot 或事件透传。
  - 一个 feature 已经形成“页面装配 + feature composable + 2~4 个主要子块”的清晰结构，此时优先停止，除非出现新增复用或明显膨胀。
- 具体粒度边界要求：
  - 不要把 Header 再机械拆成头像、用户名、统计、按钮等纯叶子碎片，除非这些片段存在独立复用、独立交互或独立测试价值。
  - 不要把列表页/标签页为每个 tab 单独复制一套加载、错误、空态壳；这类重复壳应抽公共层。
  - 不要把事件接口按每个 tab、每个按钮无限展开；优先收敛为带 key 的稳定事件契约。
  - 不要把纯样式包装层抽成组件；只有当它承载稳定语义或交互边界时才抽。
- 禁止继续堆积超大单文件。新增代码时遵循以下软上限，超出即优先拆分：
  - 普通组件：300 行
  - 路由页组件：500 行
  - composable：220 行
- 上述行数只是预警线，不是强制切分线。超过时先判断是否存在真实职责边界；若不存在，优先局部整理、提纯派生逻辑、合并重复模板，而不是生硬新增文件。

### 数据流与状态管理
- 遵循 `props down, events up`，子组件不直接修改父组件状态。
- 组件通信优先使用 `defineProps`、`defineEmits`、`v-model` 明确声明契约。
- 仅在跨 3 层以上或强共享上下文时使用 `provide/inject`，并使用显式类型。
- Pinia store 只放跨页面共享状态；页面私有状态留在页面或 feature composable 内。
- 派生状态统一使用 `computed`，`watch/watchEffect` 只用于副作用，不用于维护本可推导的数据。

### TypeScript 约束
- 禁止在业务代码中新增裸 `any`、`as any`、`Record<string, any>`。
- 确实无法精确定义时，优先使用：
  - `unknown`
  - 精确联合类型
  - 泛型约束
  - `Record<string, unknown>`
- API 响应、路由参数、组件 props、emit payload、query/mutation 入参都必须有明确类型。
- 类型断言必须说明理由；可以缩小类型时，不用宽泛断言掩盖问题。

### Vue SFC 规范
- SFC 结构顺序固定为：`<script setup>` -> `<template>` -> `<style scoped>`。
- 模板内只保留直接渲染相关表达式；复杂判断、过滤、排序、样式映射放到 `computed` 或纯函数中。
- 组件文件名使用 PascalCase，composable 使用 `useXxx.ts`。
- props 使用类型式声明；可选 props 要么通过 `withDefaults` 提供默认值，要么有明确的脚本内 fallback，风格保持一致。
- emits 必须显式声明，不依赖隐式事件约定。

### 查询、异步与副作用
- 服务端数据获取优先通过 `src/queries/**` 下的 query/mutation composable，不在页面和公共组件里直接散落请求逻辑。
- 与 DOM、定时器、滚动、键盘、WebSocket、BroadcastChannel 相关的副作用优先抽到 composable。
- 异步流程必须处理 loading、empty、error 三种基本状态，页面错误展示统一复用公共错误状态组件。
- 禁止在多个页面重复实现相同的数据整形和异常处理逻辑。

### 日志与错误处理
- 禁止在业务组件中直接保留调试型 `console.log`。
- `console.error`、`console.warn` 仅允许出现在以下位置：
  - 统一错误处理层
  - 基础设施层（如请求封装、WebSocket、router guard）
  - 明确受 `import.meta.env.DEV` 保护的开发日志
- 页面交互失败优先走统一错误消息工具，不在每个页面随意拼接提示文案和日志格式。
- TODO 型错误上报逻辑不能长期滞留在公共组件里；若暂未接入，需要标注挂载点和后续落地方向。

### 安全与渲染约束
- 禁止直接对用户内容使用 `v-html`。
- 使用 `v-html` 时必须满足两点：
  - 内容已通过统一的 sanitize 流程
  - 在代码中能明确看出 sanitize 来源
- 图片、链接、上传、富文本、Markdown 渲染都必须经过边界检查和失败兜底。

### 样式规范
- 优先复用设计令牌：颜色、间距、圆角、阴影、动效统一来自 `src/assets/styles/variables.css`。
- 页面和组件样式默认使用语义化 class，不依赖 scoped 下的裸元素选择器堆样式。
- 禁止硬编码常用设计值，如 `8px/12px/16px`、临时品牌色、随意阴影。
- 新样式先判断是否属于全局 token、全局基础样式还是组件私有样式，避免样式职责混乱。

### 可访问性与交互
- 可点击元素优先使用原生 `button`、`a`、`router-link`，避免用 `div` 模拟交互。
- 表单控件、图标按钮、图片、弹层必须具备基础可访问性属性，如 `label`、`aria-*`、焦点态和键盘可达性。
- 键盘、滚动、焦点陷阱、快捷键逻辑统一抽离，不在多个组件重复实现。

### 测试与交付
- 新增复杂逻辑时，至少补对应的单元测试或 composable 测试。
- 修复 bug 时，优先补最小复现测试，避免只改实现不补验证。
- 提交前至少确保本次改动相关的 `lint`、类型检查和测试通过；不能验证时要明确说明。
- 重任务验证默认串行执行，不要把 `vitest`、`vue-tsc`、`vite build`、Playwright、全链路脚本等高负载任务并发一起跑。
- 默认不要主动开启额外并行度：不加 Maven `-T`，前端测试/构建也不额外提高 worker/threads 数；如确需并发，先说明原因并控制范围。
- 出现“测试卡死/机器打满”风险时，优先拆成多次小验证，而不是一次性并发跑完整回归。

## 1. UI 设计风格（项目约定）

### 视觉基调
- 风格关键词：内容优先、轻拟物层次、低卡片感、可读性优先。
- 页面主背景：使用 `--gradient-page`，避免大面积纯色平铺。
- 强调色：以 `--color-cta`（青绿）为主，`--color-accent`（暖金）为辅，不做高饱和大面积填充。

### 容器与分层
- 默认策略：优先“分隔线 + 轻微底色”区分模块，而不是卡片外框。
- `surface-panel` 仅用于确实需要悬浮层感的区域（如下拉、弹层、认证卡片），内容主区尽量减少使用。
- 首页与文章页遵循去卡片化方向：减少边框、阴影、重背景块，保留信息层级和留白节奏。

### 当前确认风格（必须延续）
- 以下路由主区域必须保持无卡片壳：`/posts`、`/categories`、`/tags`、`/ranking`（以及对应详情页）。
- 首页右侧“阅读推荐”保留轻背景分区，但不做整体卡片 hover；交互重点放在“每条文章项 hover”。
- 顶部导航（主站 Header + 登录页 Header）使用中等圆角，不使用过度胶囊化弧度。
- Category 与 Tag 必须保持语义和路由分离，不可互相替代。

### 圆角体系
- 圆角统一走全局变量：`src/assets/styles/variables.css`。
- 优先使用通用令牌：`--radius-sm/md/lg/xl/2xl/full`。
- 场景化圆角走专用令牌（已落地）：
  - `--radius-home-hero`
  - `--radius-home-hero-mobile`
  - `--radius-home-sidebar-section`
  - `--radius-header-shell`
  - `--radius-header-shell-mobile`
  - `--radius-header-button`
  - `--radius-header-button-compact`
  - `--radius-auth-header-shell`
  - `--radius-auth-header-shell-mobile`
  - `--radius-auth-header-button`
- 详细说明见：`docs/design/frontend/ui-radius-tokens.md`。

### 文字与信息密度
- 标题使用 `--font-heading`，正文使用 `--font-body`。
- 长文内容优先可读性：更宽行距、清晰段落间距、避免装饰性背景干扰正文。
- 统计信息/元信息弱化为次级文本色（`--color-text-secondary/tertiary`）。

### 交互与状态
- Hover/Active 使用 `--color-bg-hover` 与 `--color-hover`，避免重阴影跳动。
- 焦点态统一依赖全局 `:focus-visible`（`--shadow-focus`），保证可访问性。
- 动效节奏统一使用 `--transition-fast/base/slow`，避免组件自行定义突兀时长。
- 错误提示统一使用无卡片化样式组件 `src/components/common/SiteErrorState.vue`，避免页面各自维护不同风格的错误卡片。

### 亮暗主题一致性
- 亮色和暗色保持同一信息层级，不允许仅暗色可读、亮色对比不足。
- 同一组件在亮暗模式下仅调整颜色，不改变结构与交互语义。

### 禁止项
- 禁止在页面中随意硬编码圆角（如 `8px/12px/16px`），应优先使用令牌。
- 禁止在内容主容器滥用“大圆角+重阴影+实色背景”形成卡片堆叠。
- 禁止把 Category 和 Tag 混为同一概念或同一路由语义。

## 2. 全局样式与令牌
- 设计变量（颜色/间距/圆角/阴影）：`src/assets/styles/variables.css`
- 全局基础样式与通用类：`src/assets/styles/main.css`

## 3. 圆角规范（本轮新增）
- 圆角令牌说明：`docs/design/frontend/ui-radius-tokens.md`
- 主页 Hero 圆角使用：`src/pages/Home.vue`
- 主页侧栏区域圆角使用：`src/components/home/HomeSidebar.vue`

## 4. 去卡片化改造相关页面
- 默认布局与首页侧栏挂载位：`src/layouts/DefaultLayout.vue`
- 主页：`src/pages/Home.vue`
- 首页侧栏（当前仅热门文章）：`src/components/home/HomeSidebar.vue`
- 文章卡片（支持 `variant=plain`）：`src/components/post/PostCard.vue`
- 文章详情页：`src/pages/post/PostDetail.vue`
- 用户主页：`src/pages/user/Profile.vue`

## 5. 分类与标签分离入口
- 路由定义：`src/router/routes.ts`
- 顶部导航：`src/components/common/AppHeader.vue`
- 侧边导航：`src/components/common/AppSidebar.vue`
- 分类列表：`src/pages/category/CategoryList.vue`
- 分类详情：`src/pages/category/CategoryDetail.vue`
