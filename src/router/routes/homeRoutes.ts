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
  {
    path: "about",
    name: "About",
    component: () => import("@/pages/home/HomeAboutRoutePage.vue"),
  },
  {
    path: "notifications",
    name: "Notifications",
    component: () => import("@/pages/home/HomeNotificationsRoutePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "messages",
    name: "Messages",
    component: () => import("@/pages/home/HomeMessagesRoutePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "messages/:conversationId",
    name: "MessageDetail",
    component: () => import("@/pages/home/HomeMessageDetailRoutePage.vue"),
    meta: { requiresAuth: true, appShellFlush: true },
  },
];
