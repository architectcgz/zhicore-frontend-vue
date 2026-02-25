/**
 * 用户相关组合式函数
 * 提供用户信息管理、关注关系、签到等功能
 */

import { ref, computed } from 'vue';
import { userApi, type UserUpdateRequest } from '@/api/user';
import { uploadApi } from '@/api/upload';
import type { User, Post, PaginatedResponse } from '@/types';
import type { CheckInInfo, CheckInStats, MonthlyCheckIn } from '@/api/user';
import { getErrorMessage } from '@/types/errors';
import { ElMessage } from 'element-plus';

/**
 * 用户组合式函数
 */
export function useUser() {
  // 响应式状态
  const userProfile = ref<User | null>(null);
  const loading = ref(false);
  const error = ref('');
  const followLoading = ref(false);
  const isFollowing = ref(false);

  /**
   * 获取用户资料
   */
  const fetchUserProfile = async (userId: string) => {
    loading.value = true;
    error.value = '';

    try {
      userProfile.value = await userApi.getUserById(userId);
      // TODO: 检查是否已关注该用户
      isFollowing.value = false;
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || '加载用户信息失败';
      console.error('获取用户资料失败:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 关注用户
   */
  const followUser = async (userId: string) => {
    followLoading.value = true;

    try {
      const result = await userApi.followUser(userId);
      isFollowing.value = result.isFollowing;
      
      // 更新用户资料中的粉丝数
      if (userProfile.value) {
        userProfile.value.followersCount = result.followersCount;
      }
    } catch (err: unknown) {
      console.error('关注用户失败:', err);
      throw err;
    } finally {
      followLoading.value = false;
    }
  };

  /**
   * 取消关注用户
   */
  const unfollowUser = async (userId: string) => {
    followLoading.value = true;

    try {
      const result = await userApi.unfollowUser(userId);
      isFollowing.value = result.isFollowing;
      
      // 更新用户资料中的粉丝数
      if (userProfile.value) {
        userProfile.value.followersCount = result.followersCount;
      }
    } catch (err: unknown) {
      console.error('取消关注用户失败:', err);
      throw err;
    } finally {
      followLoading.value = false;
    }
  };

  /**
   * 获取用户文章列表
   */
  const getUserPosts = async (
    userId: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<Post>> => {
    return await userApi.getUserPosts(userId, { page, size });
  };

  /**
   * 获取用户收藏列表
   */
  const getUserFavorites = async (
    userId: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<Post>> => {
    return await userApi.getUserFavorites(userId, { page, size });
  };

  /**
   * 获取用户关注列表
   */
  const getUserFollowing = async (
    userId: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<User>> => {
    return await userApi.getUserFollowing(userId, { page, size });
  };

  /**
   * 获取用户粉丝列表
   */
  const getUserFollowers = async (
    userId: string,
    page: number = 1,
    size: number = 20
  ): Promise<PaginatedResponse<User>> => {
    return await userApi.getUserFollowers(userId, { page, size });
  };

  /**
   * 更新用户资料
   */
  const updateUserProfile = async (userId: string, userData: UserUpdateRequest): Promise<User> => {
    loading.value = true;
    error.value = '';

    try {
      const updatedUser = await userApi.updateUser(userId, userData);
      userProfile.value = updatedUser;
      ElMessage.success('资料更新成功');
      return updatedUser;
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || '更新资料失败';
      ElMessage.error(error.value);
      console.error('更新用户资料失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 上传用户头像
   */
  const uploadAvatar = async (file: File): Promise<{ url: string; fileId: string }> => {
    loading.value = true;
    error.value = '';

    try {
      // 上传到 zhicore-upload 服务
      const uploadResult = await uploadApi.uploadImage(file);
      
      ElMessage.success('头像上传成功');
      
      return {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || '头像上传失败';
      ElMessage.error(error.value);
      console.error('上传头像失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 修改密码
   */
  const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<void> => {
    loading.value = true;
    error.value = '';

    try {
      await userApi.changePassword(userId, oldPassword, newPassword);
      ElMessage.success('密码修改成功');
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || '修改密码失败';
      ElMessage.error(error.value);
      console.error('修改密码失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    userProfile,
    loading,
    error,
    followLoading,
    isFollowing,
    fetchUserProfile,
    followUser,
    unfollowUser,
    getUserPosts,
    getUserFavorites,
    getUserFollowing,
    getUserFollowers,
    updateUserProfile,
    uploadAvatar,
    changePassword,
  };
}

/**
 * 用户签到组合式函数
 * 提供签到相关功能
 */
export function useCheckIn() {
  // 响应式状态
  const checkInInfo = ref<CheckInInfo | null>(null);
  const checkInStats = ref<CheckInStats | null>(null);
  const monthlyCheckIn = ref<MonthlyCheckIn | null>(null);
  const loading = ref(false);
  const error = ref('');

  /**
   * 执行签到
   */
  const performCheckIn = async (userId: string): Promise<CheckInInfo> => {
    loading.value = true;
    error.value = '';

    try {
      const result = await userApi.checkIn(userId);
      checkInInfo.value = result;
      return result;
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || '签到失败';
      console.error('签到失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取签到统计
   */
  const fetchCheckInStats = async (userId: string) => {
    loading.value = true;
    error.value = '';

    try {
      checkInStats.value = await userApi.getCheckInStats(userId);
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || '获取签到统计失败';
      console.error('获取签到统计失败:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取月度签到记录
   */
  const fetchMonthlyCheckIn = async (userId: string, year: number, month: number) => {
    loading.value = true;
    error.value = '';

    try {
      monthlyCheckIn.value = await userApi.getMonthlyCheckIn(userId, year, month);
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || '获取月度签到记录失败';
      console.error('获取月度签到记录失败:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 检查今天是否已签到
   */
  const isCheckedInToday = computed(() => {
    return checkInInfo.value?.isCheckedIn ?? false;
  });

  /**
   * 获取连续签到天数
   */
  const consecutiveDays = computed(() => {
    return checkInStats.value?.consecutiveDays ?? 0;
  });

  /**
   * 获取总签到天数
   */
  const totalDays = computed(() => {
    return checkInStats.value?.totalDays ?? 0;
  });

  return {
    checkInInfo,
    checkInStats,
    monthlyCheckIn,
    loading,
    error,
    isCheckedInToday,
    consecutiveDays,
    totalDays,
    performCheckIn,
    fetchCheckInStats,
    fetchMonthlyCheckIn,
  };
}
