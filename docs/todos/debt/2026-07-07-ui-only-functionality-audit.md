---
status: open
priority: high
owner: frontend
source: "2026-07-07 手动审查 src/pages、src/features、src/layouts 与既有 missing-functionality plan"
created: "2026-07-07"
---

# 仅完成 UI、功能未闭环的前端入口清单

## 影响

当前前端已有一批页面和控件具备可见 UI，但没有真实业务 workflow、API adapter、状态机或后端 contract 支撑。用户会看到可点击或已设计完成的入口，却只能进入降级页、本地 demo、禁用态，或触发只存在于页面本地的假交互。

## 审查口径

| 类型 | 判定标准 |
| --- | --- |
| 整页 UI-only | route 已注册，页面主要是静态说明、敬请期待或明确暂未接入，没有 feature workflow/API。 |
| 局部 UI-only | 页面已有按钮、筛选、tab、入口或状态展示，但控件 disabled、没有 handler、只改本地临时状态，或只展示 mock/静态配置。 |
| contract gate | 前端不应先造假 API；需等后端 endpoint 达到字段级 contract 后再实现 adapter/workflow。 |

## 清单

| 范围 | 当前 UI | 缺失功能 | 证据 | 建议退出条件 |
| --- | --- | --- | --- | --- |
| Search | 全局搜索可跳转 `/search?q=...`，搜索页显示查询词 | 没有 `src/api/search.ts`、`src/features/search/**`、结果加载、热门词、失败重试、stale response 处理 | `src/pages/search/SearchRoutePage.vue` 只有“搜索服务暂未接入”；`docs/plan/impl-plan/2026-07-05-frontend-missing-functionality-implementation-plan.md` 标记 Search contract gate 阻塞 | 后端搜索 contract 达到草案；补 search API adapter、`useSearchPage()`、结果/热门词/错误/重试/旧响应测试 |
| Resources | `/resources` 有资源中心视觉页、四个资源分类卡片 | 文件、资料、素材、收藏均未接入数据、上传、管理、列表或权限 workflow | `src/pages/resources/ResourcesRoutePage.vue` 静态 `resourceCategories`，标题“资源中心暂未接入”，状态“即将推出” | 明确资源服务 contract；新增资源 feature/API，或把入口降级为不可误解的占位入口 |
| Structure | `/structure` 展示“构”能力卡片 | 没有专题组织、知识块整理、脉络维护、发布前结构检查、内容资产管理的交互和数据 | `src/pages/structure/StructureRoutePage.vue` 只有 `structureCapabilities` 静态数组 | 拆出 structure feature；至少实现一个真实结构工作流和对应 loading/error/empty 状态 |
| Message Center | `/messages`、`/messages/:conversationId` 有私信列表、线程、输入框、表情、会话操作菜单 | 非 local demo 下直接 unavailable；没有会话列表/详情/未读数/发送/mark read API；发送只追加页面本地消息；新建、搜索、筛选、附件、拉黑、举报、删除都禁用 | `src/features/message/composables/useMessageCenterPage.ts` 非 demo 返回 `unavailableMessageCenterState`；`src/pages/home/useMessageComposerDraft.ts` 注释说明未接发送 API；页面内多处 `disabled` | Message endpoint 达到 contract 草案；新增 `src/api/message.ts`、mapper、统一 `useMessageCenterPage()` 异步 workflow；发送失败态/重试/mark read/列表搜索筛选测试 |
| Notification Center | `/notifications` 有未读摘要、分类、列表、分页、搜索框、全部已读按钮 | 非 local demo 下直接 unavailable；没有通知列表/未读数/mark read/全部已读/搜索/详情跳转 API；搜索、筛选、全部已读禁用 | `src/features/notification/composables/useNotificationCenterPage.ts` 非 demo 返回 `unavailableNotificationCenterState`；`HomeNotificationsRoutePage.vue` 搜索、筛选、全部已读 disabled | Notification endpoint 达到 contract 草案；新增 `src/api/notification.ts`、mapper、`useNotificationCenterPage()` 请求与命令 workflow；补失败、unknown unread、分页、stale response 测试 |
| Community | `/community` 已能加载 tags 和公开文章 | “更多主题”“浏览社区”“关注”“更多社区操作”“热门/待回复 tab”“喜欢”“收藏”“计数”“回复流”均未实现或降级 | `CommunityWorkspace.vue` 多处 `title="...暂未接入"`、`disabled`、`aria-disabled` 和“互动统计/计数/回复流暂未接入” | 依据 Content/Community contract 接入关注、排序、更多主题、互动状态和社区统计；无法接入的入口不要展示成可用操作 |
| Explore | `/explore` 已能加载公开文章、分类、点赞/收藏部分能力 | 排序控件只是文本；筛选面板静态；“加载更多”禁用；推荐社区和“加入”是静态入口；热门标签来自当前页 posts 本地聚合；作者数仍来自 `homeDiscoveryMock.authors` | `HomeDiscoveryExploreWorkspace.vue` 静态 `filterGroups`、`suggestedCommunities`，`explore-more` disabled；`useHomeDiscoveryPage()` 用 `homeDiscoveryMock` 填补非列表字段 | 引入分页/排序/筛选 contract；推荐社区与作者统计改为真实来源或明确降级；补加载更多和筛选旧响应测试 |
| Auth | 登录/注册主流程已接 API | 忘记密码、第三方登录、发送邮箱验证码只有 UI 禁用；注册要求用户手填 `emailVerificationToken` | `AuthRouteWorkspace.vue` 中“忘记密码”、GitHub/Gmail/Apple 登录、“发送验证码”均 disabled | 补密码重置、OAuth、邮箱验证码发送 API contract 与 workflow；或移除/隐藏未规划入口 |
| User Profile Settings | 个人资料和消息偏好可保存 | 账户设置、通知设置、隐私设置、安全设置、日志管理只是设置导航 UI，全部 disabled | `UserProfileSettingsWorkspace.vue` 的 `settingNavigation` 只有 `profile` 和 `message-preference` 有 `tabId`，其他项 `:disabled="!item.tabId"` | 为每个设置项建立 feature/API 或拆成未来入口并明确不可用状态 |
| Article Comments | 顶层评论提交已接 `createComment()` | “关注讨论”“保存草稿”、评论点赞、引用、回复发布、回复复制链接只有 UI 或本地展开，不接 API | `ArticleComments.vue` 中这些按钮缺少对应 emit/API；回复编辑器只保存 `replyDrafts` 本地状态 | 补 comment like/reply/quote/link/follow/draft contract 和 emits/workflow；不可实现项从运行时 UI 移除或禁用并说明 |
| App Router Guard | 多个 route 已声明 `meta.requiresAuth` | 全局 router guard 被硬编码关闭；当前阶段这是为了保证 UI 可直接访问，便于后端 contract 和页面联调 | `src/router/index.ts` 中 `const routerGuardsEnabled = false`，`setupRouterGuards(router)` 不执行 | 本轮不进入 impl-plan；后续切回生产鉴权验收时另开独立计划恢复 guard 并补路由测试 |

