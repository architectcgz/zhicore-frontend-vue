/**
 * TanStack Query 乐观更新集成测试
 * Integration tests for TanStack Query optimistic updates
 * 
 * 测试需求 (Requirements):
 * - 4.9: 点赞成功后更新缓存
 * - 4.10: 点赞失败后回滚
 * - 6.5: 评论创建乐观更新
 * - 6.6: 评论更新乐观更新
 * - 6.7: 评论删除乐观更新
 * - 6.8: 评论点赞乐观更新
 * - 6.9: 失败后回滚
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, ref, nextTick } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';
import { usePostQuery, useLikePostMutation, useFavoritePostMutation } from '@/queries/posts';
import { useCommentsQuery, useCreateCommentMutation, useLikeCommentMutation, useDeleteCommentMutation } from '@/queries/comments';
import { useAuthStore } from '@/stores/auth';
import type { Post, Comment, PaginatedResponse } from '@/types';

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

describe('TanStack Query 乐观更新集成测试', () => {
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

  describe('文章点赞乐观更新 (Post Like Optimistic Update)', () => {
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

    it('应该乐观更新点赞状态 (Requirement 4.9)', async () => {
      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);
      vi.mocked(postApi.likePost).mockResolvedValue({ ...mockPost, isLiked: true, likeCount: 11 });

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          const likeMutation = useLikePostMutation();

          const handleLike = () => {
            likeMutation.mutate({ postId: 'post-1', isLiked: false });
          };

          return () => h('div', [
            h('div', { class: 'like-count' }, data.value?.likeCount || 0),
            h('div', { class: 'is-liked' }, data.value?.isLiked ? 'Liked' : 'Not Liked'),
            h('button', { class: 'like-btn', onClick: handleLike }, 'Like'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.like-count').text()).toBe('10');
      expect(wrapper.find('.is-liked').text()).toBe('Not Liked');

      // 点击点赞按钮
      await wrapper.find('.like-btn').trigger('click');

      // 等待乐观更新生效
      await nextTick();
      await nextTick();
      expect(wrapper.find('.like-count').text()).toBe('11');
      expect(wrapper.find('.is-liked').text()).toBe('Liked');

      // 等待 API 调用完成
      await flushPromises();
      expect(postApi.likePost).toHaveBeenCalledWith('post-1');
      expect(wrapper.find('.like-count').text()).toBe('11');
      expect(wrapper.find('.is-liked').text()).toBe('Liked');
    });

    it('应该在点赞失败后回滚 (Requirement 4.10)', async () => {
      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);
      vi.mocked(postApi.likePost).mockRejectedValue(new Error('Network error'));

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          const likeMutation = useLikePostMutation();

          const handleLike = () => {
            likeMutation.mutate({ postId: 'post-1', isLiked: false });
          };

          return () => h('div', [
            h('div', { class: 'like-count' }, data.value?.likeCount || 0),
            h('div', { class: 'is-liked' }, data.value?.isLiked ? 'Liked' : 'Not Liked'),
            h('button', { class: 'like-btn', onClick: handleLike }, 'Like'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      const originalLikeCount = wrapper.find('.like-count').text();
      const originalLikedStatus = wrapper.find('.is-liked').text();

      // 点击点赞按钮
      await wrapper.find('.like-btn').trigger('click');

      // 等待乐观更新生效
      await nextTick();
      await nextTick();
      expect(wrapper.find('.like-count').text()).toBe('11');
      expect(wrapper.find('.is-liked').text()).toBe('Liked');

      // 等待 API 调用失败
      await flushPromises();

      // 应该回滚到原始状态
      expect(wrapper.find('.like-count').text()).toBe(originalLikeCount);
      expect(wrapper.find('.is-liked').text()).toBe(originalLikedStatus);
    });

    it('应该乐观更新取消点赞状态 (Requirement 4.9)', async () => {
      const likedPost = { ...mockPost, isLiked: true, likeCount: 11 };
      vi.mocked(postApi.getPostById).mockResolvedValue(likedPost);
      vi.mocked(postApi.unlikePost).mockResolvedValue({ ...likedPost, isLiked: false, likeCount: 10 });

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          const likeMutation = useLikePostMutation();

          const handleUnlike = () => {
            likeMutation.mutate({ postId: 'post-1', isLiked: true });
          };

          return () => h('div', [
            h('div', { class: 'like-count' }, data.value?.likeCount || 0),
            h('div', { class: 'is-liked' }, data.value?.isLiked ? 'Liked' : 'Not Liked'),
            h('button', { class: 'unlike-btn', onClick: handleUnlike }, 'Unlike'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.like-count').text()).toBe('11');
      expect(wrapper.find('.is-liked').text()).toBe('Liked');

      // 点击取消点赞按钮
      await wrapper.find('.unlike-btn').trigger('click');

      // 等待乐观更新生效
      await nextTick();
      await nextTick();
      expect(wrapper.find('.like-count').text()).toBe('10');
      expect(wrapper.find('.is-liked').text()).toBe('Not Liked');

      await flushPromises();
      expect(postApi.unlikePost).toHaveBeenCalledWith('post-1');
    });
  });

  describe('文章收藏乐观更新 (Post Favorite Optimistic Update)', () => {
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

    it('应该乐观更新收藏状态 (Requirement 4.9)', async () => {
      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);
      vi.mocked(postApi.favoritePost).mockResolvedValue({ ...mockPost, isFavorited: true, favoriteCount: 6 });

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          const favoriteMutation = useFavoritePostMutation();

          const handleFavorite = () => {
            favoriteMutation.mutate({ postId: 'post-1', isFavorited: false });
          };

          return () => h('div', [
            h('div', { class: 'favorite-count' }, data.value?.favoriteCount || 0),
            h('div', { class: 'is-favorited' }, data.value?.isFavorited ? 'Favorited' : 'Not Favorited'),
            h('button', { class: 'favorite-btn', onClick: handleFavorite }, 'Favorite'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.favorite-count').text()).toBe('5');
      expect(wrapper.find('.is-favorited').text()).toBe('Not Favorited');

      await wrapper.find('.favorite-btn').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.find('.favorite-count').text()).toBe('6');
      expect(wrapper.find('.is-favorited').text()).toBe('Favorited');

      await flushPromises();
      expect(postApi.favoritePost).toHaveBeenCalledWith('post-1');
    });

    it('应该在收藏失败后回滚 (Requirement 4.10)', async () => {
      vi.mocked(postApi.getPostById).mockResolvedValue(mockPost);
      vi.mocked(postApi.favoritePost).mockRejectedValue(new Error('Network error'));

      const TestComponent = defineComponent({
        setup() {
          const { data } = usePostQuery('post-1');
          const favoriteMutation = useFavoritePostMutation();

          const handleFavorite = () => {
            favoriteMutation.mutate({ postId: 'post-1', isFavorited: false });
          };

          return () => h('div', [
            h('div', { class: 'favorite-count' }, data.value?.favoriteCount || 0),
            h('div', { class: 'is-favorited' }, data.value?.isFavorited ? 'Favorited' : 'Not Favorited'),
            h('button', { class: 'favorite-btn', onClick: handleFavorite }, 'Favorite'),
          ]);
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      const originalCount = wrapper.find('.favorite-count').text();
      const originalStatus = wrapper.find('.is-favorited').text();

      await wrapper.find('.favorite-btn').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.find('.favorite-count').text()).toBe('6');
      expect(wrapper.find('.is-favorited').text()).toBe('Favorited');

      await flushPromises();

      expect(wrapper.find('.favorite-count').text()).toBe(originalCount);
      expect(wrapper.find('.is-favorited').text()).toBe(originalStatus);
    });
  });

  describe('评论创建乐观更新 (Comment Create Optimistic Update)', () => {
    const mockCommentsResponse: PaginatedResponse<Comment> = {
      items: [],
      total: 0,
      page: 1,
      size: 10,
      hasMore: false,
    };

    const mockUser = {
      id: 'user-1',
      username: 'testuser',
      nickname: '测试用户',
      avatar: null,
      email: 'test@example.com',
      bio: null,
      role: 'USER' as const,
      followersCount: 0,
      followingCount: 0,
      postsCount: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('应该乐观添加新评论到列表 (Requirement 6.5)', async () => {
      vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockCommentsResponse);
      
      const newComment: Comment = {
        id: 'comment-1',
        postId: 'post-1',
        userId: 'user-1',
        user: mockUser,
        content: '新评论',
        parentId: undefined,
        parent: undefined,
        replies: [],
        repliesCount: 0,
        hasMore: false,
        likeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(commentApi.createComment).mockResolvedValue(newComment);

      const TestComponent = defineComponent({
        setup() {
          const { data } = useCommentsQuery('post-1');
          const createMutation = useCreateCommentMutation();

          const handleCreate = () => {
            createMutation.mutate({
              postId: 'post-1',
              content: '新评论',
            });
          };

          return () => h('div', [
            h('div', { class: 'count' }, data.value?.items.length || 0),
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

      await wrapper.find('.create-btn').trigger('click');
      await nextTick();
      await nextTick();

      // 乐观更新应该立即添加评论
      expect(wrapper.find('.count').text()).toBe('1');

      await flushPromises();
      expect(commentApi.createComment).toHaveBeenCalled();
    });

    it('应该在评论创建失败后回滚 (Requirement 6.9)', async () => {
      vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockCommentsResponse);
      vi.mocked(commentApi.createComment).mockRejectedValue(new Error('Network error'));

      const TestComponent = defineComponent({
        setup() {
          const { data } = useCommentsQuery('post-1');
          const createMutation = useCreateCommentMutation();

          const handleCreate = () => {
            createMutation.mutate({
              postId: 'post-1',
              content: '新评论',
            });
          };

          return () => h('div', [
            h('div', { class: 'count' }, data.value?.items.length || 0),
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

      await wrapper.find('.create-btn').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.find('.count').text()).toBe('1');

      await flushPromises();

      // 应该回滚到原始状态
      expect(wrapper.find('.count').text()).toBe('0');
    });
  });

  describe('评论点赞乐观更新 (Comment Like Optimistic Update)', () => {
    const mockComment: Comment = {
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
      items: [mockComment],
      total: 1,
      page: 1,
      size: 10,
      hasMore: false,
    };

    it('应该乐观更新评论点赞状态 (Requirement 6.8)', async () => {
      vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockCommentsResponse);
      vi.mocked(commentApi.likeComment).mockResolvedValue({ ...mockComment, isLiked: true, likeCount: 6 });

      const TestComponent = defineComponent({
        setup() {
          const { data } = useCommentsQuery('post-1');
          const likeMutation = useLikeCommentMutation();

          const handleLike = () => {
            likeMutation.mutate({ commentId: 'comment-1', isLiked: false });
          };

          const comment = ref(data.value?.items[0]);

          return () => {
            comment.value = data.value?.items[0];
            return h('div', [
              h('div', { class: 'like-count' }, comment.value?.likeCount || 0),
              h('div', { class: 'is-liked' }, comment.value?.isLiked ? 'Liked' : 'Not Liked'),
              h('button', { class: 'like-btn', onClick: handleLike }, 'Like'),
            ]);
          };
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      expect(wrapper.find('.like-count').text()).toBe('5');
      expect(wrapper.find('.is-liked').text()).toBe('Not Liked');

      await wrapper.find('.like-btn').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.find('.like-count').text()).toBe('6');
      expect(wrapper.find('.is-liked').text()).toBe('Liked');

      await flushPromises();
      expect(commentApi.likeComment).toHaveBeenCalledWith('comment-1');
    });

    it('应该在评论点赞失败后回滚 (Requirement 6.9)', async () => {
      vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockCommentsResponse);
      vi.mocked(commentApi.likeComment).mockRejectedValue(new Error('Network error'));

      const TestComponent = defineComponent({
        setup() {
          const { data } = useCommentsQuery('post-1');
          const likeMutation = useLikeCommentMutation();

          const handleLike = () => {
            likeMutation.mutate({ commentId: 'comment-1', isLiked: false });
          };

          const comment = ref(data.value?.items[0]);

          return () => {
            comment.value = data.value?.items[0];
            return h('div', [
              h('div', { class: 'like-count' }, comment.value?.likeCount || 0),
              h('div', { class: 'is-liked' }, comment.value?.isLiked ? 'Liked' : 'Not Liked'),
              h('button', { class: 'like-btn', onClick: handleLike }, 'Like'),
            ]);
          };
        },
      });

      const wrapper = mount(TestComponent, {
        global: {
          plugins: [[VueQueryPlugin, { queryClient }], pinia],
        },
      });

      await flushPromises();
      const originalCount = wrapper.find('.like-count').text();
      const originalStatus = wrapper.find('.is-liked').text();

      await wrapper.find('.like-btn').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.find('.like-count').text()).toBe('6');
      expect(wrapper.find('.is-liked').text()).toBe('Liked');

      await flushPromises();

      expect(wrapper.find('.like-count').text()).toBe(originalCount);
      expect(wrapper.find('.is-liked').text()).toBe(originalStatus);
    });
  });

  describe('评论删除乐观更新 (Comment Delete Optimistic Update)', () => {
    const mockComment: Comment = {
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
      items: [mockComment],
      total: 1,
      page: 1,
      size: 10,
      hasMore: false,
    };

    it('应该乐观删除评论 (Requirement 6.7)', async () => {
      vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockCommentsResponse);
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

      await wrapper.find('.delete-btn').trigger('click');
      await nextTick();
      await nextTick();

      // 乐观更新应该立即删除评论
      expect(wrapper.find('.count').text()).toBe('0');

      await flushPromises();
      expect(commentApi.deleteComment).toHaveBeenCalledWith('comment-1');
    });

    it('应该在评论删除失败后回滚 (Requirement 6.9)', async () => {
      vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockCommentsResponse);
      vi.mocked(commentApi.deleteComment).mockRejectedValue(new Error('Network error'));

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

      await wrapper.find('.delete-btn').trigger('click');
      await nextTick();
      await nextTick();

      expect(wrapper.find('.count').text()).toBe('0');

      await flushPromises();

      // 应该回滚到原始状态
      expect(wrapper.find('.count').text()).toBe('1');
    });
  });
});
