# zhicore-frontend-vue

知构（ZhiCore）内容社区平台前端。

## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript (strict mode)
- Vite 7
- Pinia 3 (客户端状态)
- Vue Router 4
- Axios (HTTP 客户端)
- Vitest + happy-dom (测试)

## 项目结构

基于 Feature-Sliced Design（简化版，去掉了 widgets/）：

```
src/
├── api/           # API 适配器（axios 封装 + 业务接口）
├── components/    # UI 组件，按业务领域分组（post/, comment/, user/, common/）
├── composables/   # 通用可复用逻辑（useDebounce, useFocusTrap ...）
├── entities/      # 稳定业务实体类型与纯函数（user, post, comment ...）
├── features/      # 业务流程 owner（auth, post-crud, comment, notification ...）
├── layouts/       # 页面布局壳（DefaultLayout, AuthLayout, AdminLayout）
├── pages/         # 路由装配面（每个 route 对应一个 page）
├── router/        # 路由定义（按命名空间拆分）+ 守卫
├── runtime/       # 全局错误运行时（HTTP 401 / Vue error / router error）
├── stores/        # Pinia store（仅客户端状态）
├── types/         # 补充类型定义（API 响应、事件、配置等跨模块类型）
├── utils/         # 纯函数工具（格式化、校验、常量）
└── test/          # 测试 setup 与共享工具
```

## 常用命令

```bash
pnpm dev              # 开发服务器（http://localhost:5173）
pnpm build            # 生产构建
pnpm typecheck        # TypeScript 类型检查
pnpm test             # 运行测试（watch 模式）
pnpm test:run         # 单次运行测试
pnpm format           # Prettier 格式化
```

## 开发约定

- 所有新页面使用 `<script setup lang="ts">` + Composition API
- Props / Emits 使用 `defineProps<Props>()` / `defineEmits<Emits>()` 类型声明
- 服务端数据通过 API 模块获取，客户端状态放 Pinia store
- 路由按命名空间拆分（`src/router/routes/*Routes.ts`），新增路由模块后在 `src/router/index.ts` 注册

## 路由结构

| 路径                        | 名称                   | 认证 | 说明                   |
| --------------------------- | ---------------------- | ---- | ---------------------- |
| `/`                         | Home                   | 需要 | 首页                   |
| `/editor-showcase`          | EditorShowcase         | 无   | 编辑器视觉与交互展示页 |
| `/editor-document-showcase` | EditorDocumentShowcase | 无   | 工程文档展示器页面     |
| `/auth/login`               | Login                  | 游客 | 登录页                 |
| `/error/:status`            | ErrorStatus            | 无   | 错误状态页             |

## 测试

- `src/stores/__tests__/` — Pinia store 行为测试
- `src/api/__tests__/` — API 适配器测试
- 测试命令：`pnpm test:run`（单次）/ `pnpm test`（watch）
- TDD 写出的测试作为行为规格和回归护栏保留，不因功能完成就删除

## 文档

- `docs/design/` — 前端视觉、交互和产品体验设计决策
- `docs/reviews/` — 代码评审证据
- `docs/todos/debt/` — 技术债追踪

## 架构边界

- `src/entities/`：稳定业务对象类型，纯函数，不依赖 Vue / API / store
- `src/features/`：业务流程 owner，可调 API 和 store，不渲染 UI
- `src/components/`：UI 渲染，通过 props/emits 收发数据，不做业务决策
- `src/pages/`：route composition surface，装配 components + features + layouts
- `src/layouts/`：页面结构壳，包含 RouterView
- `src/composables/`：通用 Vue 逻辑，不耦合具体业务
- `src/utils/`：纯 JS/TS 函数，不依赖 Vue 响应式系统
- `src/types/`：跨模块补充类型
- `src/router/routes/`：按路由命名空间拆分

## 测试文件放置规则

- `src/entities/**/__tests__`：实体类型守卫、纯函数单元测试
- `src/features/**/__tests__`：feature 状态机、校验、异步流程测试
- `src/components/**/__tests__`：组件渲染、props/emits 行为测试
- `src/pages/**/__tests__`：route / page 入口集成测试
- `src/composables/**/__tests__`：通用 composable 行为测试
- `src/layouts/**/__tests__`：布局结构测试
- `src/api/__tests__`：API adapter、请求参数、响应映射测试
- `src/stores/__tests__`：Pinia store 行为、持久化、权限状态测试
- `src/router/__tests__`、`src/runtime/__tests__`：基础设施 owner 测试
- `src/__tests__`：跨切面架构防线测试（新增前需能说明为何不能贴近具体 owner）
- `src/test`：Vitest setup、测试环境适配和稳定复用的测试工具
