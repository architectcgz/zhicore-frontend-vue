import type { RouteRecordRaw } from "vue-router";

export const searchRoutes: RouteRecordRaw[] = [
  {
    path: "search",
    name: "Search",
    component: () => import("@/pages/search/SearchRoutePage.vue"),
  },
  {
    path: "explore",
    name: "Explore",
    redirect: { name: "Search", query: { source: "explore" } },
  },
  {
    path: "resources",
    name: "Resources",
    redirect: { name: "Search", query: { source: "resources" } },
  },
];
