/**
 * Home 页面布局测试
 */

import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { ref } from 'vue';
import Home from '@/pages/Home.vue';

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

vi.mock('@/queries/ranking/useHotTopicsQuery', () => ({
  useHotTopicsQuery: () => ({
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

vi.mock('@/queries/posts/usePostsQuery', () => ({
  usePostsQuery: () => ({
    data: ref({ items: [] }),
    isLoading: ref(false),
    isFetching: ref(false),
    error: ref(null),
    refetch: vi.fn(),
  }),
}));

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'Home', component: Home, meta: { showSidebar: false } },
      { path: '/posts', name: 'Posts', component: { template: '<div>Posts</div>' } },
      { path: '/posts/create', name: 'PostCreate', component: { template: '<div>Create</div>' } },
      { path: '/tags', name: 'TagList', component: { template: '<div>Tags</div>' } },
      { path: '/ranking', name: 'Ranking', component: { template: '<div>Ranking</div>' } },
      { path: '/drafts', name: 'Drafts', component: { template: '<div>Drafts</div>' } },
    ],
  });

describe('Home 页面布局', () => {
  const createWrapper = async () => {
    const router = createTestRouter();
    await router.push('/');
    await router.isReady();

    return mount(Home, {
      global: {
        plugins: [router],
        stubs: {
          Teleport: true,
          PostCard: true,
          SiteErrorState: true,
          HomeSidebar: false,
        },
      },
    });
  };

  it('应该渲染 Home 页面主体', async () => {
    const wrapper = await createWrapper();

    expect(wrapper.find('.home-page').exists()).toBe(true);
    expect(wrapper.text()).toContain('发现精彩内容');
  });

  it('应该包含内容主区域结构', async () => {
    const wrapper = await createWrapper();

    expect(wrapper.find('.content-container').exists()).toBe(true);
    expect(wrapper.find('.posts-section').exists()).toBe(true);
  });

  it('应该渲染热门主题模块', async () => {
    const wrapper = await createWrapper();

    expect(wrapper.text()).toContain('热门主题');
  });

  it('应该渲染热门文章侧边栏入口内容', async () => {
    const wrapper = await createWrapper();

    expect(wrapper.text()).toContain('热门文章');
  });
});
