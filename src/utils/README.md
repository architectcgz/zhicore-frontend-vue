# utils/

纯函数工具库。不依赖 Vue 响应式系统的通用工具。

## 职责

- 格式化（日期、数字、文本截断）
- 校验（表单字段、URL、ID 格式）
- 常量定义（`constants.ts`）
- 纯算法工具（排序、过滤、编码）

## 与 composables/ 的区别

| 维度 | utils/ | composables/ |
|---|---|---|
| Vue 依赖 | 纯 JS/TS，不依赖 Vue | 依赖 Vue 响应式 API（ref/watch/onMounted） |
| 使用方式 | 直接 `import { fn } from '@/utils/xxx'` | 在 `<script setup>` 或 composable 中调用 |
| 例子 | `formatDate`、`isValidEmail` | `useDebounce`、`useIntersectionObserver` |

## 约定

- 纯函数，无副作用
- 输入输出类型明确
- 使用 JSDoc 注释
