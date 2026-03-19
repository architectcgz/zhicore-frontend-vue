# CODEX 索引

## 0. UI 设计风格（项目约定）

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

## 1. 全局样式与令牌
- 设计变量（颜色/间距/圆角/阴影）：`src/assets/styles/variables.css`
- 全局基础样式与通用类：`src/assets/styles/main.css`

## 2. 圆角规范（本轮新增）
- 圆角令牌说明：`docs/design/frontend/ui-radius-tokens.md`
- 主页 Hero 圆角使用：`src/pages/Home.vue`
- 主页侧栏区域圆角使用：`src/components/home/HomeSidebar.vue`

## 3. 去卡片化改造相关页面
- 默认布局与首页侧栏挂载位：`src/layouts/DefaultLayout.vue`
- 主页：`src/pages/Home.vue`
- 首页侧栏（当前仅热门文章）：`src/components/home/HomeSidebar.vue`
- 文章卡片（支持 `variant=plain`）：`src/components/post/PostCard.vue`
- 文章详情页：`src/pages/post/PostDetail.vue`
- 用户主页：`src/pages/user/Profile.vue`

## 4. 分类与标签分离入口
- 路由定义：`src/router/routes.ts`
- 顶部导航：`src/components/common/AppHeader.vue`
- 侧边导航：`src/components/common/AppSidebar.vue`
- 分类列表：`src/pages/category/CategoryList.vue`
- 分类详情：`src/pages/category/CategoryDetail.vue`
