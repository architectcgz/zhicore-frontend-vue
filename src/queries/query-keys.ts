/**
 * Query Key 工厂
 *
 * 统一管理所有查询的 key，确保一致性和类型安全。
 * 使用 as const 确保类型推断正确。
 *
 * @module queries/query-keys
 */

// ============================================================================
// 类型导入
// ============================================================================

import type { PostQueryParams as ApiPostQueryParams } from '@/api/post';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 文章查询参数（从 API 导入以保持一致性）
 */
export type PostQueryParams = ApiPostQueryParams;

/**
 * 评论查询参数
 */
export interface CommentQueryParams {
  postId?: string;
  page?: number;
  size?: number;
  sort?: 'latest' | 'oldest' | 'hot';
  parentId?: string;
}

/**
 * 用户查询参数
 */
export interface UserQueryParams {
  page?: number;
  size?: number;
  sort?: 'latest' | 'followers' | 'posts';
  role?: 'USER' | 'ADMIN';
}

/**
 * 通知查询参数
 */
export interface NotificationQueryParams {
  page?: number;
  size?: number;
  type?: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  isRead?: boolean;
  sort?: 'latest' | 'oldest';
}

/**
 * 会话查询参数
 */
export interface ConversationQueryParams {
  page?: number;
  size?: number;
  sort?: 'latest' | 'oldest' | 'unread';
  hasUnread?: boolean;
}

/**
 * 消息查询参数
 */
export interface MessageQueryParams {
  conversationId?: string;
  page?: number;
  size?: number;
  sort?: 'latest' | 'oldest';
}

/**
 * 标签查询参数
 */
export interface TagQueryParams {
  page?: number;
  size?: number;
  sort?: 'name' | 'postCount' | 'latest' | 'popular';
  keyword?: string;
  search?: string;
}

/**
 * 排行榜查询参数
 */
export interface RankingQueryParams {
  page?: number;
  size?: number;
  period?: 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  categoryId?: string;
}

/**
 * 搜索参数
 */
export interface SearchRequest {
  query: string;
  type?: 'POST' | 'USER' | 'TAG';
  page?: number;
  size?: number;
  sort?: 'relevance' | 'latest' | 'popular' | 'hot';
}

/**
 * 高级搜索参数
 */
export interface AdvancedSearchParams extends SearchRequest {
  categoryId?: string;
  tagIds?: string[];
  authorId?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: 'relevance' | 'latest' | 'hot';
}

/**
 * 分页参数
 */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ============================================================================
// Query Keys 工厂
// ============================================================================

/**
 * 所有查询的 key 定义
 *
 * 使用工厂模式组织 query keys，确保：
 * 1. 类型安全（使用 as const）
 * 2. 层级清晰（all -> lists -> list -> detail）
 * 3. 易于失效（可以失效整个类别或特定查询）
 * 4. 避免冲突（每个查询都有唯一的 key）
 */
