import type { RouteRecordRaw } from "vue-router";

export const contentRoutes: RouteRecordRaw[] = [
  {
    path: "/posts/:postId",
    name: "ContentDetail",
    component: () => import("@/pages/content/ContentDetailRoutePage.vue"),
  },
];
