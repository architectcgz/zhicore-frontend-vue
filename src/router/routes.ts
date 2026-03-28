/**
 * 路由定义文件
 * 定义应用程序的所有路由配置
 */

import type { RouteRecordRaw } from 'vue-router';

/**
 * 路由元信息接口
 */
export interface RouteMeta {
  title?: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  requiresGuest?: boolean;
  permissions?: string[];
  roles?: string[];
  layout?: 'default' | 'auth' | 'admin';
  keepAlive?: boolean;
  showInMenu?: boolean;
  showSidebar?: boolean; // 是否显示 DefaultLayout 的侧边栏，默认 true
  icon?: string;
  order?: number;
}

/**
 * 扩展路由记录类型
 */
export interface AppRouteRecordRaw extends Omit<RouteRecordRaw, 'meta' | 'children'> {
  meta?: RouteMeta;
  children?: AppRouteRecordRaw[];
}

/**
 * 路由配置
 */
export const routes: AppRouteRecordRaw[] = [
  // ========== 首页 ==========
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: {
      title: '首页',
      layout: 'default',
      showInMenu: true,
      showSidebar: true, // 启用 DefaultLayout 的侧边栏（PC 端显示 aside 插槽，移动端通过抽屉菜单访问）
      icon: 'home',
      order: 1,
    },
  },

  // ========== 认证相关路由 ==========
  {
    path: '/auth',
    name: 'Auth',
    redirect: '/auth/login',
    meta: {
      layout: 'auth',
      requiresGuest: true,
    },
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/pages/auth/Login.vue'),
        meta: {
          title: '登录',
          requiresGuest: true,
          layout: 'auth',
        },
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/pages/auth/Register.vue'),
        meta: {
          title: '注册',
          requiresGuest: true,
          layout: 'auth',
        },
      },
    ],
  },

  // ========== 文章相关路由 ==========
  {
    path: '/posts',
    name: 'Posts',
    children: [
      {
        path: ':id',
        name: 'PostDetail',
        component: () => import('@/pages/post/PostDetail.vue'),
        meta: {
          title: '文章详情',
          layout: 'default',
          keepAlive: false,
        },
        props: true,
      },
      {
        path: 'view-3/:id',
        name: 'PostDetailView3',
        component: () => import('@/pages/post/PostDetailView3.vue'),
        meta: {
          title: '文章详情 (方案3)',
          layout: 'default',
          keepAlive: false,
        },
        props: true,
      },
      {
        path: 'create',
        name: 'PostCreate',
        component: () => import('@/pages/post/PostCreate.vue'),
        meta: {
          title: '写文章',
          requiresAuth: true,
          layout: 'default',
          showInMenu: true,
          icon: 'edit',
          order: 2,
        },
      },
      {
        path: ':id/edit',
        name: 'PostEdit',
        component: () => import('@/pages/post/PostEdit.vue'),
        meta: {
          title: '编辑文章',
          requiresAuth: true,
          layout: 'default',
        },
        props: true,
      },
    ],
  },

  // ========== 用户相关路由 ==========
  {
    path: '/users',
    name: 'Users',
    children: [
      {
        path: ':id',
        name: 'UserProfile',
        component: () => import('@/pages/user/Profile.vue'),
        meta: {
          title: '用户主页',
          layout: 'default',
        },
        props: true,
      },
    ],
  },

  // ========== 个人设置路由 ==========
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/user/Settings.vue'),
    meta: {
      title: '个人设置',
      requiresAuth: true,
      layout: 'default',
      showInMenu: true,
      icon: 'settings',
      order: 8,
    },
  },

  // ========== 草稿箱路由 ==========
  {
    path: '/drafts',
    name: 'Drafts',
    component: () => import('@/pages/user/Drafts.vue'),
    meta: {
      title: '草稿箱',
      requiresAuth: true,
      layout: 'default',
      showInMenu: true,
      icon: 'draft',
      order: 3,
    },
  },

  // ========== 分类相关路由 ==========
  {
    path: '/categories',
    name: 'Categories',
    children: [
      {
        path: '',
        name: 'CategoryList',
        component: () => import('@/pages/category/CategoryList.vue'),
        meta: {
          title: '分类',
          layout: 'default',
          showInMenu: true,
          icon: 'category',
          order: 4,
        },
      },
      {
        path: ':id',
        name: 'CategoryDetail',
        component: () => import('@/pages/category/CategoryDetail.vue'),
        meta: {
          title: '分类详情',
          layout: 'default',
        },
        props: true,
      },
    ],
  },

  // ========== 标签相关路由 ==========
  {
    path: '/tags',
    name: 'Tags',
    children: [
      {
        path: '',
        name: 'TagList',
        component: () => import('@/pages/tag/TagList.vue'),
        meta: {
          title: '标签',
          layout: 'default',
          showInMenu: true,
          icon: 'tag',
          order: 5,
        },
      },
      {
        path: ':slug',
        name: 'TagDetail',
        component: () => import('@/pages/tag/TagDetail.vue'),
        meta: {
          title: '标签详情',
          layout: 'default',
        },
        props: true,
      },
    ],
  },

  // ========== 搜索路由 ==========
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/pages/search/SearchResults.vue'),
    meta: {
      title: '搜索结果',
      layout: 'default',
    },
    props: (route) => ({
      query: route.query.q,
      type: route.query.type,
      page: route.query.page,
    }),
  },

  // ========== 通知路由 ==========
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/pages/notification/NotificationCenter.vue'),
    meta: {
      title: '通知中心',
      requiresAuth: true,
      layout: 'default',
      showInMenu: true,
      icon: 'notification',
      order: 6,
    },
  },

  // ========== 消息路由 ==========
  {
    path: '/messages',
    name: 'Messages',
    component: () => import('@/pages/message/MessageCenter.vue'),
    meta: {
      title: '消息中心',
      requiresAuth: true,
      layout: 'default',
      showInMenu: true,
      icon: 'message',
      order: 7,
    },
  },

  // ========== 排行榜路由 ==========
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/pages/ranking/RankingList.vue'),
    meta: {
      title: '排行榜',
      layout: 'default',
      showInMenu: true,
      icon: 'ranking',
      order: 5,
    },
  },

  // ========== 管理员路由 ==========
  {
    path: '/admin',
    name: 'Admin',
    redirect: '/admin/users',
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      layout: 'admin',
      showInMenu: true,
      icon: 'admin',
      order: 9,
    },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/pages/admin/Dashboard.vue'),
        meta: {
          title: '管理后台',
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin',
          showInMenu: true,
          icon: 'dashboard',
          order: 1,
        },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/pages/admin/UserManagement.vue'),
        meta: {
          title: '用户管理',
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin',
          permissions: ['admin:users:read'],
          showInMenu: true,
          icon: 'users',
          order: 2,
        },
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: () => import('@/pages/admin/PostManagement.vue'),
        meta: {
          title: '文章管理',
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin',
          permissions: ['admin:posts:read'],
          showInMenu: true,
          icon: 'posts',
          order: 3,
        },
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('@/pages/admin/CommentManagement.vue'),
        meta: {
          title: '评论管理',
          requiresAuth: true,
          requiresAdmin: true,
          layout: 'admin',
          permissions: ['admin:comments:read'],
          showInMenu: true,
          icon: 'comments',
          order: 4,
        },
      },
    ],
  },

  // ========== 错误页面路由 ==========
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/pages/error/NotFound.vue'),
    meta: {
      title: '页面未找到',
      layout: 'default',
    },
  },

  {
    path: '/500',
    name: 'ServerError',
    component: () => import('@/pages/error/ServerError.vue'),
    meta: {
      title: '服务器错误',
      layout: 'default',
    },
  },

  // ========== 通配符路由（必须放在最后） ==========
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];

