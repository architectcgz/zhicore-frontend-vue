# 前端工程规范

本文定义 ZhiCore 前端在页面、feature、状态、API、组件、测试和运行时错误上的工程边界。它补充 `AGENTS.md` 中的目录职责，避免后续业务增长时重复 CTF 前端里出现过的“大页面控制器”“全局 store 垃圾桶”“请求层直接跳页”“组件 owner 漂移”等问题。

## 总原则

1. 页面入口保持薄，只装配，不承载业务流程。
2. 用户动作、异步请求、路由参数解析和状态机优先进入 feature-local workflow；组合函数、纯函数、配置和第三方适配按目录分开。
3. Pinia 只保存真正跨页面共享的状态。
4. API 层只做请求、响应解包和数据归一化，不直接决定 UI 和导航。
5. 组件按 owner 放置，跨 feature 组合时再引入更高层，不提前造复杂层级。
6. 可恢复错误留给页面或 feature 处理，真正全局错误由 `runtime/` 接管。
7. 重要边界要有测试或脚本守住，不能只靠文档记忆。

## 当前分层

ZhiCore 目前采用简化版 Feature-Sliced Design：

```text
src/
├── api/           # provider HTTP 适配器和可复用领域 API
├── components/    # 可复用 UI 组件，按业务领域或 common 分组
├── composables/   # 通用 Vue 组合逻辑，不绑定具体业务
├── entities/      # 稳定业务对象类型、纯函数和低耦合展示
├── features/      # 用户动作、页面流程、状态机和 feature-local workflow
├── layouts/       # 应用布局壳
├── pages/         # 路由入口，只做装配
├── router/        # 路由表和守卫
├── runtime/       # 全局运行时能力
├── stores/        # Pinia 跨页面共享状态
├── types/         # 跨模块补充类型
├── utils/         # 纯工具函数
└── test/          # 测试 setup 和共享测试工具
```

暂不新增 `widgets/` 或 `shared/` 层。只有当下面条件出现时再引入：

- 同一个页面级工作区需要组合多个 feature，且它本身不拥有 API 或状态机，可以新增 `widgets/<name>/`。
- 多个 feature 共享无业务语义的 UI 原语、组合逻辑或 lib，且 `components/`、`composables/`、`utils/` 已无法表达 owner，可以评估引入 `shared/`。

新增层级前必须同步更新本文、`AGENTS.md` 和对应测试边界。

## Route Page 规范

`src/pages/**` 是运行时 route entry。

页面可以做：

- 组合 layout、component、feature UI。
- 从 feature public API 读取 page workflow。
- 做很薄的事件转发。
- 处理纯展示级本地状态，例如只影响当前页面布局的展开状态。

页面不做：

- 直接 import 非 contract API 模块。
- 直接持有复杂 `useRoute()`、`useRouter()`、query tab、分页、筛选、导出、保存、删除等业务 owner。
- 在 `onMounted` / `watch` 中编排多条业务请求。
- 直接写权限判断替代 router guard。
- 把一个页面扩成几百行的大型控制器。

推荐形态：

```vue
<script setup lang="ts">
import { usePostEditorPage } from "@/features/post-editor";
import PostEditorWorkspace from "@/components/post/PostEditorWorkspace.vue";

const page = usePostEditorPage();
</script>

<template>
  <PostEditorWorkspace
    :draft="page.draft.value"
    :saving="page.saving.value"
    @save="page.save"
  />
</template>
```

当 route page 开始直接处理请求、query、权限、提交防重或错误恢复时，应拆到 `features/<feature>/composables`；配套纯函数、映射和配置分别放入该 feature 的 `lib/`、`config/` 或明确的第三方适配目录。

## Feature 内部目录规范

`src/features/<feature>/composables` 是页面级行为 owner。它保存业务流程组合函数、表单状态、异步动作、路由参数解析和局部 loading / error / empty 状态。

适合放入 `composables/`：

