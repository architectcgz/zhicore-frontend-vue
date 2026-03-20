/**
 * 搜索相关 API 接口
 * 包含文章搜索、用户搜索、搜索建议等功能
 */

import { httpClient } from '@/utils/request';
import type { 
  Post,
  User,
  Tag,
  PaginatedResponse,
  SearchRequest,
  SearchSuggestion
} from '@/types';

export type { SearchRequest };

/**
 * 搜索结果接口
 */
export interface SearchResult {
  posts: PaginatedResponse<Post>;
  users: PaginatedResponse<User>;
  tags: Tag[];
  total: number;
  took: number; // 搜索耗时（毫秒）
}

/**
 * 高级搜索参数接口
 */
export interface AdvancedSearchParams {
  query: string;
  type?: 'POST' | 'USER' | 'TAG' | 'ALL';
  page?: number;
  size?: number;
  sort?: 'relevance' | 'latest' | 'popular' | 'hot';
  dateRange?: {
    start?: string;
    end?: string;
  };
  authorId?: string;
  categoryId?: string;
  tagIds?: string[];
  minLikes?: number;
  minViews?: number;
  hasImage?: boolean;
}

/**
 * 搜索历史接口
 */
export interface SearchHistory {
  id: string;
  query: string;
  type: 'POST' | 'USER' | 'TAG';
  resultCount: number;
  searchedAt: string;
}

/**
 * 热门搜索接口
 */
export interface HotSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  rank: number;
}

/**
 * 搜索 API 服务类
 */
export class SearchApi {
  /**
   * 全局搜索
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async search(params: SearchRequest): Promise<SearchResult> {
    return httpClient.get<SearchResult>('/search', params);
  }

  /**
   * 搜索文章
   * @param params 搜索参数
   * @returns 文章搜索结果
   */
  async searchPosts(params: AdvancedSearchParams): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>('/search/posts', params);
  }

  /**
   * 搜索用户
   * @param params 搜索参数
   * @returns 用户搜索结果
   */
  async searchUsers(params: AdvancedSearchParams): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>('/search/users', params);
  }

  /**
   * 搜索标签
   * @param params 搜索参数
   * @returns 标签搜索结果
   */
  async searchTags(params: { query: string; limit?: number }): Promise<Tag[]> {
    return httpClient.get<Tag[]>('/search/tags', params);
  }

  /**
   * 获取搜索建议
   * @param query 搜索关键词
   * @param type 搜索类型
   * @returns 搜索建议列表
   */
  async getSuggestions(
    query: string, 
    type?: 'POST' | 'USER' | 'TAG'
  ): Promise<SearchSuggestion[]> {
    return httpClient.get<SearchSuggestion[]>('/search/suggestions', { 
      query, 
      type 
    });
  }

  /**
   * 获取自动补全建议
   * @param query 搜索关键词
   * @param limit 数量限制
   * @returns 自动补全建议
   */
  async getAutoComplete(query: string, limit: number = 10): Promise<string[]> {
    return httpClient.get<string[]>('/search/autocomplete', { query, limit });
  }

  /**
   * 获取热门搜索
   * @param limit 数量限制
   * @returns 热门搜索列表
   */
  async getHotSearches(limit: number = 10): Promise<HotSearch[]> {
    return httpClient.get<HotSearch[]>('/search/hot', { limit });
  }

  /**
   * 获取搜索历史
   * @param params 查询参数
   * @returns 搜索历史列表
   */
  async getSearchHistory(params?: { 
    page?: number; 
    size?: number; 
    type?: 'POST' | 'USER' | 'TAG';
  }): Promise<PaginatedResponse<SearchHistory>> {
    return httpClient.get<PaginatedResponse<SearchHistory>>('/search/history', params);
  }

  /**
   * 保存搜索历史
   * @param query 搜索关键词
   * @param type 搜索类型
   * @param resultCount 结果数量
   */
  async saveSearchHistory(
    query: string, 
    type: 'POST' | 'USER' | 'TAG', 
    resultCount: number
  ): Promise<void> {
    return httpClient.post<void>('/search/history', {
      query,
      type,
      resultCount,
    });
  }

  /**
   * 删除搜索历史
   * @param historyId 历史记录 ID
   */
  async deleteSearchHistory(historyId: string): Promise<void> {
    return httpClient.delete<void>(`/search/history/${historyId}`);
  }

  /**
   * 清空搜索历史
   */
  async clearSearchHistory(): Promise<void> {
    return httpClient.delete<void>('/search/history');
  }

  /**
   * 高级搜索
   * @param params 高级搜索参数
   * @returns 搜索结果
   */
  async advancedSearch(params: AdvancedSearchParams): Promise<SearchResult> {
    return httpClient.post<SearchResult>('/search/advanced', params);
  }

  /**
   * 搜索相关文章
   * @param postId 文章 ID
   * @param limit 数量限制
   * @returns 相关文章列表
   */
  async getRelatedPosts(postId: string, limit: number = 5): Promise<Post[]> {
    return httpClient.get<Post[]>(`/search/related-posts/${postId}`, { limit });
  }

  /**
   * 搜索推荐用户
   * @param userId 用户 ID
   * @param limit 数量限制
   * @returns 推荐用户列表
   */
  async getRecommendedUsers(userId: string, limit: number = 10): Promise<User[]> {
    return httpClient.get<User[]>(`/search/recommended-users/${userId}`, { limit });
  }

  /**
   * 获取搜索统计信息
   * @returns 搜索统计
   */
  async getSearchStats(): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    avgResultsPerSearch: number;
    topQueries: Array<{ query: string; count: number }>;
  }> {
    return httpClient.get('/search/stats');
  }

  /**
   * 举报搜索结果
   * @param query 搜索关键词
   * @param resultId 结果 ID
   * @param resultType 结果类型
   * @param reason 举报原因
   */
  async reportSearchResult(
    query: string,
    resultId: string,
    resultType: 'POST' | 'USER',
    reason: string
  ): Promise<void> {
    return httpClient.post<void>('/search/report', {
      query,
      resultId,
      resultType,
      reason,
    });
  }

  /**
   * 获取搜索过滤器选项
   * @returns 过滤器选项
   */
  async getSearchFilters(): Promise<{
    categories: Array<{ id: string; name: string; count: number }>;
    tags: Array<{ id: string; name: string; count: number }>;
    authors: Array<{ id: string; name: string; count: number }>;
    dateRanges: Array<{ label: string; start: string; end: string }>;
  }> {
    return httpClient.get('/search/filters');
  }
}

// 创建 API 实例
export const searchApi = new SearchApi();
