# types/

补充类型定义。

## 职责

- 存放不属于 entities/ 核心实体、但跨模块使用的类型：
  - API 响应格式（`ApiResponse<T>`）
  - 通用 UI 类型（`MenuItem`、`SelectOption`）
  - 事件类型（路由事件、WebSocket 事件）
  - 配置类型
- 为第三方库补充类型声明（`*.d.ts`）

## 与 entities/ 的区别

| 维度 | entities/ | types/ |
|---|---|---|
| 内容 | 核心业务实体类型 | 辅助/跨切面类型 |
| 稳定性 | 变更少，是项目的"骨架" | 随业务迭代可能频繁调整 |
| 例子 | `Post`、`User`、`Comment` | `ApiResponse<T>`、`BreadcrumbItem`、`WsEvent` |

## 约定

- 按主题拆分子目录（`api/`、`ui/`、`events/` ...）
- 通过 `index.ts` 统一再导出
