import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { setupRouterGuards } from "./guards";
import { appShellRoute } from "./routes/appShellRoute";
import { authRoutes } from "./routes/authRoutes";

const routes: RouteRecordRaw[] = [...authRoutes, appShellRoute];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 用户资料页开发期临时关闭全局路由守卫，避免未完成的登录态恢复挡住页面调试。
const routerGuardsEnabled = false;
if (routerGuardsEnabled) {
  setupRouterGuards(router);
}

export default router;
export { routes };
