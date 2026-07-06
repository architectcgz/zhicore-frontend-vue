import type { RouteRecordRaw } from "vue-router";

export const userRoutes: RouteRecordRaw[] = [
  {
    path: "user/profile",
    name: "UserProfile",
    component: () => import("@/pages/user/UserProfileRoutePage.vue"),
    meta: {
      requiresAuth: true,
      title: "个人信息 - 知构",
    },
  },
];
