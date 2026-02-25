/**
 * 路由守卫文件
 * 实现认证守卫、权限守卫、管理员守卫等
 */

import type { Router, NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import type { RouteMeta } from './routes';

function sanitizeRedirectPath(redirect: unknown): string {
  if (typeof redirect !== 'string') return '/';

  const trimmed = redirect.trim();
  if (!trimmed.startsWith('/')) return '/';
  if (trimmed.startsWith('//')) return '/';
  if (trimmed.includes('://')) return '/';

  return trimmed;
}

/**
 * 路由守卫错误类型
 */
export class RouteGuardError extends Error {
  constructor(
    message: string,
    public code: string,
    public redirectTo?: string
  ) {
    super(message);
    this.name = 'RouteGuardError';
  }
}

/**
 * 认证守卫
 * 检查用户是否已登录
 */
export function requiresAuth(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore();
  
  // 检查路由是否需要认证
  if (!to.meta?.requiresAuth) {
    next();
    return;
  }
  
  // 检查用户是否已认证
  if (!authStore.isAuthenticated) {
    console.warn(`Access denied to ${to.path}: User not authenticated`);
    
    // 保存原始目标路径，登录后重定向
    const redirectPath = to.fullPath !== '/auth/login' ? to.fullPath : '/';
    
    next({
      name: 'Login',
      query: { 
        redirect: redirectPath,
        reason: 'auth_required'
      },
    });
    return;
  }
  
  next();
}

/**
 * 管理员守卫
 * 检查用户是否为管理员
 */
export function requiresAdmin(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore();
  
  // 检查路由是否需要管理员权限
  if (!to.meta?.requiresAdmin) {
    next();
    return;
  }
  
  // 先检查是否已认证
  if (!authStore.isAuthenticated) {
    console.warn(`Access denied to ${to.path}: User not authenticated`);
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'admin_required'
      },
    });
    return;
  }
  
  // 检查是否为管理员
  if (!authStore.isAdmin) {
    console.warn(`Access denied to ${to.path}: User is not admin`);
    next({
      name: 'NotFound', // 对于非管理员，显示404而不是403，避免信息泄露
    });
    return;
  }
  
  next();
}

/**
 * 权限守卫
 * 检查用户是否具有特定权限
 */
export function requiresPermissions(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore();
  const permissions = (to.meta as RouteMeta)?.permissions;
  
  // 如果路由没有权限要求，直接通过
  if (!permissions || permissions.length === 0) {
    next();
    return;
  }
  
  // 检查是否已认证
  if (!authStore.isAuthenticated) {
    console.warn(`Access denied to ${to.path}: User not authenticated`);
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'permission_required'
      },
    });
    return;
  }
  
  // 检查权限
  const hasAllPermissions = permissions.every(permission => 
    authStore.hasPermission(permission)
  );
  
  if (!hasAllPermissions) {
    console.warn(`Access denied to ${to.path}: Insufficient permissions`, {
      required: permissions,
      user: authStore.user?.id,
    });
    
    next({
      name: 'NotFound',
    });
    return;
  }
  
  next();
}

/**
 * 角色守卫
 * 检查用户是否具有特定角色
 */
export function requiresRoles(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore();
  const roles = (to.meta as RouteMeta)?.roles;
  
  // 如果路由没有角色要求，直接通过
  if (!roles || roles.length === 0) {
    next();
    return;
  }
  
  // 检查是否已认证
  if (!authStore.isAuthenticated) {
    console.warn(`Access denied to ${to.path}: User not authenticated`);
    next({
      name: 'Login',
      query: { 
        redirect: to.fullPath,
        reason: 'role_required'
      },
    });
    return;
  }
  
  // 检查角色
  const userRole = authStore.user?.role;
  const hasRequiredRole = userRole && roles.includes(userRole);
  
  if (!hasRequiredRole) {
    console.warn(`Access denied to ${to.path}: Insufficient role`, {
      required: roles,
      current: userRole,
      user: authStore.user?.id,
    });
    
    next({
      name: 'NotFound',
    });
    return;
  }
  
  next();
}

/**
 * 访客守卫
 * 只允许未登录用户访问（如登录、注册页面）
 */
export function requiresGuest(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  const authStore = useAuthStore();
  
  // 检查路由是否只允许访客访问
  if (!to.meta?.requiresGuest) {
    next();
    return;
  }
  
  // 如果用户已登录，重定向到首页
  if (authStore.isAuthenticated) {
    console.info(`Redirecting authenticated user from ${to.path} to home`);
    
    // 如果有重定向参数，使用重定向地址，否则去首页
    const redirectTo = sanitizeRedirectPath(to.query.redirect);
    
    next({
      path: redirectTo,
      replace: true,
    });
    return;
  }
  
  next();
}

/**
 * 页面标题更新守卫
 * 根据路由元信息更新页面标题
 */
