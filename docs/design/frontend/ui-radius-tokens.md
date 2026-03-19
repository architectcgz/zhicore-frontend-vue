# UI 圆角令牌参考

## 放置位置
- 全局圆角令牌：`src/assets/styles/variables.css`
- 页面内引用：各页面/组件的 `<style scoped>` 通过 `var(--token-name)` 使用

## 当前新增的场景化圆角令牌
- `--radius-home-hero`
  - 用途：主页 Hero 区圆角（桌面）
  - 当前值：`var(--radius-lg)`
- `--radius-home-hero-mobile`
  - 用途：主页 Hero 区圆角（移动端）
  - 当前值：`var(--radius-md)`
- `--radius-home-sidebar-section`
  - 用途：主页侧栏“热门文章”区轻微圆角
  - 当前值：`calc(var(--radius-md) - 4px)`
- `--radius-header-shell`
  - 用途：顶部导航栏容器圆角（桌面）
  - 当前值：`var(--radius-lg)`
- `--radius-header-shell-mobile`
  - 用途：顶部导航栏容器圆角（移动端）
  - 当前值：`var(--radius-md)`
- `--radius-header-button`
  - 用途：顶部导航栏主要按钮圆角（导航项/搜索容器/主操作按钮）
  - 当前值：`var(--radius-md)`
- `--radius-header-button-compact`
  - 用途：顶部导航栏紧凑按钮圆角（小图标按钮/头像块）
  - 当前值：`calc(var(--radius-md) - 2px)`
- `--radius-auth-header-shell`
  - 用途：登录/注册布局顶部 Header 容器圆角（桌面）
  - 当前值：`var(--radius-lg)`
- `--radius-auth-header-shell-mobile`
  - 用途：登录/注册布局顶部 Header 容器圆角（移动端）
  - 当前值：`var(--radius-md)`
- `--radius-auth-header-button`
  - 用途：登录/注册布局顶部 Header 内按钮圆角（如主题切换）
  - 当前值：`var(--radius-md)`

## 使用建议
- 优先使用全局令牌，不在页面里写死 `8px/12px/16px`。
- 组件有“场景语义”时，新增场景化令牌；不要直接复用不匹配语义的通用令牌名。
- 改视觉风格时，优先改 `variables.css` 中令牌值，减少页面级逐个调整。
