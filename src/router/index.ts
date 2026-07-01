import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

import { setupRouterGuards } from "./guards";
import { appShellRoute } from "./routes/appShellRoute";
import { authRoutes } from "./routes/authRoutes";
import { editorRoutes } from "./routes/editorRoutes";
import { errorRoutes } from "./routes/errorRoutes";

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...editorRoutes,
  appShellRoute,
  ...errorRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuards(router);

export default router;
export { routes };
