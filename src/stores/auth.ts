/**
 * 认证状态管理 Store
 * 管理用户认证状态、Token 管理、用户信息等
 * 实现 Token 持久化和自动刷新机制
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import { tabSyncManager } from '@/utils/tabSync';
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse 
} from '@/types';

// 本地存储键名
const ACCESS_TOKEN_KEY = 'zhicore-access-token';
const REFRESH_TOKEN_KEY = 'zhicore-refresh-token';
const USER_INFO_KEY = 'zhicore-user-info';

/**
 * 认证状态接口
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginTime: number | null;
  tokenExpiresAt: number | null;
}

/**
 * Token 存储策略
 * Memory + HttpOnly Cookie 的混合策略
 */
class TokenStorage {
  private memoryTokens: {
    accessToken: string | null;
    refreshToken: string | null;
  } = {
    accessToken: null,
    refreshToken: null,
  };

  /**
   * 保存 Token 到内存和 localStorage
   * @param accessToken 访问令牌
   * @param refreshToken 刷新令牌
   * @param expiresIn 过期时间（秒）
   */
  saveTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    // 验证 token 不是空白字符串
    // Validate tokens are not just whitespace
    const trimmedAccessToken = accessToken.trim();
    const trimmedRefreshToken = refreshToken.trim();
    
    if (!trimmedAccessToken || !trimmedRefreshToken) {
      console.error('Cannot save empty or whitespace-only tokens');
      return;
    }
    
    // 保存到内存
    this.memoryTokens.accessToken = trimmedAccessToken;
    this.memoryTokens.refreshToken = trimmedRefreshToken;

    try {
      // 保存到 localStorage（仅在浏览器环境）
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACCESS_TOKEN_KEY, trimmedAccessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, trimmedRefreshToken);
        
        // 保存过期时间
        const expiresAt = Date.now() + (expiresIn * 1000);
        localStorage.setItem('zhicore-token-expires-at', expiresAt.toString());
      }
    } catch (error) {
      console.error('Failed to save tokens to localStorage:', error);
    }
  }

  /**
   * 从存储中加载 Token
   * @returns Token 信息
   */
  loadTokens(): {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
  } {
    // 优先从内存获取
    if (this.memoryTokens.accessToken && this.memoryTokens.refreshToken) {
      // 验证 token 不是空白字符串
      // Validate tokens are not just whitespace
      const accessToken = this.memoryTokens.accessToken.trim();
      const refreshToken = this.memoryTokens.refreshToken.trim();
      
      if (accessToken && refreshToken) {
        return {
          accessToken,
          refreshToken,
          expiresAt: this.getTokenExpiresAt(),
        };
      }
    }

    // 从 localStorage 获取
    try {
      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        const expiresAt = this.getTokenExpiresAt();

        // 验证 token 存在且不是空白字符串
        // Validate tokens exist and are not just whitespace
        if (accessToken && refreshToken) {
          const trimmedAccessToken = accessToken.trim();
          const trimmedRefreshToken = refreshToken.trim();
          
          if (trimmedAccessToken && trimmedRefreshToken) {
            // 同步到内存
            this.memoryTokens.accessToken = trimmedAccessToken;
            this.memoryTokens.refreshToken = trimmedRefreshToken;

            return { 
              accessToken: trimmedAccessToken, 
              refreshToken: trimmedRefreshToken, 
              expiresAt 
            };
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from localStorage:', error);
    }

    return {
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };
  }

  /**
   * 获取 Token 过期时间
   */
  private getTokenExpiresAt(): number | null {
    try {
      if (typeof window !== 'undefined') {
        const expiresAt = localStorage.getItem('zhicore-token-expires-at');
        return expiresAt ? parseInt(expiresAt, 10) : null;
      }
    } catch (error) {
      console.error('Failed to get token expires time:', error);
    }
    return null;
  }

  /**
   * 清除所有 Token
   */
  clearTokens(): void {
    // 清除内存
    this.memoryTokens.accessToken = null;
    this.memoryTokens.refreshToken = null;

    // 清除 localStorage
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem('zhicore-token-expires-at');
      }
    } catch (error) {
      console.error('Failed to clear tokens from localStorage:', error);
    }
  }

  /**
   * 检查 Token 是否即将过期
   * @param bufferMinutes 缓冲时间（分钟）
   * @returns 是否即将过期
   */
  isTokenExpiringSoon(bufferMinutes: number = 5): boolean {
    const expiresAt = this.getTokenExpiresAt();
    if (!expiresAt) return false;

    const bufferMs = bufferMinutes * 60 * 1000;
    return Date.now() + bufferMs >= expiresAt;
  }
}

// Token 存储管理器实例
const tokenStorage = new TokenStorage();

/**
 * 用户信息存储
 */
