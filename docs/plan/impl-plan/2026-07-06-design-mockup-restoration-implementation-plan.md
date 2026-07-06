# 前端设计稿还原 Implementation Plan

> **给 agent 工作者：** 按本计划逐项实现设计稿还原，步骤使用 checkbox（`- [ ]`）语法追踪；每完成一个可验证步骤后立即勾选。

**目标：** 按 `docs/design/` 下的新设计稿，把现有 Vue 前端从早期占位/局部实现继续收敛到统一的深色知识工作台界面；优先完成已存在路由和已有业务 owner 的页面，不为尚未接入的数据能力伪造 API 或生产事实。

**架构：** 继续遵守简化 Feature-Sliced Design：`src/pages/**` 作为路由装配面，`src/features/**` 拥有业务流程和 API 编排，`src/components/**` 承载可复用展示组件。纯设计还原只改 route/page scoped CSS 和必要的展示结构；涉及保存、上传、权限、路由守卫等行为时，必须落在对应 feature/store/router owner 并保留测试。

**技术栈：** Vue 3 `<script setup>`、TypeScript、Vue Router、Pinia、`@lucide/vue`、现有全局 CSS token、Vitest。

---

## 设计稿清单与当前状态

| 设计稿                                         | 目标路由/owner                                                                            | 当前状态                                                             | 下一步                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------- |
| `docs/design/资源.png`                         | `/resources` / `src/pages/resources/ResourcesRoutePage.vue`                               | 已完成，见 `2026-07-06-resources-page-design-implementation-plan.md` | 后续接真实资源能力时另开 API/feature 计划 |
| `docs/design/个人.png`                         | `/user/profile` / `src/pages/user/UserProfileRoutePage.vue` + `src/features/user-profile` | 任务 1 已完成：设置导航、个人资料表单、保存区和状态反馈已收敛        | 后续如接安全/隐私/日志能力需另开切片      |
| `docs/design/explore.png`                      | `/explore` / `src/pages/explore/ExploreRoutePage.vue`                                     | 已完成：双栏探索页、筛选/趋势侧栏和派生统计已收敛                    | 右侧 Filter 仍为静态展示                  |
| `docs/design/社区.png`                         | `/community` / `src/pages/community/CommunityRoutePage.vue`                               | 已完成：三栏社区浏览、降级互动状态和公开帖子区已收敛                 | 真实社区统计接 API 时另开切片             |
| `docs/design/about.png`                        | `/about` / `src/pages/home/HomeAboutRoutePage.vue`                                        | 已完成：品牌介绍页、能力块和底部 statement 已收敛                    | 无                                        |
| `docs/design/文档.png`                         | `/editor-document-showcase` / `src/components/editor/EditorDocumentViewer.vue`            | 已完成：工程文档 showcase、左右栏和发布检查已收敛                    | 仅展示页，不改编辑器保存链路              |
| `docs/design/文章详情.png`                     | `/posts/:postId` / content detail owner                                                   | 已完成：三栏阅读、右侧操作栏和 dock 评论入口已收敛                   | 像素级与真实本地数据存在自然差异          |
| `docs/design/会话.png`、`消息.png`、`通知.png` | message/notification owners                                                               | 已完成：消息列表、会话详情、通知中心布局已收敛                       | 未读数仍来自现有 feature owner            |
| `docs/design/登录.png`、`注册.png`             | auth owner                                                                                | 已完成：登录/注册视觉、注册顶栏和现有表单流程已收敛                  | 发送验证码/OAuth 仅为视觉入口             |
| `docs/design/401，403，404,500.png`            | `/error/:status`                                                                          | 已完成：状态页导航、大号状态码、摘要和恢复操作已收敛                 | 无                                        |

## 范围

- 本计划第一阶段只继续实现 `个人.png`，因为对应路由、feature、测试和当前未提交改动已经存在。
- 不一次性注册所有设计稿页面，避免产生无 owner 的空页面。
- 不把设计稿里的示例用户、计数、头像或内容当成生产假数据；没有真实数据时使用当前用户资料、真实状态或明确空态。
- 不修改全局 token，除非同一语义值在多个页面复用并且明暗主题都能解释。

## 测试策略

- 纯视觉结构、spacing、icon、表单布局：No TDD，使用 `pnpm typecheck`、定向组件/页面测试和必要时浏览器截图验证。
- 头像上传、保存防重复、错误映射、登录守卫、store 权限：TDD 或保留现有行为测试；本计划只在已有行为上做最小补强。

## 任务 1：个人设置页还原 `个人.png`

**目标：** 把 `/user/profile` 从普通账户设置表单收敛为设计稿中的双栏设置工作台：左侧图标菜单，右侧个人资料表单，底部保存操作和真实保存状态。

**文件：**

- 修改：`src/pages/user/UserProfileRoutePage.vue`
- 修改：`src/features/user-profile/composables/useUserProfile.ts`（仅当需要补足保存/上传状态语义）
- 新增：`src/features/user-profile/ui/UserProfileSettingsWorkspace.vue`
- 修改：`src/pages/user/__tests__/UserProfileRoutePage.spec.ts`（仅当行为或可测结构变化）
- 修改：本计划文件

- [x] **步骤 1：补齐左侧设置导航**

将设置导航改为设计稿中的图标化菜单：个人资料、账户设置、偏好设置、通知设置、隐私设置、安全设置、日志管理、退出登录。当前仅 `个人资料` 和已有消息/偏好设置可交互，其余保持禁用或降级展示，避免暗示未实现能力。

