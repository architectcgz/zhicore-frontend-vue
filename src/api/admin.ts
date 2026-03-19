/**
 * 管理员 API 模块
 * 提供管理后台相关的 API 接口
 */

import { httpClient } from '@/utils/request';

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
  status: AdminUserStatus;
  roles: string[];
  createdAt: string;
}

export type AdminUserStatus = 'NORMAL' | 'FORBIDDEN';

interface BackendPageResult<T> {
  current: number;
  size: number;
  total: number;
  pages: number;
  records: T[];
  hasNext: boolean;
  cursor?: string;
}

interface BackendAdminUser {
  id: string;
  username: string;
  email: string;
  nickname: string;
  avatar?: string;
  status: AdminUserStatus;
  createdAt: string;
  roles?: string[];
}

interface BackendAdminPost {
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  status: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt?: string;
  createdAt: string;
}

interface BackendAdminComment {
  id: string;
  postId: string;
  postTitle: string;
  userId: string;
  userName: string;
  content: string;
  likeCount: number;
  createdAt: string;
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
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
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
  authorId?: string;
  postId?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function sanitizePageParams(params: PageParams = {}): Record<string, string | number> {
  const entries = Object.entries(params).filter(([, value]) => {
    return value !== undefined && value !== null && value !== '';
  });

  return Object.fromEntries(entries);
}

export function normalizePageResponse<TSource, TTarget>(
  pageResult: BackendPageResult<TSource>,
  mapper: (item: TSource) => TTarget
): PageResponse<TTarget> {
  return {
    items: pageResult.records.map(mapper),
    total: pageResult.total,
    page: pageResult.current,
    size: pageResult.size,
    hasMore: pageResult.hasNext,
  };
}

export function normalizeAdminUser(user: BackendAdminUser): AdminUser {
  return {
    id: String(user.id),
    username: user.username,
    email: user.email,
    nickname: user.nickname,
    avatar: user.avatar || '',
    status: user.status,
    roles: user.roles ?? [],
    createdAt: user.createdAt,
  };
}

function normalizeAdminPost(post: BackendAdminPost): AdminPost {
  return {
    id: String(post.id),
    title: post.title,
    author: {
      id: String(post.authorId),
      nickname: post.authorName,
      avatar: '',
    },
    status: post.status as AdminPost['status'],
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
  };
}

function normalizeAdminComment(comment: BackendAdminComment): AdminComment {
  return {
    id: String(comment.id),
    content: comment.content,
    user: {
      id: String(comment.userId),
      nickname: comment.userName,
      avatar: '',
    },
    post: {
      id: String(comment.postId),
      title: comment.postTitle,
    },
    likeCount: comment.likeCount,
    repliesCount: 0,
    createdAt: comment.createdAt,
  };
}

/**
 * 管理员 API
 */
export const adminApi = {
  /**
   * 获取统计数据
   */
  getStats(): Promise<AdminStats> {
    return httpClient.get('/admin/stats');
  },

  /**
   * 获取访问趋势数据
   */
  getTrends(days: number = 7): Promise<TrendDataPoint[]> {
    return httpClient.get('/admin/trends', { days });
  },

  /**
   * 获取内容增长数据
   */
  getContentGrowth(days: number = 30): Promise<ContentGrowth> {
    return httpClient.get('/admin/content-growth', { days });
  },

  /**
   * 获取最近活动
   */
  getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    return httpClient.get('/admin/activities', { limit });
  },

  /**
   * 获取用户列表
   */
  async getUsers(params: PageParams = {}): Promise<PageResponse<AdminUser>> {
    const pageResult = await httpClient.get<BackendPageResult<BackendAdminUser>>(
      '/admin/users',
      sanitizePageParams(params)
    );

    return normalizePageResponse(pageResult, normalizeAdminUser);
  },

  /**
   * 禁用用户
   */
  disableUser(userId: string): Promise<void> {
    return httpClient.post(`/admin/users/${userId}/disable`);
  },

  /**
   * 启用用户
   */
  enableUser(userId: string): Promise<void> {
    return httpClient.post(`/admin/users/${userId}/enable`);
  },

  /**
   * 使用户所有 Token 失效
   */
  invalidateUserTokens(userId: string): Promise<void> {
    return httpClient.post(`/admin/users/${userId}/invalidate-tokens`);
  },

  /**
   * 批量禁用用户
   */
  async batchDisableUsers(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((userId) => this.disableUser(userId)));
  },

  /**
   * 批量启用用户
   */
  async batchEnableUsers(userIds: string[]): Promise<void> {
    await Promise.all(userIds.map((userId) => this.enableUser(userId)));
  },

  /**
   * 获取文章列表
   */
  async getPosts(params: PageParams = {}): Promise<PageResponse<AdminPost>> {
    const pageResult = await httpClient.get<BackendPageResult<BackendAdminPost>>(
      '/admin/posts',
      sanitizePageParams(params)
    );

    return normalizePageResponse(pageResult, normalizeAdminPost);
  },

  /**
   * 删除文章
   */
  deletePost(postId: string): Promise<void> {
    return httpClient.delete(`/admin/posts/${postId}`);
  },

  /**
   * 批量删除文章
   */
  async batchDeletePosts(postIds: string[]): Promise<void> {
    await Promise.all(postIds.map((postId) => this.deletePost(postId)));
  },

  /**
   * 获取评论列表
   */
  async getComments(params: PageParams = {}): Promise<PageResponse<AdminComment>> {
    const pageResult = await httpClient.get<BackendPageResult<BackendAdminComment>>(
      '/admin/comments',
      sanitizePageParams(params)
    );

    return normalizePageResponse(pageResult, normalizeAdminComment);
  },

  /**
   * 删除评论
   */
  deleteComment(commentId: string): Promise<void> {
    return httpClient.delete(`/admin/comments/${commentId}`);
  },

  /**
   * 批量删除评论
   */
  async batchDeleteComments(commentIds: string[]): Promise<void> {
    await Promise.all(commentIds.map((commentId) => this.deleteComment(commentId)));
  },

  /**
   * 获取举报列表
   */
  getReports(params: PageParams): Promise<PageResponse<AdminReport>> {
    return httpClient.get('/admin/reports', sanitizePageParams(params));
  },

  /**
   * 处理举报
   */
  handleReport(reportId: string, action: 'resolve' | 'reject', reason?: string): Promise<void> {
    return httpClient.post(`/admin/reports/${reportId}/handle`, { action, reason });
  },
};

export default adminApi;
