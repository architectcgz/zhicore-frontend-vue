# CSS 规范

本文定义 ZhiCore 前端 CSS 的长期写法。目标不是限制视觉表达，而是避免样式 owner 漂移、页面级补丁堆叠、主题变量失控和响应式反复回归。

## 适用范围

- 适用于 `src/**/*.vue`、`src/style.css` 和后续新增的全局样式文件。
- Vue SFC 默认使用 `<style scoped>`。
- 全局样式只放 reset、字体、全局 design token、应用壳级别结构，不承载具体业务组件样式。

## 核心原则

1. 组件自己管理自己的结构样式。
2. 父组件只负责布局关系和主题变量，不穿透子组件内部 DOM。
3. 可复用视觉值先抽象为语义变量，再落到组件样式。
4. 页面样式只做页面级 composition，不复制组件内部规则。
5. 新增样式优先解决 owner 边界，不靠更长 selector 抢优先级。

## 文件职责

### `src/style.css`

只允许放：

- `:root` 全局色彩、阴影、字号、间距、圆角、z-index token。
- `html`、`body`、`#app`、`*`、`button`、`input`、`a` 这类基础 reset。
- 应用级明暗主题覆盖。

不允许放：

- 某个页面或组件的 `.xxx-card`、`.xxx-button` 细节。
- 为修一个组件而写全局 selector。
- 业务页面专属布局。

### `src/pages/**`

页面是路由装配面，只写：

- 页面根容器。
- 页面级分栏、主内容宽度、上下文间距。
- route page 与 layout 的衔接。

页面不写：

- 子组件内部标题、按钮、列表、卡片细节。
- 对子组件内部类名的覆盖。
- 与其他页面重复的一整套 header / toolbar / card CSS。

### `src/components/**`

组件拥有自己的 DOM 结构和结构样式：

- 组件根类名、内部元素类名、状态类名都在组件内定义。
- 可被父级定制的部分通过 props、公开 class、slot 或 CSS variable contract 暴露。
- 子组件不得依赖父组件给内部 DOM 补关键样式。

### `src/features/**`

feature 层以状态、行为和业务流程为主。只有当某个 UI 组件明确属于 feature 且不适合放入 `components/` 时，才在 feature 内写 SFC 样式。

## 命名规则

使用 BEM 风格，按组件根类名组织：

```css
.editor-preview {
}

.editor-preview__header {
}

.editor-preview__title {
}

.editor-preview--compact {
}
```

规则：

- 根类名必须能表达 owner，例如 `.editor-preview`、`.login-panel`，不要使用 `.card`、`.title`、`.content` 这种全局含义过宽的名字。
- 元素类用 `__`，状态或变体用 `--`。
- 交互状态优先用 `[aria-pressed="true"]`、`:disabled`、`:focus-visible` 等语义 selector，少造 `.active`。
- 不用 ID selector 写样式。
- 不通过增加 selector 长度解决覆盖问题。

## Design Token

### 全局 token

全局 token 放在 `src/style.css` 的 `:root` 中，按语义命名：

```css
:root {
  --color-bg: #f8fafc;
  --color-panel: rgba(255, 255, 255, 0.92);
  --color-border: rgba(100, 116, 139, 0.16);
  --color-text: #0f172a;
  --color-text-soft: #64748b;
  --color-primary: #2563eb;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-pill: 999px;
}
```

新增 token 的标准：

- 同一视觉值在 3 个以上位置复用，或者它表达稳定语义。
- token 名称描述用途或层级，不描述当前颜色外观，例如用 `--color-text-soft`，不要用 `--gray-500`。
- 明暗主题都能解释这个 token。

### 组件变量

组件内部可以定义自己的局部变量，父组件通过变量改主题：

```css
.reader-preview {
  --reader-text: var(--color-text-soft);
  --reader-heading: var(--color-text-strong);
  --reader-link: var(--color-primary);

  color: var(--reader-text);
}

.editor-showcase--ink .reader-preview {
  --reader-text: #c1ccd6;
  --reader-heading: #ffffff;
  --reader-link: #d7e5ea;
}
```

规则：

- 子组件使用变量，不读取父组件内部类名。
- 父组件覆盖变量，不写 `.parent .child__internal`。
- 变量名带组件前缀，例如 `--reader-*`、`--editor-*`。
- 如果变量越来越多，优先评估是否需要 named variant，而不是无限扩变量。

## 颜色规范

- 默认使用 `var(--color-*)` 或组件变量。
- 允许在主题候选、品牌背景、一次性视觉实验中使用硬编码颜色，但要限定在组件 owner 内。
- 同一种语义颜色不要在多个组件里反复硬编码。
- 新增危险、成功、警告、信息色时，先补全全局 token，再使用。
- 不让页面长期由单一色相统治；背景、边框、正文、强调色要有明确层次。

推荐：

```css
.notice {
  border: 1px solid var(--color-border);
  background: var(--color-panel);
  color: var(--color-text);
}
```

避免：

```css
.notice {
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1d4ed8;
}
```

## 间距与尺寸

基础间距按 4px 栅格：

- `4px`、`8px`、`12px`、`16px`、`20px`、`24px`、`32px`、`40px`、`48px`。
- 新增布局优先使用 `var(--space-*)`；存量裸值可以逐步迁移。
- 页面外边距、section gap、toolbar gap 应使用语义变量，避免多个容器叠加出不可控空白。

