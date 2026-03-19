/**
 * 排行榜相关 API 接口
 * 包含文章排行榜、创作者排行榜、话题排行榜等功能
 */

import { httpClient } from '@/utils/request';
import { normalizePost } from '@/api/post';
import type { 
  Post,
  User,
  Tag,
  PaginatedResponse,
  RankingItem
} from '@/types';

interface BackendHotPostDTO {
  id: string;
  title: string;
  excerpt?: string;
  coverImageUrl?: string;
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  publishedAt?: string;
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
  viewCount?: number;
}

interface BackendPostDetailDTO {
  id: string;
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  title: string;
  raw?: string;
  html?: string;
  excerpt?: string;
  coverImageUrl?: string;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  likeCount?: number;
  commentCount?: number;
  favoriteCount?: number;
  viewCount?: number;
  liked?: boolean;
  favorited?: boolean;
}

export interface BackendRankingScoreDTO {
  entityId: string;
  score: number;
  rank: number;
  updatedAt?: string;
}

/**
 * 排行榜查询参数接口
 */
export interface RankingQueryParams {
  page?: number;
  size?: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
  category?: string;
  tag?: string;
}

/**
 * 文章排行榜项接口
 */
export interface PostRankingItem extends RankingItem {
  post: Post;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    favorites: number;
  };
}

/**
 * 创作者排行榜项接口
 */
export interface CreatorRankingItem extends RankingItem {
  user: User;
  metrics: {
    posts: number;
    totalViews: number;
    totalLikes: number;
    followers: number;
    engagement: number;
  };
}

/**
 * 话题排行榜项接口
 */
export interface TopicRankingItem extends RankingItem {
  tag: Tag;
  metrics: {
    posts: number;
    totalViews: number;
    totalLikes: number;
    followers: number;
    growth: number;
  };
}

/**
 * 排行榜统计信息接口
 */
export interface RankingStats {
  totalPosts: number;
  totalCreators: number;
  totalTopics: number;
  periodStats: {
    period: string;
    posts: number;
    creators: number;
    topics: number;
  };
}

type PostRankingPeriod = 'hot' | 'daily' | 'weekly' | 'monthly';

type RankingPageWindow = {
  page: number;
  size: number;
  startIndex: number;
  endIndex: number;
  requestCount: number;
};

function getRankingPageWindow(params?: Pick<RankingQueryParams, 'page' | 'size'>): RankingPageWindow {
  const page = Math.max(1, params?.page ?? 1);
  const size = Math.max(1, params?.size ?? 20);
  const startIndex = (page - 1) * size;
  const endIndex = startIndex + size;

  return {
    page,
    size,
    startIndex,
    endIndex,
    requestCount: Math.min(100, endIndex + 1),
  };
}

export function buildPostRankingItem(post: Post, score: BackendRankingScoreDTO): PostRankingItem {
  return {
    id: String(score.entityId),
    title: post.title,
    score: score.score,
    rank: score.rank,
    change: 0,
    type: 'POST',
    post,
    metrics: {
      views: post.viewCount ?? 0,
      likes: post.likeCount ?? 0,
      comments: post.commentCount ?? 0,
      shares: 0,
      favorites: post.favoriteCount ?? 0,
    },
  };
}

export function mapPostScoresToRankingItems(
  scores: BackendRankingScoreDTO[],
  posts: Post[]
): PostRankingItem[] {
  const postsById = new Map(posts.map((post) => [post.id, post]));

  return scores.flatMap((score) => {
    const post = postsById.get(String(score.entityId));

    return post ? [buildPostRankingItem(post, score)] : [];
  });
}

export function buildApproximateRankingPage<T>(
  items: T[],
  pageWindow: RankingPageWindow,
  hasMore: boolean
): PaginatedResponse<T> {
  const total = hasMore
    ? pageWindow.endIndex + 1
    : pageWindow.startIndex + items.length;

  return {
    items,
    total,
    page: pageWindow.page,
    size: pageWindow.size,
    hasMore,
  };
}