- 页面请求编排。
- route params / query 解析与规范化。
- 表单草稿、校验、提交防重。
- 保存、发布、删除、导入、导出等用户动作。
- loading / error / empty 等局部状态。
- 业务状态机和派生数据。
- 对 API DTO 到页面 view model 的适配。

`composables/` 不做：

- 长期持有跨页面共享状态。
- 直接渲染 UI。
- 把多个无关流程塞进一个超大 composable。

feature 内部非组合函数按职责拆分：

- `lib/`：feature-local 纯函数、状态机、DTO/view model 映射、持久化 helper、滚动计算等非 Vue 逻辑。
- `config/`：工具栏、选项、默认值、静态候选项等配置。
- `api/`：只允许放真正 feature-private 的 HTTP adapter。判断标准是该 endpoint 只服务当前用户流程，其他 feature 不应复用；一旦属于后端 provider 的稳定资源能力，应提升到 `src/api/<provider>.ts`。
- 明确第三方适配目录：例如 editor 的 `tiptap/` 放 Tiptap runtime、扩展和命令适配。
- `ui/`：只服务单一 feature 的 page-sized UI。

features 下不再使用泛化的 `model/` 目录；这个名称容易把组合函数、配置、第三方适配和领域模型混为一谈。

拆分规则：

- 一个 composable 超过 3 类责任时，拆成 loader、actions、bindings、validation 等小 owner。
- 同一份 normalize / default / validate 只能有一个 owner，不在页面、API 和组件里各写一份。
- 暴露给外部的 feature 能力通过 `features/<feature>/index.ts` 出口导出；需要 feature 内部实现时，路径也应体现 `composables/`、`lib/`、`config/` 或第三方适配目录的职责。

## Pinia Store 规范

Pinia 只承载跨页面共享、多个模块需要同时读取或写入的状态。

适合进入 store：

- 当前登录用户、角色、session restore 状态。
- 顶栏和多个页面共享的通知摘要。
- 未来多个页面同时依赖的用户偏好、主题、编辑器草稿索引等。

不适合进入 store：

- 单页分页、筛选、排序。
- 局部表单草稿。
- 一次性提交中的 loading。
- 当前弹窗开关。
- route query、tab、详情页局部数据。

store 约束：

- store 不直接 `router.push()`，导航交给 route guard、runtime 或 feature workflow。
- store 不直接弹 toast，反馈交给 feature 或共享反馈 composable。
- store 不直接互相循环 import；跨 store 清理应由上层流程或明确 action 协调。
- 认证状态不持久化敏感 token；Pinia 只在当前运行时保存 `accessToken`、`csrfToken` 和用户快照，并同步给 request transport 注入 `Authorization` / `X-CSRF-Token`，认证事实仍以服务端 session 和 refresh cookie 为准。

## API 层规范

`src/api/request.ts` 是 HTTP transport owner。

请求层负责：

- 统一 `baseURL`、`timeout`、`withCredentials`。
- 基于 auth store 同步的运行时 token 注入 `Authorization` 和 `X-CSRF-Token`。
- 解包后端响应 envelope。
- 构造标准化 `ApiError`。
- 处理取消请求和网络错误。

请求层不负责：

- 弹 toast。
- 跳错误页。
- 自动决定重试。
- 保存页面状态。
- 做业务权限判断。

领域 API 模块负责：

- 封装 URL 和请求参数。
- 定义后端 provider 可复用的请求 / 响应类型，具体 HTTP 接口使用 `Req` / `Resp` 后缀。
- 在 API 边界完成 DTO 归一化，例如 ID 字符串化、可空字段默认值、时间字段规范化。
- 上传类接口在 API 边界构造 `FormData`。
- 对页面更好处理的缺失语义，可以在 API 边界转为 `null`，不要让页面到处 try/catch。

归属规则：

