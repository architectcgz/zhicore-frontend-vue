/**
 * DefaultLayout 侧边栏显示逻辑测试
 * 验证根据路由 meta 配置正确显示/隐藏侧边栏
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(max-width: 767px)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock AppHeader, AppFooter, AppSidebar
vi.mock('@/components/common/AppHeader.vue', () => ({
  default: {
    name: 'AppHeader',
    template: '<div class="app-header"><slot /></div>',
  },
}));

vi.mock('@/components/common/AppFooter.vue', () => ({
  default: {
    name: 'AppFooter',
    template: '<div class="app-footer"><slot /></div>',
  },
}));

vi.mock('@/components/common/AppSidebar.vue', () => ({
  default: {
    name: 'AppSidebar',
    template: '<div class="app-sidebar"><slot /></div>',
  },
}));

describe('DefaultLayout 侧边栏显示逻辑', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia(false);
  });

  it('PC 端非首页不应显示侧边栏（忽略 meta.showSidebar 默认值）', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/tags',
          name: 'TagList',
          component: { template: '<div>Tags</div>' },
          meta: { showSidebar: true },
        },
      ],
    });

    await router.push('/tags');
    await router.isReady();

    const wrapper = mount(DefaultLayout, {
      global: {
        plugins: [router],
        stubs: {
          AppHeader: true,
          AppFooter: true,
          AppSidebar: true,
        },
      },
      slots: {
        default: '<div>Content</div>',
      },
    });

    // 等待组件更新
    await wrapper.vm.$nextTick();

    // 验证侧边栏不存在
    expect(wrapper.find('.default-layout__sidebar').exists()).toBe(false);
  });

  it('PC 端首页应显示侧边栏', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: { template: '<div>Home</div>' },
          meta: { showSidebar: false },
        },
      ],
    });

    await router.push('/');
    await router.isReady();

    const wrapper = mount(DefaultLayout, {
      global: {
        plugins: [router],
        stubs: {
          AppHeader: true,
          AppFooter: true,
          AppSidebar: true,
        },
      },
      slots: {
        default: '<div>Content</div>',
      },
    });

    // 等待组件更新
    await wrapper.vm.$nextTick();

    // 验证侧边栏存在
    expect(wrapper.find('.default-layout__sidebar').exists()).toBe(true);
  });

  it('移动端当路由 meta.showSidebar 未设置时，应默认显示侧边栏', async () => {
    mockMatchMedia(true);
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/about',
          name: 'About',
          component: { template: '<div>About</div>' },
          meta: {}, // 未设置 showSidebar
        },
      ],
    });

    await router.push('/about');
    await router.isReady();

    const wrapper = mount(DefaultLayout, {
      global: {
        plugins: [router],
        stubs: {
          AppHeader: true,
          AppFooter: true,
          AppSidebar: true,
        },
      },
      slots: {
        default: '<div>Content</div>',
      },
    });

    // 等待组件更新
    await wrapper.vm.$nextTick();

    // 验证侧边栏存在（默认行为）
    expect(wrapper.find('.default-layout__sidebar').exists()).toBe(true);
  });

  it('移动端当路由 meta.showSidebar 为 false 时，不应显示侧边栏（未打开抽屉）', async () => {
    mockMatchMedia(true);
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/about',
          name: 'About',
          component: { template: '<div>About</div>' },
          meta: { showSidebar: false },
        },
      ],
    });

    await router.push('/about');
    await router.isReady();

    const wrapper = mount(DefaultLayout, {
      global: {
        plugins: [router],
        stubs: {
          AppHeader: true,
          AppFooter: true,
          AppSidebar: true,
        },
      },
      slots: {
        default: '<div>Content</div>',
      },
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.find('.default-layout__sidebar').exists()).toBe(false);
  });

  it('移动端打开抽屉后应强制显示侧边栏（即使 meta.showSidebar 为 false）', async () => {
    mockMatchMedia(true);
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          name: 'Home',
          component: { template: '<div>Home</div>' },
          meta: { showSidebar: false },
        },
      ],
    });

    await router.push('/');
    await router.isReady();

    const wrapper = mount(DefaultLayout, {
      global: {
        plugins: [router],
        stubs: {
          AppHeader: {
            template: '<div class="app-header" @click="$emit(\'toggle-sidebar\')">Header</div>',
          },
          AppFooter: true,
          AppSidebar: true,
        },
      },
      slots: {
        default: '<div>Content</div>',
      },
    });

    const vm = wrapper.vm as unknown as { isSidebarOpen: boolean };

    expect(vm.isSidebarOpen).toBe(false);
    expect(wrapper.find('.default-layout__sidebar').exists()).toBe(false);

    await wrapper.find('.app-header').trigger('click');
    await wrapper.vm.$nextTick();

    expect(vm.isSidebarOpen).toBe(true);
    expect(wrapper.find('.default-layout__sidebar').exists()).toBe(true);

    await wrapper.find('.app-header').trigger('click');
    await wrapper.vm.$nextTick();

    expect(vm.isSidebarOpen).toBe(false);
  });
});
