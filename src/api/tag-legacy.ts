/**
 * 未确认契约的标签 API。
 *
 * 这些能力尚未在本地 backend inventory 中确认，保留在独立模块中，
 * 避免继续污染 contract-aligned 的 `src/api/tag.ts`。
 */

import { httpClient } from '@/utils/request';
import type {
  PaginatedResponse,
  Post,
  Tag,
  User,
} from '@/types';

export interface TagFollowState {
  isFollowing: boolean;
  followersCount: number;
}

export class LegacyTagApi {
  async getTagById(tagId: string): Promise<Tag> {
    return httpClient.get<Tag>(`/tags/${tagId}`);
  }

  async getPostsByTag(
    tagId: string,
    params?: {
      page?: number;
      size?: number;
      sort?: 'latest' | 'popular' | 'hot';
    }
  ): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>(`/tags/${tagId}/posts`, params);
  }

  async getRecommendedTags(params?: { limit?: number; userId?: string }): Promise<Tag[]> {
    return httpClient.get<Tag[]>('/tags/recommended', params);
  }

  async getRelatedTags(tagId: string, limit: number = 10): Promise<Tag[]> {
    return httpClient.get<Tag[]>(`/tags/${tagId}/related`, { limit });
  }

  async getTagSuggestions(query: string, limit: number = 10): Promise<string[]> {
    return httpClient.get<string[]>('/tags/suggestions', { query, limit });
  }

  async followTag(tagId: string): Promise<TagFollowState> {
    return httpClient.post<TagFollowState>(`/tags/${tagId}/follow`);
  }

  async unfollowTag(tagId: string): Promise<TagFollowState> {
    return httpClient.delete<TagFollowState>(`/tags/${tagId}/follow`);
  }

  async getUserFollowedTags(
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<Tag>> {
    return httpClient.get<PaginatedResponse<Tag>>(`/users/${userId}/followed-tags`, params);
  }

  async getTagFollowers(
    tagId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>(`/tags/${tagId}/followers`, params);
  }
}

export const legacyTagApi = new LegacyTagApi();