- `src/api/<provider>.ts` 表示后端 provider 的稳定 HTTP adapter，例如 Content/Post、Auth、User、File、Comment、Ranking。它不是某个页面或 feature 的私有实现。
- `src/features/<feature>/api/` 只用于 feature-private endpoint；如果其他 feature 可能复用该 endpoint，或 endpoint 暴露的是 provider 的资源能力，应放回 `src/api`。
- `src/types/api/` 放全局通用 envelope、分页、错误详情等跨 provider 类型；具体接口的 `Req` / `Resp` 默认贴近对应 API adapter。
- feature workflow 可以 import `@/api/*`，并在 `composables/` 或 `lib/` 内完成请求编排、错误恢复、DTO/view model 映射和本 feature 的 port 抽象。
- 页面、布局和组件不直接 import `@/api/*`。业务请求必须从 feature workflow 进入 API 层。

## 请求并发与 Stale Response

带搜索、筛选、分页、自动补全、轮询或实时刷新能力的 feature，必须显式处理旧请求晚到的问题。

规则：

- 用户连续输入触发请求时，应 debounce，并取消上一轮请求或用 request sequence 忽略旧响应。
- route params 改变时，先清理旧详情数据或标记为 refreshing，不能继续显示旧对象内容。
- 列表筛选变化时，页码归一回第一页，避免请求到不存在的页。
- 组件卸载时取消仍在进行的请求，或确保响应回来后不会写入已卸载状态。
- 自动轮询应有停止条件，例如页面离开、状态完成、用户手动停止、连接错误。
- 对同一个动作的重复提交，用 `submitting` guard，而不是依赖按钮禁用这一层 UI。

推荐在 feature workflow 内封装：

```ts
let requestVersion = 0;

async function loadDetail(id: string): Promise<void> {
  const currentVersion = (requestVersion += 1);
  loading.value = true;

  try {
    const nextDetail = await getDetail(id);
    if (currentVersion !== requestVersion) return;
    detail.value = nextDetail;
  } finally {
    if (currentVersion === requestVersion) {
      loading.value = false;
    }
  }
}
```

## 路由与权限

路由文件负责 URL、页面入口和 `meta`。

规范：

- 新增路由按命名空间拆分到 `src/router/routes/*Routes.ts`。
- 权限优先放在 route `meta` 和 `router/guards.ts`。
- 页面内部不复制角色判断；页面可以根据能力状态做展示降级，但不替代守卫。
- 登录 redirect 参数必须清洗，禁止外部 URL open redirect。
- 临时调试不得注释掉认证或角色检查；确实需要本地绕过时，用显式 dev-only 开关，并保证生产构建不可触发。

## Runtime 错误边界

`src/runtime/` 负责全局运行时错误。

当前 owner：

- HTTP 401 会话失效。
- Vue runtime error。
- Router runtime error。
- 命名空间 logger。

边界：

- `/500` 代表 Vue 或 Router 运行时崩溃，不代表所有 HTTP 5xx。
- HTTP 429、普通 5xx、业务错误、网络错误默认由 feature 或页面处理，提供 inline error、toast、retry 或草稿保留。
- WebSocket 鉴权关闭、全局未捕获 promise、客户端错误上报等能力后续应进入 `runtime/`，不要散落在页面里。

## 安全渲染规范

用户生成内容和后端富文本默认不可信。

规则：

- 默认不用 `v-html`。
- 必须渲染 Markdown / HTML 时，先经过统一 sanitize helper，再进入 `v-html`。
- `v-html` 使用点旁边必须能看出内容已经净化，例如变量名包含 `sanitized*`。
- sanitize 使用白名单策略，禁止事件属性、`javascript:` URL、危险 iframe 和未知协议。
- 外链必须使用 `target="_blank"` 时，同时设置 `rel="noopener noreferrer"`。
- `window.open()` 必须传入 `noopener,noreferrer` 或等价保护。
- 登录 redirect、返回地址、下载地址、外部 URL 都必须经过 allowlist / sanitize，不直接信任 query 或后端 URL。
- CSP、图片源、WebSocket 源等 allowlist 应按真实依赖收紧，不写宽泛的 `https:`、`ws:`、`wss:`。
- 敏感 token 不进入 `localStorage`；认证继续依赖服务端 session 或后端明确设计的短期凭证。

