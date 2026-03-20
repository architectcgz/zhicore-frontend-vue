/**
 * HomeSidebar 组件测试（当前版本：仅热门文章）
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import HomeSidebar from '@/components/home/HomeSidebar.vue';
import type { Post } from '@/types';

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/posts/:id', name: 'post', component: { template: '<div>Post</div>' } },
    ],
  });

const createPost = (id: string, title: string, viewCount: number, likeCount: number): Post => ({
  id,
  title,
  content: '文章内容',
  excerpt: '文章摘要',
  summary: '文章摘要',
  authorId: 'user-1',
  author: {
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
  tags: [],
  viewCount,
  likeCount,
  favoriteCount: 0,
  commentCount: 0,
  isLiked: false,
  isFavorited: false,
  status: 'PUBLISHED',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
});

const mockPosts: Post[] = [
  createPost('1', '深入理解 Vue 3 Composition API', 12345, 678),
  createPost('2', 'TypeScript 高级类型技巧', 5678, 234),
  createPost('3', 'React Hooks 最佳实践', 1234, 123),
];

describe('HomeSidebar', () => {
  let router: ReturnType<typeof createTestRouter>;
  type SidebarProps = {
    trendingPosts?: Post[];
    isLoading?: boolean;
    postsError?: Error | null;
  };

  beforeEach(async () => {
    router = createTestRouter();
    await router.push('/');
    await router.isReady();
  });

  const createWrapper = (props?: SidebarProps) =>
    mount(HomeSidebar, {
      props: {
        trendingPosts: mockPosts,
        isLoading: false,
        ...props,
      },
      global: {
        plugins: [router],
      },
    });

  it('应该渲染侧边栏和热门文章区块', () => {
    const wrapper = createWrapper();

    expect(wrapper.find('.home-sidebar').exists()).toBe(true);
    expect(wrapper.find('.home-sidebar').attributes('role')).toBe('complementary');
    expect(wrapper.find('.home-sidebar').attributes('aria-label')).toBe('侧边栏');
    expect(wrapper.findAll('.home-sidebar__section')).toHaveLength(1);
    expect(wrapper.find('#posts-heading').text()).toContain('热门文章');
  });

  it('应该渲染热门文章列表并限制最多 10 篇', () => {
    const manyPosts = Array.from({ length: 15 }, (_, index) =>
      createPost(String(index + 1), `Post ${index + 1}`, 10000 - index * 10, 100 - index)
    );
    const wrapper = createWrapper({ trendingPosts: manyPosts });

    const posts = wrapper.findAll('.home-sidebar__post');
    expect(posts).toHaveLength(10);
    expect(posts[0].find('.home-sidebar__post-title').text()).toBe('Post 1');
  });

  it('应该正确显示排名徽章样式', () => {
    const wrapper = createWrapper();
    const badges = wrapper.findAll('.home-sidebar__rank-badge');

    expect(badges[0].classes()).toContain('home-sidebar__rank-badge--first');
    expect(badges[1].classes()).toContain('home-sidebar__rank-badge--second');
    expect(badges[2].classes()).toContain('home-sidebar__rank-badge--third');
  });

  it('应该显示加载骨架屏', () => {
    const wrapper = createWrapper({ isLoading: true, trendingPosts: [] });

    expect(wrapper.find('.home-sidebar__skeleton').exists()).toBe(true);
    expect(wrapper.findAll('.home-sidebar__skeleton-post')).toHaveLength(5);
  });

  it('应该显示错误状态叠加层', () => {
    const wrapper = createWrapper({
      postsError: new Error('加载文章失败'),
      trendingPosts: [],
      isLoading: false,
    });

    expect(wrapper.find('.home-sidebar__error-overlay').exists()).toBe(true);
    expect(wrapper.find('.home-sidebar__error-message').text()).toBe('加载文章失败');
  });

  it('应该显示空状态', () => {
    const wrapper = createWrapper({ trendingPosts: [], isLoading: false });

    expect(wrapper.find('.home-sidebar__empty').exists()).toBe(true);
    expect(wrapper.text()).toContain('暂无热门文章');
  });

  it('应该正确格式化数字', () => {
    const wrapper = createWrapper();
    const firstPost = wrapper.findAll('.home-sidebar__post')[0];

    expect(firstPost.text()).toContain('1.2万');
    expect(firstPost.text()).toContain('678');

    const thirdPost = wrapper.findAll('.home-sidebar__post')[2];
    expect(thirdPost.text()).toContain('1.2k');
  });

  it('应该在点击文章时触发事件并导航', async () => {
    const pushSpy = vi.spyOn(router, 'push');
    const wrapper = createWrapper();

    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    await firstPost.trigger('click');

    expect(wrapper.emitted('post-click')).toBeTruthy();
    expect(wrapper.emitted('post-click')?.[0]).toEqual([mockPosts[0]]);
    expect(pushSpy).toHaveBeenCalledWith('/posts/1');
  });

  it('应该支持键盘 Enter 激活文章', async () => {
    const wrapper = createWrapper();

    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    await firstPost.trigger('keydown.enter');

    expect(wrapper.emitted('post-click')).toBeTruthy();
    expect(wrapper.emitted('post-click')?.[0]).toEqual([mockPosts[0]]);
  });

  it('应该具备当前可访问性属性', () => {
    const wrapper = createWrapper();

    const section = wrapper.find('.home-sidebar__section');
    expect(section.attributes('aria-labelledby')).toBe('posts-heading');
    expect(wrapper.find('#posts-heading').exists()).toBe(true);

    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    expect(firstPost.attributes('tabindex')).toBe('0');
    expect(firstPost.attributes('aria-label')).toBe('第 1 名: 深入理解 Vue 3 Composition API');

    const firstBadge = wrapper.findAll('.home-sidebar__rank-badge')[0];
    expect(firstBadge.attributes('aria-label')).toBe('排名第 1');
  });
});
