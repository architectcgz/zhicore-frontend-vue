import type { RouteRecordRaw } from "vue-router";

export const searchRoutes: RouteRecordRaw[] = [
  {
    path: "search",
    name: "Search",
    component: () => import("@/pages/search/SearchRoutePage.vue"),
  },
];
