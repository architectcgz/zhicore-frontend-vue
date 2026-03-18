/**
 * 用户相关 API 接口
 * 包含用户信息管理、关注关系、头像上传等功能
 */

import { httpClient } from '@/utils/request';
import type {
  User,
  Post,
  PaginatedResponse,
  UploadResponse
} from '@/types';

interface BackendUserVO {
  id: number | string;
  userName?: string;
  nickName?: string;
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
}

export interface PublicUserSummary {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  bio: string;
  followersCount: number;
}

function normalizePublicUserSummary(source: BackendUserVO): PublicUserSummary {
  const nickname = source.nickName || source.userName || '匿名用户';

  return {
    id: String(source.id),
    username: source.userName || nickname,
    nickname,
    avatar: source.avatarUrl || '',
    bio: source.bio || '',
    followersCount: source.followersCount ?? 0,
  };
}

/**
 * 用户信息更新请求接口
 */
export interface UserUpdateRequest {
  nickname?: string;
  bio?: string;
  avatarId?: string; // 头像文件ID
  email?: string;
}

/**
 * 用户查询参数接口
 */
export interface UserQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  sort?: 'latest' | 'popular' | 'followers';
}

/**
 * 用户统计信息接口
 */
export interface UserStats {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  likesCount: number;
  favoritesCount: number;
  viewsCount: number;
}

/**
 * 签到信息接口
 */
export interface CheckInInfo {
  isCheckedIn: boolean;
  consecutiveDays: number;
  totalDays: number;
  todayReward: number;
  nextReward: number;
}

/**
 * 签到统计接口
 */
export interface CheckInStats {
  consecutiveDays: number;
  totalDays: number;
  currentMonthDays: number;
  longestStreak: number;
}

/**
 * 月度签到记录接口
 */
export interface MonthlyCheckIn {
  year: number;
  month: number;
  checkedDays: number[];
  totalDays: number;
}

/**
 * 用户 API 服务类
 */
export class UserApi {
  async getPublicUserSummary(userId: string): Promise<PublicUserSummary> {
    const user = await httpClient.get<BackendUserVO>(`/users/${userId}`);
    return normalizePublicUserSummary(user);
  }

  /**
   * 根据 ID 获取用户信息
   * @param userId 用户 ID
   * @returns 用户信息
   */
  async getUserById(userId: string): Promise<User> {
    return httpClient.get<User>(`/users/${userId}`);
  }

  /**
   * 更新用户信息
   * @param userId 用户 ID
   * @param userData 更新数据
   * @returns 更新后的用户信息
   */
  async updateUser(userId: string, userData: UserUpdateRequest): Promise<User> {
    return httpClient.put<User>(`/users/${userId}`, userData);
  }

  /**
   * 上传用户头像
   * @param userId 用户 ID
   * @param file 头像文件
   * @param onProgress 上传进度回调
   * @returns 上传结果
   */
  async uploadAvatar(
    userId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('avatar', file);

    return httpClient.upload<UploadResponse>(`/users/${userId}/avatar`, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  }

  /**
   * 修改密码
   * @param userId 用户 ID
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    return httpClient.post<void>(`/users/${userId}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  /**
   * 关注用户
   * @param userId 要关注的用户 ID
   * @returns 关注状态
   */
  async followUser(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    return httpClient.post<{ isFollowing: boolean; followersCount: number }>(`/users/${userId}/follow`);
  }

  /**
   * 取消关注用户
   * @param userId 要取消关注的用户 ID
   * @returns 关注状态
   */
  async unfollowUser(userId: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    return httpClient.delete<{ isFollowing: boolean; followersCount: number }>(`/users/${userId}/follow`);
  }

  /**
   * 获取用户的文章列表
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 用户文章列表
   */
  async getUserPosts(
    userId: string,
    params?: { page?: number; size?: number; status?: 'PUBLISHED' | 'DRAFT' }
  ): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>(`/users/${userId}/posts`, params);
  }

  /**
   * 获取用户的收藏列表
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 用户收藏列表
   */
  async getUserFavorites(
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>(`/users/${userId}/favorites`, params);
  }

  /**
   * 获取用户的关注列表
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 关注用户列表
   */
  async getUserFollowing(
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>(`/users/${userId}/following`, params);
  }

  /**
   * 获取用户的粉丝列表
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 粉丝用户列表
   */
  async getUserFollowers(
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>(`/users/${userId}/followers`, params);
  }

  /**
   * 获取用户的草稿列表
   * @param userId 用户 ID
   * @param params 查询参数
   * @returns 草稿列表
   */
  async getUserDrafts(
    userId: string,
    params?: { page?: number; size?: number }
  ): Promise<PaginatedResponse<Post>> {
    return httpClient.get<PaginatedResponse<Post>>(`/users/${userId}/drafts`, params);
  }

  /**
   * 获取用户统计信息
   * @param userId 用户 ID
   * @returns 用户统计信息
   */
  async getUserStats(userId: string): Promise<UserStats> {
    return httpClient.get<UserStats>(`/users/${userId}/stats`);
  }

  /**
   * 搜索用户
   * @param params 搜索参数
   * @returns 用户搜索结果
   */
  async searchUsers(params: UserQueryParams): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>('/users/search', params);
  }

  /**
   * 获取推荐用户
   * @param params 查询参数
   * @returns 推荐用户列表
   */
  async getRecommendedUsers(params?: { size?: number }): Promise<User[]> {
    return httpClient.get<User[]>('/users/recommended', params);
  }

  /**
   * 获取热门用户
   * @param params 查询参数
   * @returns 热门用户列表
   */
  async getPopularUsers(params?: { page?: number; size?: number }): Promise<PaginatedResponse<User>> {
    return httpClient.get<PaginatedResponse<User>>('/users/popular', params);
  }

  /**
   * 检查用户名是否可用
   * @param username 用户名
   * @returns 是否可用
   */
  async checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
    return httpClient.get<{ available: boolean }>('/users/check-username', { username });
  }

  /**
   * 检查邮箱是否可用
   * @param email 邮箱
   * @returns 是否可用
   */
  async checkEmailAvailability(email: string): Promise<{ available: boolean }> {
    return httpClient.get<{ available: boolean }>('/users/check-email', { email });
  }

  /**
   * 用户签到
   * @param userId 用户 ID
   * @returns 签到信息
   */
  async checkIn(userId: string): Promise<CheckInInfo> {
    return httpClient.post<CheckInInfo>(`/users/${userId}/check-in`);
  }

  /**
   * 获取签到统计
   * @param userId 用户 ID
   * @returns 签到统计信息
   */
  async getCheckInStats(userId: string): Promise<CheckInStats> {
    return httpClient.get<CheckInStats>(`/users/${userId}/check-in/stats`);
  }

  /**
   * 获取月度签到记录
   * @param userId 用户 ID
   * @param year 年份
   * @param month 月份
   * @returns 月度签到记录
   */
  async getMonthlyCheckIn(userId: string, year: number, month: number): Promise<MonthlyCheckIn> {
    return httpClient.get<MonthlyCheckIn>(`/users/${userId}/check-in/monthly`, { year, month });
  }

  /**
   * 注销账户
   * @param userId 用户 ID
   * @param password 确认密码
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    return httpClient.post<void>(`/users/${userId}/delete-account`, { password });
  }
}

// 创建 API 实例
export const userApi = new UserApi();
