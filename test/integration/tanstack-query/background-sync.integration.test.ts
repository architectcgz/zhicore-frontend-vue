/**
 * TanStack Query 后台同步集成测试（当前缓存策略）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, VueQueryPlugin, focusManager, onlineManager } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { postApi } from '@/api/post';
import { usePostQuery, usePostsQuery } from '@/queries/posts';
import type { Post, PaginatedResponse } from '@/types';

vi.mock('@/api/post');

const mockPost: Post = {
  id: 'post-1',
  title: '原标题',
  content: '内容',
  summary: '摘要',
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

const mockList: PaginatedResponse<Post> = {
  items: [mockPost],
  total: 1,
  page: 0,
  size: 10,
  hasMore: false,
};

describe('TanStack Query 后台同步集成测试', () => {
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
    focusManager.setFocused(true);
    onlineManager.setOnline(true);
  });

  afterEach(() => {
    queryClient.clear();
    vi.useRealTimers();
  });

  it('窗口焦点变化时，fresh 查询不会重复请求', async () => {
    vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);

    const TestComponent = defineComponent({
      setup() {
        const { data } = usePostQuery('post-1');
        return () => h('div', { class: 'title' }, data.value?.title ?? 'No Data');
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(wrapper.find('.title').text()).toBe('原标题');
    expect(postApi.getPostById).toHaveBeenCalledTimes(1);

    focusManager.setFocused(false);
    focusManager.setFocused(true);
    await flushPromises();

    expect(postApi.getPostById).toHaveBeenCalledTimes(1);
  });

  it('网络重连时，fresh 查询不会重复请求', async () => {
    vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);

    const TestComponent = defineComponent({
      setup() {
        const { data } = usePostQuery('post-1');
        return () => h('div', { class: 'title' }, data.value?.title ?? 'No Data');
      },
    });

    mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(postApi.getPostById).toHaveBeenCalledTimes(1);

    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    await flushPromises();

    expect(postApi.getPostById).toHaveBeenCalledTimes(1);
  });

  it('焦点变化时，详情查询保持稳定，列表查询可按策略刷新', async () => {
    vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);
    vi.mocked(postApi.getPosts).mockResolvedValue(mockList);

    const TestComponent = defineComponent({
      setup() {
        const postQuery = usePostQuery('post-1');
        const listQuery = usePostsQuery({ page: 0, size: 10, sort: 'latest' });
        return () =>
          h('div', [
            h('div', { class: 'post-title' }, postQuery.data.value?.title ?? 'No Data'),
            h('div', { class: 'list-count' }, listQuery.data.value?.items.length ?? 0),
          ]);
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(wrapper.find('.post-title').text()).toBe('原标题');
    expect(wrapper.find('.list-count').text()).toBe('1');
    expect(postApi.getPostById).toHaveBeenCalledTimes(1);
    expect(postApi.getPosts).toHaveBeenCalledTimes(1);

    focusManager.setFocused(false);
    focusManager.setFocused(true);
    await flushPromises();

    expect(postApi.getPostById).toHaveBeenCalledTimes(1);
    expect(postApi.getPosts).toHaveBeenCalledTimes(2);
  });
});