/**
 * 获取菜单路由
 * 过滤出需要在菜单中显示的路由
 */
export function getMenuRoutes(): AppRouteRecordRaw[] {
  const filterMenuRoutes = (routes: AppRouteRecordRaw[]): AppRouteRecordRaw[] => {
    return routes
      .filter(route => route.meta?.showInMenu)
      .map(route => ({
        ...route,
        children: route.children ? filterMenuRoutes(route.children) : undefined,
      }))
      .sort((a, b) => (a.meta?.order || 999) - (b.meta?.order || 999));
  };

  return filterMenuRoutes(routes);
}

/**
 * 根据路由名称查找路由
 */
export function findRouteByName(name: string, routesToSearch: AppRouteRecordRaw[] = routes): AppRouteRecordRaw | null {
  for (const route of routesToSearch) {
    if (route.name === name) {
      return route;
    }
    if (route.children) {
      const found = findRouteByName(name, route.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 根据路径查找路由
 */
export function findRouteByPath(path: string, routesToSearch: AppRouteRecordRaw[] = routes): AppRouteRecordRaw | null {
  for (const route of routesToSearch) {
    if (route.path === path) {
      return route;
    }
    if (route.children) {
      const found = findRouteByPath(path, route.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 获取面包屑导航
 */
export function getBreadcrumbs(routeName: string, routesToSearch: AppRouteRecordRaw[] = routes): Array<{ name: string; title: string; path?: string }> {
  const breadcrumbs: Array<{ name: string; title: string; path?: string }> = [];
  
  const findBreadcrumbs = (
    routes: AppRouteRecordRaw[], 
    targetName: string, 
    parentPath = ''
  ): boolean => {
    for (const route of routes) {
      const currentPath = parentPath + route.path;
      
      if (route.name === targetName) {
        breadcrumbs.push({
          name: route.name as string,
          title: route.meta?.title || route.name as string,
          path: currentPath,
        });
        return true;
      }
      
      if (route.children) {
        breadcrumbs.push({
          name: route.name as string,
          title: route.meta?.title || route.name as string,
          path: currentPath,
        });
        
        if (findBreadcrumbs(route.children, targetName, currentPath + '/')) {
          return true;
        }
        
        breadcrumbs.pop(); // 如果在子路由中没找到，移除当前路由
      }
    }
    return false;
  };
  
  findBreadcrumbs(routesToSearch, routeName);
  return breadcrumbs;
}
