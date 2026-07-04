import type { RouteRecordRaw } from "vue-router";

export const errorRoutes: RouteRecordRaw[] = [
  {
    path: "/error/:status(\\d+)",
    name: "ErrorStatus",
    component: () => import("@/pages/error/StatusRoutePage.vue"),
    props: (route) => ({
      status: Number(route.params.status),
    }),
  },
  {
    path: "/:status(401|403|404|500)",
    name: "ErrorStatusShorthand",
    component: () => import("@/pages/error/StatusRoutePage.vue"),
    props: (route) => ({
      status: Number(route.params.status),
    }),
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/error/StatusRoutePage.vue"),
    props: {
      status: 404,
    },
  },
];
