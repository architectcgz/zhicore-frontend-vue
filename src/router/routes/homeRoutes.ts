import type { RouteRecordRaw } from "vue-router";

/**
 * 知构首页路由。
 * 后续按需拆分为 posts、users、tags、search 等独立路由模块。
 */
export const homeRoutes: RouteRecordRaw[] = [
  {
    path: "",
    name: "Home",
    alias: "home",
    component: () => import("@/pages/home/HomeRoutePage.vue"),
  },
];