如果某个 feature 需要富文本渲染，先建立 `utils` 或未来 `shared/lib` 下的统一 sanitize owner，并为典型 XSS payload 补测试。

## 页面状态规范

所有有异步数据或用户提交的页面，都必须显式设计状态，而不是只处理成功路径。

### 状态类型

| 状态         | Owner                       | 展示要求                                           |
| ------------ | --------------------------- | -------------------------------------------------- |
| `idle`       | feature workflow            | 初始态，不提前展示错误                             |
| `loading`    | feature workflow + UI       | 首屏加载用 skeleton 或稳定占位，不让布局跳动       |
| `refreshing` | feature workflow + UI       | 保留旧内容，局部显示刷新状态，不清空整个页面       |
| `empty`      | feature workflow + UI       | 空数据不是错误，展示空状态和下一步动作             |
| `fail`       | feature workflow + UI       | 可恢复错误，展示错误原因、requestId 和重试入口     |
| `submitting` | feature workflow + UI       | 禁用重复提交，按钮显示进行中状态                   |
| `success`    | feature workflow + feedback | 成功后按语义选择 toast、inline success 或跳转      |
| `disabled`   | UI + 权限/业务状态          | 禁用态必须说明不可操作原因，不能只有灰色按钮       |
| `conflict`   | feature workflow + UI       | 草稿、版本、并发冲突必须保留本地输入，不能静默覆盖 |
| `offline`    | runtime / feature workflow  | 网络不可用或实时断线时，降级为手动刷新或只读提示   |

### Loading

- 首屏列表、详情、工作区加载优先使用 skeleton 或固定高度占位。
- 小范围刷新使用局部 spinner、按钮 loading 或状态文本，不替换整页。
- loading 期间保留容器尺寸，避免内容加载完成后大幅跳动。
- 不同请求并行时，不把所有 loading 混成一个布尔值；按区域拆分，例如 `loadingDetail`、`loadingComments`。

### Fail

fail 表示用户可以继续操作或重试的失败，不应直接升级为全局错误页。

fail UI 至少包含：

- 用户可读错误说明。
- 重试入口或下一步动作。
- 后端 `requestId`，如果 `ApiError` 提供。
- 对输入型页面，必须保留用户已经输入的草稿。

请求层只提供 `ApiError`，不直接弹 toast 或跳页。feature workflow 决定是展示 inline fail、toast、表单字段错误，还是降级到只读。

### Empty

- 空状态必须和 fail 区分。
- 空列表应说明当前筛选条件下没有结果，并提供清空筛选、创建内容或返回入口。
- 首次使用的空状态可以带引导动作；普通查询为空不做过重引导。

### Submit

- 提交动作必须有 `submitting` 防重。
- 提交按钮在进行中时保持宽度稳定。
- 表单校验错误优先定位到字段；全局错误只用于无法归属字段的失败。
- 提交成功后的状态流要明确：留在当前页、刷新数据、关闭弹窗、跳转，不能由组件临时决定。

### Realtime / Offline

- 实时连接异常不等于页面崩溃。
- WebSocket 断线、心跳超时或鉴权失败应暴露连接状态。
- 普通断线展示“同步异常 / 手动刷新”，鉴权失败走 runtime 会话失效 owner。
- 页面不能假装仍在实时同步；需要给用户明确状态。

## 表单规范

表单的事实 owner 是 feature workflow，不是模板。

feature workflow 负责：

- 表单初始值。
- 字段级校验。
- dirty / pristine 状态。
- submitting 防重。
- 服务端字段错误映射。
- 成功后的刷新、关闭、跳转或草稿清理。

UI 负责：

- 显示 label、helper、error。
- 关联 `label for` 与输入框 `id`。
- 在 `aria-invalid`、`aria-describedby` 中暴露错误和说明。
- 保持提交按钮宽度稳定。
- 禁用态说明原因。

