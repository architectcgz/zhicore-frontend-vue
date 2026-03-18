/**
 * 未纳入当前 contract-aligned public ranking slice 的排行榜 API。
 *
 * 这些能力要么仍依赖 ID-only 返回后的跨服务补全，要么当前页面未准备好
 * 直接消费它们，因此先保留在 legacy 模块，避免再次污染 `src/api/ranking.ts`。
 */

import { httpClient } from '@/utils/request';
import type { PaginatedResponse } from '@/types';
import type {
  CreatorRankingItem,
  PostRankingItem,
  RankingQueryParams,
  RankingStats,
  TopicRankingItem,
} from '@/api/ranking';

export class LegacyRankingApi {
  async getHotPosts(params?: RankingQueryParams): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>('/ranking/posts/hot', params);
  }

  async getDailyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>('/ranking/posts/daily', params);
  }

  async getWeeklyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>('/ranking/posts/weekly', params);
  }

  async getMonthlyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>('/ranking/posts/monthly', params);
  }

  async getYearlyPosts(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>('/ranking/posts/yearly', params);
  }

  async getHotCreators(params?: RankingQueryParams): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/hot', params);
  }

  async getDailyCreators(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/daily', params);
  }

  async getWeeklyCreators(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/weekly', params);
  }

  async getMonthlyCreators(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/monthly', params);
  }

  async getHotTopics(params?: RankingQueryParams): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/hot', params);
  }

  async getDailyTopics(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/daily', params);
  }

  async getWeeklyTopics(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/weekly', params);
  }

  async getMonthlyTopics(params?: Omit<RankingQueryParams, 'period'>): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/monthly', params);
  }

  async getRisingCreators(params?: RankingQueryParams): Promise<PaginatedResponse<CreatorRankingItem>> {
    return httpClient.get<PaginatedResponse<CreatorRankingItem>>('/ranking/creators/rising', params);
  }

  async getTrendingTopics(params?: RankingQueryParams): Promise<PaginatedResponse<TopicRankingItem>> {
    return httpClient.get<PaginatedResponse<TopicRankingItem>>('/ranking/topics/trending', params);
  }

  async getRankingStats(period?: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<RankingStats> {
    return httpClient.get<RankingStats>('/ranking/stats', { period });
  }

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

  async getCategoryRanking(
    categoryId: string,
    params?: RankingQueryParams
  ): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>(`/ranking/categories/${categoryId}`, params);
  }

  async getTagRanking(
    tagId: string,
    params?: RankingQueryParams
  ): Promise<PaginatedResponse<PostRankingItem>> {
    return httpClient.get<PaginatedResponse<PostRankingItem>>(`/ranking/tags/${tagId}`, params);
  }
}

export const legacyRankingApi = new LegacyRankingApi();
