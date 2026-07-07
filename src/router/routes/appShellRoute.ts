import type { RouteRecordRaw } from "vue-router";

import { communityRoutes } from "./communityRoutes";
import { contentRoutes } from "./contentRoutes";
import { editorRoutes } from "./editorRoutes";
import { errorRoutes } from "./errorRoutes";
import { homeRoutes } from "./homeRoutes";
import { legalRoutes } from "./legalRoutes";
import { resourcesRoutes } from "./resourcesRoutes";
import { searchRoutes } from "./searchRoutes";
import { structureRoutes } from "./structureRoutes";
import { userRoutes } from "./userRoutes";

/**
 * AppShell 路由：
 * 主要产品页面都作为其子路由，共享 AppLayout（平台导航 + 内容区）。
 * 认证要求由具体子路由声明，避免把公开编辑器入口错误变成登录后页面。
 */
export const appShellRoute: RouteRecordRaw = {
  path: "/",
  component: () => import("@/pages/AppShellRoutePage.vue"),
  redirect: "/",
  children: [
    ...homeRoutes,
    ...communityRoutes,
    ...contentRoutes,
    ...structureRoutes,
    ...resourcesRoutes,
    ...searchRoutes,
    ...editorRoutes,
    ...userRoutes,
    ...legalRoutes,
    // 错误状态页属于产品壳内的恢复路径，统一复用 AppLayout 的导航、搜索和移动入口。
    ...errorRoutes,
  ],
};
