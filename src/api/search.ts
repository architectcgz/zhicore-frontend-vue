/**
 * 搜索相关 API 接口
 *
 * 这里只保留当前已在本地 backend inventory 中确认的搜索读能力：
 * - `GET /search/posts`
 * - `GET /search/suggest`
 * - `GET /search/hot`
 * - `GET /search/history`
 * - `DELETE /search/history`
 */

import { httpClient } from '@/utils/request';
import type { PaginatedResponse } from '@/types';

interface BackendSearchResultVO<T> {
  items?: T[];
  total?: number;
  page?: number;
  size?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface BackendPostSearchVO {
  id: string;
  title: string;
  highlightTitle?: string;
  excerpt?: string;
  highlightContent?: string;
  authorId?: string;
  authorName?: string;
  tags?: string[];
  categoryName?: string;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number | string;
  publishedAt?: string;
  score?: number;
}

export interface SearchPostsParams {
  keyword: string;
  page?: number;
  size?: number;
}

export interface SearchPostItem {
  id: string;
  title: string;
  highlightTitle?: string;
  excerpt: string;
  highlightContent?: string;
  authorId: string;
  authorName: string;
  tags: string[];
  categoryName?: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  publishedAt?: string;
  score?: number;
}

function normalizeSearchPost(source: BackendPostSearchVO): SearchPostItem {
  return {
    id: source.id,
    title: source.title,
    highlightTitle: source.highlightTitle,
    excerpt: source.excerpt ?? '',
    highlightContent: source.highlightContent,
    authorId: source.authorId ?? '',
    authorName: source.authorName ?? '',
    tags: source.tags ?? [],
    categoryName: source.categoryName,
    likeCount: source.likeCount ?? 0,
    commentCount: source.commentCount ?? 0,
    viewCount: Number(source.viewCount ?? 0),
    publishedAt: source.publishedAt,
    score: source.score,
  };
}

function normalizeSearchPostsResponse(
  result: BackendSearchResultVO<BackendPostSearchVO>
): PaginatedResponse<SearchPostItem> {
  const items = (result.items ?? []).map(normalizeSearchPost);
  const page = result.page ?? 0;
  const size = result.size ?? items.length;
  const total = result.total ?? items.length;
  const hasMore = result.hasNext ?? (
    typeof result.totalPages === 'number' ? page + 1 < result.totalPages : items.length >= size
  );

  return {
    items,
    total,
    page,
    size,
    hasMore,
  };
}

export class SearchApi {
  /**
   * 搜索文章
   */
  async searchPosts(params: SearchPostsParams): Promise<PaginatedResponse<SearchPostItem>> {
    const result = await httpClient.get<BackendSearchResultVO<BackendPostSearchVO>>('/search/posts', {
      keyword: params.keyword,
      page: params.page ?? 0,
      size: params.size ?? 10,
    });
    return normalizeSearchPostsResponse(result);
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(prefix: string, limit: number = 10): Promise<string[]> {
    return httpClient.get<string[]>('/search/suggest', { prefix, limit });
  }

  /**
   * 获取热门搜索关键词
   */
  async getHotSearches(limit: number = 10): Promise<string[]> {
    return httpClient.get<string[]>('/search/hot', { limit });
  }

  /**
   * 获取当前用户搜索历史
   */
  async getSearchHistory(limit: number = 10): Promise<string[]> {
    return httpClient.get<string[]>('/search/history', { limit });
  }

  /**
   * 清空当前用户搜索历史
   */
  async clearSearchHistory(): Promise<void> {
    return httpClient.delete<void>('/search/history');
  }
}

export const searchApi = new SearchApi();
