/**
 * API 模块统一导出
 * 提供所有 API 服务的统一入口
 */

// 导入 API 服务实例
import { authApi } from './auth';
import { postApi } from './post';
import { commentApi } from './comment';
import { userApi } from './user';
import { notificationApi } from './notification';
import { messageApi } from './message';
import { searchApi } from './search';
import { tagApi } from './tag';
import { rankingApi } from './ranking';

// 导出 API 服务类和实例
export { AuthApi, authApi } from './auth';
export { PostApi, postApi } from './post';
export { CommentApi, commentApi } from './comment';
export { UserApi, userApi } from './user';
export { NotificationApi, notificationApi } from './notification';
export { MessageApi, messageApi } from './message';
export { SearchApi, searchApi } from './search';
export { TagApi, tagApi } from './tag';
export { RankingApi, rankingApi } from './ranking';

// 导出 HTTP 客户端
export { httpClient, HttpClient } from '@/utils/request';

// 导出类型定义 - 直接从 @/types 导出，避免重复
// Export type definitions - directly from @/types to avoid duplication
export type {
  // Auth 相关类型
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  
  // Post 相关类型
  Post,
  PostStatus,
  
  // Comment 相关类型
  Comment,
  
  // Notification 相关类型
  Notification,
  NotificationType,
  
  // Message 相关类型
  Message,
  Conversation,
  
  // Tag 相关类型
  Tag,
  
  // 通用类型
  PaginatedResponse,
  ApiResponse,
} from '@/types';

// 创建 API 服务集合对象
export const api = {
  auth: authApi,
  post: postApi,
  comment: commentApi,
  user: userApi,
  notification: notificationApi,
  message: messageApi,
  search: searchApi,
  tag: tagApi,
  ranking: rankingApi,
} as const;

// 默认导出 API 服务集合
export default api;