## 根因

| 根因 | 说明 |
| --- | --- |
| 后端 contract 尚未达到草案 | Message、Notification、Search 已在旧计划中作为 gate 阻塞，前端目前只能保留明确 degraded 状态。 |
| 页面设计先行 | Resources、Structure、部分 Profile/Auth/Community/Explore 控件先完成视觉和导航，但没有同步拆 feature workflow。 |
| local demo 兜底过强 | Message/Notification 在开发态看起来可用，生产关闭 local demo 后直接 unavailable，容易掩盖真实缺口。 |
| 局部控件缺 owner | ArticleComments、Community、Explore 中多个按钮没有 props/emits/API owner，只是静态展示或 disabled。 |

## 建议方案

| 优先级 | 处理建议 |
| --- | --- |
| P1 | 收口 contract gate：Message、Notification、Search 不新增假 adapter；先补后端字段级 contract，再按 feature workflow 接入。 |
| P1 | 对用户高频入口做真实闭环：私信发送/列表、通知已读/列表、全局搜索。 |
| P2 | 对半成品页面做入口治理：Resources、Structure 若短期不实现，降低导航权重或保持明确占位；不要展示可误解的操作控件。 |
| P2 | 拆局部 UI-only 控件 owner：Community/Explore/ArticleComments/Auth/Profile 按 API contract 和用户路径逐项实现或隐藏。 |
| 暂缓 | 路由守卫恢复暂不执行，避免阻断当前 UI 可见性；等后端/API 联调阶段结束后再单独评估。 |

## 退出条件

| 检查项 | 退出标准 |
| --- | --- |
| 静态扫描 | `rg "暂未接入|即将推出|disabled|unavailable|LocalMock|local demo" src/pages src/features src/layouts` 中剩余项均有明确产品降级或已记录 owner。 |
| 架构边界 | 页面/组件不直接依赖 mock，不把 disabled 控件当作已实现功能；API adapter 只在 contract 达标后新增。 |
| 行为测试 | 每个补齐的入口至少有对应 feature/composable 或 page 测试覆盖 loading/error/empty/success、重复提交和 stale response（如适用）。 |
| 文档同步 | 对仍需保留的 contract gate，在 `docs/contracts/` 或实施计划中记录状态和 owner。 |
| 验证 | 补齐切片后运行定向 Vitest、`pnpm typecheck`；涉及路由/构建时补 `pnpm build`。 |
