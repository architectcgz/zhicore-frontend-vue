# 管理后台首个纵切片设计

## Relevant modules

- 前端路由与布局：`src/router/routes.ts`、`src/layouts/AdminLayout.vue`
- 管理后台 API：`src/api/admin.ts`
- 管理员用户页：`src/pages/admin/UserManagement.vue`
- 管理员概览页：`src/pages/admin/Dashboard.vue`
- Vue Query admin hooks：`src/queries/admin/useAdminUsersQuery.ts`、`src/queries/admin/useDisableUserMutation.ts`
- 后端用户管理接口：`zhicore-user/.../AdminUserQueryController.java`、`zhicore-user/.../AdminUserCommandController.java`
- 后端分页与 DTO：`zhicore-common/.../PageResult.java`、`zhicore-client/.../UserManageDTO.java`

## Affected files

- `docs/design/admin/admin-user-management-first-slice.md`
- `src/api/admin.ts`
- `src/components/admin/AdminUserManagementPanel.vue`
- `src/pages/admin/UserManagement.vue`
- `src/pages/admin/Dashboard.vue`
- `src/layouts/AdminLayout.vue`
- `src/router/routes.ts`
- `test/api/admin.test.ts`

## Current behavior

- 前端 admin API 直接使用 Axios 实例 `request`，返回值没有解包 `ApiResponse.data`，类型声明与真实运行行为不一致。
- 前端 admin API 路径写成 `/api/v1/admin/...`，而全局 `baseURL` 已经带 `/api/v1`，存在重复前缀风险。
- 当前后端已确认可用的管理员接口是：
  - `GET /api/v1/admin/users`
  - `POST /api/v1/admin/users/{userId}/disable`
  - `POST /api/v1/admin/users/{userId}/enable`
  - `POST /api/v1/admin/users/{userId}/invalidate-tokens`
- 用户列表真实返回 DTO 为 `UserManageDTO`，字段只有 `id/username/email/nickname/avatar/status/createdAt/roles`。
- 当前前端用户管理页依赖了不存在或未返回的字段与接口：
  - `role`
  - `postsCount`
  - `followersCount`
  - `lastLoginAt`
  - 批量禁用/批量启用接口
- 管理后台默认落地页 `Dashboard` 依赖 `/admin/stats`、`/admin/trends`、`/admin/content-growth`、`/admin/activities`，当前后端未确认存在。

## Proposed approach

- 先完成“管理员用户管理”这一条最小可验证纵切片。
- `src/api/admin.ts` 改为统一走 `httpClient`，并把后端 `PageResult` 归一化成前端现有 `PageResponse`。
- 用户字段按后端真实 DTO 建模，不再伪造文章数、粉丝数、最后登录等前端字段。
- 用户管理页改成基于 Vue Query 的查询与状态切换：
  - 查询参数：`keyword/status/page/size`
  - 命令操作：单用户禁用/启用
- 批量禁用/启用不再依赖虚构接口；API 层保留批量方法时，改为循环调用单条后端命令，避免未来页面继续踩坑。
- `UserManagement` 页面降为 route-level composition surface，实际实现放入 `AdminUserManagementPanel`。
- `Dashboard` 本轮改成静态概览页，明确当前已对齐的后台模块，避免默认进入坏接口页面。
- 管理后台默认重定向调整到 `/admin/users`，确保进入后台即可落到当前已打通页面。
- 去掉 admin 布局中当前没有对应页面实现的死链菜单项。

## Component map

- `src/pages/admin/UserManagement.vue`
  - 负责路由级页面标题和组合 `AdminUserManagementPanel`
- `src/components/admin/AdminUserManagementPanel.vue`
  - 负责查询条件、列表展示、分页、禁用/启用交互
  - 不向父组件暴露内部可变状态

## Backend APIs used

- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users/{userId}/disable`
- `POST /api/v1/admin/users/{userId}/enable`

## Risks

- 后端 `roles` 可能返回 `ADMIN` 或 `ROLE_ADMIN`，前端展示层需要做兼容格式化。
- 后端 `status` 当前是 `NORMAL/FORBIDDEN`，若后续枚举扩展，前端标签文案需要同步。
- `posts/comments` 页面本轮只修正了 API 通路，不保证所有字段展示都已完全对齐。

## Unknowns

- `Dashboard` 所需统计接口是否后续会由 gateway 聚合暴露。
- `reports` 模块当前后端接口位置未在本轮确认。
- 管理侧是否后续会补充真正的批量接口。

## Slice acceptance

- 进入 `/admin` 时默认到 `/admin/users`
- 用户列表能按当前后端契约正常加载
- 能按关键词、状态筛选
- 能分页
- 能对单个用户执行禁用/启用
- 不再请求错误的 `/api/v1/api/v1/...` 地址
