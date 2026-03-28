import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import PostListCard from '@/components/post/PostListCard.vue';

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const basePost = {
  id: 'post-1',
  title: 'Posts list page',
  content: 'content',
  excerpt: 'excerpt',
  summary: 'excerpt',
  author: {
    id: 'user-1',
    username: 'alice',
    email: '',
    nickname: 'Alice',
    avatar: '',
    bio: '',
    role: 'USER' as const,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '',
    updatedAt: '',
  },
  tags: [{ id: 'tag-1', name: 'Vue', slug: 'vue', postCount: 1, createdAt: '', updatedAt: '' }],
  status: 'PUBLISHED' as const,
  viewCount: 20,
  likeCount: 10,
  commentCount: 4,
  favoriteCount: 1,
  isLiked: false,
  isFavorited: false,
  createdAt: '2026-03-28T08:00:00.000Z',
  updatedAt: '2026-03-28T08:00:00.000Z',
  publishedAt: '2026-03-28T08:00:00.000Z',
};

describe('PostListCard', () => {
  it('renders cover layout when cover image exists', () => {
    const wrapper = mount(PostListCard, {
      props: {
        post: {
          ...basePost,
          coverImage: '/cover.png',
        },
      },
      global: {
        stubs: {
          RouterLink: false,
        },
      },
    });

    expect(wrapper.find('.post-list-card--with-cover').exists()).toBe(true);
    expect(wrapper.text()).toContain('Vue');
  });

  it('renders text-only layout and emits action events', async () => {
    const wrapper = mount(PostListCard, {
      props: {
        post: {
          ...basePost,
          coverImage: null,
        },
      },
    });

    expect(wrapper.find('.post-list-card--text-only').exists()).toBe(true);

    await wrapper.get('[data-test="like-button"]').trigger('click');
    await wrapper.get('[data-test="favorite-button"]').trigger('click');

    expect(wrapper.emitted('like')?.[0]?.[0]).toBe('post-1');
    expect(wrapper.emitted('favorite')?.[0]?.[0]).toBe('post-1');
  });
});
