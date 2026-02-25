/**
 * 评论功能集成测试
 * 测试 CommentList、CommentItem 和 CommentForm 组件的集成
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import CommentList from '@/components/comment/CommentList.vue';
import CommentForm from '@/components/comment/CommentForm.vue';
import { commentApi } from '@/api/comment';
import type { Comment, PaginatedResponse, User } from '@/types';

// Mock comment API
vi.mock('@/api/comment', () => ({
  commentApi: {
    getCommentsByPostId: vi.fn(),
    createComment: vi.fn(),
    likeComment: vi.fn(),
    unlikeComment: vi.fn(),
    deleteComment: vi.fn(),
    getCommentReplies: vi.fn(),
    reportComment: vi.fn(),
  },
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '1小时前'),
}));

// Mock date-fns/locale
vi.mock('date-fns/locale', () => ({
  zhCN: {},
}));

describe('评论功能集成测试', () => {
  const mockUser: User = {
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
  };

  const mockComment: Comment = {
    id: 'comment-1',
    postId: 'post-1',
    userId: 'user-1',
    user: mockUser,
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
  };

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    
    // 设置认证状态
    const authStore = useAuthStore();
    authStore.user = mockUser;
    authStore.accessToken = 'mock-token';
  });

  it('应该能够发表评论', async () => {
    const newComment: Comment = {
      ...mockComment,
      id: 'comment-2',
      content: '新发表的评论',
    };

    // Mock API 响应
    vi.mocked(commentApi.createComment).mockResolvedValue(newComment);

    const wrapper = mount(CommentForm, {
      props: {
        postId: 'post-1',
      },
    });

    // 输入评论内容
    const textarea = wrapper.find('.comment-textarea');
    await textarea.setValue('新发表的评论');

    // 提交评论
    const submitBtn = wrapper.find('.submit-btn');
    await submitBtn.trigger('click');

    // 等待异步操作
    await wrapper.vm.$nextTick();

    // 验证 API 调用
    expect(commentApi.createComment).toHaveBeenCalledWith({
      postId: 'post-1',
      content: '新发表的评论',
      parentId: undefined,
    });

    // 验证事件发出
    expect(wrapper.emitted('comment-created')).toBeTruthy();
  });

  it('应该验证评论内容', async () => {
    const wrapper = mount(CommentForm, {
      props: {
        postId: 'post-1',
      },
    });

    // 尝试提交空评论
    const submitBtn = wrapper.find('.submit-btn');
    await submitBtn.trigger('click');

    // 应该显示错误信息
    expect(wrapper.find('.error-message').exists()).toBe(true);
  });

  it('应该支持回复评论', async () => {
    const replyComment: Comment = {
      ...mockComment,
      id: 'reply-1',
      content: '这是一条回复',
      parentId: 'comment-1',
    };

    vi.mocked(commentApi.createComment).mockResolvedValue(replyComment);

    const wrapper = mount(CommentForm, {
      props: {
        postId: 'post-1',
        replyTo: mockComment,
      },
    });

    // 应该显示回复提示
    expect(wrapper.find('.reply-indicator').exists()).toBe(true);
    expect(wrapper.text()).toContain('回复 @测试用户');

    // 输入回复内容
    const textarea = wrapper.find('.comment-textarea');
    await textarea.setValue('这是一条回复');

    // 提交回复
    const submitBtn = wrapper.find('.submit-btn');
    await submitBtn.trigger('click');

    // 验证 API 调用
    expect(commentApi.createComment).toHaveBeenCalledWith({
      postId: 'post-1',
      content: '这是一条回复',
      parentId: 'comment-1',
    });
  });

  it('应该限制评论长度', async () => {
    const wrapper = mount(CommentForm, {
      props: {
        postId: 'post-1',
      },
    });

    // 输入超长内容
    const longContent = 'a'.repeat(1001);
    const textarea = wrapper.find('.comment-textarea');
    await textarea.setValue(longContent);

    // 尝试提交
    const submitBtn = wrapper.find('.submit-btn');
    await submitBtn.trigger('click');

    // 应该显示错误信息
    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toContain('不能超过1000个字符');
  });

  it('应该显示字符计数', async () => {
    const wrapper = mount(CommentForm, {
      props: {
        postId: 'post-1',
      },
    });

    const textarea = wrapper.find('.comment-textarea');
    await textarea.setValue('测试内容');

    // 应该显示字符计数
    expect(wrapper.find('.char-count').text()).toBe('4/1000');
  });

  it('未登录用户应该看到登录提示', () => {
    // 清除认证状态
    const authStore = useAuthStore();
    authStore.user = null;
    authStore.accessToken = null;

    const wrapper = mount(CommentForm, {
      props: {
        postId: 'post-1',
      },
    });

    // 应该显示登录提示
    expect(wrapper.find('.login-prompt').exists()).toBe(true);
    expect(wrapper.text()).toContain('请先登录后发表评论');
  });
});