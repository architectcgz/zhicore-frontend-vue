/**
 * TanStack Query 查询缓存集成测试（当前缓存策略）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';
import { usePostQuery, usePostsQuery } from '@/queries/posts';
import { useCommentsQuery } from '@/queries/comments';
import type { Post, Comment, PaginatedResponse } from '@/types';

vi.mock('@/api/post');
vi.mock('@/api/comment');

const mockPost: Post = {
  id: 'post-1',
  title: '测试文章',
  content: '测试内容',
  summary: '测试摘要',
  coverImage: null,
  author: {
    id: 'user-1',
    username: 'testuser',
    nickname: '测试用户',
    avatar: null,
    email: 'test@example.com',
    bio: null,
    role: 'USER',
    followersCount: 0,
    followingCount: 0,
    postsCount: 1,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  tags: [],
  viewCount: 100,
  likeCount: 10,
  favoriteCount: 5,
  commentCount: 0,
  isLiked: false,
  isFavorited: false,
  status: 'PUBLISHED',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  publishedAt: '2024-01-01T00:00:00Z',
};

const mockComments: PaginatedResponse<Comment> = {
  items: [],
  total: 0,
  page: 0,
  size: 10,
  hasMore: false,
};

describe('TanStack Query 查询缓存集成测试', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    queryClient.clear();
    vi.useRealTimers();
  });

  it('相同文章详情查询键会复用缓存', async () => {
    vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);

    const TestComponent = defineComponent({
      setup() {
        const { data } = usePostQuery('post-1');
        return () => h('div', { class: 'title' }, data.value?.title ?? 'No Data');
      },
    });

    const wrapper1 = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();
    expect(wrapper1.find('.title').text()).toBe('测试文章');
    expect(postApi.getPostById).toHaveBeenCalledTimes(1);

    const wrapper2 = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();
    expect(wrapper2.find('.title').text()).toBe('测试文章');
    expect(postApi.getPostById).toHaveBeenCalledTimes(1);
  });

  it('不同文章列表参数会命中不同缓存键', async () => {
    vi.mocked(postApi.getPosts)
      .mockResolvedValueOnce({
        items: [{ ...mockPost, id: 'post-1', title: '第一页' }],
        total: 1,
        page: 0,
        size: 10,
        hasMore: false,
      })
      .mockResolvedValueOnce({
        items: [{ ...mockPost, id: 'post-2', title: '第二页' }],
        total: 1,
        page: 1,
        size: 10,
        hasMore: false,
      });

    const ListA = defineComponent({
      setup() {
        const { data } = usePostsQuery({ page: 0, size: 10, sort: 'latest' });
        return () => h('div', { class: 'title-a' }, data.value?.items[0]?.title ?? 'No Data');
      },
    });

    const ListB = defineComponent({
      setup() {
        const { data } = usePostsQuery({ page: 1, size: 10, sort: 'latest' });
        return () => h('div', { class: 'title-b' }, data.value?.items[0]?.title ?? 'No Data');
      },
    });

    const wrapperA = mount(ListA, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();

    const wrapperB = mount(ListB, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();

    expect(wrapperA.find('.title-a').text()).toBe('第一页');
    expect(wrapperB.find('.title-b').text()).toBe('第二页');
    expect(postApi.getPosts).toHaveBeenCalledTimes(2);
  });

  it('相同评论查询键会复用缓存', async () => {
    vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockComments);

    const TestComponent = defineComponent({
      setup() {
        const { data } = useCommentsQuery('post-1');
        return () => h('div', { class: 'count' }, data.value?.items.length ?? 0);
      },
    });

    const wrapper1 = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();
    expect(wrapper1.find('.count').text()).toBe('0');
    expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1);

    const wrapper2 = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();
    expect(wrapper2.find('.count').text()).toBe('0');
    expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1);
  });

  it('评论查询超过 1 分钟 staleTime 后会重新请求', async () => {
    vi.mocked(commentApi.getCommentsByPostId)
      .mockResolvedValueOnce(mockComments)
      .mockResolvedValueOnce({
        ...mockComments,
        items: [
          {
            id: 'comment-1',
            postId: 'post-1',
            userId: 'user-1',
            user: {
              id: 'user-1',
              username: 'testuser',
              nickname: '测试用户',
              avatar: null,
              email: 'test@example.com',
              bio: null,
              role: 'USER',
              followersCount: 0,
              followingCount: 0,
              postsCount: 1,
              createdAt: '2024-01-01T00:00:00Z',
              updatedAt: '2024-01-01T00:00:00Z',
            },
            content: '新评论',
            parentId: undefined,
            parent: undefined,
            replies: [],
            repliesCount: 0,
            hasMore: false,
            likeCount: 0,
            isLiked: false,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      });

    const TestComponent = defineComponent({
      setup() {
        const { data } = useCommentsQuery('post-1');
        return () => h('div', { class: 'count' }, data.value?.items.length ?? 0);
      },
    });

    const wrapper1 = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();
    expect(wrapper1.find('.count').text()).toBe('0');
    expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(61 * 1000);
    const wrapper2 = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });
    await flushPromises();

    expect(wrapper2.find('.count').text()).toBe('1');
    expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(2);
  });
});
