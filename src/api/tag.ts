/**
 * 标签相关 API 接口
 * 包含标签的 CRUD 操作、标签文章获取等功能
 */

import { normalizePageResponse, type BackendPageResult } from '@/api/contracts';
import { normalizePost } from '@/api/post';
import { httpClient } from '@/utils/request';
import type {
  Tag,
  Post,
  PaginatedResponse
} from '@/types';

interface BackendTagDTO {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendTagStatsDTO {
  id: number | string;
  name: string;
  slug: string;
  postCount?: number;
}

type BackendTagPostSummary = Parameters<typeof normalizePost>[0];

function normalizeTag(source: BackendTagDTO | BackendTagStatsDTO): Tag {
  return {
    id: String(source.id),
    name: source.name,
    slug: source.slug,
    description: 'description' in source ? source.description : undefined,
    postCount: 'postCount' in source ? source.postCount ?? 0 : undefined,
    createdAt: 'createdAt' in source ? source.createdAt ?? '' : '',
    updatedAt: 'updatedAt' in source ? source.updatedAt ?? '' : '',
  };
}

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
  keyword?: string;
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
    const pageResult = await httpClient.get<BackendPageResult<BackendTagDTO>>('/tags', {
      page: params?.page,
      size: params?.size,
    });
    return normalizePageResponse(pageResult, normalizeTag);
  }

  /**
   * 根据 slug 获取标签详情
   * @param slug 标签 slug
   * @returns 标签详情
   */
  async getTagBySlug(slug: string): Promise<Tag> {
    const tag = await httpClient.get<BackendTagDTO>(`/tags/${slug}`);
    return normalizeTag(tag);
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
    const pageResult = await httpClient.get<BackendPageResult<BackendTagPostSummary>>(`/tags/${slug}/posts`, {
      page: params?.page,
      size: params?.size,
    });
    return normalizePageResponse(pageResult, normalizePost);
  }

  /**
   * 获取热门标签
   * @param params 查询参数
   * @returns 热门标签列表
   */
  async getHotTags(params?: { limit?: number; period?: 'day' | 'week' | 'month' }): Promise<Tag[]> {
    const tags = await httpClient.get<BackendTagStatsDTO[]>('/tags/hot', {
      limit: params?.limit,
    });
    return tags.map(normalizeTag);
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
    const tags = await httpClient.get<BackendTagDTO[]>('/tags/search', {
      keyword: query,
      limit: params?.limit,
    });
    return tags.map(normalizeTag);
  }

  /**
   * 获取标签统计信息
   * @returns 标签统计信息
   */
  async getTagStats(): Promise<TagStats> {
    return httpClient.get<TagStats>('/tags/stats');
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
