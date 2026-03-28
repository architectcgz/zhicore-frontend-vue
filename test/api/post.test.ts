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

import { normalizePostReadingPresence, postApi } from '@/api/post';

describe('post api presence adapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes presence payload and fills avatar defaults', () => {
    expect(
      normalizePostReadingPresence({
        readingCount: 4,
        avatars: [
          {
            userId: '2001',
            nickname: '读者一',
            avatarUrl: 'https://cdn.example/avatar-1.png',
          },
          {
            userId: '2002',
          },
        ],
      })
    ).toEqual({
      readingCount: 4,
      avatars: [
        {
          userId: '2001',
          nickname: '读者一',
          avatarUrl: 'https://cdn.example/avatar-1.png',
        },
        {
          userId: '2002',
          nickname: '已登录用户',
          avatarUrl: null,
        },
      ],
    });
  });

  it('registers reader session through the expected endpoint', async () => {
    httpClient.post.mockResolvedValue({
      readingCount: 3,
      avatars: [],
    });

    const result = await postApi.registerPostReadingSession('1001', 'session-1');

    expect(httpClient.post).toHaveBeenCalledWith('/posts/1001/readers/session', {
      sessionId: 'session-1',
    });
    expect(result).toEqual({
      readingCount: 3,
      avatars: [],
    });
  });

  it('queries and leaves reader presence through dedicated endpoints', async () => {
    httpClient.get.mockResolvedValue({
      readingCount: 1,
      avatars: [],
    });
    httpClient.post.mockResolvedValue(undefined);

    const result = await postApi.getPostReadingPresence('1002');
    await postApi.leavePostReadingSession('1002', 'session-2');

    expect(httpClient.get).toHaveBeenCalledWith('/posts/1002/readers/presence');
    expect(httpClient.post).toHaveBeenCalledWith('/posts/1002/readers/session/leave', {
      sessionId: 'session-2',
    });
    expect(result).toEqual({
      readingCount: 1,
      avatars: [],
    });
  });
});
