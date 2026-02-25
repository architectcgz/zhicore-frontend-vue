/**
 * 认证相关 API 接口
 * 包含登录、注册、登出、Token 刷新等功能
 */

import { httpClient } from '@/utils/request';
import type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User 
} from '@/types';

/**
 * 认证 API 服务类
 */
export class AuthApi {
  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 认证响应信息
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/login', credentials, {
      skipAuth: true, // 登录请求不需要认证
    });
  }

  /**
   * 用户注册
   * @param userData 注册信息
   * @returns 认证响应信息
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/register', userData, {
      skipAuth: true, // 注册请求不需要认证
    });
  }

  /**
   * 用户登出
   * 清除服务端 Token 状态
   */
  async logout(): Promise<void> {
    return httpClient.post<void>('/auth/logout');
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的认证响应信息
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    }, {
      skipAuth: true, // 刷新 Token 请求不需要认证
    });
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async getCurrentUser(): Promise<User> {
    return httpClient.get<User>('/auth/me');
  }

  /**
   * 验证邮箱
   * @param token 验证令牌
   */
  async verifyEmail(token: string): Promise<void> {
    return httpClient.post<void>('/auth/verify-email', { token }, {
      skipAuth: true,
    });
  }

  /**
   * 发送密码重置邮件
   * @param email 邮箱地址
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    return httpClient.post<void>('/auth/forgot-password', { email }, {
      skipAuth: true,
    });
  }

  /**
   * 重置密码
   * @param token 重置令牌
   * @param newPassword 新密码
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    return httpClient.post<void>('/auth/reset-password', {
      token,
      newPassword,
    }, {
      skipAuth: true,
    });
  }

  /**
   * 修改密码
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    return httpClient.post<void>('/auth/change-password', {
      oldPassword,
      newPassword,
    });
  }
}

// 创建 API 实例
export const authApi = new AuthApi();