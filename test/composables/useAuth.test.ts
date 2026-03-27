/**
 * useAuth Composable 单元测试
 * Unit tests for useAuth composable
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuth, useAuthGuard } from '@/composables/useAuth';
import { createTestPinia } from '@/test/utils';
import { useAuthStore } from '@/stores/auth';
import type { LoginRequest, RegisterRequest } from '@/types';

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
  ElMessageBox: {
    confirm: vi.fn(),
  },
}));

// Mock Vue Router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    currentRoute: {
      value: {
        fullPath: '/test',
      },
    },
  }),
}));

describe('useAuth', () => {
  beforeEach(() => {
    // 创建测试用的 Pinia 实例
    createTestPinia();
    
    // 清除所有 mock
    vi.clearAllMocks();
    
    // 清除 localStorage
    localStorage.clear();
  });

  describe('响应式状态', () => {
    it('应该正确暴露用户状态', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        nickname: 'Test User',
        avatar: '/avatar.jpg',
        role: 'USER',
      } as any;
      authStore.accessToken = 'mock-token';
      authStore.refreshToken = 'mock-refresh-token'; // isAuthenticated requires both tokens

      const { user, isAuthenticated, username, nickname } = useAuth();

      expect(user.value).toEqual(authStore.user);
      expect(isAuthenticated.value).toBe(true);
      expect(username.value).toBe('testuser');
      expect(nickname.value).toBe('Test User');
    });

    it('应该正确识别管理员用户', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
      } as any;

      const { isAdmin } = useAuth();

      expect(isAdmin.value).toBe(true);
    });

    it('应该正确识别普通用户', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'user',
        role: 'USER',
      } as any;

      const { isAdmin } = useAuth();

      expect(isAdmin.value).toBe(false);
    });
  });

  describe('登录功能', () => {
    it('应该成功登录', async () => {
      const authStore = useAuthStore();
      authStore.login = vi.fn().mockResolvedValue(undefined);

      const { login } = useAuth();
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await login(credentials, { silent: true });

      expect(result).toBe(true);
      expect(authStore.login).toHaveBeenCalledWith(credentials);
    });

    it('应该处理登录失败', async () => {
      const authStore = useAuthStore();
      authStore.login = vi.fn().mockRejectedValue(new Error('Invalid credentials'));

      const { login } = useAuth();
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const result = await login(credentials, { silent: true });

      expect(result).toBe(false);
    });

    it('应该在登录成功后重定向', async () => {
      const authStore = useAuthStore();
      authStore.login = vi.fn().mockResolvedValue(undefined);

      const { login } = useAuth();
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(credentials, { 
        silent: true, 
        redirectTo: '/dashboard' 
      });

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('注册功能', () => {
    it('应该成功注册', async () => {
      const authStore = useAuthStore();
      authStore.register = vi.fn().mockResolvedValue(undefined);

      const { register } = useAuth();
      const userData: RegisterRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const result = await register(userData, { silent: true });

      expect(result).toBe(true);
      expect(authStore.register).toHaveBeenCalledWith(userData);
    });

    it('应该处理注册失败', async () => {
      const authStore = useAuthStore();
      authStore.register = vi.fn().mockRejectedValue(new Error('Username already exists'));

      const { register } = useAuth();
      const userData: RegisterRequest = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      const result = await register(userData, { silent: true });

      expect(result).toBe(false);
    });
  });

  describe('登出功能', () => {
    it('应该成功登出', async () => {
      const authStore = useAuthStore();
      authStore.logout = vi.fn().mockResolvedValue(undefined);

      const { logout } = useAuth();

      const result = await logout({ silent: true });

      expect(result).toBe(true);
      expect(authStore.logout).toHaveBeenCalled();
    });

    it('应该在登出后重定向到登录页', async () => {
      const authStore = useAuthStore();
      authStore.logout = vi.fn().mockResolvedValue(undefined);

      const { logout } = useAuth();

      await logout({ silent: true, redirectTo: '/auth/login' });

      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  describe('权限检查', () => {
    it('应该正确检查资源所有者', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '123',
        username: 'testuser',
      } as any;

      const { isOwner } = useAuth();

      expect(isOwner('123')).toBe(true);
      expect(isOwner('456')).toBe(false);
    });

    it('应该允许管理员访问所有资源', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
      } as any;
      authStore.accessToken = 'mock-token';
      authStore.refreshToken = 'mock-refresh-token';

      const { canAccess } = useAuth();

      expect(canAccess('999')).toBe(true);
    });

    it('应该允许资源所有者访问', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '123',
        username: 'testuser',
        role: 'USER',
      } as any;
      authStore.accessToken = 'mock-token';
      authStore.refreshToken = 'mock-refresh-token';

      const { canAccess } = useAuth();

      expect(canAccess('123')).toBe(true);
      expect(canAccess('456')).toBe(false);
    });

    it('应该拒绝未认证用户访问', () => {
      const authStore = useAuthStore();
      authStore.user = null;

      const { canAccess } = useAuth();

      expect(canAccess('123')).toBe(false);
    });
  });

  describe('工具方法', () => {
    it('应该返回正确的显示名称', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'testuser',
        nickname: 'Test User',
      } as any;

      const { getDisplayName } = useAuth();

      expect(getDisplayName()).toBe('Test User');
    });

    it('应该在没有昵称时返回用户名', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'testuser',
      } as any;

      const { getDisplayName } = useAuth();

      expect(getDisplayName()).toBe('testuser');
    });

    it('应该返回正确的头像 URL', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'testuser',
        avatar: '/avatar.jpg',
      } as any;

      const { getAvatarUrl } = useAuth();

      expect(getAvatarUrl('small')).toBe('/avatar.jpg?w=64&h=64');
      expect(getAvatarUrl('medium')).toBe('/avatar.jpg?w=128&h=128');
      expect(getAvatarUrl('large')).toBe('/avatar.jpg?w=256&h=256');
    });
  });
});

describe('useAuthGuard', () => {
  beforeEach(() => {
    createTestPinia();
    vi.clearAllMocks();
  });

  describe('认证守卫', () => {
    it('应该允许已认证用户通过', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'testuser',
      } as any;
      authStore.accessToken = 'mock-token';
      authStore.refreshToken = 'mock-refresh-token';

      const { authGuard } = useAuthGuard();

      expect(authGuard()).toBe(true);
    });

    it('应该阻止未认证用户并重定向', () => {
      const authStore = useAuthStore();
      authStore.user = null;

      const { authGuard } = useAuthGuard();

      expect(authGuard()).toBe(false);
      expect(mockPush).toHaveBeenCalled();
    });
  });

  describe('管理员守卫', () => {
    it('应该允许管理员通过', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'admin',
        role: 'ADMIN',
      } as any;
      authStore.accessToken = 'mock-token';
      authStore.refreshToken = 'mock-refresh-token';

      const { adminGuard } = useAuthGuard();

      expect(adminGuard()).toBe(true);
    });

    it('应该阻止普通用户', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'user',
        role: 'USER',
      } as any;

      const { adminGuard } = useAuthGuard();

      expect(adminGuard()).toBe(false);
    });
  });

  describe('访客守卫', () => {
    it('应该允许未认证用户通过', () => {
      const authStore = useAuthStore();
      authStore.user = null;

      const { guestGuard } = useAuthGuard();

      expect(guestGuard()).toBe(true);
    });

    it('应该阻止已认证用户并重定向', () => {
      const authStore = useAuthStore();
      authStore.user = {
        id: '1',
        username: 'testuser',
      } as any;
      authStore.accessToken = 'mock-token';
      authStore.refreshToken = 'mock-refresh-token';

      const { guestGuard } = useAuthGuard();

      expect(guestGuard()).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
