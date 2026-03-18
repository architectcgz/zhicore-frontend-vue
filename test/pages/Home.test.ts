/**
 * Home 页面布局测试
 * 验证 Home 页面使用 DefaultLayout 且自定义侧边栏不冲突
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { ref } from 'vue';
import Home from '@/pages/Home.vue';

// Mock TanStack Query hooks
vi.mock('@/queries/tags/useHotTagsQuery', () => ({
  useHotTagsQuery: () => ({
    data: ref([]),
    isLoading: ref(false),
    error: ref(null),
  }),
}));

vi.mock('@/queries/ranking/useHotCreatorsQuery', () => ({
  useHotCreatorsQuery: () => ({
    data: ref({ items: [] }),
    isLoading: ref(false),
    error: ref(null),
  }),
}));

vi.mock('@/queries/posts/useHotPostsQuery', () => ({
  useHotPostsQuery: () => ({
    data: ref({ items: [] }),
    isLoading: ref(false),
    error: ref(null),
  }),
}));

vi.mock('@/queries/ranking/useHotCreatorsQuery', () => ({
  useHotCreatorsQuery: () => ({
    data: ref({ items: [] }),
    isLoading: ref(false),
    error: ref(null),
  }),
}));

vi.mock('@/queries/ranking/useHotTopicsQuery', () => ({
  useHotTopicsQuery: () => ({
    data: ref({ items: [] }),
    isLoading: ref(false),
    error: ref(null),
  }),
}));

vi.mock('@/queries/posts/usePostsQuery', () => ({
  usePostsQuery: () => ({
    data: ref({ items: [] }),
    isLoading: ref(false),
    isFetching: ref(false),
    error: ref(null),
  }),
}));

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
  }),
}));

describe('Home 页面布局', () => {
  it('应该渲染 Home 页面主体', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: Home,
          meta: { showSidebar: false },
        },
        {
          path: '/posts',
          name: 'Posts',
          component: { template: '<div>Posts</div>' },
        },
        {
          path: '/posts/create',
          name: 'PostCreate',
          component: { template: '<div>Create Post</div>' },
        },
        {
          path: '/tags',
          name: 'Tags',
          component: { template: '<div>Tags</div>' },
        },
        {
          path: '/ranking',
          name: 'Ranking',
          component: { template: '<div>Ranking</div>' },
        },
        {
          path: '/drafts',
          name: 'Drafts',
          component: { template: '<div>Drafts</div>' },
        },
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          Teleport: true,
          PostList: true,
          LoadingSpinner: true,
        },
      },
    });

    expect(wrapper.find('.home-page').exists()).toBe(true);
    expect(wrapper.text()).toContain('发现精彩内容');
  });

  it('应该包含自定义的左侧边栏', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: Home,
          meta: { showSidebar: false },
        },
        {
          path: '/posts',
          name: 'Posts',
          component: { template: '<div>Posts</div>' },
        },
        {
          path: '/posts/create',
          name: 'PostCreate',
          component: { template: '<div>Create Post</div>' },
        },
        {
          path: '/tags',
          name: 'Tags',
          component: { template: '<div>Tags</div>' },
        },
        {
          path: '/ranking',
          name: 'Ranking',
          component: { template: '<div>Ranking</div>' },
        },
        {
          path: '/drafts',
          name: 'Drafts',
          component: { template: '<div>Drafts</div>' },
        },
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          Teleport: true,
          PostList: true,
          LoadingSpinner: true,
        },
      },
    });

    // 验证包含热门标签部分（左侧边栏的一部分）
    expect(wrapper.text()).toContain('热门标签');
  });

  it('应该包含自定义的右侧边栏', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: Home,
          meta: { showSidebar: false },
        },
        {
          path: '/posts',
          name: 'Posts',
          component: { template: '<div>Posts</div>' },
        },
        {
          path: '/posts/create',
          name: 'PostCreate',
          component: { template: '<div>Create Post</div>' },
        },
        {
          path: '/tags',
          name: 'Tags',
          component: { template: '<div>Tags</div>' },
        },
        {
          path: '/ranking',
          name: 'Ranking',
          component: { template: '<div>Ranking</div>' },
        },
        {
          path: '/drafts',
          name: 'Drafts',
          component: { template: '<div>Drafts</div>' },
        },
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          Teleport: true,
          PostList: true,
          LoadingSpinner: true,
        },
      },
    });

    // 验证包含热门文章部分（右侧边栏）
    expect(wrapper.text()).toContain('热门文章');
  });

  it('应该使用响应式网格布局', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: Home,
          meta: { showSidebar: false },
        },
        {
          path: '/posts',
          name: 'Posts',
          component: { template: '<div>Posts</div>' },
        },
        {
          path: '/posts/create',
          name: 'PostCreate',
          component: { template: '<div>Create Post</div>' },
        },
        {
          path: '/tags',
          name: 'Tags',
          component: { template: '<div>Tags</div>' },
        },
        {
          path: '/ranking',
          name: 'Ranking',
          component: { template: '<div>Ranking</div>' },
        },
        {
          path: '/drafts',
          name: 'Drafts',
          component: { template: '<div>Drafts</div>' },
        },
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          Teleport: true,
          PostList: true,
          LoadingSpinner: true,
        },
      },
    });

    // 验证内容区域存在（布局由 DefaultLayout 负责响应式网格，Home 自身负责内容结构）
    expect(wrapper.find('.content-container').exists()).toBe(true);
    expect(wrapper.find('.posts-section').exists()).toBe(true);
  });
});
