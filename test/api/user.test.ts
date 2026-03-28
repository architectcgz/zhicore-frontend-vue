import { beforeEach, describe, expect, it, vi } from 'vitest';

const { httpClient } = vi.hoisted(() => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
  },
}));

vi.mock('@/utils/request', () => ({
  httpClient,
}));

import { userApi } from '@/api/user';

describe('user api adapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes backend user aliases for profile detail responses', async () => {
    httpClient.get.mockResolvedValue({
      id: '163265472681213981',
      userName: 'notif_1774619246349754398',
      nickName: 'notif_1774619246349754398',
      email: 'notif_1774619246349754398@example.com',
      avatarUrl: null,
      bio: null,
      roles: ['USER'],
      followersCount: 1,
      followingCount: 0,
      createdAt: '2026-03-27T05:47:26.464084Z',
    });

    const result = await userApi.getUserById('163265472681213981');

    expect(result).toEqual({
      id: '163265472681213981',
      username: 'notif_1774619246349754398',
      email: 'notif_1774619246349754398@example.com',
      nickname: 'notif_1774619246349754398',
      avatar: null,
      bio: null,
      role: 'USER',
      followersCount: 1,
      followingCount: 0,
      postsCount: 0,
      createdAt: '2026-03-27T05:47:26.464084Z',
      updatedAt: '2026-03-27T05:47:26.464084Z',
    });
  });
});
