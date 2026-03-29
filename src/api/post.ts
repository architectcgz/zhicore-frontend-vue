/**
 * 文章相关 API 接口
 * 包含文章的 CRUD 操作、点赞、收藏等功能
 */

import { httpClient } from '@/utils/request';
import { normalizePageResponse, type BackendHybridPageResult } from '@/api/contracts';
import type { 
  User,
  Post, 
  PostReadingPresence,
  PaginatedResponse, 
  UploadResponse 
} from '@/types';

interface BackendPostSummary {
  id: string;
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  author?: {
    id?: string | number;
    userName?: string;
    username?: string;
    nickname?: string;
    avatarId?: string | null;
    avatarUrl?: string | null;
    role?: string;
    roles?: string[];
  };
  title: string;
  raw?: string;
  html?: string;
  excerpt?: string;
  coverImage?: string;
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
  tags?: Array<{
    id?: string | number;
    name?: string;
    slug?: string;
    description?: string;
    postCount?: number;
  }>;
  categoryId?: string | number;
  categoryName?: string;
  categorySlug?: string;
  categoryDescription?: string;
}

interface BackendPostReadingPresence {
  readingCount?: number;
  avatars?: Array<{
    userId?: string;
    nickname?: string;
    avatarUrl?: string | null;
  }>;
}

export function normalizeUserSummary(source: {
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string;
  id?: string | number;
  userName?: string;
  username?: string;
  nickname?: string;
  avatarId?: string | null;
  avatarUrl?: string | null;
  role?: string;
  roles?: string[];
}): User {
  const nickname = source.nickname || source.ownerName || source.userName || source.username || '匿名用户';
  const isAdmin = source.role === 'ADMIN' || source.roles?.includes('ADMIN');

  return {
    id: String(source.ownerId ?? source.id ?? ''),
    username: source.username || source.userName || nickname,
    email: '',
    nickname,
    avatar: source.ownerAvatar || source.avatarUrl || source.avatarId || '',
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
  if (source.author) {
    return normalizeUserSummary({
      id: source.author.id,
      userName: source.author.userName,
      username: source.author.username,
      nickname: source.author.nickname,
      avatarId: source.author.avatarId,
      avatarUrl: source.author.avatarUrl,
      role: source.author.role,
      roles: source.author.roles,
    });
  }

  const nickname = source.ownerName || '匿名用户';

  return normalizeUserSummary({
    ownerId: source.ownerId,
    ownerName: nickname,
    ownerAvatar: source.ownerAvatar,
  });
}

function normalizeTagSummary(source: NonNullable<BackendPostSummary['tags']>[number]) {
  const tagId = String(source.id ?? '');
  const tagName = source.name?.trim() || '未命名标签';

  return {
    id: tagId,
    name: tagName,
    slug: source.slug?.trim() || tagId,
    description: source.description?.trim() || '',
    postCount: source.postCount ?? 0,
    createdAt: '',
    updatedAt: '',
  };
}

function normalizeCategorySummary(source: BackendPostSummary) {
  const categoryId = String(source.categoryId ?? '');
  const categoryName = source.categoryName?.trim() || '未命名分类';

  return {
    id: categoryId,
    name: categoryName,
    slug: source.categorySlug?.trim() || categoryId,
    description: source.categoryDescription?.trim() || '',
    postCount: 0,
    createdAt: '',
    updatedAt: '',
  };
}

export function normalizePost(source: BackendPostSummary): Post {
  return {
    id: String(source.id),
    title: source.title,
    content: source.raw || source.excerpt || '',
    rawContent: source.raw,
    htmlContent: source.html,
    excerpt: source.excerpt || '',
    summary: source.excerpt || '',
    coverImage: source.coverImageUrl || source.coverImage,
    authorId: String(source.ownerId ?? ''),
    author: normalizeAuthor(source),
    tags: (source.tags ?? []).map(normalizeTagSummary),
    categoryId: source.categoryId ? String(source.categoryId) : undefined,
    category: source.categoryId ? normalizeCategorySummary(source) : undefined,
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

export function normalizePostReadingPresence(
  source?: BackendPostReadingPresence | null
): PostReadingPresence {
  return {
    readingCount: source?.readingCount ?? 0,
    avatars: (source?.avatars ?? []).map((item) => ({
      userId: String(item.userId ?? ''),
      nickname: item.nickname || '已登录用户',
      avatarUrl: item.avatarUrl || null,
    })),
  };
}

/**
 * 文章创建/更新请求接口
 */
export interface PostCreateRequest {
  title: string;
  content: string;
  excerpt?: string;
  summary?: string;
  coverImage?: string;
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
  cursor?: string;
  size?: number;
  sort?: 'latest' | 'popular' | 'hot';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  tagIds?: string[];
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}

/**
 * 文章 API 服务类
 */
export class PostApi {
  private normalizePostQueryParams(params?: PostQueryParams): PostQueryParams | undefined {
    if (!params) {
      return undefined;
    }

    const normalizedParams: PostQueryParams = { ...params };
    const isLatestSort = normalizedParams.sort === 'latest';

    if (isLatestSort) {
      delete normalizedParams.page;
    } else {
      delete normalizedParams.cursor;
    }

    if (!normalizedParams.cursor) {
      delete normalizedParams.cursor;
    }

    return normalizedParams;
  }

  /**
   * 获取文章列表
   * @param params 查询参数
   * @returns 分页文章列表
   */
  async getPosts(params?: PostQueryParams): Promise<PaginatedResponse<Post>> {
    const queryParams = this.normalizePostQueryParams(params);
    const pageResult = await httpClient.get<BackendHybridPageResult<BackendPostSummary>>('/posts', queryParams);
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

  async registerPostReadingSession(postId: string, sessionId: string): Promise<PostReadingPresence> {
    const presence = await httpClient.post<BackendPostReadingPresence>(`/posts/${postId}/readers/session`, {
      sessionId,
    });
    return normalizePostReadingPresence(presence);
  }

  async leavePostReadingSession(postId: string, sessionId: string): Promise<void> {
    await httpClient.post<void>(`/posts/${postId}/readers/session/leave`, {
      sessionId,
    });
  }

  async getPostReadingPresence(postId: string): Promise<PostReadingPresence> {
    const presence = await httpClient.get<BackendPostReadingPresence>(`/posts/${postId}/readers/presence`);
    return normalizePostReadingPresence(presence);
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
  async likePost(postId: string): Promise<Post> {
    return httpClient.post<Post>(`/posts/${postId}/like`);
  }

  /**
   * 取消点赞文章
   * @param postId 文章 ID
   * @returns 取消点赞后的文章信息
   */
  async unlikePost(postId: string): Promise<Post> {
    return httpClient.delete<Post>(`/posts/${postId}/like`);
  }

  /**
   * 收藏文章
   * @param postId 文章 ID
   * @returns 收藏后的文章信息
   */
  async favoritePost(postId: string): Promise<Post> {
    return httpClient.post<Post>(`/posts/${postId}/favorite`);
  }

  /**
   * 取消收藏文章
   * @param postId 文章 ID
   * @returns 取消收藏后的文章信息
   */
  async unfavoritePost(postId: string): Promise<Post> {
    return httpClient.delete<Post>(`/posts/${postId}/favorite`);
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
