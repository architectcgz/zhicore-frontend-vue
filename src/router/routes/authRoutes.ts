import type { RouteRecordRaw } from "vue-router";

export const authRoutes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: () => import("@/layouts/AuthLayout.vue"),
    redirect: "/auth/login",
    children: [
      {
        path: "login",
        name: "Login",
        component: () => import("@/pages/auth/LoginRoutePage.vue"),
      },
    ],
  },
];
