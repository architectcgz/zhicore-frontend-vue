import type { Router } from "vue-router";

import { useAuthStore } from "@/stores/auth";

export function setupRouterGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore();

    // 需要登录的路由：先恢复 session，未登录则跳转登录页
    if (to.meta.requiresAuth) {
      await authStore.restore();
      if (!authStore.isLoggedIn) {
        return {
          path: "/auth/login",
          query: { redirect: to.fullPath },
        };
      }
    }

    // 已登录用户访问登录页：直接跳首页
    if (to.path === "/auth/login") {
      await authStore.restore();
      if (authStore.isLoggedIn) {
        return "/";
      }
    }

    return true;
  });
}
