/**
 * TanStack Query 缓存失效集成测试
 * Integration tests for TanStack Query cache invalidation
 * 
 * 测试需求 (Requirements):
 * - 4.6: 创建文章后失效列表查询
 * - 4.7: 更新文章后更新缓存
 * - 4.8: 删除文章后移除缓存
 * - 6.10: Mutation 后失效相关查询
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';
import {
  usePostQuery,
  usePostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from '@/queries/posts';
import {
  useCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} from '@/queries/comments';
import { useAuthStore } from '@/stores/auth';
import type { Post, Comment, PaginatedResponse, PostCreateRequest } from '@/types';

// Mock APIs
vi.mock('@/api/post');
vi.mock('@/api/comment');

// Mock ElMessage
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TanStack Query 缓存失效集成测试', () => {
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
          gcTime: 10 * 60 * 1000,
        },
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('文章创建后失效列表查询 (Invalidate List After Create)', () => {
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

    const newPost: Post = {
      id: 'post-2',
      title: '新文章',
      content: '新内容',
      summary: '新摘要',
      coverImage: null,
      author: mockPostsResponse.items[0].author,
      tags: [],
      viewCount: 0,
      likeCount: 0,
      favoriteCount: 0,
      commentCount: 0,
      isLiked: false,
      isFavorited: false,
      status: 'PUBLISHED',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      publishedAt: '2024-01-02T00:00:00Z',
    };

    it('应该在创建文章后失效列表查询 (Requirement 4.6)', async () => {
      const updatedResponse = {
        ...mockPostsResponse,
        items: [newPost, ...mockPostsResponse.items],
        total: 2,
      };

      vi.mocked(postApi.getPosts)
        .mockResolvedValueOnce(mockPostsResponse)
        .mockResolvedValueOnce(updatedResponse);
      
      vi.mocked(postApi.createPost).mockResolvedValue(newPost);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = usePostsQuery({ page: 1, size: 10 });
          const createMutation = useCreatePostMutation();

          const handleCreate = () => {
            const postData: PostCreateRequest = {
              title: '新文章',
              content: '新内容',
              summary: '新摘要',
              tags: [],
              status: 'PUBLISHED',
            };
            createMutation.mutate(postData);
          };

          return () => h('div', [
            h('div', { class: 'count' }, data.value?.items.length || 0),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
            h('button', { class: 'create-btn', onClick: handleCreate }, 'Create'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.count').text()).toBe('1');
      expect(postApi.getPosts).toHaveBeenCalledTimes(1);

      // 创建新文章
      await wrapper.find('.create-btn').trigger('click');
      await flushPromises();

      // 应该触发列表查询的重新获取
      expect(postApi.getPosts).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.count').text()).toBe('2');
    });
  });

  describe('文章更新后更新缓存 (Update Cache After Update)', () => {
    const mockPost: Post = {
      id: 'post-1',
      title: '原标题',
      content: '原内容',
      summary: '原摘要',
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
    };

    it('应该在更新文章后更新缓存 (Requirement 4.7)', async () => {
      const updatedPost = { ...mockPost, title: '新标题', content: '新内容' };

      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);
      vi.mocked(postApi.updatePost).mockResolvedValue(updatedPost);

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          const updateMutation = useUpdatePostMutation();

          const handleUpdate = () => {
            updateMutation.mutate({
              postId: 'post-1',
              postData: { title: '新标题', content: '新内容' },
            });
          };

          return () => h('div', [
            h('div', { class: 'title' }, data.value?.title || ''),
            h('button', { class: 'update-btn', onClick: handleUpdate }, 'Update'),
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

      // 更新文章
      await wrapper.find('.update-btn').trigger('click');
      await flushPromises();

      // 缓存应该被更新
      expect(wrapper.find('.title').text()).toBe('新标题');
      expect(postApi.getPostById).toHaveBeenCalledTimes(1); // 不应该重新请求
    });

    it('应该在更新文章后失效列表查询 (Requirement 4.7)', async () => {
      const mockPostsResponse: PaginatedResponse<Post> = {
        items: [mockPost],
        total: 1,
        page: 1,
        size: 10,
        hasMore: false,
      };

      const updatedPost = { ...mockPost, title: '新标题' };
      const updatedResponse = {
        ...mockPostsResponse,
        items: [updatedPost],
      };

      vi.mocked(postApi.getPosts)
        .mockResolvedValueOnce(mockPostsResponse)
        .mockResolvedValueOnce(updatedResponse);
      
      vi.mocked(postApi.updatePost).mockResolvedValue(updatedPost);

      const TestComponent = defineComponent({
        setup() {
          const { data: listData } = usePostsQuery({ page: 1, size: 10 });
          const updateMutation = useUpdatePostMutation();

          const handleUpdate = () => {
            updateMutation.mutate({
              postId: 'post-1',
              postData: { title: '新标题' },
            });
          };

          return () => h('div', [
            h('div', { class: 'list-title' }, listData.value?.items[0]?.title || ''),
            h('button', { class: 'update-btn', onClick: handleUpdate }, 'Update'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.list-title').text()).toBe('原标题');
      expect(postApi.getPosts).toHaveBeenCalledTimes(1);

      // 更新文章
      await wrapper.find('.update-btn').trigger('click');
      await flushPromises();

      // 列表查询应该被失效并重新获取
      expect(postApi.getPosts).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.list-title').text()).toBe('新标题');
    });
  });

  describe('文章删除后移除缓存 (Remove Cache After Delete)', () => {
    const mockPost: Post = {
      id: 'post-1',
      title: '测试文章',
      content: '测试内容',
      summary: '测试摘要',
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
    };

    it('应该在删除文章后移除缓存 (Requirement 4.8)', async () => {
      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);
      vi.mocked(postApi.deletePost).mockResolvedValue(undefined);

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          const deleteMutation = useDeletePostMutation();

          const handleDelete = () => {
            deleteMutation.mutate('post-1');
          };

          return () => h('div', [
            h('div', { class: 'title' }, data.value?.title || 'No Data'),
            h('button', { class: 'delete-btn', onClick: handleDelete }, 'Delete'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.title').text()).toBe('测试文章');

      // 删除文章
      await wrapper.find('.delete-btn').trigger('click');
      await flushPromises();

      // 缓存应该被移除
      const cachedData = queryClient.getQueryData(['posts', 'detail', 'post-1']);
      expect(cachedData).toBeUndefined();
    });

    it('应该在删除文章后失效列表查询 (Requirement 4.8)', async () => {
      const mockPostsResponse: PaginatedResponse<Post> = {
        items: [mockPost],
        total: 1,
        page: 1,
        size: 10,
        hasMore: false,
      };

      const emptyResponse: PaginatedResponse<Post> = {
        items: [],
        total: 0,
        page: 1,
        size: 10,
        hasMore: false,
      };

      vi.mocked(postApi.getPosts)
        .mockResolvedValueOnce(mockPostsResponse)
        .mockResolvedValueOnce(emptyResponse);
      
      vi.mocked(postApi.deletePost).mockResolvedValue(undefined);

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostsQuery({ page: 1, size: 10 });
          const deleteMutation = useDeletePostMutation();

          const handleDelete = () => {
            deleteMutation.mutate('post-1');
          };

          return () => h('div', [
            h('div', { class: 'count' }, data.value?.items.length || 0),
            h('button', { class: 'delete-btn', onClick: handleDelete }, 'Delete'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.count').text()).toBe('1');
      expect(postApi.getPosts).toHaveBeenCalledTimes(1);

      // 删除文章
      await wrapper.find('.delete-btn').trigger('click');
      await flushPromises();

      // 列表查询应该被失效并重新获取
      expect(postApi.getPosts).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.count').text()).toBe('0');
    });
  });

  describe('评论 Mutation 后失效相关查询 (Invalidate After Comment Mutation)', () => {
    const mockComment: Comment = {
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
    };

    const mockCommentsResponse: PaginatedResponse<Comment> = {
      items: [],
      total: 0,
      page: 1,
      size: 10,
      hasMore: false,
    };

    it('应该在创建评论后失效评论列表查询 (Requirement 6.10)', async () => {
      const newComment: Comment = {
        ...mockComment,
        id: 'comment-2',
        content: '新评论',
      };

      const updatedResponse = {
        ...mockCommentsResponse,
        items: [newComment],
        total: 1,
      };

      vi.mocked(commentApi.getCommentsByPostId)
        .mockResolvedValueOnce(mockCommentsResponse)
        .mockResolvedValueOnce(updatedResponse);
      
      vi.mocked(commentApi.createComment).mockResolvedValue(newComment);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = useCommentsQuery('post-1');
          const createMutation = useCreateCommentMutation();

          const handleCreate = () => {
            createMutation.mutate({
              postId: 'post-1',
              content: '新评论',
            });
          };

          return () => h('div', [
            h('div', { class: 'count' }, data.value?.items.length || 0),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
            h('button', { class: 'create-btn', onClick: handleCreate }, 'Create'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.count').text()).toBe('0');
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1);

      // 创建评论
      await wrapper.find('.create-btn').trigger('click');
      await flushPromises();

      // 应该触发评论列表查询的重新获取
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.count').text()).toBe('1');
    });

    it('应该在删除评论后失效评论列表查询 (Requirement 6.10)', async () => {
      const initialResponse = {
        ...mockCommentsResponse,
        items: [mockComment],
        total: 1,
      };

      vi.mocked(commentApi.getCommentsByPostId)
        .mockResolvedValueOnce(initialResponse)
        .mockResolvedValueOnce(mockCommentsResponse);
      
      vi.mocked(commentApi.deleteComment).mockResolvedValue(undefined);

      const TestComponent = defineComponent({
        setup() {
          const { data } = useCommentsQuery('post-1');
          const deleteMutation = useDeleteCommentMutation();

          const handleDelete = () => {
            deleteMutation.mutate('comment-1');
          };

          return () => h('div', [
            h('div', { class: 'count' }, data.value?.items.length || 0),
            h('button', { class: 'delete-btn', onClick: handleDelete }, 'Delete'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.count').text()).toBe('1');
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(1);

      // 删除评论
      await wrapper.find('.delete-btn').trigger('click');
      await flushPromises();

      // 应该触发评论列表查询的重新获取
      expect(commentApi.getCommentsByPostId).toHaveBeenCalledTimes(2);
      expect(wrapper.find('.count').text()).toBe('0');
    });
  });

  describe('失效后的自动刷新 (Auto Refetch After Invalidation)', () => {
    it('应该在失效后自动刷新活跃的查询', async () => {
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

      const newPost: Post = {
        id: 'post-2',
        title: '新文章',
        content: '新内容',
        summary: '新摘要',
        coverImage: null,
        author: mockPostsResponse.items[0].author,
        tags: [],
        viewCount: 0,
        likeCount: 0,
        favoriteCount: 0,
        commentCount: 0,
        isLiked: false,
        isFavorited: false,
        status: 'PUBLISHED',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
        publishedAt: '2024-01-02T00:00:00Z',
      };

      const updatedResponse = {
        ...mockPostsResponse,
        items: [newPost, ...mockPostsResponse.items],
        total: 2,
      };

      vi.mocked(postApi.getPosts)
        .mockResolvedValueOnce(mockPostsResponse)
        .mockResolvedValueOnce(updatedResponse);
      
      vi.mocked(postApi.createPost).mockResolvedValue(newPost);

      const TestComponent = defineComponent({
        setup() {
          const { data, isFetching } = usePostsQuery({ page: 1, size: 10 });
          const createMutation = useCreatePostMutation();

          const handleCreate = () => {
            const postData: PostCreateRequest = {
              title: '新文章',
              content: '新内容',
              summary: '新摘要',
              tags: [],
              status: 'PUBLISHED',
            };
            createMutation.mutate(postData);
          };

          return () => h('div', [
            h('div', { class: 'count' }, data.value?.items.length || 0),
            h('div', { class: 'fetching' }, isFetching.value ? 'Fetching' : 'Not Fetching'),
            h('button', { class: 'create-btn', onClick: handleCreate }, 'Create'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.count').text()).toBe('1');
      expect(wrapper.find('.fetching').text()).toBe('Not Fetching');

      // 创建新文章
      await wrapper.find('.create-btn').trigger('click');

      // 应该显示正在获取状态
      await wrapper.vm.$nextTick();
      
      await flushPromises();

      // 应该自动刷新并显示新数据
      expect(wrapper.find('.count').text()).toBe('2');
      expect(postApi.getPosts).toHaveBeenCalledTimes(2);
    });
  });
});
