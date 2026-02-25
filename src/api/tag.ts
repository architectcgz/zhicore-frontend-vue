/**
 * 标签相关 API 接口
 * 包含标签的 CRUD 操作、标签文章获取等功能
 */

import { httpClient } from '@/utils/request';
import type { 
  Tag, 
  Post,
  PaginatedResponse 
} from '@/types';

/**
 * 标签创建请求接口
 */
export interface TagCreateRequest {
  name: string;
  slug?: string;
  description?: string;
}

/**
 * 标签更新请求接口
 */
export interface TagUpdateRequest {
  name?: string;
  slug?: string;
  description?: string;
}

/**
 * 标签查询参数接口
 */
export interface TagQueryParams {
  page?: number;
  size?: number;
  sort?: 'name' | 'postCount' | 'latest' | 'popular';
  keyword?: string;
  minPostCount?: number;
}

/**
 * 标签统计信息接口
 */
export interface TagStats {
  totalTags: number;
  totalPosts: number;
  avgPostsPerTag: number;
  topTags: Array<{
    tag: Tag;
    postCount: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

/**
 * 标签 API 服务类
 */
export class TagApi {
  /**
   * 获取标签列表
   * @param params 查询参数
   * @returns 分页标签列表
   */
  async getTags(params?: TagQueryParams): Promise<PaginatedResponse<Tag>> {
    return httpClient.get<PaginatedResponse<Tag>>('/tags', params);
  }

  /**
   * 根据 ID 获取标签详情
   * @param tagId 标签 ID
   * @returns 标签详情
   */
  async getTagById(tagId: string): Promise<Tag> {
    return httpClient.get<Tag>(`/tags/${tagId}`);
  }

  /**
   * 根据 slug 获取标签详情
   * @param slug 标签 slug
   * @returns 标签详情
   */
  async getTagBySlug(slug: string): Promise<Tag> {
    return httpClient.get<Tag>(`/tags/slug/${slug}`);
  }

  /**
   * 创建标签
   * @param tagData 标签数据
   * @returns 创建的标签
   */
  async createTag(tagData: TagCreateRequest): Promise<Tag> {
    return httpClient.post<Tag>('/tags', tagData);
  }

  /**
   * 更新标签
   * @param tagId 标签 ID
   * @param tagData 更新数据
   * @returns 更新后的标签
   */
  async updateTag(tagId: string, tagData: TagUpdateRequest): Promise<Tag> {
    return httpClient.put<Tag>(`/tags/${tagId}`, tagData);
  }

  /**
   * 删除标签
   * @param tagId 标签 ID
   */
  async deleteTag(tagId: string): Promise<void> {
    return httpClient.delete<void>(`/tags/${tagId}`);
  }

  /**
   * 根据标签获取文章列表
   * @param tagId 标签 ID
   * @param params 查询参数
   * @returns 标签下的文章列表
   */
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

  /**
   * 根据标签 slug 获取文章列表
   * @param slug 标签 slug
   * @param params 查询参数
   * @returns 标签下的文章列表
   */
  async getPostsByTagSlug(
    slug: string,
    params?: { 
      page?: number; 
      size?: number; 
      sort?: 'latest' | 'popular' | 'hot';
    }
  ): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>(`/tags/slug/${slug}/posts`, params);
  }

  /**
   * 获取热门标签
   * @param params 查询参数
   * @returns 热门标签列表
   */
  async getHotTags(params?: { limit?: number; period?: 'day' | 'week' | 'month' }): Promise<Tag[]> {
    return httpClient.get<Tag[]>('/tags/hot', params);
  }

  /**
   * 获取推荐标签
   * @param params 查询参数
   * @returns 推荐标签列表
   */
  async getRecommendedTags(params?: { limit?: number; userId?: string }): Promise<Tag[]> {
    return httpClient.get<Tag[]>('/tags/recommended', params);
  }

  /**
   * 获取相关标签
   * @param tagId 标签 ID
   * @param limit 数量限制
   * @returns 相关标签列表
   */
  async getRelatedTags(tagId: string, limit: number = 10): Promise<Tag[]> {
    return httpClient.get<Tag[]>(`/tags/${tagId}/related`, { limit });
  }

  /**
   * 搜索标签
   * @param query 搜索关键词
   * @param params 查询参数
   * @returns 标签搜索结果
   */
  async searchTags(
    query: string,
    params?: { limit?: number; exact?: boolean }
  ): Promise<Tag[]> {
    return httpClient.get<Tag[]>('/tags/search', { query, ...params });
  }

  /**
   * 获取标签自动补全建议
   * @param query 搜索关键词
   * @param limit 数量限制
   * @returns 标签建议列表
   */
  async getTagSuggestions(query: string, limit: number = 10): Promise<string[]> {
    return httpClient.get<string[]>('/tags/suggestions', { query, limit });
  }

  /**
   * 获取标签统计信息
   * @returns 标签统计信息
   */
  async getTagStats(): Promise<TagStats> {
    return httpClient.get<TagStats>('/tags/stats');
  }

  /**
   * 关注标签
   * @param tagId 标签 ID
   * @returns 关注状态
   */
  async followTag(tagId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    return httpClient.post<{ isFollowing: boolean; followersCount: number }>(`/tags/${tagId}/follow`);
  }

  /**
   * 取消关注标签
   * @param tagId 标签 ID
   * @returns 关注状态
   */
  async unfollowTag(tagId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    return httpClient.delete<{ isFollowing: boolean; followersCount: number }>(`/tags/${tagId}/follow`);
  }

  /**
   * 获取用户关注的标签
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 用户关注的标签列表
   */
  async getUserFollowedTags(
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<Tag>> {
    return httpClient.get<PaginatedResponse<Tag>>(`/users/${userId}/followed-tags`, params);
  }

  /**
   * 获取标签的关注者
   * @param tagId 标签 ID
   * @param params 查询参数
   * @returns 标签关注者列表
   */
  async getTagFollowers(
    tagId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<any>> {
    return httpClient.get<PaginatedResponse<any>>(`/tags/${tagId}/followers`, params);
  }

  /**
   * 批量创建标签
   * @param tagNames 标签名称列表
   * @returns 创建的标签列表
   */
  async batchCreateTags(tagNames: string[]): Promise<Tag[]> {
    return httpClient.post<Tag[]>('/tags/batch-create', { tagNames });
  }

  /**
   * 合并标签
   * @param sourceTagId 源标签 ID
   * @param targetTagId 目标标签 ID
   */
  async mergeTags(sourceTagId: string, targetTagId: string): Promise<void> {
    return httpClient.post<void>('/tags/merge', { sourceTagId, targetTagId });
  }

  /**
   * 检查标签名称是否可用
   * @param name 标签名称
   * @returns 是否可用
   */
  async checkTagNameAvailability(name: string): Promise<{ available: boolean }> {
    return httpClient.get<{ available: boolean }>('/tags/check-name', { name });
  }

  /**
   * 检查标签 slug 是否可用
   * @param slug 标签 slug
   * @returns 是否可用
   */
  async checkTagSlugAvailability(slug: string): Promise<{ available: boolean }> {
    return httpClient.get<{ available: boolean }>('/tags/check-slug', { slug });
  }
}

// 创建 API 实例
export const tagApi = new TagApi();