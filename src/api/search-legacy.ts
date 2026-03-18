/**
 * 未确认契约的搜索 API。
 *
 * 这些能力暂未在本地 backend inventory 中确认，保留在独立模块中，
 * 避免继续污染 contract-aligned 的 `src/api/search.ts`。
 */

import { httpClient } from '@/utils/request';
import type {
  Post,
  User,
  Tag,
  PaginatedResponse,
  SearchRequest,
} from '@/types';

export interface SearchResult {
  posts: PaginatedResponse<Post>;
  users: PaginatedResponse<User>;
  tags: Tag[];
  total: number;
  took: number;
}

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

export interface SearchHistory {
  id: string;
  query: string;
  type: 'POST' | 'USER' | 'TAG';
  resultCount: number;
  searchedAt: string;
}

export class LegacySearchApi {
  async search(params: SearchRequest): Promise<SearchResult> {
    return httpClient.get<SearchResult>('/search', params);
  }

  async searchUsers(params: AdvancedSearchParams): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>('/search/users', params);
  }

  async searchTags(params: { query: string; limit?: number }): Promise<Tag[]> {
    return httpClient.get<Tag[]>('/search/tags', params);
  }

  async getAutoComplete(query: string, limit: number = 10): Promise<string[]> {
    return httpClient.get<string[]>('/search/autocomplete', { query, limit });
  }

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

  async deleteSearchHistory(historyId: string): Promise<void> {
    return httpClient.delete<void>(`/search/history/${historyId}`);
  }

  async advancedSearch(params: AdvancedSearchParams): Promise<SearchResult> {
    return httpClient.post<SearchResult>('/search/advanced', params);
  }

  async getRelatedPosts(postId: string, limit: number = 5): Promise<Post[]> {
    return httpClient.get<Post[]>(`/search/related-posts/${postId}`, { limit });
  }

  async getRecommendedUsers(userId: string, limit: number = 10): Promise<User[]> {
    return httpClient.get<User[]>(`/search/recommended-users/${userId}`, { limit });
  }

  async getSearchStats(): Promise<{
    totalSearches: number;
    uniqueQueries: number;
    avgResultsPerSearch: number;
    topQueries: Array<{ query: string; count: number }>;
  }> {
    return httpClient.get('/search/stats');
  }

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

  async getSearchFilters(): Promise<{
    categories: Array<{ id: string; name: string; count: number }>;
    tags: Array<{ id: string; name: string; count: number }>;
    authors: Array<{ id: string; name: string; count: number }>;
    dateRanges: Array<{ label: string; start: string; end: string }>;
  }> {
    return httpClient.get('/search/filters');
  }
}

export const legacySearchApi = new LegacySearchApi();
