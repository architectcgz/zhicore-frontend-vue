/**
 * CommentList 组件单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import CommentList from '@/components/comment/CommentList.vue';
import { commentApi } from '@/api/comment';
import type { Comment, PaginatedResponse } from '@/types';

// Mock comment API
vi.mock('@/api/comment', () => ({
  commentApi: {
    getCommentsByPostId: vi.fn(),
    likeComment: vi.fn(),
    unlikeComment: vi.fn(),
    deleteComment: vi.fn(),
    getCommentReplies: vi.fn(),
  },
}));

// Mock components
vi.mock('./CommentItem.vue', () => ({
  default: {
    name: 'CommentItem',
    template: '<div class="comment-item-mock">{{ comment.content }}</div>',
    props: ['comment', 'postId'],
    emits: ['reply', 'like', 'delete', 'load-replies'],
  },
}));

vi.mock('@/components/common/LoadingSpinner.vue', () => ({
  default: {
    name: 'LoadingSpinner',
    template: '<div class="loading-spinner-mock">Loading...</div>',
    props: ['size'],
  },
}));

vi.mock('@/components/common/EmptyState.vue', () => ({
  default: {
    name: 'EmptyState',
    template: '<div class="empty-state-mock">{{ title }}</div>',
    props: ['icon', 'title', 'description'],
  },
}));

describe('CommentList', () => {
  const mockComments: Comment[] = [
    {
      id: '1',
      postId: 'post-1',
      userId: 'user-1',
      user: {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        nickname: '测试用户',
        avatar: '/avatar.jpg',
        bio: '测试用户简介',
        role: 'USER',
        followersCount: 10,
        followingCount: 5,
        postsCount: 3,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      content: '这是一条测试评论',
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
  ];

  const mockResponse: PaginatedResponse<Comment> = {
    items: mockComments,
    total: 1,
    page: 1,
    size: 20,
    hasMore: false,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('应该正确渲染评论列表', async () => {
    // Mock API 响应
    vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockResponse);

    const wrapper = mount(CommentList, {
      props: {
        postId: 'post-1',
      },
    });

    // 等待异步操作完成
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));

    // 验证 API 调用
    expect(commentApi.getCommentsByPostId).toHaveBeenCalledWith('post-1', {
      page: 1,
      size: 20,
      sort: 'latest',
      loadReplies: false,
    });
  });

  it('应该显示加载状态', () => {
    vi.mocked(commentApi.getCommentsByPostId).mockImplementation(
      () => new Promise(() => {}) // 永不解决的 Promise
    );

    const wrapper = mount(CommentList, {
      props: {
        postId: 'post-1',
      },
    });

    expect(wrapper.find('.loading-container').exists()).toBe(true);
    expect(wrapper.find('.loading-spinner-mock').exists()).toBe(true);
  });

  it('应该显示空状态', async () => {
    const emptyResponse: PaginatedResponse<Comment> = {
      items: [],
      total: 0,
      page: 1,
      size: 20,
      hasMore: false,
    };

    vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(emptyResponse);

    const wrapper = mount(CommentList, {
      props: {
        postId: 'post-1',
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(wrapper.find('.empty-state-mock').exists()).toBe(true);
  });

  it('应该支持排序切换', async () => {
    vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockResponse);

    const wrapper = mount(CommentList, {
      props: {
        postId: 'post-1',
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));

    // 点击热门排序
    const hotSortBtn = wrapper.find('.sort-btn:nth-child(2)');
    await hotSortBtn.trigger('click');

    // 验证 API 再次调用，使用热门排序
    expect(commentApi.getCommentsByPostId).toHaveBeenCalledWith('post-1', {
      page: 1,
      size: 20,
      sort: 'hot',
      loadReplies: false,
    });
  });

  it('应该发出评论数量变化事件', async () => {
    vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockResponse);

    const wrapper = mount(CommentList, {
      props: {
        postId: 'post-1',
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));

    // 验证事件发出
    expect(wrapper.emitted('comment-count-change')).toBeTruthy();
    expect(wrapper.emitted('comment-count-change')?.[0]).toEqual([1]);
  });

  it('应该显示正确的评论数量', async () => {
    vi.mocked(commentApi.getCommentsByPostId).mockResolvedValue(mockResponse);

    const wrapper = mount(CommentList, {
      props: {
        postId: 'post-1',
      },
    });

    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(wrapper.find('.comment-count').text()).toBe('共 1 条评论');
  });
});