/**
 * 排行榜 API 服务类
 */
export class RankingApi {
  private async getPostScoreList(
    period: PostRankingPeriod,
    pageWindow: RankingPageWindow
  ): Promise<BackendRankingScoreDTO[]> {
    if (period === 'hot') {
      return httpClient.get<BackendRankingScoreDTO[]>('/ranking/posts/hot/scores', {
        page: 0,
        size: pageWindow.requestCount,
      });
    }

    return httpClient.get<BackendRankingScoreDTO[]>(`/ranking/posts/${period}/scores`, {
      limit: pageWindow.requestCount,
    });
  }

  private async getPostsByIds(postIds: string[]): Promise<Post[]> {
    const results = await Promise.allSettled(
      postIds.map((postId) =>
        httpClient
          .get<BackendPostDetailDTO>(`/posts/${postId}`, undefined, {
            skipErrorHandler: true,
          })
          .then((post) => normalizePost(post))
      )
    );

    return results.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []));
  }

  private async getPostRankingPage(
    period: PostRankingPeriod,
    params?: Pick<RankingQueryParams, 'page' | 'size'>
  ): Promise<PaginatedResponse<PostRankingItem>> {
    const pageWindow = getRankingPageWindow(params);
    const scores = await this.getPostScoreList(period, pageWindow);
    const pageScores = scores.slice(pageWindow.startIndex, pageWindow.endIndex);
    const posts = await this.getPostsByIds(pageScores.map((score) => String(score.entityId)));
    const items = mapPostScoresToRankingItems(pageScores, posts);
    const hasMore = scores.length > pageWindow.endIndex;

    return buildApproximateRankingPage(items, pageWindow, hasMore);
  }

  /**
   * 获取热门文章详情列表
   * 首页垂直切片使用后端确认的 details 端点。
   */
  async getHotPostDetails(params?: { page?: number; size?: number }): Promise<Post[]> {
    const requestParams = {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
    };
    const posts = await httpClient.get<BackendHotPostDTO[]>('/ranking/posts/hot/details', requestParams);
    return posts.map(normalizePost);
  }

  /**
   * 获取热门文章排行榜
   * @param params 查询参数
   * @returns 热门文章排行榜
   */
  async getHotPosts(params?: RankingQueryParams): Promise<PaginatedResponse<PostRankingItem>> {
    return this.getPostRankingPage('hot', params);
  }

  /**
   * 获取日榜文章
   * @param params 查询参数
   * @returns 日榜文章列表
   */
  async getDailyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return this.getPostRankingPage('daily', params);
  }

  /**
   * 获取周榜文章
   * @param params 查询参数
   * @returns 周榜文章列表
   */
  async getWeeklyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return this.getPostRankingPage('weekly', params);
  }

  /**
   * 获取月榜文章
   * @param params 查询参数
   * @returns 月榜文章列表
   */
  async getMonthlyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return this.getPostRankingPage('monthly', params);
  }

  /**
   * 获取年榜文章
   * @param params 查询参数
   * @returns 年榜文章列表
   */
  async getYearlyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>('/ranking/posts/yearly', params);
  }

  /**
   * 获取热门创作者排行榜
   * @param params 查询参数
   * @returns 热门创作者排行榜
   */
  async getHotCreators(params?: RankingQueryParams): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/hot', params);
  }

  /**
   * 获取日榜创作者
   * @param params 查询参数
   * @returns 日榜创作者列表
   */
  async getDailyCreators(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/daily', params);
  }

  /**
   * 获取周榜创作者
   * @param params 查询参数
   * @returns 周榜创作者列表
   */
  async getWeeklyCreators(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/weekly', params);
  }

  /**
   * 获取月榜创作者
   * @param params 查询参数
   * @returns 月榜创作者列表
   */
  async getMonthlyCreators(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/monthly', params);
  }

  /**
   * 获取热门话题排行榜
   * @param params 查询参数
   * @returns 热门话题排行榜
   */
  async getHotTopics(params?: RankingQueryParams): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/hot', params);
  }

  /**
   * 获取日榜话题
   * @param params 查询参数
   * @returns 日榜话题列表
   */
  async getDailyTopics(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/daily', params);
  }

  /**
   * 获取周榜话题
   * @param params 查询参数
   * @returns 周榜话题列表
   */
  async getWeeklyTopics(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/weekly', params);
  }

  /**
   * 获取月榜话题
   * @param params 查询参数
   * @returns 月榜话题列表
   */
  async getMonthlyTopics(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/monthly', params);
  }

  /**
   * 获取新星榜（新兴创作者）
   * @param params 查询参数
   * @returns 新星创作者列表
   */
  async getRisingCreators(params?: RankingQueryParams): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/rising', params);
  }

  /**
   * 获取新锐榜（新兴话题）
   * @param params 查询参数
   * @returns 新锐话题列表
   */
  async getTrendingTopics(params?: RankingQueryParams): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/trending', params);
  }

  /**
   * 获取排行榜统计信息
   * @param period 时间周期
   * @returns 排行榜统计信息
   */
  async getRankingStats(period?: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<RankingStats> {
    return httpClient.get<RankingStats>('/ranking/stats', { period });
  }

  /**
   * 获取用户在排行榜中的位置
   * @param userId 用户 ID
   * @param type 排行榜类型
   * @param period 时间周期
   * @returns 用户排名信息
   */
  async getUserRanking(
    userId: string,
    type: 'creator' | 'posts',
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<{
    rank: number;
    score: number;
    change: number;
    percentile: number;
  }> {
    return httpClient.get(`/ranking/users/${userId}`, { type, period });
  }

  /**
   * 获取文章在排行榜中的位置
   * @param postId 文章 ID
   * @param period 时间周期
   * @returns 文章排名信息
   */
  async getPostRanking(
    postId: string,
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<{
    rank: number;
    score: number;
    change: number;
    category: string;
  }> {
    return httpClient.get(`/ranking/posts/${postId}`, { period });
  }

  /**
   * 获取话题在排行榜中的位置
   * @param tagId 话题 ID
   * @param period 时间周期
   * @returns 话题排名信息
   */
  async getTopicRanking(
    tagId: string,
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  ): Promise<{
    rank: number;
    score: number;
    change: number;
    growth: number;
  }> {
    return httpClient.get(`/ranking/topics/${tagId}`, { period });
  }

  /**
   * 获取排行榜历史数据
   * @param type 排行榜类型
   * @param itemId 项目 ID
   * @param period 时间周期
   * @param days 天数
   * @returns 历史排名数据
   */
  async getRankingHistory(
    type: 'post' | 'creator' | 'topic',
    itemId: string,
    period: 'daily' | 'weekly' | 'monthly',
    days: number = 30
  ): Promise<Array<{
    date: string;
    rank: number;
    score: number;
  }>> {
    return httpClient.get(`/ranking/history/${type}/${itemId}`, { period, days });
  }

  /**
   * 获取分类排行榜
   * @param categoryId 分类 ID
   * @param params 查询参数
   * @returns 分类排行榜
   */
  async getCategoryRanking(
    categoryId: string,
    params?: RankingQueryParams
  ): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>(`/ranking/categories/${categoryId}`, params);
  }

  /**
   * 获取标签排行榜
   * @param tagId 标签 ID
   * @param params 查询参数
   * @returns 标签排行榜
   */
  async getTagRanking(
    tagId: string,
    params?: RankingQueryParams
  ): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>(`/ranking/tags/${tagId}`, params);
  }
}

// 创建 API 实例
export const rankingApi = new RankingApi();
