import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import PostListPage from '@/pages/post/PostList.vue';
import { routes } from '@/router/routes';

const usePostsListPage = vi.fn(() => ({
  sort: ref<'latest' | 'popular' | 'hot'>('latest'),
  tagIds: ref<string[]>([]),
  timeRange: ref<'all' | 'today' | 'week' | 'month'>('all'),
  page: ref(1),
  isMobile: ref(false),
  availableTags: ref([]),
  posts: ref([]),
  total: ref(12),
  isLoading: ref(false),
  errorMessage: ref<string | null>(null),
  hasNextPage: ref(false),
  isFetchingNextPage: ref(false),
  hotCreators: ref([]),
  hotTags: ref([]),
  updateFilters: vi.fn(),
  updatePage: vi.fn(),
  handleLike: vi.fn(),
  handleFavorite: vi.fn(),
  loadMore: vi.fn(),
}));

vi.mock('@/composables/usePostsListPage', () => ({
  usePostsListPage: () => usePostsListPage(),
}));

vi.mock('@/components/post/PostListFilter.vue', () => ({
  default: {
    name: 'PostListFilter',
    template: '<div class="post-list-filter-stub" />',
  },
}));

vi.mock('@/components/post/PostListCard.vue', () => ({
  default: {
    name: 'PostListCard',
    props: ['post'],
    template: '<article class="post-list-card-stub">{{ post?.title }}</article>',
  },
}));

vi.mock('@/components/post/PostListSidebar.vue', () => ({
  default: {
    name: 'PostListSidebar',
    template: '<aside class="post-list-sidebar-stub" />',
  },
}));

describe('PostList page', () => {
  it('registers /posts as the PostList route', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: routes as any,
    });

    await router.push('/posts');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('PostList');
    expect(router.currentRoute.value.meta.title).toBe('文章广场');
  });

  it('renders desktop pagination and sidebar', () => {
    const wrapper = mount(PostListPage, {
      global: {
        stubs: {
          ElPagination: {
            name: 'ElPagination',
            template: '<div class="el-pagination-stub" />',
          },
        },
      },
    });

    expect(wrapper.text()).toContain('文章广场');
    expect(wrapper.find('.el-pagination-stub').exists()).toBe(true);
    expect(wrapper.find('.post-list-sidebar-stub').exists()).toBe(true);
  });

  it('renders infinite loading sentinel on mobile', () => {
    usePostsListPage.mockReturnValueOnce({
      ...usePostsListPage(),
      isMobile: ref(true),
      hasNextPage: ref(true),
    });

    const wrapper = mount(PostListPage, {
      global: {
        stubs: {
          ElPagination: true,
        },
      },
    });

    expect(wrapper.find('.post-list-page__load-more-trigger').exists()).toBe(true);
    expect(wrapper.find('.post-list-sidebar-stub').exists()).toBe(false);
  });
});
