# Review 遗留问题修复 Implementation Plan

> 来源：本轮对 zhicore-frontend-vue 的 review。消息模块已在 `54b5405` 单独重构提交，本文件覆盖其余经真实源码核实成立的 finding。每个逻辑切片按 TDD 执行；纯 UI/无障碍属性调整用组件渲染断言即可。所有核实均对照真实源码，排除 `.worktrees/` 下的旧副本。

## 目标

- 修复经真实代码核实成立的 8 项 review finding：401 拦截器过宽、头像上传缺校验、登出不吊销服务端 session、request 缺超时、取消错误未识别、离开脏数据无守卫、KaTeX 静态导入、评论排序 tab 无障碍，以及补齐 mock 分支 spec 覆盖。
- 不新增后端接口，不改变现有路由路径。
- 不为旧接口、旧参数、旧状态添加兼容逻辑。

## 非目标

- 不重做视觉设计或文案。
- 不改动已提交的消息模块重构。
- `ArticleDetailMobileView` 的底部 action sheet 不套 `role="dialog"`/`aria-modal`（经核实是非模态操作面板，报告该项被夸大，不在本轮范围）。

## 架构边界

- `src/runtime/**` 负责全局错误/401 处理；`src/router/guards.ts` 负责会话恢复触发范围。
- `src/api/**` 负责 HTTP adapter、超时、错误归一化和本地 demo mock DTO。
- `src/features/**/lib` 承接可测纯函数（文件校验）；`src/features/**/composables` 承接表单与用户动作。
- `src/stores/auth.ts` 负责 session 生命周期，logout 需吊销服务端 session。

## 任务切片

### 批次一：认证与安全

#### 1. 401 拦截器 + guards restore 范围（高）

- [ ] `src/runtime/globalErrorRuntime.ts` 响应拦截器排除会话探测端点：`error.config?.url` 命中 `/v1/auth/refresh`、`/v1/auth/csrf`、`/v1/auth/me` 时不触发 `handleUnauthorized`，仅 reject 交给 `restore()` catch 降级。
- [ ] 默认 `handleUnauthorized` 的 `router.push(loginPath)` 补 redirect：`router.push({ path: loginPath, query: { redirect: router.currentRoute.value.fullPath } })`，与 `guards.ts` 行为对齐。
- [ ] `src/router/guards.ts` 收窄 restore 触发范围：仅 `requiresAuth === true` 路由在无 user 时 `await restore()`；公开页不主动探测会话。已在 `restorePromise` 恢复中的仍 await，保持并发去重。
- 验证：`pnpm test:run src/runtime/__tests__/globalErrorRuntime.spec.ts`（补 refresh-401 不触发 / 业务-401 触发且带 redirect）+ guards 相关 spec（公开页不 restore、requiresAuth 页 restore）。

#### 2. 头像上传校验（高）

- [ ] 新增 `src/features/user-profile/lib/validateAvatarFile.ts`：校验 MIME（`image/jpeg|image/png|image/webp`）、大小上限 5MB，返回 `{ ok: true } | { ok: false, message }`，常量集中定义。
- [ ] `useUserProfile.ts` `handleAvatarUpload` 开头调用校验，失败写 `errorMessage.value` 并 return，不进 `isUploading`。
- 验证：`pnpm test:run src/features/user-profile/lib/__tests__/validateAvatarFile.spec.ts`（类型/大小边界）+ composable 断言非法文件不调 `uploadImage`。

#### 3. 登出吊销服务端 session（中）

- [ ] `src/stores/auth.ts` `logout()` 改 async：有 `accessToken` 时 `await logoutRequest()`（处理 202 processing 分支），`finally` 清本地态；无 token 时短路不打请求，避免 401 场景二次 401。
- [ ] `useUserProfile.ts` `handleLogout` 改为 `await authStore.logout()` 后再 push。
- 验证：`pnpm test:run src/stores/__tests__/auth.spec.ts`（调用 `logoutRequest`、异常仍清态、无 token 短路）+ user-profile 登出流程 spec。

### 批次二：健壮性

#### 4. request 超时（中）

- [ ] `src/api/request.ts` `axios.create` 补 `timeout: 15000`。
- 验证：`pnpm test:run src/api/__tests__/request.spec.ts`（断言 `defaults.timeout`）。

#### 5. 取消错误识别（低）

- [ ] `normalizeApiError` 加分支：`axios.isCancel(error) || error.code === "ERR_CANCELED"` 返回可识别取消态，上层 stale 翻页据此跳过错误提示。
- 验证：`pnpm test:run src/api/__tests__/request.spec.ts`（取消错误不被当普通网络错误）。

#### 6. 离开脏数据守卫（中）

- [ ] `useUserProfile.ts` 抽 `isFormDirty` computed（比对 `form.value` 与 `savedFormSnapshot.value`），加 `onBeforeRouteLeave`，脏时 `window.confirm` 拦截。
- 验证：`pnpm test:run` user-profile spec（脏态阻止离开，stub `window.confirm`）。

### 批次三：性能 / 无障碍 / 测试补齐

#### 7. KaTeX MathBlock 整体异步化（中）

- [ ] `PostBodyMathBlock.vue` 内部 `import katex` + `import "katex/dist/katex.min.css"` 保持不变（作为 chunk 边界）。
- [ ] 在渲染 blocks 的父组件用 `defineAsyncComponent(() => import("./blocks/PostBodyMathBlock.vue"))` 引入，仅含 math block 的文章才拉 KaTeX chunk。
- 验证：组件渲染 math 块正常；`pnpm build` 后确认 katex 进独立 chunk。

#### 8. 评论排序 tab 无障碍（中）

- [ ] `ArticleComments.vue` 排序 tab 容器加 `role="tablist"`，按钮加 `role="tab"` + `:tabindex`（选中 0 / 其余 -1），补左右箭头键盘切换。
- 验证：`pnpm test:run` ArticleComments 组件 spec（断言 role 属性）。

#### 9. mock 分支补 spec（低）

- [ ] `src/api/__tests__/post.spec.ts` 补 `likePost`/`favoritePost` mock-mode 用例。
- [ ] `src/api/__tests__/comment.spec.ts` 补 `createComment` mock-mode 用例。
- [ ] `src/api/__tests__/user.spec.ts` 补 `getProfile(publicId)` mock-mode 用例。
- [ ] 均断言返回 API 形状 DTO 且不调用 `getAxiosInstance`。
- 验证：`pnpm test:run src/api/__tests__/post.spec.ts src/api/__tests__/comment.spec.ts src/api/__tests__/user.spec.ts`

## 集成验证

- [ ] `pnpm typecheck`
- [ ] `pnpm test:run`（排除 `.worktrees/`）
- [ ] `pnpm build`（确认 KaTeX 独立 chunk）

## 提交拆分

- 提交 1：批次一（auth 安全）— `globalErrorRuntime` + `guards` + `auth` store + `useUserProfile` + `validateAvatarFile` + spec。
- 提交 2：批次二（request 超时 + 取消 + 脏数据守卫）。
- 提交 3：批次三性能 + 无障碍（KaTeX + 评论 tab）。
- 提交 4：批次三测试补齐（mock spec）。
- 每次提交走 `committing-changes` skill，精确 `git add <path>` 避开 worktree 与无关改动。

## 回退说明

- 每个切片对应独立文件与 spec，可按切片回退。
- 401 拦截器与 guards 改动耦合，若线上出现会话恢复异常，可先回退 guards 收窄、保留拦截器端点排除。
