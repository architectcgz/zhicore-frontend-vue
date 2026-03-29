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

  it('normalizes published user posts page responses', async () => {
    httpClient.get.mockResolvedValue({
      page: 1,
      size: 20,
      total: 1,
      pages: 1,
      hasMore: false,
      items: [
        {
          id: '163265472681213990',
          ownerId: '163265472681213977',
          title: '用户文章',
          excerpt: '文章摘要',
          coverImage: 'https://cdn.example.com/post-cover.png',
          status: 'PUBLISHED',
          publishedAt: '2026-03-29T10:00:00Z',
          createdAt: '2026-03-29T09:30:00Z',
          updatedAt: '2026-03-29T10:10:00Z',
          likeCount: 8,
          commentCount: 2,
          favoriteCount: 3,
          viewCount: 66,
          liked: false,
          favorited: true,
          author: {
            id: '163265472681213977',
            userName: 'author_name',
            nickname: '作者昵称',
            avatarId: 'avatar-file-id',
          },
          tags: [
            {
              id: '1',
              name: 'Vue',
              slug: 'vue',
            },
          ],
        },
      ],
    });

    const result = await userApi.getUserPosts('163265472681213977', { page: 1, size: 20 });

    expect(httpClient.get).toHaveBeenCalledWith('/users/163265472681213977/posts', { page: 1, size: 20 });
    expect(result).toEqual({
      items: [
        {
          id: '163265472681213990',
          title: '用户文章',
          content: '文章摘要',
          rawContent: undefined,
          htmlContent: undefined,
          excerpt: '文章摘要',
          summary: '文章摘要',
          coverImage: 'https://cdn.example.com/post-cover.png',
          authorId: '163265472681213977',
          author: {
            id: '163265472681213977',
            username: 'author_name',
            email: '',
            nickname: '作者昵称',
            avatar: 'avatar-file-id',
            bio: '',
            role: 'USER',
            followersCount: 0,
            followingCount: 0,
            postsCount: 0,
            createdAt: '',
            updatedAt: '',
          },
          tags: [
            {
              id: '1',
              name: 'Vue',
              slug: 'vue',
              description: '',
              postCount: 0,
              createdAt: '',
              updatedAt: '',
            },
          ],
          categoryId: undefined,
          category: undefined,
          status: 'PUBLISHED',
          viewCount: 66,
          likeCount: 8,
          commentCount: 2,
          favoriteCount: 3,
          isLiked: false,
          isFavorited: true,
          publishedAt: '2026-03-29T10:00:00Z',
          createdAt: '2026-03-29T09:30:00Z',
          updatedAt: '2026-03-29T10:10:00Z',
        },
      ],
      total: 1,
      page: 1,
      size: 20,
      hasMore: false,
      totalPages: 1,
      cursor: null,
    });
  });
});
