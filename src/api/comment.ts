/**
 * 评论相关 API 接口
 * 包含评论的 CRUD 操作、点赞等功能
 */

import { httpClient } from '@/utils/request';
import type { 
  Comment, 
  PaginatedResponse 
} from '@/types';

/**
 * 评论创建请求接口
 */
export interface CommentCreateRequest {
  postId: string;
  content: string;
  parentId?: string; // 回复评论的 ID
}

/**
 * 评论更新请求接口
 */
export interface CommentUpdateRequest {
  content: string;
}

/**
 * 评论查询参数接口
 */
export interface CommentQueryParams {
  postId?: string;
  parentId?: string;
  page?: number;
  size?: number;
  sort?: 'latest' | 'oldest' | 'hot';
  loadReplies?: boolean; // 是否加载回复
}

/**
 * 评论 API 服务类
 */
export class CommentApi {
  /**
   * 获取评论列表
   * @param params 查询参数
   * @returns 分页评论列表
   */
  async getComments(params: CommentQueryParams): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>('/comments', params);
  }

  /**
   * 根据文章 ID 获取评论列表
   * @param postId 文章 ID
   * @param params 查询参数
   * @returns 分页评论列表
   */
  async getCommentsByPostId(
    postId: string, 
    params?: Omit<CommentQueryParams, 'postId'>
  ): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>(`/posts/${postId}/comments`, params);
  }

  /**
   * 根据 ID 获取评论详情
   * @param commentId 评论 ID
   * @returns 评论详情
   */
  async getCommentById(commentId: string): Promise<Comment> {
    return httpClient.get<Comment>(`/comments/${commentId}`);
  }

  /**
   * 获取评论的回复列表
   * @param commentId 评论 ID
   * @param params 查询参数
   * @returns 回复列表
   */
  async getCommentReplies(
    commentId: string,
    params?: { page?: number; size?: number; sort?: 'latest' | 'oldest' }
  ): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>(`/comments/${commentId}/replies`, params);
  }

  /**
   * 创建评论
   * @param commentData 评论数据
   * @returns 创建的评论
   */
  async createComment(commentData: CommentCreateRequest): Promise<Comment> {
    return httpClient.post<Comment>('/comments', commentData);
  }

  /**
   * 更新评论
   * @param commentId 评论 ID
   * @param commentData 更新数据
   * @returns 更新后的评论
   */
  async updateComment(commentId: string, commentData: CommentUpdateRequest): Promise<Comment> {
    return httpClient.put<Comment>(`/comments/${commentId}`, commentData);
  }

  /**
   * 删除评论
   * @param commentId 评论 ID
   */
  async deleteComment(commentId: string): Promise<void> {
    return httpClient.delete<void>(`/comments/${commentId}`);
  }

  /**
   * 点赞评论
   * @param commentId 评论 ID
   * @returns 点赞后的评论信息
   */
  async likeComment(commentId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    return httpClient.post<{ isLiked: boolean; likeCount: number }>(`/comments/${commentId}/like`);
  }

  /**
   * 取消点赞评论
   * @param commentId 评论 ID
   * @returns 取消点赞后的评论信息
   */
  async unlikeComment(commentId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    return httpClient.delete<{ isLiked: boolean; likeCount: number }>(`/comments/${commentId}/like`);
  }

  /**
   * 举报评论
   * @param commentId 评论 ID
   * @param reason 举报原因
   */
  async reportComment(commentId: string, reason: string): Promise<void> {
    return httpClient.post<void>(`/comments/${commentId}/report`, { reason });
  }

  /**
   * 获取用户的评论列表
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 用户评论列表
   */
  async getUserComments(
    userId: string,
    params?: { page?: number; size?: number; sort?: 'latest' | 'oldest' }
  ): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>(`/users/${userId}/comments`, params);
  }

  /**
   * 获取热门评论
   * @param postId 文章 ID
   * @param params 查询参数
   * @returns 热门评论列表
   */
  async getHotComments(
    postId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<Comment>> {
    return httpClient.get<PaginatedResponse<Comment>>(`/posts/${postId}/comments/hot`, params);
  }

  /**
   * 批量删除评论（管理员功能）
   * @param commentIds 评论 ID 列表
   */
  async batchDeleteComments(commentIds: string[]): Promise<void> {
    return httpClient.post<void>('/comments/batch-delete', { commentIds });
  }

  /**
   * 审核评论（管理员功能）
   * @param commentId 评论 ID
   * @param status 审核状态
   */
  async moderateComment(commentId: string, status: 'APPROVED' | 'REJECTED'): Promise<void> {
    return httpClient.post<void>(`/comments/${commentId}/moderate`, { status });
  }
}

// 创建 API 实例
export const commentApi = new CommentApi();