固定格式 UI 必须有稳定尺寸：

- toolbar 按钮、icon button、tab、计数器、编辑器工具栏、预览容器、表格列宽，需要设置 `min-*`、`max-*`、`aspect-ratio` 或 grid track。
- hover、focus、loading、字数变化不能撑大容器导致布局跳动。

## 圆角与阴影

默认圆角：

- 小控件：`4px` 或 `6px`。
- 卡片、面板、代码块、表格外框：`8px`。
- badge、segmented control、头像：`999px`。

规则：

- 新增卡片默认不超过 `8px`。
- 大圆角只用于明确的品牌容器或特殊展示面，并且应在组件文档或代码附近能解释。
- 阴影用于层级，不用于装饰；同一层级使用同一套 shadow token。

## 排版

- 正文优先使用全局字体栈。
- 不用 `vw` 直接驱动字体大小；新增 `font-size: clamp(..., vw, ...)` 默认禁止。
- 页面标题、卡片标题、正文、辅助文字应形成固定层级，不在每个页面重新定义一套。
- `letter-spacing` 默认 `0`；只有 eyebrow、表头、短标签这类场景可使用正值。
- 文本必须在移动端和桌面端都能容纳最长词，不得溢出按钮、卡片或侧栏。

## 响应式

推荐断点：

- `640px`：手机布局收口。
- `768px`：窄平板。
- `980px`：左右分栏转上下布局。
- `1200px`：宽屏内容约束。

规则：

- 响应式优先改变布局结构，例如 grid 列数、容器宽度、工具栏换行。
- 不用缩小字体解决布局问题。
- 移动端优先保证主操作可见，不把关键按钮挤到横向滚动里。
- 滚动容器要明确 `overflow`、`overscroll-behavior` 和最大高度来源。

## Scoped、`:global` 与 `:deep`

### 默认

- SFC 使用 `<style scoped>`。
- 子组件样式写在子组件内。
- 父组件通过 CSS variable、props、slot class 或公开 root class 定制子组件。

### `:global`

只允许用于：

- 主题根类影响组件公开变量，例如 `.editor-showcase--ink .reader-preview`。
- 应用壳级全局状态，例如 `[data-theme="dark"]`。

### `:deep`

默认禁止。

确实需要时必须满足全部条件：

- 目标是第三方组件内部结构，或短期迁移期间无法改子组件 owner。
- 在代码旁写清 owner 和退场条件。
- 优先考虑把样式 contract 移到子组件，而不是让父组件继续穿透。

CTF 前端重构已经验证过：父级 `:deep(.section-card__body)` 这类写法会让共享组件 owner 漂移，后续任何内部 DOM 调整都会引发跨页面回归。ZhiCore 新代码不重复这个模式。

## 交互状态

所有可交互元素必须覆盖：

- `:hover`：轻微反馈，不改变布局尺寸。
- `:focus-visible`：键盘可见焦点。
- `:disabled` 或 `[aria-disabled="true"]`：可识别的禁用态。
- `aria-pressed`、`aria-current`、`aria-selected` 等语义状态。

动画规则：

- 普通过渡时长控制在 `120ms` 到 `260ms`。
- 使用 `opacity`、`transform`、`background-color`、`border-color`。
- 避免频繁动画 `width`、`height`、`top`、`left`。
- 必须支持 `prefers-reduced-motion: reduce`。

## 组件样式 contract

当父组件需要改变子组件视觉时，优先按顺序选择：

1. 子组件提供 prop，例如 `variant="quiet"`。
2. 子组件公开 CSS variable，例如 `--reader-text`。
3. 子组件公开 root class，例如 `.reader-preview`。
4. 子组件提供 slot，让父组件渲染可控结构。
5. 最后才考虑 `:deep`，并记录退场条件。

示例：

```vue
<EditorPreviewPane class="editor-workspace__preview" />
```

```css
.editor-workspace__preview {
  --reader-text: var(--color-text-soft);
  --reader-link: var(--color-primary);
}
```

不要写：

```css
.editor-workspace :deep(.reader-preview__link) {
  color: var(--color-primary);
}
```

## 页面新增检查清单

- [ ] 页面只负责布局，不覆盖子组件内部类名。
- [ ] 新颜色来自 `var(--color-*)` 或局部组件变量。
- [ ] 新间距来自 `var(--space-*)` 或语义变量。
- [ ] 卡片、表格、代码块圆角默认不超过 `8px`。
- [ ] 所有按钮、链接、表单控件有 `:focus-visible`。
- [ ] hover / loading / 计数变化不会改变布局尺寸。
- [ ] 移动端没有横向溢出。
- [ ] 没有新增 `:deep`；如果有，已有 owner 和退场条件。
- [ ] 没有新增 `font-size` 的 `vw` 缩放。
- [ ] `prefers-reduced-motion` 覆盖了非必要动画。

## 存量迁移优先级

1. 把重复颜色、间距、阴影提升到全局 token。
2. 把 editor reader 这类已经形成主题变量的区域保持为“父级覆盖变量，子组件消费变量”。
3. 收敛页面级裸值，尤其是重复出现的 `padding`、`gap`、`border-radius`。
4. 检查并移除不必要的 `:global` 和潜在 `:deep`。
5. 为高频页面补充视觉回归或组件测试，防止样式 contract 被无意破坏。
