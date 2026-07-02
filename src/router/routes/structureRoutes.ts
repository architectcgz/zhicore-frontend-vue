import type { RouteRecordRaw } from "vue-router";

/**
 * “构”路由：
 * 承载知识结构组织能力，区别于读内容和写草稿的主流程。
 */
export const structureRoutes: RouteRecordRaw[] = [
  {
    path: "structure",
    name: "Structure",
    component: () => import("@/pages/structure/StructureRoutePage.vue"),
    meta: { requiresAuth: true },
  },
];
