/**
 * TanStack Query 查询缓存集成测试
 * Integration tests for TanStack Query cache behavior
 * 
 * 测试需求 (Requirements):
 * - 3.7: 文章缓存 5 分钟
 * - 3.8: 文章列表缓存 2 分钟
 * - 5.5: 评论缓存 1 分钟
 * - 5.6: 相同查询返回缓存数据
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';
import { usePostQuery, usePostsQuery } from '@/queries/posts';
import { useCommentsQuery } from '@/queries/comments';
import { useAuthStore } from '@/stores/auth';
import type { Post, Comment, PaginatedResponse } from '@/types';

// Mock APIs
vi.mock('@/api/post');
vi.mock('@/api/comment');

describe('TanStack Query 查询缓存集成测试', () => {
  let queryClient: QueryClient;
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    // 创建 Pinia 实例
    pinia = createPinia();
    setActivePinia(pinia);
    
    // 设置认证用户
    const authStore = useAuthStore();
    authStore.user = {
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
    };
    
    // 为每个测试创建新的 QueryClient
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // 测试中禁用重试
          gcTime: 10 * 60 * 1000, // 10 minutes
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('文章查询缓存 (Post Query Cache)', () => {
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
      commentCount: 3,
      isLiked: false,
      isFavorited: false,
      status: 'PUBLISHED',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      publishedAt: '2024-01-01T00:00:00Z',
    };

    it('应该缓存文章查询结果 (Requirement 3.7)', async () => {
      // Mock API 返回
      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);

      // 创建测试组件
      const TestComponent = defineComponent({
        setup() {
          const { data, isLoading, isFetching } = usePostQuery('post-1');
          return () => h('div', [
            h('div', { class: 'loading' }, isLoading.value ? 'Loading' : 'Loaded'),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
            h('div', { class: 'title' }, data.value?.title || ''),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      // 等待初始加载
      await flushPromises();
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);
      expect(wrapper.find('.title').text()).toBe('测试文章');

      // 卸载并重新挂载组件
      wrapper.unmount();
      
      const wrapper2 = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      // 应该立即从缓存返回数据，不触发新的 API 调用
      await flushPromises();
      expect(postApi.getPostById).toHaveBeenCalledTimes(1); // 仍然是 1 次
      expect(wrapper2.find('.title').text()).toBe('测试文章');
      expect(wrapper2.find('.loading').text()).toBe('Loaded');
    });

    it('应该在 staleTime 过期后重新请求 (Requirement 3.7)', async () => {
      // Mock API 返回
      const updatedPost = { ...mockPost, title: '更新后的文章' };
      vi.mocked(postApi.getPostById)
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(updatedPost);

      // 创建带有短 staleTime 的 QueryClient
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 100, // 100ms staleTime for testing
            gcTime: 10 * 60 * 1000,
          },
        },
      });

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          return () => h('div', { class: 'title' }, data.value?.title || '');
        },
      });

      // 第一次挂载
      const wrapper1 = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: testQueryClient }]],
        },
      });

      await flushPromises();
      expect(wrapper1.find('.title').text()).toBe('测试文章');
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      wrapper1.unmount();

      // 等待 staleTime 过期
      await new Promise(resolve => setTimeout(resolve, 150));

      // 第二次挂载 - 应该触发新的请求
      const wrapper2 = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: testQueryClient }]],
        },
      });

      await flushPromises();
      expect(postApi.getPostById).toHaveBeenCalledTimes(2);
      expect(wrapper2.find('.title').text()).toBe('更新后的文章');

      testQueryClient.clear();
    });
  });

  describe('文章列表查询缓存 (Posts List Query Cache)', () => {
    const mockPostsResponse: PaginatedResponse<Post> = {
      items: [
        {
          id: 'post-1',
          title: '文章1',
          content: '内容1',
          summary: '摘要1',
          coverImage: null,
          author: {
            id: 'user-1',
            username: 'user1',
            nickname: '用户1',
            avatar: null,
            email: 'user1@example.com',
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
          commentCount: 3,
          isLiked: false,
          isFavorited: false,
          status: 'PUBLISHED',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          publishedAt: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      size: 10,
      hasMore: false,
    };

    it('应该缓存文章列表查询结果 (Requirement 3.8)', async () => {
      vi.mocked(postApi.getPosts).mockResolvedValue(mockPostsResponse);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = usePostsQuery({ page: 1, size: 10 });
          return () => h('div', [
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
            h('div', { class: 'count' }, data.value?.items.length || 0),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPosts).toHaveBeenCalledTimes(1);
      expect(wrapper.find('.count').text()).toBe('1');

      // 重新挂载
      wrapper.unmount();
      const wrapper2 = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPosts).toHaveBeenCalledTimes(1); // 仍然是 1 次
      expect(wrapper2.find('.count').text()).toBe('1');
    });

    it('应该为不同的查询参数创建不同的缓存 (Requirement 5.6)', async () => {
      const page1Response = { ...mockPostsResponse, page: 1 };
      const page2Response = { ...mockPostsResponse, page: 2 };

      vi.mocked(postApi.getPosts)
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response);

      const TestComponent = defineComponent({
        props: ['page'],
        setup(props) {
          const { data } = usePostsQuery({ page: props.page, size: 10 });
          return () => h('div', { class: 'page' }, data.value?.page || 0);
        },
      });

      // 查询第 1 页
      const wrapper1 = mount(TestComponent, {
        props: { page: 1 },
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPosts).toHaveBeenCalledTimes(1);
      expect(wrapper1.find('.page').text()).toBe('1');

      // 查询第 2 页 - 应该触发新的请求
      const wrapper2 = mount(TestComponent, {
        props: { page: 2 },
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPosts).toHaveBeenCalledTimes(2);
      expect(wrapper2.find('.page').text()).toBe('2');

      // 再次查询第 1 页 - 应该从缓存返回
      wrapper1.unmount();
      const wrapper3 = mount(TestComponent, {
        props: { page: 1 },
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPosts).toHaveBeenCalledTimes(2); // 仍然是 2 次
      expect(wrapper3.find('.page').text()).toBe('1');
    });
  });

  describe('评论查询缓存 (Comments Query Cache)', () => {
    const mockCommentsResponse: PaginatedResponse<Comment> = {
      items: [
        {
          id: 'comment-1',
          postId: 'post-1',
          userId: 'user-1',
          user: {
            id: 'user-1',
            username: 'user1',
            nickname: '用户1',
            avatar: null,
            email: 'user1@example.com',
            bio: null,
            role: 'USER',
            followersCount: 0,
            followingCount: 0,
            postsCount: 1,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          content: '测试评论',
          parentId: undefined,
          parent: undefined,
          replies: [],
          repliesCount: 0,
          hasMore: false,
          likeCount: 5,
          isLiked: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      size: 10,
      hasMore: false,
    };

    it('应该缓存评论查询结果 (Requirement 5.5)', async () => {
      vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockCommentsResponse);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = useCommentsQuery('post-1');
          return () => h('div', [
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
            h('div', { class: 'count' }, data.value?.items.length || 0),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1);
      expect(wrapper.find('.count').text()).toBe('1');

      // 重新挂载
      wrapper.unmount();
      const wrapper2 = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1); // 仍然是 1 次
      expect(wrapper2.find('.count').text()).toBe('1');
    });

    it('应该在 staleTime 过期后重新请求评论 (Requirement 5.5)', async () => {
      const updatedResponse = {
        ...mockCommentsResponse,
        items: [
          ...mockCommentsResponse.items,
          {
            ...mockCommentsResponse.items[0],
            id: 'comment-2',
            content: '新评论',
          },
        ],
        total: 2,
      };

      vi.mocked(commentApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockCommentsResponse)
        .mockResolvedValueOnce(updatedResponse);

      // 创建带有短 staleTime 的 QueryClient
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 100, // 100ms for testing
            gcTime: 10 * 60 * 1000,
          },
        },
      });

      const TestComponent = defineComponent({
        setup() {
          const { data } = useCommentsQuery('post-1');
          return () => h('div', { class: 'count' }, data.value?.items.length || 0);
        },
      });

      // 第一次挂载
      const wrapper1 = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: testQueryClient }]],
        },
      });

      await flushPromises();
      expect(wrapper1.find('.count').text()).toBe('1');
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1);

      wrapper1.unmount();

      // 等待 staleTime 过期
      await new Promise(resolve => setTimeout(resolve, 150));

      // 第二次挂载 - 应该触发新的请求
      const wrapper2 = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: testQueryClient }]],
        },
      });

      await flushPromises();
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(2);
      expect(wrapper2.find('.count').text()).toBe('2');

      testQueryClient.clear();
    });
  });

  describe('相同查询返回缓存数据 (Same Query Returns Cached Data)', () => {
    it('应该为相同的查询键返回相同的缓存数据 (Requirement 5.6)', async () => {
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
        commentCount: 3,
        isLiked: false,
        isFavorited: false,
        status: 'PUBLISHED',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        publishedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);

      const TestComponent1 = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          return () => h('div', { class: 'title' }, data.value?.title || '');
        },
      });

      const TestComponent2 = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          return () => h('div', { class: 'title' }, data.value?.title || '');
        },
      });

      // 挂载第一个组件
      const wrapper1 = mount(TestComponent1, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);
      expect(wrapper1.find('.title').text()).toBe('测试文章');

      // 挂载第二个组件 - 应该使用相同的缓存
      const wrapper2 = mount(TestComponent2, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPostById).toHaveBeenCalledTimes(1); // 仍然是 1 次
      expect(wrapper2.find('.title').text()).toBe('测试文章');

      // 两个组件应该共享相同的数据
      expect(wrapper1.find('.title').text()).toBe(wrapper2.find('.title').text());
    });
  });
});