class UserStorage {
  /**
   * 保存用户信息
   * @param user 用户信息
   */
  saveUser(user: User): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Failed to save user info:', error);
    }
  }

  /**
   * 加载用户信息
   * @returns 用户信息
   */
  loadUser(): User | null {
    try {
      if (typeof window !== 'undefined') {
        const userJson = localStorage.getItem(USER_INFO_KEY);
        return userJson ? JSON.parse(userJson) : null;
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
    return null;
  }

  /**
   * 清除用户信息
   */
  clearUser(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_INFO_KEY);
      }
    } catch (error) {
      console.error('Failed to clear user info:', error);
    }
  }
}

// 用户信息存储管理器实例
const userStorage = new UserStorage();

// Module-scope singleton for global initialization tracking
// Ensures initAuth() only executes once across all component instances
let _globalInitialized = false;

export const useAuthStore = defineStore('auth', () => {
  // ========== 状态 ==========
  
  // 用户信息
  const user = ref<User | null>(null);
  
  // 访问令牌
  const accessToken = ref<string | null>(null);
  
  // 刷新令牌
  const refreshToken = ref<string | null>(null);
  
  // 加载状态
  const isLoading = ref(false);
  
  // 登录时间
  const loginTime = ref<number | null>(null);
  
  // Token 过期时间
  const tokenExpiresAt = ref<number | null>(null);
  
  // 初始化状态
  const isInitialized = ref(false);

  // ========== 计算属性 ==========
  
  /**
   * 是否已认证
   * Validates that tokens are not empty or whitespace-only
   */
  const isAuthenticated = computed(() => {
    // Validate user exists and tokens are not empty/whitespace
    if (!user.value || !accessToken.value || !refreshToken.value) {
      return false;
    }
    
    // Trim and validate tokens are not just whitespace
    const trimmedAccessToken = accessToken.value.trim();
    const trimmedRefreshToken = refreshToken.value.trim();
    
    return trimmedAccessToken.length > 0 && trimmedRefreshToken.length > 0;
  });

  /**
   * 是否为管理员
   */
  const isAdmin = computed(() => {
    return user.value?.role === 'ADMIN';
  });

  /**
   * 用户 ID
   */
  const userId = computed(() => {
    return user.value?.id || null;
  });

  /**
   * 用户名
   */
  const username = computed(() => {
    return user.value?.username || null;
  });

  /**
   * 用户昵称
   */
  const nickname = computed(() => {
    return user.value?.nickname || user.value?.username || null;
  });

  /**
   * 用户头像
   */
  const avatar = computed(() => {
    return user.value?.avatar || null;
  });

  /**
   * Token 是否即将过期
   */
  const isTokenExpiringSoon = computed(() => {
    return tokenStorage.isTokenExpiringSoon();
  });

  // ========== 方法 ==========

  /**
   * 用户登录
   * @param credentials 登录凭据
   * @returns 认证响应
   */
  async function login(credentials: LoginRequest): Promise<AuthResponse> {
    isLoading.value = true;
    
    try {
      const response = await authApi.login(credentials);
      
      // 保存认证信息
      await setAuthData(response);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 用户注册
   * @param userData 注册信息
   * @returns 认证响应
   */
  async function register(userData: RegisterRequest): Promise<AuthResponse> {
    isLoading.value = true;
    
    try {
      const response = await authApi.register(userData);
      
      // 保存认证信息
      await setAuthData(response);
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 用户登出
   */
  async function logout(): Promise<void> {
    isLoading.value = true;
    
    try {
      // 调用服务端登出接口
      if (accessToken.value) {
        await authApi.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // 即使服务端登出失败，也要清除本地状态
    } finally {
      // 清除本地认证状态
      clearAuth();
      
      // 广播登出事件到其他标签页
      tabSyncManager.broadcast('logout', {});
      
      isLoading.value = false;
    }
  }

  /**
   * 刷新访问令牌
   * @returns 新的访问令牌
   */
  async function refreshAccessToken(): Promise<string> {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authApi.refreshToken(refreshToken.value);
      
      // 更新认证信息
      await setAuthData(response);
      
      return response.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // 刷新失败，清除认证状态
      clearAuth();
      
      throw error;
    }
  }

  /**
   * 获取当前用户信息
   * @returns 用户信息
   */
  async function fetchCurrentUser(): Promise<User> {
    if (!accessToken.value) {
      throw new Error('No access token available');
    }

    isLoading.value = true;
    
    try {
      const userData = await authApi.getCurrentUser();
      
      // 更新用户信息
      user.value = userData;
      userStorage.saveUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Fetch current user failed:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 设置认证数据
   * @param authResponse 认证响应
   */
  async function setAuthData(authResponse: AuthResponse): Promise<void> {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: userData, expiresIn } = authResponse;
    
    // 更新状态
    accessToken.value = newAccessToken;
    refreshToken.value = newRefreshToken;
    user.value = userData;
    loginTime.value = Date.now();
    tokenExpiresAt.value = Date.now() + (expiresIn * 1000);
    
    // 持久化存储
    tokenStorage.saveTokens(newAccessToken, newRefreshToken, expiresIn);
    userStorage.saveUser(userData);
  }

  /**
   * 清除认证状态
   */
  function clearAuth(): void {
    // 清除状态
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    loginTime.value = null;
    tokenExpiresAt.value = null;
    
    // 清除存储
    tokenStorage.clearTokens();
    userStorage.clearUser();
  }

  /**
   * 初始化认证状态
   * 从本地存储恢复认证信息
   * Uses singleton pattern to ensure initialization only happens once
   */
  async function initAuth(): Promise<void> {
    // Check global singleton first - if already initialized globally, just sync local state
    if (_globalInitialized) {
      isInitialized.value = true;
      return;
    }
    
    // Check local initialization state
    if (isInitialized.value) {
      return;
    }
    
    // 首先清除当前状态，确保从干净的状态开始
    // First clear current state to ensure we start from a clean slate
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    loginTime.value = null;
    tokenExpiresAt.value = null;
    
    try {
      // 加载 Token
      const tokens = tokenStorage.loadTokens();
      
      // 验证 tokens 不是空字符串（loadTokens 已经做了 trim 验证）
      // Validate tokens are not empty strings (loadTokens already does trim validation)
      // loadTokens 返回 null 表示 token 无效（包括空白字符串的情况）
      // loadTokens returns null to indicate invalid tokens (including whitespace strings)
      if (tokens.accessToken && tokens.refreshToken) {
        accessToken.value = tokens.accessToken;
        refreshToken.value = tokens.refreshToken;
        tokenExpiresAt.value = tokens.expiresAt;
        
        // 加载用户信息
        const userData = userStorage.loadUser();
        if (userData) {
          user.value = userData;
        }
        
        // 检查 Token 是否过期
        if (tokens.expiresAt && Date.now() >= tokens.expiresAt) {
          // Token 已过期，尝试刷新
          try {
            await refreshAccessToken();
          } catch (error) {
            console.error('Auto refresh token failed:', error);
            clearAuth();
          }
        } else if (tokenStorage.isTokenExpiringSoon()) {
          // Token 即将过期，后台刷新
          refreshAccessToken().catch(error => {
            console.error('Background token refresh failed:', error);
          });
        }
        
        // 如果没有用户信息，尝试获取
        if (!user.value && accessToken.value) {
          try {
            await fetchCurrentUser();
          } catch (error) {
            console.error('Auto fetch user failed:', error);
            clearAuth();
          }
        }
      } else {
        // Token 无效，清除所有认证状态（包括存储）
        // Invalid tokens, clear all auth state (including storage)
        clearAuth();
      }
      
      // 设置标签页同步监听器
      setupTabSyncListeners();
      
      // Mark as initialized both locally and globally
      isInitialized.value = true;
      _globalInitialized = true;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      clearAuth();
      
      // Even on error, mark as initialized to prevent retry loops
      isInitialized.value = true;
      _globalInitialized = true;
    }
  }

  /**
   * 设置标签页同步监听器
   */
  function setupTabSyncListeners(): void {
    // 监听其他标签页的登出事件
    tabSyncManager.on('logout', () => {
      console.log('Received logout event from another tab');
      clearAuth();
      
      // 可选：重定向到登录页
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    });

    // 监听其他标签页的用户信息更新
    tabSyncManager.on('user_update', (data) => {
      console.log('Received user update from another tab:', data);
      
      if (user.value) {
        user.value = { ...user.value, ...data };
        userStorage.saveUser(user.value);
      }
    });
  }

  /**
   * 更新用户信息
   * @param userData 新的用户信息
   */
  function updateUser(userData: Partial<User>): void {
    if (user.value) {
      user.value = { ...user.value, ...userData };
      userStorage.saveUser(user.value);
      
      // 广播用户信息更新到其他标签页
      tabSyncManager.broadcast('user_update', {
        userId: user.value.id,
        ...userData
      });
    }
  }

  /**
   * 检查权限
   * @param _permission 权限名称（暂未使用）
   * @returns 是否有权限
   */
  function hasPermission(_permission: string): boolean {
    if (!user.value) return false;
    
    // 管理员拥有所有权限
    if (user.value.role === 'ADMIN') return true;
    
    // 这里可以根据实际需求扩展权限检查逻辑
    // 例如：检查用户的权限列表
    
    return false;
  }

  /**
   * 检查是否为资源所有者
   * @param resourceUserId 资源所有者 ID
   * @returns 是否为所有者
   */
  function isOwner(resourceUserId: string): boolean {
    return user.value?.id === resourceUserId;
  }

  // ========== 返回 ==========
  
  return {
    // 状态
    user,
    accessToken,
    refreshToken,
    isLoading,
    loginTime,
    tokenExpiresAt,
    
    // 计算属性
    isAuthenticated,
    isAdmin,
    userId,
    username,
    nickname,
    avatar,
    isTokenExpiringSoon,
    isInitialized: computed(() => isInitialized.value),
    
    // 方法
    login,
    register,
    logout,
    refreshAccessToken,
    fetchCurrentUser,
    initAuth,
    updateUser,
    hasPermission,
    isOwner,
  };
});
