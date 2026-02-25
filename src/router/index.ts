/**
 * Vue Router 配置
 * 配置路由实例和路由守卫
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { routes } from './routes';
import { setupRouterGuards } from './guards';

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as RouteRecordRaw[],
  
  // 路由配置选项
  scrollBehavior(to, _from, savedPosition) {
    // 如果有保存的滚动位置（浏览器前进/后退）
    if (savedPosition) {
      return savedPosition;
    }
    
    // 如果有锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }
    
    // 默认滚动到顶部
    return { top: 0, behavior: 'smooth' };
  },
  
  // 严格模式，尾部斜杠敏感
  strict: true,
  
  // 区分大小写
  sensitive: false,
});

// 安装路由守卫
setupRouterGuards(router);

export default router;

// 导出路由相关工具
export { routes } from './routes';
export * from './guards';