export function updatePageTitle(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  // 获取页面标题
  const title = (to.meta as RouteMeta)?.title;
  const siteTitle = import.meta.env.VITE_APP_NAME || '知构';
  
  if (title) {
    // 设置页面标题，格式：页面标题 - 网站名称
    document.title = `${title} - ${siteTitle}`;
  } else {
    // 如果没有设置标题，使用默认标题
    document.title = siteTitle;
  }
  
  next();
}

/**
 * 路由参数验证守卫
 * 验证路由参数的有效性
 */
export function validateRouteParams(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
): void {
  // 验证用户ID参数
  if (to.params.id && to.name?.toString().includes('User')) {
    const userId = to.params.id as string;
    
    // 简单的ID格式验证
    if (!/^[a-zA-Z0-9-_]+$/.test(userId)) {
      console.warn(`Invalid user ID format: ${userId}`);
      next({ name: 'NotFound' });
      return;
    }
  }
  
  // 验证文章ID参数
  if (to.params.id && to.name?.toString().includes('Post')) {
    const postId = to.params.id as string;
    
    // 简单的ID格式验证
    if (!/^[a-zA-Z0-9-_]+$/.test(postId)) {
      console.warn(`Invalid post ID format: ${postId}`);
      next({ name: 'NotFound' });
      return;
    }
  }
  
  // 验证标签slug参数
  if (to.params.slug && to.name === 'TagDetail') {
    const slug = to.params.slug as string;
    
    // 简单的slug格式验证
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
      console.warn(`Invalid tag slug format: ${slug}`);
      next({ name: 'NotFound' });
      return;
    }
  }
  
  next();
}

/**
 * 安装所有路由守卫
 * @param router Vue Router 实例
 */
export function setupRouterGuards(router: Router): void {
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    try {
      // 注意：当前仅支持同步守卫。如需异步守卫（如远程权限校验），
      // 需将 evaluateGuard 改为 async 并 await 调用
      const evaluateGuard = (guard: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => void) => {
        let called = false;
        let nextArg: Parameters<NavigationGuardNext>[0] | undefined;

        guard(to, from, (arg?: Parameters<NavigationGuardNext>[0]) => {
          called = true;
          nextArg = arg;
        });

        return called ? nextArg : undefined;
      };

      const guards = [
        validateRouteParams,
        requiresGuest,
        requiresAuth,
        requiresAdmin,
        requiresPermissions,
        requiresRoles,
      ];

      for (const guard of guards) {
        const result = evaluateGuard(guard);
        if (result !== undefined) {
          next(result);
          return;
        }
      }

      next();
      
    } catch (error) {
      console.error('Router guard error:', error);
      
      // 发生错误时，重定向到错误页面
      next({
        name: 'ServerError',
        query: { 
          error: 'router_guard_error',
          from: from.fullPath 
        },
      });
    }
  });
  
  // 全局后置钩子
  router.afterEach((to, from) => {
    // 更新页面标题
    updatePageTitle(to, from, () => {});
    
    // 页面切换完成后的处理
    // 例如：隐藏加载指示器、发送页面访问统计等
    
    // 滚动到页面顶部（可选）
    if (to.hash) {
      // 如果有锚点，滚动到锚点位置
      setTimeout(() => {
        const element = document.querySelector(to.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // 否则滚动到页面顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 记录路由变化（用于分析）
    if (import.meta.env.DEV) {
      console.info(`Route changed: ${from.fullPath} -> ${to.fullPath}`);
    }
  });
  
  // 路由错误处理
  router.onError((error) => {
    console.error('Router error:', error);
    
    // 可以在这里添加错误上报逻辑
    // 例如：发送错误信息到监控系统
    
    // 重定向到错误页面
    router.push({
      name: 'ServerError',
      query: { 
        error: 'router_error',
      },
    });
  });
}

/**
 * 检查路由权限（工具函数）
 * @param routeName 路由名称
 * @returns 是否有权限访问
 */
export function canAccessRoute(routeName: string): boolean {
  const authStore = useAuthStore();
  
  // 这里可以根据路由名称检查权限
  // 实际实现中，可能需要从路由配置中获取权限要求
  
  // 示例逻辑
  if (routeName.startsWith('Admin')) {
    return authStore.isAdmin;
  }
  
  if (routeName === 'PostCreate' || routeName === 'PostEdit') {
    return authStore.isAuthenticated;
  }
  
  return true;
}

/**
 * 获取登录重定向URL
 * @param currentPath 当前路径
 * @returns 登录URL
 */
export function getLoginUrl(currentPath: string): string {
  const loginPath = '/auth/login';
  
  if (currentPath === '/' || currentPath === loginPath) {
    return loginPath;
  }
  
  return `${loginPath}?redirect=${encodeURIComponent(currentPath)}`;
}

/**
 * 处理认证失败
 * @param router Vue Router 实例
 * @param currentPath 当前路径
 */
export function handleAuthFailure(router: Router, currentPath: string): void {
  const authStore = useAuthStore();
  
  // 清除认证状态（统一走 logout，确保同步广播）
  void authStore.logout();
  
  // 重定向到登录页面
  router.push(getLoginUrl(currentPath));
}
