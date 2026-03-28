import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import PostListSidebar from '@/components/post/PostListSidebar.vue';

vi.mock('@/queries/tags/useHotTagsQuery', () => ({
  useHotTagsQuery: () => ({
    data: ref([
      { id: 'tag-1', name: 'Vue', slug: 'vue', postCount: 3, createdAt: '', updatedAt: '' },
    ]),
    isLoading: ref(false),
  }),
}));

vi.mock('@/queries/ranking/useHotCreatorsQuery', () => ({
  useHotCreatorsQuery: () => ({
    data: ref({
      items: [
        {
          user: {
            id: 'user-1',
            username: 'alice',
            email: '',
            nickname: 'Alice',
            avatar: '',
            bio: '',
            role: 'USER',
            followersCount: 10,
            followingCount: 0,
            postsCount: 5,
            createdAt: '',
            updatedAt: '',
          },
          metrics: {
            posts: 5,
            totalViews: 100,
            totalLikes: 12,
            followers: 10,
            engagement: 1,
          },
          id: 'rank-1',
          title: 'Alice',
          score: 10,
          rank: 1,
          change: 0,
          type: 'USER',
        },
      ],
    }),
    isLoading: ref(false),
  }),
}));

describe('PostListSidebar', () => {
  it('renders hot tags and creators on desktop, and emits tag selection', async () => {
    const wrapper = mount(PostListSidebar, {
      props: {
        isMobile: false,
        selectedTagIds: [],
      },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    expect(wrapper.text()).toContain('热门标签');
    expect(wrapper.text()).toContain('热门创作者');

    await wrapper.get('[data-test="hot-tag-tag-1"]').trigger('click');

    expect(wrapper.emitted('tag-click')?.[0]?.[0]).toBe('tag-1');
  });

  it('does not render on mobile', () => {
    const wrapper = mount(PostListSidebar, {
      props: {
        isMobile: true,
        selectedTagIds: [],
      },
    });

    expect(wrapper.find('aside').exists()).toBe(false);
  });
});
