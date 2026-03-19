import { describe, expect, it } from 'vitest';
import {
  buildApproximateRankingPage,
  buildPostRankingItem,
  mapPostScoresToRankingItems,
  type BackendRankingScoreDTO,
} from '@/api/ranking';
import type { Post } from '@/types';

const createPost = (overrides: Partial<Post> = {}): Post => ({
  id: '160300433435271168',
  title: 'API联调文章A',
  content: 'content',
  excerpt: 'excerpt',
  authorId: '160300433431076865',
  author: {
    id: '160300433431076865',
    username: 'seed-user',
    email: '',
    nickname: 'seed-user',
    avatar: '',
    bio: '',
    role: 'USER',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
    updatedAt: '',
  },
  tags: [],
  status: 'PUBLISHED',
  viewCount: 10,
  likeCount: 2,
  commentCount: 3,
  favoriteCount: 1,
  isLiked: false,
  isFavorited: false,
  createdAt: '2026-03-19T16:17:23',
  updatedAt: '2026-03-19T16:17:23',
  ...overrides,
});

describe('ranking api adapters', () => {
  it('builds a post ranking item from score and post data', () => {
    const post = createPost();
    const score: BackendRankingScoreDTO = {
      entityId: '160300433435271168',
      score: 40,
      rank: 1,
    };

    const item = buildPostRankingItem(post, score);

    expect(item.id).toBe('160300433435271168');
    expect(item.post.id).toBe('160300433435271168');
    expect(item.score).toBe(40);
    expect(item.rank).toBe(1);
    expect(item.metrics).toEqual({
      views: 10,
      likes: 2,
      comments: 3,
      shares: 0,
      favorites: 1,
    });
  });

  it('filters stale ranking ids while preserving score order', () => {
    const scores: BackendRankingScoreDTO[] = [
      { entityId: '160300433435271168', score: 40, rank: 1 },
      { entityId: '9701', score: 15, rank: 2 },
      { entityId: '160300433435271172', score: 5, rank: 3 },
    ];
    const posts = [
      createPost(),
      createPost({
        id: '160300433435271172',
        title: 'API联调文章B',
      }),
    ];

    const items = mapPostScoresToRankingItems(scores, posts);

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.id)).toEqual([
      '160300433435271168',
      '160300433435271172',
    ]);
    expect(items.map((item) => item.rank)).toEqual([1, 3]);
  });

  it('builds a pagination shape for score-based ranking endpoints without totals', () => {
    const page = buildApproximateRankingPage(
      [createPost()],
      {
        page: 2,
        size: 20,
        startIndex: 20,
        endIndex: 40,
        requestCount: 41,
      },
      true
    );

    expect(page).toEqual({
      items: [createPost()],
      total: 41,
      page: 2,
      size: 20,
      hasMore: true,
    });
  });
});
