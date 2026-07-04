import type { RouteRecordRaw } from "vue-router";

import { contentRoutes } from "./contentRoutes";
import { editorRoutes } from "./editorRoutes";
import { homeRoutes } from "./homeRoutes";
import { structureRoutes } from "./structureRoutes";

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
    ...contentRoutes,
    ...structureRoutes,
    ...editorRoutes,
  ],
};