规则：

- 必填、长度、格式、枚举范围等基础校验在提交前执行。
- 服务端返回字段级错误时，优先落到字段；无法归属字段时才展示全局 fail。
- 有草稿风险的表单，离开页面、关闭弹窗或切换对象前必须处理 dirty 状态。
- 上传表单必须限制文件类型、大小和数量，并把失败原因展示给用户。
- 表单成功后是否清空草稿必须由 feature workflow 决定，组件不自行重置。

## 可访问性与键盘规范

新交互组件默认支持键盘和语义属性。

必须覆盖：

- 可点击非链接元素优先用 `<button>`；确实使用 `role="button"` 时，必须处理 Enter 和 Space。
- tab 组件使用 `role="tablist"`、`role="tab"`、`role="tabpanel"`、`aria-selected`、`aria-controls`。
- dialog / drawer 使用 `role="dialog"`、`aria-modal="true"`、`aria-labelledby`，并支持 Escape 关闭。
- menu 使用 `aria-haspopup="menu"`、`aria-expanded`、`role="menuitem"`。
- alert / fail 使用 `role="alert"` 或 `aria-live="polite"`，避免只靠颜色表达状态。
- icon-only button 必须有 `aria-label` 或可见文本。
- 焦点样式必须可见，不能用 `outline: none` 后不补替代 focus ring。
- 打开 dialog / drawer 时焦点进入弹层；关闭后焦点回到触发元素。

## 性能与构建规范

性能优化优先从“少做事、少阻塞、少重复请求”开始，不提前引入复杂缓存系统。

规则：

- 路由页面默认懒加载，除首页和核心 shell 外不进入首屏同步 chunk。
- ECharts、Markdown、高亮、富文本编辑器、PDF、图像处理等重依赖必须按需加载。
- `main.ts` 只做应用启动、全局插件和 runtime 安装，不做页面级数据预取。
- API 列表请求必须分页或限制数量；不要一次性拉全量再在前端过滤。
- 输入联想、搜索、实时预览等高频能力必须 debounce 或 throttle。
- 大型计算优先放纯函数并可测试；确实阻塞输入时再考虑 Web Worker。
- 环境变量只有 `VITE_*` 会暴露到客户端，不能放密钥、私有 token 或内部管理凭证。
- `dist/` 是构建产物，不提交到仓库。

需要新增重依赖时，先说明：

- 为什么不能用现有能力。
- 是否会进入首屏 bundle。
- 是否需要动态 import。
- 是否有对应测试或手动验证路径。

## 组件与 UI Owner

当前不设 `shared/ui`，使用 `components/` 承接 UI owner。

放置规则：

- 跨业务复用、无业务流程的 UI，放 `components/common/`。
- 明确属于某个业务领域的展示组件，放 `components/<domain>/`。
- 只服务单一 feature 且直接消费该 feature workflow 的 page-sized UI，可以放 `features/<feature>/ui/`。
- 稳定业务对象展示且可被多个 feature 复用，考虑放 `entities/<entity>/ui/`。
- 跨多个 feature 的完整工作区组合，等需求出现后再引入 `widgets/`。

组件不做：

- 直接 import 非 contract API。
- 直接持有复杂路由 owner。
- 通过全局 store 承接本可由 props/emits 完成的局部状态。
- 把业务删除、发布、导入等动作藏在共享 UI 原语里。

组件通信：

- 父传子用 props。
- 子通知父用 emits。
- 跨远距离但仍是页面内流程的状态，优先由 feature workflow 持有。
- 真正跨页面共享才进入 Pinia。

## Overlay、Toast 和危险操作

后续需要弹窗、抽屉、toast、危险确认时，提前区分行为层和业务层。

建议：

