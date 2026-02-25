/**
 * Home 页面布局测试
 * 验证 Home 页面使用 DefaultLayout 且自定义侧边栏不冲突
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import Home from '@/pages/Home.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

// Mock TanStack Query hooks
vi.mock('@/queries/tags/useHotTagsQuery', () => ({
  useHotTagsQuery: () => ({
    data: { value: [] },
    isLoading: false,
  }),
}));

vi.mock('@/queries/ranking/useHotCreatorsQuery', () => ({
  useHotCreatorsQuery: () => ({
    data: { value: { items: [] } },
    isLoading: false,
  }),
}));

vi.mock('@/queries/posts/usePostsQuery', () => ({
  usePostsQuery: () => ({
    data: { value: { items: [] } },
    isLoading: false,
  }),
}));

// Mock auth store
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    isAuthenticated: false,
  }),
}));

describe('Home 页面布局', () => {
  it('应该使用 DefaultLayout 包装', () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: Home,
          meta: { showSidebar: false },
        },
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          DefaultLayout: {
            template: '<div class="default-layout-stub"><slot /></div>',
          },
          PostList: true,
          LoadingSpinner: true,
        },
      },
    });

    // 验证使用了 DefaultLayout
    expect(wrapper.findComponent(DefaultLayout).exists()).toBe(true);
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
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          DefaultLayout: {
            template: '<div><slot /></div>',
          },
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
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          DefaultLayout: {
            template: '<div><slot /></div>',
          },
          PostList: true,
          LoadingSpinner: true,
        },
      },
    });

    // 验证包含热门作者和最新文章部分（右侧边栏）
    expect(wrapper.text()).toContain('热门作者');
    expect(wrapper.text()).toContain('最新文章');
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
      ],
    });

    const wrapper = mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          DefaultLayout: {
            template: '<div><slot /></div>',
          },
          PostList: true,
          LoadingSpinner: true,
        },
      },
    });

    // 验证使用了响应式网格类
    const gridContainer = wrapper.find('.grid');
    expect(gridContainer.exists()).toBe(true);
    expect(gridContainer.classes()).toContain('grid-cols-1');
    expect(gridContainer.classes()).toContain('lg:grid-cols-12');
  });
});
