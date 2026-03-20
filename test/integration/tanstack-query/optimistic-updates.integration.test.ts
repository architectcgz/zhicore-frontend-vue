/**
 * TanStack Query Mutation 集成测试（当前实现）
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import { postApi } from '@/api/post';
import { commentApi } from '@/api/comment';
import { usePostQuery, useLikePostMutation, useFavoritePostMutation } from '@/queries/posts';
import { useCommentsQuery, useCreateCommentMutation, useLikeCommentMutation, useDeleteCommentMutation } from '@/queries/comments';
import { useAuthStore } from '@/stores/auth';
import type { Post, Comment, PaginatedResponse } from '@/types';

vi.mock('@/api/post');
vi.mock('@/api/comment');
vi.mock('element-plus', () => ({
  ElMessage: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const baseUser = {
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

const basePost: Post = {
  id: 'post-1',
  title: '测试文章',
  content: '测试内容',
  summary: '测试摘要',
  coverImage: null,
  author: baseUser,
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

const baseComment: Comment = {
  id: 'comment-1',
  postId: 'post-1',
  userId: 'user-1',
  user: baseUser,
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

describe('TanStack Query Mutation 集成测试', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const authStore = useAuthStore();
    authStore.$patch({
      user: baseUser,
      accessToken: 'token',
      refreshToken: 'refresh-token',
    });

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
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

  it('文章点赞成功后应更新详情缓存', async () => {
    vi.mocked(postApi.getPostById)
      .mockResolvedValueOnce(basePost)
      .mockResolvedValueOnce({ ...basePost, likeCount: 11, isLiked: true });
    vi.mocked(postApi.likePost).mockResolvedValue({ ...basePost, likeCount: 11, isLiked: true });

    const TestComponent = defineComponent({
      setup() {
        const { data } = usePostQuery('post-1');
        const mutation = useLikePostMutation();
        const handleLike = () => mutation.mutate({ postId: 'post-1', isLiked: false });
        return () =>
          h('div', [
            h('div', { class: 'like-count' }, data.value?.likeCount ?? 0),
            h('button', { class: 'like-btn', onClick: handleLike }, 'Like'),
          ]);
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(wrapper.find('.like-count').text()).toBe('10');

    await wrapper.find('.like-btn').trigger('click');
    await flushPromises();

    expect(postApi.likePost).toHaveBeenCalledWith('post-1');
    expect(wrapper.find('.like-count').text()).toBe('11');
  });

  it('文章点赞失败后应回滚到原始状态', async () => {
    vi.mocked(postApi.getPostById).mockResolvedValue(basePost);
    vi.mocked(postApi.likePost).mockRejectedValue(new Error('Network error'));

    const TestComponent = defineComponent({
      setup() {
        const { data } = usePostQuery('post-1');
        const mutation = useLikePostMutation();
        const handleLike = () => mutation.mutate({ postId: 'post-1', isLiked: false });
        return () =>
          h('div', [
            h('div', { class: 'like-count' }, data.value?.likeCount ?? 0),
            h('button', { class: 'like-btn', onClick: handleLike }, 'Like'),
          ]);
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    await wrapper.find('.like-btn').trigger('click');
    await flushPromises();

    expect(wrapper.find('.like-count').text()).toBe('10');
  });

  it('文章收藏成功后应更新详情缓存', async () => {
    vi.mocked(postApi.getPostById)
      .mockResolvedValueOnce(basePost)
      .mockResolvedValueOnce({ ...basePost, favoriteCount: 6, isFavorited: true });
    vi.mocked(postApi.favoritePost).mockResolvedValue({ ...basePost, favoriteCount: 6, isFavorited: true });

    const TestComponent = defineComponent({
      setup() {
        const { data } = usePostQuery('post-1');
        const mutation = useFavoritePostMutation();
        const handleFavorite = () => mutation.mutate({ postId: 'post-1', isFavorited: false });
        return () =>
          h('div', [
            h('div', { class: 'favorite-count' }, data.value?.favoriteCount ?? 0),
            h('button', { class: 'favorite-btn', onClick: handleFavorite }, 'Favorite'),
          ]);
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    await wrapper.find('.favorite-btn').trigger('click');
    await flushPromises();

    expect(postApi.favoritePost).toHaveBeenCalledWith('post-1');
    expect(wrapper.find('.favorite-count').text()).toBe('6');
  });

  it('创建评论后应刷新评论列表', async () => {
    const emptyComments: PaginatedResponse<Comment> = {
      items: [],
      total: 0,
      page: 0,
      size: 10,
      hasMore: false,
    };
    const oneComment: PaginatedResponse<Comment> = {
      items: [{ ...baseComment, content: '新评论' }],
      total: 1,
      page: 0,
      size: 10,
      hasMore: false,
    };

    vi.mocked(commentApi.getCommentsByPostId)
      .mockResolvedValueOnce(emptyComments)
      .mockResolvedValueOnce(oneComment);
    vi.mocked(commentApi.createComment).mockResolvedValue({ ...baseComment, content: '新评论' });

    const TestComponent = defineComponent({
      setup() {
        const { data } = useCommentsQuery('post-1');
        const mutation = useCreateCommentMutation();
        const handleCreate = () => mutation.mutate({ postId: 'post-1', content: '新评论' });
        return () =>
          h('div', [
            h('div', { class: 'count' }, data.value?.items.length ?? 0),
            h('button', { class: 'create-btn', onClick: handleCreate }, 'Create'),
          ]);
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(wrapper.find('.count').text()).toBe('0');

    await wrapper.find('.create-btn').trigger('click');
    await flushPromises();

    expect(commentApi.createComment).toHaveBeenCalled();
    expect(wrapper.find('.count').text()).toBe('1');
  });

  it('评论点赞后应刷新当前文章评论列表', async () => {
    const commentsBefore: PaginatedResponse<Comment> = {
      items: [baseComment],
      total: 1,
      page: 0,
      size: 10,
      hasMore: false,
    };
    const commentsAfter: PaginatedResponse<Comment> = {
      ...commentsBefore,
      items: [{ ...baseComment, likeCount: 6, isLiked: true }],
    };

    vi.mocked(commentApi.getCommentsByPostId)
      .mockResolvedValueOnce(commentsBefore)
      .mockResolvedValueOnce(commentsAfter);
    vi.mocked(commentApi.likeComment).mockResolvedValue({ ...baseComment, likeCount: 6, isLiked: true });

    const TestComponent = defineComponent({
      setup() {
        const { data } = useCommentsQuery('post-1');
        const mutation = useLikeCommentMutation();
        const handleLike = () =>
          mutation.mutate({ commentId: 'comment-1', isLiked: false, postId: 'post-1' });
        return () =>
          h('div', [
            h('div', { class: 'like-count' }, data.value?.items[0]?.likeCount ?? 0),
            h('button', { class: 'like-btn', onClick: handleLike }, 'Like'),
          ]);
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(wrapper.find('.like-count').text()).toBe('5');

    await wrapper.find('.like-btn').trigger('click');
    await flushPromises();

    expect(commentApi.likeComment).toHaveBeenCalledWith('comment-1');
    expect(wrapper.find('.like-count').text()).toBe('6');
  });

  it('删除评论后应刷新当前文章评论列表', async () => {
    const commentsBefore: PaginatedResponse<Comment> = {
      items: [baseComment],
      total: 1,
      page: 0,
      size: 10,
      hasMore: false,
    };
    const commentsAfter: PaginatedResponse<Comment> = {
      items: [],
      total: 0,
      page: 0,
      size: 10,
      hasMore: false,
    };

    vi.mocked(commentApi.getCommentsByPostId)
      .mockResolvedValueOnce(commentsBefore)
      .mockResolvedValueOnce(commentsAfter);
    vi.mocked(commentApi.deleteComment).mockResolvedValue(undefined);

    const TestComponent = defineComponent({
      setup() {
        const { data } = useCommentsQuery('post-1');
        const mutation = useDeleteCommentMutation();
        const handleDelete = () =>
          mutation.mutate({ commentId: 'comment-1', postId: 'post-1' });
        return () =>
          h('div', [
            h('div', { class: 'count' }, data.value?.items.length ?? 0),
            h('button', { class: 'delete-btn', onClick: handleDelete }, 'Delete'),
          ]);
      },
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
      },
    });

    await flushPromises();
    expect(wrapper.find('.count').text()).toBe('1');

    await wrapper.find('.delete-btn').trigger('click');
    await flushPromises();

    expect(commentApi.deleteComment).toHaveBeenCalledWith('comment-1');
    expect(wrapper.find('.count').text()).toBe('0');
  });
});
