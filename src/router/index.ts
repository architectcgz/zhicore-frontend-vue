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

setupRouterGuards(router);

export default router;
export { routes };