- Toast 渲染和队列状态做成共享 composable / common 组件，不由业务页面各写一套。
- 删除、撤销、发布这类危险动作使用统一确认模型，但真实业务动作留在 feature workflow。
- Overlay 行为层负责 Teleport、Escape、backdrop、scroll lock、aria；业务弹窗负责内容和动作。
- 不把所有弹窗做成一个万能组件，也不让每个页面重复实现 overlay 行为。

## 测试规范

测试贴近 owner 放置：

- `src/features/**/__tests__`：feature workflow、状态机、请求编排、提交防重。
- `src/components/**/__tests__`：组件 props、emits、关键交互。
- `src/api/__tests__`：请求参数、响应归一化、错误对象。
- `src/stores/__tests__`：跨页面状态和持久化策略。
- `src/router/__tests__`：守卫、redirect 清洗、权限。
- `src/runtime/__tests__`：全局错误、logger、运行时安装。
- `src/__tests__`：跨切面架构边界测试。

优先测试：

- 权限和 redirect。
- API 错误标准化。
- 表单校验和重复提交。
- 草稿保存、冲突、恢复。
- loading / fail / empty / retry 状态流。
- route query 规范化。
- 安全相关 sanitize。
- stale response、取消请求和重复提交防线。
- 可访问性关键属性和键盘交互。
- 重依赖是否懒加载，高频输入是否 debounce / throttle。
- runtime 401 / Vue error / router error 边界。

避免测试：

- 只断言 class 名。
- 只断言 CSS 文本。
- 锁死组件内部 DOM 结构。
- 大量 snapshot 代替行为断言。

## 架构 Guardrail

随着业务增长，应逐步补充轻量源码边界测试或脚本。

优先级：

1. route page 不直接 import `@/api/*`。
2. route page 不直接持有复杂 router/query owner。
3. `entities/**` 不 import `features/**`、`pages/**`、`stores/**`。
4. `components/common/**` 不 import 业务 API、router、store。
5. 禁止未登记的 `:deep`，CSS 规范见 `docs/design/css-style-guide.md`。
6. 检查 active docs 中的代码路径是否仍存在，减少文档事实漂移。

这些 guardrail 不需要一次全部实现。每当某条边界被真实任务触达，就补对应测试或 TODO。

## 文档同步

当前事实源：

- 前端工程边界：本文。
- CSS 规范：`docs/design/css-style-guide.md`。
- 编辑器设计：`docs/design/editor-design.md`。
- 技术债：`docs/todos/debt/`。

规则：

- 新增目录层级、route 命名空间、运行时 owner 或共享组件体系时，必须同步更新本文和 `AGENTS.md`。
- 架构文档写当前事实，不把计划中的功能写成已经实现。
- 历史迁移过程进入 plan / review / todo，不污染 current 架构文档。

## 新功能检查清单

- [ ] route page 只是组合器，没有直接 API 调用。
- [ ] 页面流程 owner 在 `features/<feature>/composables`。
- [ ] 只有跨页面共享状态进入 Pinia。
- [ ] API 层完成 DTO 归一化，不弹 toast、不跳页。
- [ ] 搜索、筛选、轮询、自动补全处理 stale response 和取消请求。
- [ ] 权限由 router meta / guard 承接。
- [ ] 用户内容渲染经过 sanitize，外链和 redirect 有安全清洗。
- [ ] 可恢复错误由 feature 处理，全局崩溃由 runtime 处理。
- [ ] loading、empty、fail、submitting、disabled、conflict 等状态有明确 UI。
- [ ] 表单有字段校验、服务端错误映射、dirty 状态和提交防重。
- [ ] tab、dialog、menu、icon button 有 ARIA 与键盘行为。
- [ ] 重依赖按需加载，高频输入有 debounce / throttle。
- [ ] UI 组件按 owner 放置，并通过 props/emits 或 feature workflow 通信。
- [ ] CSS 遵循 `docs/design/css-style-guide.md`。
- [ ] 测试贴近 owner，覆盖关键状态和错误路径。
- [ ] 如果新增架构例外，已有 TODO 或 guardrail 记录。
