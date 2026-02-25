/**
 * TanStack Query 后台同步集成测试
 * Integration tests for TanStack Query background synchronization
 * 
 * 测试需求 (Requirements):
 * - 8.1: 窗口焦点刷新
 * - 8.2: 网络重连刷新
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, VueQueryPlugin, focusManager, onlineManager } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { postApi } from '@/api/post';
import { usePostQuery, usePostsQuery } from '@/queries/posts';
import { useAuthStore } from '@/stores/auth';
import type { Post, PaginatedResponse } from '@/types';

// Mock APIs
vi.mock('@/api/post');

describe('TanStack Query 后台同步集成测试', () => {
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
    
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0, // 立即过期，便于测试刷新行为
          gcTime: 10 * 60 * 1000,
          refetchOnWindowFocus: true,
          refetchOnReconnect: true,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('窗口焦点刷新 (Window Focus Refetch)', () => {
    const mockPost: Post = {
      id: 'post-1',
      title: '原标题',
      content: '原内容',
      summary: '原摘要',
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

    it('应该在窗口重新获得焦点时刷新过期查询 (Requirement 8.1)', async () => {
      const updatedPost = { ...mockPost, title: '更新后的标题', viewCount: 150 };

      vi.mocked(postApi.getPostById)
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(updatedPost);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = usePostQuery('post-1');
          return () => h('div', [
            h('div', { class: 'title' }, data.value?.title || ''),
            h('div', { class: 'view-count' }, data.value?.viewCount || 0),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.title').text()).toBe('原标题');
      expect(wrapper.find('.view-count').text()).toBe('100');
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      // 模拟窗口失去焦点
      focusManager.setFocused(false);
      await wrapper.vm.$nextTick();

      // 模拟窗口重新获得焦点
      focusManager.setFocused(true);
      await flushPromises();

      // 应该触发重新获取
      expect(postApi.getPostById).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.title').text()).toBe('更新后的标题');
      expect(wrapper.find('.view-count').text()).toBe('150');
    });

    it('应该在窗口焦点切换时显示加载状态 (Requirement 8.1)', async () => {
      const updatedPost = { ...mockPost, title: '更新后的标题' };

      vi.mocked(postApi.getPostById)
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(updatedPost);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = usePostQuery('post-1');
          return () => h('div', [
            h('div', { class: 'title' }, data.value?.title || ''),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.fetching').text()).toBe('Not Fetching');

      // 模拟窗口失去焦点然后重新获得焦点
      focusManager.setFocused(false);
      focusManager.setFocused(true);

      // 应该显示正在获取状态
      await wrapper.vm.$nextTick();
      
      await flushPromises();
      expect(wrapper.find('.fetching').text()).toBe('Not Fetching');
      expect(wrapper.find('.title').text()).toBe('更新后的标题');
    });

    it('应该为多个查询同时触发窗口焦点刷新 (Requirement 8.1)', async () => {
      const mockPostsResponse: PaginatedResponse<Post> = {
        items: [mockPost],
        total: 1,
        page: 1,
        size: 10,
        hasMore: false,
      };

      const updatedPost = { ...mockPost, title: '更新后的标题' };
      const updatedResponse = {
        ...mockPostsResponse,
        items: [updatedPost],
      };

      vi.mocked(postApi.getPostById)
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(updatedPost);

      vi.mocked(postApi.getPosts)
        .mockResolvedValueOnce(mockPostsResponse)
        .mockResolvedValueOnce(updatedResponse);

      const TestComponent = defineComponent({
        setup() {
          const { data: postData } = usePostQuery('post-1');
          const { data: postsData } = usePostsQuery({ page: 1, size: 10 });

          return () => h('div', [
            h('div', { class: 'post-title' }, postData.value?.title || ''),
            h('div', { class: 'list-title' }, postsData.value?.items[0]?.title || ''),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.post-title').text()).toBe('原标题');
      expect(wrapper.find('.list-title').text()).toBe('原标题');
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);
      expect(postApi.getPosts).toHaveBeenCalledTimes(1);

      // 模拟窗口焦点切换
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await flushPromises();

      // 两个查询都应该被刷新
      expect(postApi.getPostById).toHaveBeenCalledTimes(2);
      expect(postApi.getPosts).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.post-title').text()).toBe('更新后的标题');
      expect(wrapper.find('.list-title').text()).toBe('更新后的标题');
    });

    it('应该可以禁用窗口焦点刷新', async () => {
      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);

      // 创建禁用窗口焦点刷新的 QueryClient
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false, // 禁用
          },
        },
      });

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          return () => h('div', { class: 'title' }, data.value?.title || '');
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: testQueryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      // 模拟窗口焦点切换
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await flushPromises();

      // 不应该触发刷新
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      testQueryClient.clear();
    });
  });

  describe('网络重连刷新 (Network Reconnect Refetch)', () => {
    const mockPost: Post = {
      id: 'post-1',
      title: '原标题',
      content: '原内容',
      summary: '原摘要',
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

    it('应该在网络重连时刷新失败的查询 (Requirement 8.2)', async () => {
      const updatedPost = { ...mockPost, title: '更新后的标题' };

      vi.mocked(postApi.getPostById)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(updatedPost);

      const TestComponent = defineComponent({
        setup() {
          const { data, isError, isFetching } = usePostQuery('post-1');
          return () => h('div', [
            h('div', { class: 'title' }, data.value?.title || 'No Data'),
            h('div', { class: 'error' }, isError.value ? 'Error' : 'No Error'),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
          ]);
        },
      });

      // 模拟离线状态
      onlineManager.setOnline(false);

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.error').text()).toBe('Error');
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      // 模拟网络重连
      onlineManager.setOnline(true);
      await flushPromises();

      // 应该触发重新获取
      expect(postApi.getPostById).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.title').text()).toBe('更新后的标题');
      expect(wrapper.find('.error').text()).toBe('No Error');
    });

    it('应该在网络重连时显示加载状态 (Requirement 8.2)', async () => {
      const updatedPost = { ...mockPost, title: '更新后的标题' };

      vi.mocked(postApi.getPostById)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(updatedPost);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = usePostQuery('post-1');
          return () => h('div', [
            h('div', { class: 'title' }, data.value?.title || 'No Data'),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
          ]);
        },
      });

      // 模拟离线状态
      onlineManager.setOnline(false);

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();

      // 模拟网络重连
      onlineManager.setOnline(true);
      
      await wrapper.vm.$nextTick();
      
      await flushPromises();
      expect(wrapper.find('.title').text()).toBe('更新后的标题');
    });

    it('应该为多个失败的查询同时触发网络重连刷新 (Requirement 8.2)', async () => {
      const mockPostsResponse: PaginatedResponse<Post> = {
        items: [mockPost],
        total: 1,
        page: 1,
        size: 10,
        hasMore: false,
      };

      const updatedPost = { ...mockPost, title: '更新后的标题' };
      const updatedResponse = {
        ...mockPostsResponse,
        items: [updatedPost],
      };

      vi.mocked(postApi.getPostById)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(updatedPost);

      vi.mocked(postApi.getPosts)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(updatedResponse);

      const TestComponent = defineComponent({
        setup() {
          const { data: postData } = usePostQuery('post-1');
          const { data: postsData } = usePostsQuery({ page: 1, size: 10 });

          return () => h('div', [
            h('div', { class: 'post-title' }, postData.value?.title || 'No Data'),
            h('div', { class: 'list-title' }, postsData.value?.items[0]?.title || 'No Data'),
          ]);
        },
      });

      // 模拟离线状态
      onlineManager.setOnline(false);

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.post-title').text()).toBe('No Data');
      expect(wrapper.find('.list-title').text()).toBe('No Data');
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);
      expect(postApi.getPosts).toHaveBeenCalledTimes(1);

      // 模拟网络重连
      onlineManager.setOnline(true);
      await flushPromises();

      // 两个查询都应该被刷新
      expect(postApi.getPostById).toHaveBeenCalledTimes(2);
      expect(postApi.getPosts).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.post-title').text()).toBe('更新后的标题');
      expect(wrapper.find('.list-title').text()).toBe('更新后的标题');
    });

    it('应该可以禁用网络重连刷新', async () => {
      vi.mocked(postApi.getPostById).mockRejectedValue(new Error('Network error'));

      // 创建禁用网络重连刷新的 QueryClient
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 10 * 60 * 1000,
            refetchOnReconnect: false, // 禁用
          },
        },
      });

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          return () => h('div', { class: 'title' }, data.value?.title || 'No Data');
        },
      });

      // 模拟离线状态
      onlineManager.setOnline(false);

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient: testQueryClient }], pinia],
        },
      });

      await flushPromises();
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      // 模拟网络重连
      onlineManager.setOnline(true);
      await flushPromises();

      // 不应该触发刷新
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      testQueryClient.clear();
    });
  });

  describe('后台同步综合测试 (Combined Background Sync)', () => {
    const mockPost: Post = {
      id: 'post-1',
      title: '原标题',
      content: '原内容',
      summary: '原摘要',
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

    it('应该同时支持窗口焦点和网络重连刷新 (Requirements 8.1, 8.2)', async () => {
      const updatedPost1 = { ...mockPost, title: '焦点更新' };
      const updatedPost2 = { ...mockPost, title: '重连更新' };

      vi.mocked(postApi.getPostById)
        .mockResolvedValueOnce(mockPost)
        .mockResolvedValueOnce(updatedPost1)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(updatedPost2);

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          return () => h('div', { class: 'title' }, data.value?.title || 'No Data');
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.title').text()).toBe('原标题');
      expect(postApi.getPostById).toHaveBeenCalledTimes(1);

      // 测试窗口焦点刷新
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await flushPromises();

      expect(postApi.getPostById).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.title').text()).toBe('焦点更新');

      // 模拟网络断开
      onlineManager.setOnline(false);
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      await flushPromises();

      expect(postApi.getPostById).toHaveBeenCalledTimes(3);
      expect(wrapper.find('.title').text()).toBe('焦点更新'); // 保持之前的数据

      // 测试网络重连刷新
      onlineManager.setOnline(true);
      await flushPromises();

      expect(postApi.getPostById).toHaveBeenCalledTimes(4);
      expect(wrapper.find('.title').text()).toBe('重连更新');
    });
  });
});
