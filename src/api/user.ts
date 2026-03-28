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

type BackendUser = Partial<User> & {
  id?: string | number | null;
  userName?: string | null;
  nickName?: string | null;
  avatarUrl?: string | null;
  roles?: string[] | null;
  followersCount?: number | string | null;
  followingCount?: number | string | null;
  postsCount?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function toCount(value: number | string | null | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeUser(user: BackendUser): User {
  const username = user.username ?? user.userName ?? '';
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const hasAdminRole = roles.some(role => {
    const normalizedRole = String(role).replace(/^ROLE_/, '').toUpperCase();
    return normalizedRole === 'ADMIN';
  });
  const createdAt = user.createdAt ?? '';

  return {
    id: user.id != null ? String(user.id) : '',
    username,
    email: user.email ?? '',
    nickname: user.nickname ?? user.nickName ?? username,
    avatar: user.avatar ?? user.avatarUrl ?? null,
    bio: user.bio ?? null,
    role: user.role ?? (hasAdminRole ? 'ADMIN' : 'USER'),
    followersCount: toCount(user.followersCount),
    followingCount: toCount(user.followingCount),
    postsCount: toCount(user.postsCount),
    createdAt,
    updatedAt: user.updatedAt ?? createdAt,
  };
}

/**
 * 用户信息更新请求接口
 */
export interface UserUpdateRequest {
  nickname?: string;
  bio?: string;
  avatarId?: string; // 头像文件ID
  coverImageId?: string; // 封面图片文件ID
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
  /**
   * 根据 ID 获取用户信息
   * @param userId 用户 ID
   * @returns 用户信息
   */
  async getUserById(userId: string): Promise<User> {
    const user = await httpClient.get<BackendUser>(`/users/${userId}`);
    return normalizeUser(user);
  }

  /**
   * 更新用户信息
   * @param userId 用户 ID
   * @param userData 更新数据
   * @returns 更新后的用户信息
   */
  async updateUser(userId: string, userData: UserUpdateRequest): Promise<User> {
    const user = await httpClient.put<BackendUser>(`/users/${userId}`, userData);
    return normalizeUser(user);
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
