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
├── api/           # provider HTTP 适配器（axios 封装 + 可复用 Req/Resp）
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
- 服务端数据由 feature workflow 发起；feature 可调用 `src/api` 中的 provider HTTP adapter，页面、布局和组件不直接调用 `src/api`
- 本地 mock API 必须在 `src/api` adapter 层实现，mock 返回值必须使用真实 `Req` / `Resp` DTO 类型；页面、组件、feature workflow 不添加 mock 开关、不 import `src/api/mock`，后续切真实 API 只能改 adapter / 环境开关。
- 路由按命名空间拆分（`src/router/routes/*Routes.ts`），新增路由模块后在 `src/router/index.ts` 注册
- 前端 route page、feature workflow、Pinia、API、组件、测试与 runtime 边界遵循 `docs/architecture/frontend-engineering-guidelines.md`
- CSS owner、命名、token、响应式与组件样式 contract 遵循 `docs/design/css-style-guide.md`
- 依赖变更后不要格式化 `pnpm-lock.yaml`；如果 lockfile 出现大范围格式化噪音，先恢复 lockfile 原格式，再运行 `pnpm install --lockfile-only` 生成最小 lockfile 变更。

## Git 提交身份

- 本项目提交作者固定使用 `DimensionR <architect0x0@foxmail.com>`，与 `ctf` 项目保持一致；不要使用 `codex <codex@local>`。

## 路由结构

| 路径                        | 名称                   | 认证 | 说明                   |
| --------------------------- | ---------------------- | ---- | ---------------------- |
| `/`                         | Home                   | 需要 | 首页                   |
| `/editor`                   | Editor                 | 无   | 正式编辑器工作台       |
| `/editor-document-showcase` | EditorDocumentShowcase | 无   | 工程文档展示器页面     |
| `/auth/login`               | Login                  | 游客 | 登录页                 |
| `/error/:status`            | ErrorStatus            | 无   | 错误状态页             |

## 测试

- `src/stores/__tests__/` — Pinia store 行为测试
- `src/api/__tests__/` — API 适配器测试
- 测试命令：`pnpm test:run`（单次）/ `pnpm test`（watch）
- TDD 写出的测试作为行为规格和回归护栏保留，不因功能完成就删除

### 验证范围策略

默认先跑与本次改动直接相关的最小充分验证，不把 `pnpm test:run` 全量测试当成每次固定动作。验证范围按风险递进：

| 场景 | 默认验证 |
| --- | --- |
| 单个 owner 内的 bugfix / 行为改动 | 先跑对应 owner 的定向测试；必要时补相邻工具函数、组件或架构约束测试 |
| 类型、导出、Vue props/emits、组合式 API 变化 | 跑定向测试后补 `pnpm typecheck` |
| 跨模块共享逻辑、公共基础设施、路由、runtime、API adapter、构建配置或依赖变化 | 跑相关测试、`pnpm typecheck`，并评估是否需要 `pnpm test:run` |
| 提交 / 合并前风险边界不清，或相关测试无法覆盖真实回归面 | 可以跑 `pnpm test:run`，但要说明触发原因 |
| 用户明确要求全量验证 | 跑 `pnpm test:run` |

提交前必须重新跑本次提交范围的最小充分验证；没有执行全量测试时，不要暗示已经完成全仓回归。

## 文档

- `docs/architecture/` — 前端代码组织、运行时边界和工程约束
- `docs/contracts/` — 前后端 API / DTO / 错误处理协作契约
- `docs/design/` — 前端视觉、交互和产品体验设计决策
  - `docs/design/pages/` — 页面初设计、页面分区、加载状态、空态 / 错误态 / degraded 态和跨页面约定
- `docs/reviews/` — 代码评审证据
- `docs/todos/debt/` — 技术债追踪

## 架构边界

- `src/entities/`：稳定业务对象类型，纯函数，不依赖 Vue / API / store
- `src/api/`：后端 provider 的 HTTP adapter 和可复用 `Req` / `Resp` owner；只做 URL、请求参数、envelope 解包、边界归一化和 API 层本地 mock，不做页面流程
- `src/features/`：业务流程 owner，可调 API 和 store；feature 内用 `composables/`、`lib/`、`config/`、明确第三方适配目录和 `ui/` 区分职责，不使用泛化的 `model/` 桶；仅当 endpoint 明确只服务单一 feature 且不会复用时，才允许放入 `features/<feature>/api/`
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
