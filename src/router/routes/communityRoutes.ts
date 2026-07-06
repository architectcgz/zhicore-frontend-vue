import type { RouteRecordRaw } from "vue-router";

/**
 * 社区路由：
 * 第一阶段以 Content tags 和公开文章承载主题社区入口。
 */
export const communityRoutes: RouteRecordRaw[] = [
  {
    path: "community",
    name: "Community",
    component: () => import("@/pages/community/CommunityRoutePage.vue"),
  },
];
