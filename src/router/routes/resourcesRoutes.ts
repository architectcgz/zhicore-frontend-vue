import type { RouteRecordRaw } from "vue-router";

export const resourcesRoutes: RouteRecordRaw[] = [
  {
    path: "resources",
    name: "Resources",
    component: () => import("@/pages/resources/ResourcesRoutePage.vue"),
  },
];
