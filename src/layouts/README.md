# layouts/

页面布局壳。提供页面外围的导航、侧栏、底栏等结构性框架。

## 职责

- 定义页面的整体 HTML 结构（header + main + footer）
- 管理侧栏展开/收起、响应式断点切换等布局级 UI 状态
- 包含 `<RouterView />` 作为内容区占位

## 约定

- 每个布局是一个 Vue SFC
- 通过 `defineProps` 接收布局需要的外部动作（如 `logout`）
- 布局之间互相独立，不嵌套依赖

## 示例

```vue
<!-- layouts/DefaultLayout.vue -->
<template>
  <div class="layout">
    <AppHeader />
    <main><RouterView /></main>
    <AppFooter />
  </div>
</template>
```
