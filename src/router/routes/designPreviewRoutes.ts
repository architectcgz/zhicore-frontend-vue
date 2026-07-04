import type { RouteRecordRaw } from "vue-router";

export const designPreviewRoutes: RouteRecordRaw[] = [
  {
    path: "/design-preview",
    name: "DesignPreview",
    component: () => import("@/pages/design/DesignPreviewRoutePage.vue"),
    meta: { appShellFlush: true },
  },
];
