# composables/

通用可复用逻辑。与具体业务无关的工具型组合式函数。

## 与 features/ 的区别

| 维度 | composables/ | features/ |
|---|---|---|
| 耦合度 | 不依赖任何业务 API / store | 可能依赖业务 API / store |
| 复用范围 | 任何页面、任何组件都能用 | 只在特定业务流程内使用 |
| 例子 | `useDebounce`、`useFocusTrap`、`useIntersectionObserver` | `useLoginForm`、`usePostEditor` |

## 约定

- 文件名 `useXxx.ts`
- 返回类型使用接口声明（`UseXxxReturn`）
- 有副作用的（事件监听、定时器）必须在 `onUnmounted` 中清理
- 使用 JSDoc 注释说明参数和返回值

## 示例

```ts
// composables/useDebounce.ts
export function useDebounce<T>(source: Ref<T>, delay: number): Ref<T> {
  // ...
}
```
