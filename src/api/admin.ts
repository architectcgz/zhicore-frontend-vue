/**
 * 管理员 API 模块
 * 提供管理后台相关的 API 接口
 */

import {request} from '@/utils/request';

/**
 * 统计数据接口
 */
export interface AdminStats {
  userCount: number;
  postCount: number;
  commentCount: number;
  todayUserCount: number;
  todayPostCount: number;
  todayCommentCount: number;
}

/**
 * 访问趋势数据点
 */
export interface TrendDataPoint {
  date: string;
  value: number;
}

/**
 * 内容增长数据
 */
export interface ContentGrowth {
  posts: TrendDataPoint[];
  comments: TrendDataPoint[];
  users: TrendDataPoint[];
}

/**
 * 最近活动项
 */
export interface RecentActivity {
  id: string;
  type: 'user' | 'post' | 'comment' | 'report';
  title: string;
  description: string;
  timestamp: string;
  user?: {
    id: string;
    nickname: string;
    avatar: string;
  };
}

/**
 * 用户列表项
 */
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'DISABLED';
  postsCount: number;
  followersCount: number;
  createdAt: string;
  lastLoginAt?: string;
}

/**
 * 文章列表项
 */
export interface AdminPost {
  id: string;
  title: string;
  author: {
    id: string;
    nickname: string;
    avatar: string;
  };
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
}

/**
 * 评论列表项
 */
export interface AdminComment {
  id: string;
  content: string;
  user: {
    id: string;
    nickname: string;
    avatar: string;
  };
  post: {
    id: string;
    title: string;
  };
  likeCount: number;
  repliesCount: number;
  createdAt: string;
}

/**
 * 举报列表项
 */
export interface AdminReport {
  id: string;
  type: 'POST' | 'COMMENT' | 'USER';
  targetId: string;
  targetTitle: string;
  reason: string;
  reporter: {
    id: string;
    nickname: string;
    avatar: string;
  };
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  hasMore: boolean;
}

/**
 * 分页参数
 */
export interface PageParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 管理员 API
 */
export const adminApi = {
  /**
   * 获取统计数据
   */
  getStats(): Promise<AdminStats> {
    return request.get('/api/v1/admin/stats');
  },

  /**
   * 获取访问趋势数据
   */
  getTrends(days: number = 7): Promise<TrendDataPoint[]> {
    return request.get('/api/v1/admin/trends', { params: { days } });
  },

  /**
   * 获取内容增长数据
   */
  getContentGrowth(days: number = 30): Promise<ContentGrowth> {
    return request.get('/api/v1/admin/content-growth', { params: { days } });
  },

  /**
   * 获取最近活动
   */
  getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    return request.get('/api/v1/admin/activities', { params: { limit } });
  },

  /**
   * 获取用户列表
   */
  getUsers(params: PageParams): Promise<PageResponse<AdminUser>> {
    return request.get('/api/v1/admin/users', { params });
  },

  /**
   * 禁用用户
   */
  disableUser(userId: string): Promise<void> {
    return request.post(`/api/v1/admin/users/${userId}/disable`);
  },

  /**
   * 启用用户
   */
  enableUser(userId: string): Promise<void> {
    return request.post(`/api/v1/admin/users/${userId}/enable`);
  },

  /**
   * 批量禁用用户
   */
  batchDisableUsers(userIds: string[]): Promise<void> {
    return request.post('/api/v1/admin/users/batch-disable', { userIds });
  },

  /**
   * 批量启用用户
   */
  batchEnableUsers(userIds: string[]): Promise<void> {
    return request.post('/api/v1/admin/users/batch-enable', { userIds });
  },

  /**
   * 获取文章列表
   */
  getPosts(params: PageParams): Promise<PageResponse<AdminPost>> {
    return request.get('/api/v1/admin/posts', { params });
  },

  /**
   * 删除文章
   */
  deletePost(postId: string): Promise<void> {
    return request.delete(`/api/v1/admin/posts/${postId}`);
  },

  /**
   * 批量删除文章
   */
  batchDeletePosts(postIds: string[]): Promise<void> {
    return request.post('/api/v1/admin/posts/batch-delete', { postIds });
  },

  /**
   * 获取评论列表
   */
  getComments(params: PageParams): Promise<PageResponse<AdminComment>> {
    return request.get('/api/v1/admin/comments', { params });
  },

  /**
   * 删除评论
   */
  deleteComment(commentId: string): Promise<void> {
    return request.delete(`/api/v1/admin/comments/${commentId}`);
  },

  /**
   * 批量删除评论
   */
  batchDeleteComments(commentIds: string[]): Promise<void> {
    return request.post('/api/v1/admin/comments/batch-delete', { commentIds });
  },

  /**
   * 获取举报列表
   */
  getReports(params: PageParams): Promise<PageResponse<AdminReport>> {
    return request.get('/api/v1/admin/reports', { params });
  },

  /**
   * 处理举报
   */
  handleReport(reportId: string, action: 'resolve' | 'reject', reason?: string): Promise<void> {
    return request.post(`/api/v1/admin/reports/${reportId}/handle`, { action, reason });
  },
};

export default adminApi;