预期：左侧菜单有稳定图标、active 态和退出动作；测试仍能通过 tab 切换。

- [x] **步骤 2：重排个人资料表单**

按设计稿把头像上传、昵称、简介、UID、资料版本、偏好选择重排为横向 label + 控件的表单行；UID 和资料版本展示真实 profile 字段且不可编辑。

预期：右侧内容不再使用独立 meta 卡片；表单在桌面宽度下与设计稿对齐，在窄屏下自然变为单列。

- [x] **步骤 3：补齐保存动作区和状态**

底部动作区提供取消/保存更改，保存按钮沿用 `handleSave`；状态区显示保存成功、错误、保存中或默认已保存，不新增假状态。

预期：重复保存仍由 feature 防重；成功/错误反馈不挤压按钮布局。

- [x] **步骤 4：视觉收敛**

用 scoped CSS 实现设计稿的深色双栏、细边框、青绿色 active ring、圆形头像、输入框弱边界、底部 action bar 和移动端收口；减少无意义说明性文案。

预期：页面接近 `个人.png`，不修改全局样式，不产生横向溢出。

- [x] **步骤 5：验证并更新计划**

运行个人页定向测试、`pnpm typecheck` 和必要的格式/构建检查；根据实际结果勾选本任务步骤。

预期：验证命令通过；未验证项在最终交付中明确说明。

## 任务 2：发现页核对 `explore.png`

**目标：** 对照 `docs/design/explore.png` 检查 `/explore` 现状，补齐首屏结构、筛选、列表密度和移动端收口。

- [x] 核对当前 `ExploreRoutePage.vue` 与设计稿差异。
- [x] 只在现有 route owner 内做静态/展示收敛。
- [x] 运行定向验证。

## 任务 3：社区页核对 `社区.png`

**目标：** 对照 `docs/design/社区.png` 检查 `/community` 现状，保持社区页作为内容浏览页，不伪造真实社区统计。

- [x] 核对当前 `CommunityRoutePage.vue` 与设计稿差异。
- [x] 补齐必要的静态结构和降级状态。
- [x] 运行定向验证。

## 任务 4：About 路由归属确认

**目标：** 对照 `docs/design/about.png` 确认当前是否已有 `/about` 路由和 owner，再决定是否新增页面。

- [x] 搜索路由和页面 owner。
- [x] 如没有 route，单独补路由计划和导航测试。
- [x] 如已有 route，只做设计还原和定向验证。

## 任务 5：文章详情核对 `文章详情.png`

**目标：** 对照 `docs/design/文章详情.png` 收敛 `/posts/:postId` 阅读首屏，同时保留现有内容详情 owner、评论行为和未知计数降级。

- [x] 核对文章详情组件与设计稿差异。
- [x] 补齐三栏阅读、右侧操作栏和 dock 评论入口。
- [x] 运行内容详情定向测试、类型检查和截图验证。

## 任务 6：文档展示页核对 `文档.png`

**目标：** 对照 `docs/design/文档.png` 收敛文档 showcase 页面，不改正式编辑器持久化和 Tiptap 工作流。

- [x] 确认目标 owner 为 `EditorDocumentViewer`。
- [x] 补齐浅色工程文档界面、左侧导航、右侧状态栏和发布检查。
- [x] 运行组件定向测试和类型检查。

## 任务 7：消息、会话和通知核对

**目标：** 对照 `docs/design/消息.png`、`docs/design/会话.png`、`docs/design/通知.png` 收敛消息中心和通知中心页面。

- [x] 核对现有 message/notification owner 和 route page。
- [x] 补齐消息列表、会话详情、通知列表、筛选和分页布局。
- [x] 运行 message/notification feature 与页面定向测试。

## 任务 8：认证与错误页核对

**目标：** 对照 `docs/design/登录.png`、`docs/design/注册.png`、`docs/design/401，403，404,500.png` 收敛认证与状态页。

- [x] 保留 `/auth/register` 复用 `LoginRoutePage` 和现有 `useRegisterForm`。
- [x] 补齐登录/注册视觉、错误状态页和恢复操作。
- [x] 运行 auth/error route 与页面定向测试。

## 架构适配评估

- 边界清晰：第一阶段只碰已存在的 `/user/profile` 和 `user-profile` feature，不扩散到消息、通知、认证、文档等页面。
- 状态 owner 清晰：资料读取、保存、上传、退出仍由 `useUserProfile` 和 auth store owner 处理；页面只渲染状态和派发意图。
- 结构收敛：`UserProfileRoutePage.vue` 已收敛为 route 装配面，具体设置工作台落在 `features/user-profile/ui/UserProfileSettingsWorkspace.vue`；后续安全、隐私、日志等真实设置仍需按能力继续拆切片。
- 兼容策略：开发阶段不为旧页面视觉做兼容；保留现有测试覆盖的行为语义。

## 验证清单

- [x] `pnpm exec vitest run src/pages/user/__tests__/UserProfileRoutePage.spec.ts`
- [x] `pnpm typecheck`
- [x] `pnpm build`（如涉及构建风险或 SFC/CSS 编译风险）
- [x] `pnpm test:run` 全量回归（64 个测试文件、309 个测试）
- [x] 文章详情桌面截图验证（Playwright，agent 产物 `/tmp/zhicore-article-detail.png`）
- [ ] 其他页面桌面和移动端不横向溢出（浏览器或截图验证）
