/**
 * 认证相关的组合式函数
 * 封装认证逻辑，提供便捷的认证状态管理和操作方法
 */

import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { LoginRequest, RegisterRequest, User } from '@/types';
import { getErrorMessage } from '@/utils/errorHandler';

/**
 * 认证组合式函数
 * @returns 认证相关的状态和方法
 */
export function useAuth() {
  // 获取认证 Store
  const authStore = useAuthStore();
  const router = useRouter();

  // ========== 响应式状态 ==========

  /**
   * 当前用户信息
   */
  const user = computed<User | null>(() => authStore.user);

  /**
   * 是否已认证
   */
  const isAuthenticated = computed<boolean>(() => authStore.isAuthenticated);

  /**
   * 是否为管理员
   */
  const isAdmin = computed<boolean>(() => authStore.isAdmin);

  /**
   * 用户 ID
   */
  const userId = computed<string | null>(() => authStore.userId);

  /**
   * 用户名
   */
  const username = computed<string | null>(() => authStore.username);

  /**
   * 用户昵称
   */
  const nickname = computed<string | null>(() => authStore.nickname);

  /**
   * 用户头像
   */
  const avatar = computed<string | null>(() => authStore.avatar);

  /**
   * 是否正在加载
   */
  const isLoading = computed<boolean>(() => authStore.isLoading);

  /**
   * 访问令牌
   */
  const accessToken = computed<string | null>(() => authStore.accessToken);

  /**
   * Token 是否即将过期
   */
  const isTokenExpiringSoon = computed<boolean>(() => authStore.isTokenExpiringSoon);

  /**
   * 是否已初始化
   */
  const isInitialized = computed<boolean>(() => authStore.isInitialized);

  // ========== 认证操作方法 ==========

  /**
   * 用户登录
   * @param credentials 登录凭据
   * @param options 登录选项
   * @returns Promise<boolean> 登录是否成功
   */
  async function login(
    credentials: LoginRequest,
    options: {
      showSuccessMessage?: boolean;
      redirectTo?: string;
      silent?: boolean;
    } = {}
  ): Promise<boolean> {
    const { showSuccessMessage = true, redirectTo, silent = false } = options;

    try {
      await authStore.login(credentials);

      if (showSuccessMessage && !silent) {
        ElMessage.success('登录成功！');
      }

      // 重定向处理
      if (redirectTo) {
        await router.push(redirectTo);
      }

      return true;
    } catch (error: unknown) {
      if (!silent) {
        const errorMessage = getErrorMessage(error, '登录失败，请检查用户名和密码');
        ElMessage.error(errorMessage);
      }
      
      console.error('Login failed:', error);
      return false;
    }
  }

  /**
   * 用户注册
   * @param userData 注册信息
   * @param options 注册选项
   * @returns Promise<boolean> 注册是否成功
   */
  async function register(
    userData: RegisterRequest,
    options: {
      showSuccessMessage?: boolean;
      redirectTo?: string;
      silent?: boolean;
    } = {}
  ): Promise<boolean> {
    const { showSuccessMessage = true, redirectTo, silent = false } = options;

    try {
      await authStore.register(userData);

      if (showSuccessMessage && !silent) {
        ElMessage.success('注册成功！欢迎加入我们！');
      }

      // 重定向处理
      if (redirectTo) {
        await router.push(redirectTo);
      }

      return true;
    } catch (error: unknown) {
      if (!silent) {
        const errorMessage = getErrorMessage(error, '注册失败，请稍后重试');
        ElMessage.error(errorMessage);
      }
      
      console.error('Registration failed:', error);
      return false;
    }
  }

  /**
   * 用户登出
   * @param options 登出选项
   * @returns Promise<boolean> 登出是否成功
   */
  async function logout(
    options: {
      showConfirmDialog?: boolean;
      showSuccessMessage?: boolean;
      redirectTo?: string;
      silent?: boolean;
    } = {}
  ): Promise<boolean> {
    const { 
      showConfirmDialog = false, 
      showSuccessMessage = true, 
      redirectTo = '/auth/login',
      silent = false 
    } = options;

    try {
      // 显示确认对话框
      if (showConfirmDialog && !silent) {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '确认退出',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        );
      }

      await authStore.logout();

      if (showSuccessMessage && !silent) {
        ElMessage.success('已退出登录');
      }

      // 重定向处理
      if (redirectTo) {
        await router.push(redirectTo);
      }

      return true;
    } catch (error: unknown) {
      // 处理取消操作 - ElMessageBox 会以 'cancel' 或 'close' 拒绝
      const errorStr = String(error);
      if (errorStr === 'cancel' || errorStr === 'close') {
        return false;
      }

      if (!silent) {
        const errorMessage = getErrorMessage(error, '退出登录失败');
        ElMessage.error(errorMessage);
      }
      
      console.error('Logout failed:', error);
      return false;
    }
  }

  /**
   * 刷新用户信息
   * @param silent 是否静默刷新（默认为 true）
   * @returns Promise<boolean> 刷新是否成功
   */
  async function refreshUser(silent: boolean = true): Promise<boolean> {
    try {
      await authStore.fetchCurrentUser();
      
      if (!silent) {
        ElMessage.success('用户信息已更新');
      }
      
      return true;
    } catch (error: unknown) {
      if (!silent) {
        const errorMessage = getErrorMessage(error, '获取用户信息失败');
        ElMessage.error(errorMessage);
      }
      
      console.error('Refresh user failed:', error);
      return false;
    }
  }

  /**
   * 更新用户信息
   * @param userData 用户信息
   * @param silent 是否静默更新
   */
  function updateUser(userData: Partial<User>, silent: boolean = false): void {
    authStore.updateUser(userData);
    
    if (!silent) {
      ElMessage.success('用户信息已更新');
    }
  }

  // ========== 权限检查方法 ==========

  /**
   * 检查用户权限
   * @param permission 权限名称
   * @returns 是否有权限
   */
  function hasPermission(permission: string): boolean {
    return authStore.hasPermission(permission);
  }

  /**
   * 检查是否为资源所有者
   * @param resourceUserId 资源所有者 ID
   * @returns 是否为所有者
   */
  function isOwner(resourceUserId: string): boolean {
    return authStore.isOwner(resourceUserId);
  }

  /**
   * 检查是否可以访问资源
   * @param resourceUserId 资源所有者 ID
   * @param requiredPermission 所需权限
   * @returns 是否可以访问
   */
  function canAccess(resourceUserId?: string, requiredPermission?: string): boolean {
    // 未认证用户无权限
    if (!isAuthenticated.value) {
      return false;
    }

    // 管理员拥有所有权限
    if (isAdmin.value) {
      return true;
    }

    // 检查是否为资源所有者
    if (resourceUserId && isOwner(resourceUserId)) {
      return true;
    }

    // 检查特定权限
    if (requiredPermission && hasPermission(requiredPermission)) {
      return true;
    }

    return false;
  }

  // ========== 认证状态监听 ==========

  /**
   * 监听认证状态变化
   * @param callback 回调函数
   * @returns 停止监听的函数
   */
  function watchAuthState(callback: (isAuthenticated: boolean, user: User | null) => void) {
    return watch(
      [isAuthenticated, user],
      ([newIsAuthenticated, newUser]) => {
        callback(newIsAuthenticated, newUser);
      },
      { immediate: true }
    );
  }

  // ========== 初始化方法 ==========

  /**
   * 初始化认证状态
   * 从本地存储恢复认证信息
   */
  async function initAuth(): Promise<void> {
    try {
      await authStore.initAuth();
    } catch (error) {
      console.error('Auth initialization failed:', error);
    }
  }

  // ========== Token 管理 ==========

  /**
   * 手动刷新访问令牌
   * @param silent 是否静默刷新
   * @returns Promise<boolean> 刷新是否成功
   */
  async function refreshToken(silent: boolean = true): Promise<boolean> {
    try {
      await authStore.refreshAccessToken();
      
      if (!silent) {
        ElMessage.success('Token 已刷新');
      }
      
      return true;
    } catch (error: unknown) {
      if (!silent) {
        const errorMessage = getErrorMessage(error, 'Token 刷新失败');
        ElMessage.error(errorMessage);
      }
      
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // ========== 工具方法 ==========

  /**
   * 要求用户登录
   * 如果用户未登录，重定向到登录页面
   * @param redirectTo 登录后重定向的页面
   * @returns Promise<void>
   */
  async function requireAuth(redirectTo?: string): Promise<void> {
    if (!isAuthenticated.value) {
      const currentPath = redirectTo || router.currentRoute.value.fullPath;
      await router.push({
        path: '/auth/login',
        query: { redirect: currentPath },
      });
    }
  }

  /**
   * 要求管理员权限
   * 如果用户不是管理员，显示错误信息并重定向
   * @returns Promise<void>
   */
  async function requireAdmin(): Promise<void> {
    if (!isAuthenticated.value) {
      await requireAuth();
      return;
    }

    if (!isAdmin.value) {
      ElMessage.error('需要管理员权限');
      await router.push('/');
    }
  }

  /**
   * 获取用户显示名称
   * @returns 用户显示名称
   */
  function getDisplayName(): string {
    return nickname.value || username.value || '未知用户';
  }

  /**
   * 获取用户头像 URL
   * @param size 头像尺寸
   * @returns 头像 URL
   */
  function getAvatarUrl(size: 'small' | 'medium' | 'large' = 'medium'): string {
    const baseUrl = avatar.value;
    
    if (!baseUrl) {
      // 返回默认头像
      return '/images/default-avatar.svg';
    }

    // 如果是完整 URL，直接返回
    if (baseUrl.startsWith('http')) {
      return baseUrl;
    }

    // 根据尺寸返回不同大小的头像
    const sizeMap = {
      small: 'w=64&h=64',
      medium: 'w=128&h=128',
      large: 'w=256&h=256',
    };

    // 检查 URL 是否已包含查询参数
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${sizeMap[size]}`;
  }

  // ========== 返回值 ==========

  return {
    // 响应式状态
    user,
    isAuthenticated,
    isAdmin,
    userId,
    username,
    nickname,
    avatar,
    isLoading,
    accessToken,
    isTokenExpiringSoon,
    isInitialized,

    // 认证操作方法
    login,
    register,
    logout,
    refreshUser,
    updateUser,

    // 权限检查方法
    hasPermission,
    isOwner,
    canAccess,

    // 认证状态监听
    watchAuthState,

    // 初始化方法
    initAuth,

    // Token 管理
    refreshToken,

    // 工具方法
    requireAuth,
    requireAdmin,
    getDisplayName,
    getAvatarUrl,
  };
}

/**
 * 认证守卫组合式函数
 * 用于路由守卫和组件守卫
 */
export function useAuthGuard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter(); // Single router instance at top level

  /**
   * 认证守卫
   * @param redirectTo 重定向路径
   * @returns 是否通过守卫
   */
  function authGuard(redirectTo?: string): boolean {
    if (!isAuthenticated.value) {
      const currentPath = redirectTo || router.currentRoute.value.fullPath;
      router.push({
        path: '/auth/login',
        query: { redirect: currentPath },
      });
      return false;
    }
    return true;
  }

  /**
   * 管理员守卫
   * @returns 是否通过守卫
   */
  function adminGuard(): boolean {
    if (!isAuthenticated.value) {
      router.push({
        path: '/auth/login',
        query: { redirect: router.currentRoute.value.fullPath },
      });
      return false;
    }

    if (!isAdmin.value) {
      ElMessage.error('需要管理员权限');
      router.push('/');
      return false;
    }

    return true;
  }

  /**
   * 访客守卫（仅未登录用户可访问）
   * @param redirectTo 重定向路径
   * @returns 是否通过守卫
   */
  function guestGuard(redirectTo: string = '/'): boolean {
    if (isAuthenticated.value) {
      router.push(redirectTo); // Use router from parent scope
      return false;
    }
    return true;
  }

  return {
    authGuard,
    adminGuard,
    guestGuard,
  };
}