export const queryKeys = {
  // ============================================================================
  // 文章相关 Query Keys
  // ============================================================================
  posts: {
    /**
     * 所有文章查询的基础 key
     */
    all: ['posts'] as const,

    /**
     * 所有文章列表查询的基础 key
     */
    lists: () => [...queryKeys.posts.all, 'list'] as const,

    /**
     * 特定条件的文章列表查询 key
     * @param filters - 查询过滤条件
     */
    list: (filters: PostQueryParams) => [...queryKeys.posts.lists(), filters] as const,

    /**
     * 所有文章详情查询的基础 key
     */
    details: () => [...queryKeys.posts.all, 'detail'] as const,

    /**
     * 特定文章详情查询 key
     * @param id - 文章 ID
     */
    detail: (id: string) => [...queryKeys.posts.details(), id] as const,

    /**
     * 热门文章查询 key
     */
    hot: (filters?: Pick<PostQueryParams, 'page' | 'size'>) =>
      [...queryKeys.posts.all, 'hot', filters] as const,

    /**
     * 推荐文章查询 key
     */
    recommended: () => [...queryKeys.posts.all, 'recommended'] as const,

    /**
     * 相关文章查询 key
     * @param id - 文章 ID
     */
    related: (id: string) => [...queryKeys.posts.all, 'related', id] as const,
  },

  // ============================================================================
  // 评论相关 Query Keys
  // ============================================================================
  comments: {
    /**
     * 所有评论查询的基础 key
     */
    all: ['comments'] as const,

    /**
     * 所有评论列表查询的基础 key
     */
    lists: () => [...queryKeys.comments.all, 'list'] as const,

    /**
     * 特定文章的评论列表查询 key
     * @param postId - 文章 ID
     * @param filters - 查询过滤条件（可选）
     */
    list: (postId: string, filters?: CommentQueryParams) =>
      [...queryKeys.comments.lists(), postId, filters] as const,

    /**
     * 所有评论详情查询的基础 key
     */
    details: () => [...queryKeys.comments.all, 'detail'] as const,

    /**
     * 特定评论详情查询 key
     * @param id - 评论 ID
     */
    detail: (id: string) => [...queryKeys.comments.details(), id] as const,

    /**
     * 评论回复查询 key
     * @param commentId - 父评论 ID
     */
    replies: (commentId: string) => [...queryKeys.comments.all, 'replies', commentId] as const,

    /**
     * 热门评论查询 key
     * @param postId - 文章 ID
     */
    hot: (postId: string) => [...queryKeys.comments.all, 'hot', postId] as const,
  },

  // ============================================================================
  // 用户相关 Query Keys
  // ============================================================================
  users: {
    /**
     * 所有用户查询的基础 key
     */
    all: ['users'] as const,

    /**
     * 所有用户详情查询的基础 key
     */
    details: () => [...queryKeys.users.all, 'detail'] as const,

    /**
     * 特定用户详情查询 key
     * @param id - 用户 ID
     */
    detail: (id: string) => [...queryKeys.users.details(), id] as const,

    /**
     * 当前用户查询 key
     */
    current: () => [...queryKeys.users.all, 'current'] as const,
  },

  // ============================================================================
  // 通知相关 Query Keys
  // ============================================================================
  notifications: {
    /**
     * 所有通知查询的基础 key
     */
    all: ['notifications'] as const,

    /**
     * 所有通知列表查询的基础 key
     */
    lists: () => [...queryKeys.notifications.all, 'list'] as const,

    /**
     * 特定条件的通知列表查询 key
     * @param filters - 查询过滤条件（可选）
     */
    list: (filters?: NotificationQueryParams) => [...queryKeys.notifications.lists(), filters] as const,

    /**
     * 未读通知查询 key
     */
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,

    /**
     * 未读通知数量查询 key
     */
    count: () => [...queryKeys.notifications.all, 'count'] as const,

    /**
     * 通知统计信息查询 key
     */
    stats: () => [...queryKeys.notifications.all, 'stats'] as const,

    /**
     * 通知设置查询 key
     */
    settings: () => [...queryKeys.notifications.all, 'settings'] as const,
  },

  // ============================================================================
  // 消息相关 Query Keys
  // ============================================================================
  messages: {
    /**
     * 所有消息查询的基础 key
     */
    all: ['messages'] as const,

    /**
     * 所有会话查询的基础 key
     */
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,

    /**
     * 特定条件的会话列表查询 key
     * @param filters - 查询过滤条件（可选）
     */
    conversationsList: (filters?: ConversationQueryParams) =>
      [...queryKeys.messages.conversations(), filters] as const,

    /**
     * 特定会话查询 key
     * @param conversationId - 会话 ID
     */
    conversation: (conversationId: string) =>
      [...queryKeys.messages.conversations(), conversationId] as const,

    /**
     * 特定会话的消息列表查询 key
     * @param conversationId - 会话 ID
     * @param filters - 查询过滤条件（可选）
     */
    messagesList: (conversationId: string, filters?: MessageQueryParams) =>
      [...queryKeys.messages.all, 'list', conversationId, filters] as const,

    /**
     * 未读消息数量查询 key
     */
    unreadCount: () => [...queryKeys.messages.all, 'unreadCount'] as const,

    /**
     * 消息统计信息查询 key
     */
    stats: () => [...queryKeys.messages.all, 'stats'] as const,
  },

  // ============================================================================
  // 标签相关 Query Keys
  // ============================================================================
  tags: {
    /**
     * 所有标签查询的基础 key
     */
    all: ['tags'] as const,

    /**
     * 所有标签列表查询的基础 key
     */
    lists: () => [...queryKeys.tags.all, 'list'] as const,

    /**
     * 特定条件的标签列表查询 key
     * @param filters - 查询过滤条件（可选）
     */
    list: (filters?: TagQueryParams) => [...queryKeys.tags.lists(), filters] as const,

    /**
     * 所有标签详情查询的基础 key
     */
    details: () => [...queryKeys.tags.all, 'detail'] as const,

    /**
     * 特定标签详情查询 key
     * @param id - 标签 ID
     */
    detail: (id: string) => [...queryKeys.tags.details(), id] as const,

    /**
     * 根据 slug 查询标签 key
     * @param slug - 标签 slug
     */
    bySlug: (slug: string) => [...queryKeys.tags.all, 'slug', slug] as const,

    /**
     * 标签下的文章列表查询 key
     * @param tagId - 标签 ID
     * @param filters - 查询过滤条件（可选）
     */
    posts: (tagId: string, filters?: any) => [...queryKeys.tags.all, 'posts', tagId, filters] as const,

    /**
     * 热门标签查询 key
     */
    hot: () => [...queryKeys.tags.all, 'hot'] as const,

    /**
     * 推荐标签查询 key
     */
    recommended: () => [...queryKeys.tags.all, 'recommended'] as const,

    /**
     * 标签搜索建议查询 key
     * @param query - 搜索关键词
     */
    suggestions: (query: string) => [...queryKeys.tags.all, 'suggestions', query] as const,
  },

  // ============================================================================
  // 排行榜相关 Query Keys
  // ============================================================================
  ranking: {
    /**
     * 所有排行榜查询的基础 key
     */
    all: ['ranking'] as const,

    /**
     * 文章排行榜相关 keys
     */
    posts: {
      hot: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'posts', 'hot', filters] as const,
      daily: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'posts', 'daily', filters] as const,
      weekly: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'posts', 'weekly', filters] as const,
      monthly: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'posts', 'monthly', filters] as const,
    },

    /**
     * 创作者排行榜相关 keys
     */
    creators: {
      hot: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'creators', 'hot', filters] as const,
      daily: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'creators', 'daily', filters] as const,
      weekly: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'creators', 'weekly', filters] as const,
      monthly: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'creators', 'monthly', filters] as const,
      rising: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'creators', 'rising', filters] as const,
    },

    /**
     * 话题排行榜相关 keys
     */
    topics: {
      hot: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'topics', 'hot', filters] as const,
      daily: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'topics', 'daily', filters] as const,
      weekly: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'topics', 'weekly', filters] as const,
      monthly: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'topics', 'monthly', filters] as const,
      trending: (filters?: RankingQueryParams) => [...queryKeys.ranking.all, 'topics', 'trending', filters] as const,
    },

    /**
     * 排行榜统计信息查询 key
     * @param period - 时间周期（可选）
     */
    stats: (period?: string) => [...queryKeys.ranking.all, 'stats', period] as const,
  },

  // ============================================================================
  // 搜索相关 Query Keys
  // ============================================================================
  search: {
    /**
     * 所有搜索查询的基础 key
     */
    all: ['search'] as const,

    /**
     * 全局搜索查询 key
     * @param query - 搜索关键词
     * @param filters - 查询过滤条件（可选）
     */
    global: (query: string, filters?: any) => [...queryKeys.search.all, 'global', query, filters] as const,

    /**
     * 文章搜索查询 key
     * @param query - 搜索关键词
     * @param filters - 查询过滤条件（可选）
     */
    posts: (query: string, filters?: any) => [...queryKeys.search.all, 'posts', query, filters] as const,

    /**
     * 用户搜索查询 key
     * @param query - 搜索关键词
     * @param filters - 查询过滤条件（可选）
     */
    users: (query: string, filters?: any) => [...queryKeys.search.all, 'users', query, filters] as const,

    /**
     * 标签搜索查询 key
     * @param query - 搜索关键词
     */
    tags: (query: string) => [...queryKeys.search.all, 'tags', query] as const,

    /**
     * 搜索建议查询 key
     * @param query - 搜索关键词
     * @param type - 搜索类型（可选）
     */
    suggestions: (query: string, type?: string) => [...queryKeys.search.all, 'suggestions', query, type] as const,

    /**
     * 热门搜索查询 key
     */
    hot: () => [...queryKeys.search.all, 'hot'] as const,

    /**
     * 搜索历史查询 key
     */
    history: () => [...queryKeys.search.all, 'history'] as const,
  },

  // ============================================================================
  // 管理员相关 Query Keys
  // ============================================================================
  admin: {
    /**
     * 所有管理员查询的基础 key
     */
    all: ['admin'] as const,

    /**
     * 管理员统计信息查询 key
     */
    stats: () => [...queryKeys.admin.all, 'stats'] as const,

    /**
     * 访问趋势查询 key
     * @param days - 天数（可选）
     */
    trends: (days?: number) => [...queryKeys.admin.all, 'trends', days] as const,

    /**
     * 内容增长查询 key
     * @param days - 天数（可选）
     */
    contentGrowth: (days?: number) => [...queryKeys.admin.all, 'content-growth', days] as const,

    /**
     * 最近活动查询 key
     * @param limit - 数量限制（可选）
     */
    activities: (limit?: number) => [...queryKeys.admin.all, 'activities', limit] as const,

    /**
     * 管理员用户相关 keys
     */
    users: {
      all: () => [...queryKeys.admin.all, 'users'] as const,
      list: (params?: PageParams) => [...queryKeys.admin.users.all(), 'list', params] as const,
    },

    /**
     * 管理员文章相关 keys
     */
    posts: {
      all: () => [...queryKeys.admin.all, 'posts'] as const,
      list: (params?: PageParams) => [...queryKeys.admin.posts.all(), 'list', params] as const,
    },

    /**
     * 管理员评论相关 keys
     */
    comments: {
      all: () => [...queryKeys.admin.all, 'comments'] as const,
      list: (params?: PageParams) => [...queryKeys.admin.comments.all(), 'list', params] as const,
    },

    /**
     * 管理员举报相关 keys
     */
    reports: {
      all: () => [...queryKeys.admin.all, 'reports'] as const,
      list: (params?: PageParams) => [...queryKeys.admin.reports.all(), 'list', params] as const,
    },
  },
} as const;
