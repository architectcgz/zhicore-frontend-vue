/**
 * 文章相关 API 接口
 * 包含文章的 CRUD 操作、点赞、收藏等功能
 */

import { httpClient } from '@/utils/request';
import { normalizePageResponse, type BackendHybridPageResult } from '@/api/contracts';
import type { 
  User,
  Post, 
  PaginatedResponse, 
  UploadResponse 
} from '@/types';

interface BackendPostSummary {
  id: number | string;
  ownerId?: number | string;
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

export function normalizeUserSummary(source: {
  ownerId?: number | string;
  ownerName?: string;
  ownerAvatar?: string;
  role?: string;
  roles?: string[];
}): User {
  const nickname = source.ownerName || '匿名用户';
  const isAdmin = source.role === 'ADMIN' || source.roles?.includes('ADMIN');

  return {
    id: String(source.ownerId ?? ''),
    username: nickname,
    email: '',
    nickname,
    avatar: source.ownerAvatar || '',
    bio: '',
    role: isAdmin ? 'ADMIN' : 'USER',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
    updatedAt: '',
  };
}

function normalizeAuthor(source: BackendPostSummary): User {
  const nickname = source.ownerName || '匿名用户';

  return normalizeUserSummary({
    ownerId: source.ownerId,
    ownerName: nickname,
    ownerAvatar: source.ownerAvatar,
  });
}

export function normalizePost(source: BackendPostSummary): Post {
  return {
    id: String(source.id),
    title: source.title,
    content: source.raw || source.excerpt || '',
    rawContent: source.raw,
    htmlContent: source.html,
    excerpt: source.excerpt || '',
    coverImage: source.coverImageUrl,
    authorId: String(source.ownerId ?? ''),
    author: normalizeAuthor(source),
    tags: [],
    status: (source.status as Post['status']) || 'PUBLISHED',
    viewCount: source.viewCount ?? 0,
    likeCount: source.likeCount ?? 0,
    commentCount: source.commentCount ?? 0,
    favoriteCount: source.favoriteCount ?? 0,
    isLiked: source.liked ?? false,
    isFavorited: source.favorited ?? false,
    publishedAt: source.publishedAt,
    createdAt: source.createdAt || source.publishedAt || '',
    updatedAt: source.updatedAt || source.createdAt || source.publishedAt || '',
  };
}

/**
 * 文章创建/更新请求接口
 */
export interface PostCreateRequest {
  title: string;
  content: string;
  excerpt?: string;
  coverImageId?: string; // 封面图文件ID
  tags: string[];
  categoryId?: string;
  status: 'DRAFT' | 'PUBLISHED';
}

export interface PostUpdateRequest extends Partial<PostCreateRequest> {
  id: string;
}

/**
 * 文章查询参数接口
 */
export interface PostQueryParams {
  page?: number;
  size?: number;
  sort?: 'latest' | 'popular' | 'hot';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  keyword?: string;
}

/**
 * 文章 API 服务类
 */
export class PostApi {
  /**
   * 获取文章列表
   * @param params 查询参数
   * @returns 分页文章列表
   */
  async getPosts(params?: PostQueryParams): Promise<PaginatedResponse<Post>> {
    const pageResult = await httpClient.get<BackendHybridPageResult<BackendPostSummary>>('/posts', params);
    return normalizePageResponse(pageResult, normalizePost);
  }

  /**
   * 根据 ID 获取文章详情
   * @param postId 文章 ID
   * @returns 文章详情
   */
  async getPostById(postId: string): Promise<Post> {
    const post = await httpClient.get<BackendPostSummary>(`/posts/${postId}`);
    return normalizePost(post);
  }

  /**
   * 创建文章
   * @param postData 文章数据
   * @returns 创建的文章
   */
  async createPost(postData: PostCreateRequest): Promise<Post> {
    return httpClient.post<Post>('/posts', postData);
  }

