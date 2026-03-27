import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestPinia } from '@/test/utils';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/api/auth';

vi.mock('@/api/auth', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('@/utils/tabSync', () => ({
  tabSyncManager: {
    broadcast: vi.fn(),
    on: vi.fn(() => () => {}),
  },
}));

describe('认证 Store 集成测试', () => {
  beforeEach(() => {
    createTestPinia();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('登录响应只有 token 时也应该补抓当前用户并进入已登录态', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      expiresIn: 7200,
    } as any);

    vi.mocked(authApi.getCurrentUser).mockResolvedValue({
      id: '161313324569460737',
      userName: 'fullchain_admin',
      email: 'fullchain_1774155584_admin@example.com',
      nickName: 'fullchain_admin',
      avatarUrl: null,
      bio: null,
      roles: ['ADMIN', 'USER'],
      followersCount: 0,
      followingCount: 0,
      createdAt: '2026-03-23T00:00:00Z',
    } as any);

    const authStore = useAuthStore();

    await authStore.login({
      email: 'fullchain_1774155584_admin@example.com',
      password: 'Test123456!',
    });

    expect(authApi.getCurrentUser).toHaveBeenCalledOnce();
    expect(authStore.user?.email).toBe('fullchain_1774155584_admin@example.com');
    expect(authStore.user?.username).toBe('fullchain_admin');
    expect(authStore.user?.nickname).toBe('fullchain_admin');
    expect(authStore.isAdmin).toBe(true);
    expect(authStore.isAuthenticated).toBe(true);
  });
});
