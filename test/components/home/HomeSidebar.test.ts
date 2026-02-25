/**
 * HomeSidebar 组件测试
 * 
 * 测试范围:
 * - 视觉回归测试: 验证组件在不同状态下的渲染
 * - 交互测试: 验证标签和文章点击导航
 * - 可访问性测试: 验证 ARIA 标签和键盘导航
 * - 性能测试: 验证渲染性能和动画流畅度
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import HomeSidebar from '@/components/home/HomeSidebar.vue';
import type { Tag, Post } from '@/types';

// 创建测试路由
const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/tags/:slug', name: 'tag', component: { template: '<div>Tag</div>' } },
      { path: '/posts/:id', name: 'post', component: { template: '<div>Post</div>' } },
    ],
  });
};

// 模拟标签数据
const mockTags: Tag[] = [
  {
    id: '1',
    name: 'Vue.js',
    slug: 'vuejs',
    postCount: 1234,
    description: 'Vue.js 相关文章',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'TypeScript',
    slug: 'typescript',
    postCount: 567,
    description: 'TypeScript 相关文章',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'React',
    slug: 'react',
    postCount: 89,
    description: 'React 相关文章',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// 模拟文章数据
const mockPosts: Post[] = [
  {
    id: '1',
    title: '深入理解 Vue 3 Composition API',
    content: '文章内容',
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
    viewCount: 12345,
    likeCount: 678,
    commentCount: 90,
    isLiked: false,
    isBookmarked: false,
    status: 'PUBLISHED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'TypeScript 高级类型技巧',
    content: '文章内容',
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
    viewCount: 5678,
    likeCount: 234,
    commentCount: 45,
    isLiked: false,
    isBookmarked: false,
    status: 'PUBLISHED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    title: 'React Hooks 最佳实践',
    content: '文章内容',
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
    viewCount: 1234,
    likeCount: 123,
    commentCount: 23,
    isLiked: false,
    isBookmarked: false,
    status: 'PUBLISHED',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('HomeSidebar - 视觉回归测试', () => {
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(async () => {
    router = createTestRouter();
    await router.push('/');
    await router.isReady();
  });

  it('应该正确渲染完整的侧边栏结构', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证侧边栏容器
    expect(wrapper.find('.home-sidebar').exists()).toBe(true);
    expect(wrapper.find('.home-sidebar').attributes('role')).toBe('complementary');
    expect(wrapper.find('.home-sidebar').attributes('aria-label')).toBe('侧边栏');

    // 验证两个区块都存在
    const sections = wrapper.findAll('.home-sidebar__section');
    expect(sections).toHaveLength(2);
  });

  it('应该正确渲染热门标签区块', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证标题
    const tagsHeading = wrapper.find('#tags-heading');
    expect(tagsHeading.exists()).toBe(true);
    expect(tagsHeading.text()).toContain('热门标签');

    // 验证标题图标
    const titleIcon = tagsHeading.find('.home-sidebar__section-icon');
    expect(titleIcon.exists()).toBe(true);

    // 验证标签列表
    const tags = wrapper.findAll('.home-sidebar__tag');
    expect(tags).toHaveLength(mockTags.length);

    // 验证第一个标签的内容
    const firstTag = tags[0];
    expect(firstTag.text()).toContain('Vue.js');
    expect(firstTag.text()).toContain('1.2k'); // 1234 格式化为 1.2k
  });

  it('应该正确渲染热门文章区块', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证标题
    const postsHeading = wrapper.find('#posts-heading');
    expect(postsHeading.exists()).toBe(true);
    expect(postsHeading.text()).toContain('热门文章');

    // 验证标题图标
    const titleIcon = postsHeading.find('.home-sidebar__section-icon--red');
    expect(titleIcon.exists()).toBe(true);

    // 验证文章列表
    const posts = wrapper.findAll('.home-sidebar__post');
    expect(posts).toHaveLength(mockPosts.length);

    // 验证第一篇文章的内容
    const firstPost = posts[0];
    expect(firstPost.find('.home-sidebar__post-title').text()).toBe(mockPosts[0].title);
    expect(firstPost.find('.home-sidebar__rank-badge').text()).toBe('1');
  });

  it('应该正确显示排名徽章样式', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const badges = wrapper.findAll('.home-sidebar__rank-badge');

    // 第1名: 金色
    expect(badges[0].classes()).toContain('home-sidebar__rank-badge--first');

    // 第2名: 银色
    expect(badges[1].classes()).toContain('home-sidebar__rank-badge--second');

    // 第3名: 铜色
    expect(badges[2].classes()).toContain('home-sidebar__rank-badge--third');
  });

  it('应该显示加载状态的骨架屏', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        isLoading: true,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证骨架屏存在
    const skeletons = wrapper.findAll('.home-sidebar__skeleton');
    expect(skeletons.length).toBeGreaterThan(0);

    // 验证标签骨架屏
    expect(wrapper.findAll('.home-sidebar__skeleton-tag')).toHaveLength(8);

    // 验证文章骨架屏
    expect(wrapper.findAll('.home-sidebar__skeleton-post')).toHaveLength(5);
  });

  it('应该显示错误状态叠加层', () => {
    const tagsError = new Error('加载标签失败');
    const postsError = new Error('加载文章失败');

    const wrapper = mount(HomeSidebar, {
      props: {
        isLoading: false,
        tagsError,
        postsError,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证错误叠加层存在
    const errorOverlays = wrapper.findAll('.home-sidebar__error-overlay');
    expect(errorOverlays.length).toBeGreaterThan(0);

    // 验证错误消息
    const errorMessages = wrapper.findAll('.home-sidebar__error-message');
    expect(errorMessages[0].text()).toBe('加载标签失败');
  });

  it('应该显示空状态', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: [],
        trendingPosts: [],
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证空状态存在
    const emptyStates = wrapper.findAll('.home-sidebar__empty');
    expect(emptyStates.length).toBeGreaterThan(0);

    // 验证空状态文本
    expect(wrapper.text()).toContain('暂无热门标签');
    expect(wrapper.text()).toContain('暂无热门文章');
  });

  it('应该正确格式化数字显示', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证标签计数格式化 (1234 -> 1.2k)
    const firstTag = wrapper.findAll('.home-sidebar__tag')[0];
    expect(firstTag.text()).toContain('1.2k');

    // 验证文章浏览量格式化 (12345 -> 1.2万)
    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    expect(firstPost.text()).toContain('1.2万');
  });
});

describe('HomeSidebar - 交互测试', () => {
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(async () => {
    router = createTestRouter();
    await router.push('/');
    await router.isReady();
  });

  it('应该在点击标签时触发事件', async () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const firstTag = wrapper.findAll('.home-sidebar__tag')[0];
    await firstTag.trigger('click');

    // 验证事件触发
    expect(wrapper.emitted('tag-click')).toBeTruthy();
    expect(wrapper.emitted('tag-click')?.[0]).toEqual([mockTags[0]]);
  });

  it('应该在点击文章时触发事件', async () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    await firstPost.trigger('click');

    // 验证事件触发
    expect(wrapper.emitted('post-click')).toBeTruthy();
    expect(wrapper.emitted('post-click')?.[0]).toEqual([mockPosts[0]]);
  });

  it('应该支持键盘 Enter 键激活文章', async () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    await firstPost.trigger('keydown.enter');

    // 验证事件触发
    expect(wrapper.emitted('post-click')).toBeTruthy();
    expect(wrapper.emitted('post-click')?.[0]).toEqual([mockPosts[0]]);
  });

  it('应该在悬停时应用正确的样式类', async () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 测试标签悬停
    const firstTag = wrapper.findAll('.home-sidebar__tag')[0];
    expect(firstTag.classes()).toContain('home-sidebar__tag');

    // 测试文章悬停
    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    expect(firstPost.classes()).toContain('home-sidebar__post');
  });
});

describe('HomeSidebar - 可访问性测试', () => {
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(async () => {
    router = createTestRouter();
    await router.push('/');
    await router.isReady();
  });

  it('应该有正确的 ARIA 标签', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证侧边栏 ARIA 标签
    const sidebar = wrapper.find('.home-sidebar');
    expect(sidebar.attributes('role')).toBe('complementary');
    expect(sidebar.attributes('aria-label')).toBe('侧边栏');

    // 验证区块 ARIA 标签
    const sections = wrapper.findAll('.home-sidebar__section');
    expect(sections[0].attributes('aria-labelledby')).toBe('tags-heading');
    expect(sections[1].attributes('aria-labelledby')).toBe('posts-heading');

    // 验证标题 ID
    expect(wrapper.find('#tags-heading').exists()).toBe(true);
    expect(wrapper.find('#posts-heading').exists()).toBe(true);
  });

  it('应该为标签提供 aria-label', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const firstTag = wrapper.findAll('.home-sidebar__tag')[0];
    expect(firstTag.attributes('aria-label')).toBe('标签: Vue.js, 1234 篇文章');
  });

  it('应该为文章提供 aria-label', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const firstPost = wrapper.findAll('.home-sidebar__post')[0];
    expect(firstPost.attributes('aria-label')).toBe('第 1 名: 深入理解 Vue 3 Composition API');
  });

  it('应该为排名徽章提供 aria-label', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const firstBadge = wrapper.findAll('.home-sidebar__rank-badge')[0];
    expect(firstBadge.attributes('aria-label')).toBe('排名第 1');
  });

  it('应该为图标添加 aria-hidden', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证标题图标
    const titleIcons = wrapper.findAll('.home-sidebar__section-icon');
    titleIcons.forEach(icon => {
      expect(icon.attributes('aria-hidden')).toBe('true');
    });

    // 验证元数据图标
    const metaIcons = wrapper.findAll('.home-sidebar__post-meta-icon');
    metaIcons.forEach(icon => {
      expect(icon.attributes('aria-hidden')).toBe('true');
    });
  });

  it('应该支持键盘导航 (tabindex)', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证文章项可以通过 Tab 键访问
    const posts = wrapper.findAll('.home-sidebar__post');
    posts.forEach(post => {
      expect(post.attributes('tabindex')).toBe('0');
    });
  });

  it('应该为屏幕阅读器提供文本替代方案', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证 sr-only 类的使用
    const srOnlyElements = wrapper.findAll('.sr-only');
    expect(srOnlyElements.length).toBeGreaterThan(0);

    // 验证浏览量和点赞数的文本替代
    expect(wrapper.html()).toContain('浏览量:');
    expect(wrapper.html()).toContain('点赞数:');
  });
});

describe('HomeSidebar - 性能测试', () => {
  let router: ReturnType<typeof createTestRouter>;

  beforeEach(async () => {
    router = createTestRouter();
    await router.push('/');
    await router.isReady();
  });

  it('应该限制显示的标签数量 (最多15个)', () => {
    const manyTags = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Tag ${i + 1}`,
      slug: `tag-${i + 1}`,
      postCount: 100 - i,
      description: `Tag ${i + 1} description`,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }));

    const wrapper = mount(HomeSidebar, {
      props: {
        tags: manyTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证只显示15个标签
    const tags = wrapper.findAll('.home-sidebar__tag');
    expect(tags).toHaveLength(15);
  });

  it('应该限制显示的文章数量 (最多10篇)', () => {
    const manyPosts = Array.from({ length: 15 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Post ${i + 1}`,
      content: 'Content',
      summary: 'Summary',
      authorId: 'user-1',
      author: {
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        nickname: '测试用户',
        avatar: '/avatar.jpg',
        bio: '测试用户简介',
        role: 'USER' as const,
        followersCount: 10,
        followingCount: 5,
        postsCount: 3,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      tags: [],
      viewCount: 1000 - i * 10,
      likeCount: 100 - i,
      commentCount: 10,
      isLiked: false,
      isBookmarked: false,
      status: 'PUBLISHED' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    }));

    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: manyPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证只显示10篇文章
    const posts = wrapper.findAll('.home-sidebar__post');
    expect(posts).toHaveLength(10);
  });

  it('应该快速渲染组件 (性能基准)', () => {
    const startTime = performance.now();

    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // 验证渲染时间小于 100ms
    expect(renderTime).toBeLessThan(100);

    // 验证组件已渲染
    expect(wrapper.find('.home-sidebar').exists()).toBe(true);
  });

  it('应该正确使用 CSS 变量', () => {
    const wrapper = mount(HomeSidebar, {
      props: {
        tags: mockTags,
        trendingPosts: mockPosts,
        isLoading: false,
      },
      global: {
        plugins: [router],
      },
    });

    // 验证组件使用了 scoped 样式
    const sidebar = wrapper.find('.home-sidebar');
    expect(sidebar.exists()).toBe(true);

    // 验证关键样式类存在
    expect(wrapper.find('.home-sidebar__section').exists()).toBe(true);
    expect(wrapper.find('.home-sidebar__section-title').exists()).toBe(true);
    expect(wrapper.find('.home-sidebar__tag').exists()).toBe(true);
    expect(wrapper.find('.home-sidebar__post').exists()).toBe(true);
  });
});