  /**
   * 更新文章
   * @param postId 文章 ID
   * @param postData 更新数据
   * @returns 更新后的文章
   */
  async updatePost(postId: string, postData: Partial<PostCreateRequest>): Promise<Post> {
    return httpClient.put<Post>(`/posts/${postId}`, postData);
  }

  /**
   * 删除文章
   * @param postId 文章 ID
   */
  async deletePost(postId: string): Promise<void> {
    return httpClient.delete<void>(`/posts/${postId}`);
  }

  /**
   * 点赞文章
   * @param postId 文章 ID
   * @returns 点赞后的文章信息
   */
  async likePost(postId: string): Promise<void> {
    return httpClient.post<void>(`/posts/${postId}/like`);
  }

  /**
   * 取消点赞文章
   * @param postId 文章 ID
   * @returns 取消点赞后的文章信息
   */
  async unlikePost(postId: string): Promise<void> {
    return httpClient.delete<void>(`/posts/${postId}/like`);
  }

  /**
   * 收藏文章
   * @param postId 文章 ID
   * @returns 收藏后的文章信息
   */
  async favoritePost(postId: string): Promise<void> {
    return httpClient.post<void>(`/posts/${postId}/favorite`);
  }

  /**
   * 取消收藏文章
   * @param postId 文章 ID
   * @returns 取消收藏后的文章信息
   */
  async unfavoritePost(postId: string): Promise<void> {
    return httpClient.delete<void>(`/posts/${postId}/favorite`);
  }

  /**
   * 增加文章浏览量
   * @param postId 文章 ID
   */
  async viewPost(postId: string): Promise<void> {
    return httpClient.post<void>(`/posts/${postId}/view`);
  }

  /**
   * 获取热门文章
   * @param params 查询参数
   * @returns 热门文章列表
   */
  async getHotPosts(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>('/posts/hot', params);
  }

  /**
   * 获取推荐文章
   * @param params 查询参数
   * @returns 推荐文章列表
   */
  async getRecommendedPosts(params?: { page?: number; size?: number }): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>('/posts/recommended', params);
  }

  /**
   * 获取相关文章
   * @param postId 文章 ID
   * @param params 查询参数
   * @returns 相关文章列表
   */
  async getRelatedPosts(postId: string, params?: { size?: number }): Promise<Post[]> {
    return httpClient.get<Post[]>(`/posts/${postId}/related`, params);
  }

  /**
   * 上传文章图片
   * @param file 图片文件
   * @param onProgress 上传进度回调
   * @returns 上传结果
   */
  async uploadImage(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return httpClient.upload<UploadResponse>('/posts/images/upload', formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * 删除文章图片
   * @param imageId 图片 ID
   */
  async deleteImage(imageId: string): Promise<void> {
    return httpClient.delete<void>(`/posts/images/${imageId}`);
  }

  /**
   * 保存草稿
   * @param postData 文章数据
   * @returns 保存的草稿
   */
  async saveDraft(postData: PostCreateRequest): Promise<Post> {
    return httpClient.post<Post>('/posts/drafts', {
      ...postData,
      status: 'DRAFT',
    });
  }

  /**
   * 更新草稿
   * @param draftId 草稿 ID
   * @param postData 更新数据
   * @returns 更新后的草稿
   */
  async updateDraft(draftId: string, postData: Partial<PostCreateRequest>): Promise<Post> {
    return httpClient.put<Post>(`/posts/drafts/${draftId}`, postData);
  }

  /**
   * 删除草稿
   * @param draftId 草稿 ID
   */
  async deleteDraft(draftId: string): Promise<void> {
    return httpClient.delete<void>(`/posts/drafts/${draftId}`);
  }

  /**
   * 发布草稿
   * @param draftId 草稿 ID
   * @returns 发布后的文章
   */
  async publishDraft(draftId: string): Promise<Post> {
    return httpClient.post<Post>(`/posts/drafts/${draftId}/publish`);
  }
}

// 创建 API 实例
export const postApi = new PostApi();
