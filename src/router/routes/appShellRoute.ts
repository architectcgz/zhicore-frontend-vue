import type { RouteRecordRaw } from 'vue-router'

import { homeRoutes } from './homeRoutes'

/**
 * AppShell 路由：
 * 所有需要登录后展示的页面都作为其子路由，
 * 共享 AppLayout（顶栏 + 内容区）。
 */
export const appShellRoute: RouteRecordRaw = {
  path: '/',
  component: () => import('@/pages/AppShellRoutePage.vue'),
  redirect: '/',
  meta: { requiresAuth: true },
  children: [...homeRoutes],
}
