/**
 * Pinia 状态管理统一导出
 * 提供所有 Store 的统一入口
 * 
 * 注意：服务端数据管理已迁移到 TanStack Query
 * Pinia Stores 现在仅负责客户端状态管理
 */

// 导出 Store 实例
export { useAuthStore } from './auth';
export { useMessageStore } from './message';
export { useNotificationStore } from './notification';
export { useThemeStore } from './theme';

// 导出 Store 相关类型
export type { AuthState } from './auth';
export type { NotificationClientState } from './notification';
export type { Theme } from './theme';

// 创建 Store 集合对象
import { useAuthStore } from './auth';
import { useMessageStore } from './message';
import { useNotificationStore } from './notification';
import { useThemeStore } from './theme';

export const stores = {
  auth: useAuthStore,
  message: useMessageStore,
  notification: useNotificationStore,
  theme: useThemeStore,
} as const;

// 默认导出 Store 集合
export default stores;
