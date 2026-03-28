/* eslint-disable vue/one-component-per-file */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, defineComponent } from 'vue';
import PostDetail from '@/pages/post/PostDetail.vue';
import type { Post } from '@/types';

const usePostDetailContent = vi.fn();

vi.mock('@/composables/usePostDetailContent', () => ({
  usePostDetailContent: (options: { id: string }) => usePostDetailContent(options),
}));

vi.mock('@/components/post/detail/PostDetailHeader.vue', () => ({
  default: defineComponent({
    name: 'PostDetailHeaderStub',
    props: {
      readingPresence: {
        type: Object,
        required: true,
      },
    },
    template: '<div class="post-detail-header-stub">{{ readingPresence.readingCount }}</div>',
  }),
}));

vi.mock('@/components/common/SiteErrorState.vue', () => ({
  default: defineComponent({
    template: '<div class="site-error-state-stub" />',
  }),
}));

vi.mock('@/components/post/detail/PostDetailReadingRail.vue', () => ({
  default: defineComponent({
    template: '<div class="reading-rail-stub" />',
  }),
}));

vi.mock('@/components/post/detail/PostDetailArticleSection.vue', () => ({
  default: defineComponent({
    template: '<div class="article-section-stub" />',
  }),
}));

vi.mock('@/components/post/detail/PostDetailActionRail.vue', () => ({
  default: defineComponent({
    template: '<div class="action-rail-stub" />',
  }),
}));

vi.mock('@/components/post/detail/PostDetailRelatedSection.vue', () => ({
  default: defineComponent({
    template: '<div class="related-section-stub" />',
  }),
}));

vi.mock('@/components/post/detail/PostDetailCommentsSection.vue', () => ({
  default: defineComponent({
    template: '<div class="comments-section-stub" />',
  }),
}));

const createPost = (): Post => ({
  id: '1001',
  title: 'Presence Post',
  content: '正文',
  excerpt: '摘要',
  author: {
    id: '2001',
    username: 'author',
    email: 'author@example.com',
    nickname: '作者',
    avatar: '',
    bio: '',
    role: 'USER',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  tags: [],
  status: 'PUBLISHED',
  viewCount: 0,
  likeCount: 0,
  commentCount: 0,
  favoriteCount: 0,
  isLiked: false,
  isFavorited: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('PostDetail 页面 presence 装配', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePostDetailContent.mockReturnValue({
      defaultAvatar: '/images/default-avatar.svg',
      error: null,
      errorPresentation: { title: '', message: '', detail: '' },
      post: createPost(),
      isLoading: false,
      handleRetry: vi.fn(),
      sectionCount: 2,
      articleSummary: '摘要',
      headerTags: [],
      readingTime: 6,
      commentCount: 0,
      readingPresence: computed(() => ({
        readingCount: 3,
        avatars: [],
      })),
      handleAvatarError: vi.fn(),
      articleHtml: '<p>正文</p>',
      handleImageError: vi.fn(),
      postTags: [],
      setArticleBodyRef: vi.fn(),
      readingBatteryStyle: {},
      readingProgressPercent: 12,
      tocItems: [],
      activeHeading: '',
      scrollToHeading: vi.fn(),
      likeLoading: false,
      favoriteLoading: false,
      handleLike: vi.fn(),
      handleFavorite: vi.fn(),
      scrollToComments: vi.fn(),
      handleCopyLink: vi.fn(),
      copyLabel: '复制链接',
      relatedSectionKicker: '相关文章',
      relatedSectionTitle: '继续阅读',
      isRelatedLoading: false,
      relatedCards: [],
      setCommentsSectionRef: vi.fn(),
      handleCommentCountChange: vi.fn(),
    });
  });

  it('passes reading presence into the header area', () => {
    const wrapper = mount(PostDetail, {
      props: {
        id: '1001',
      },
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    expect(usePostDetailContent).toHaveBeenCalledWith({ id: '1001' });
    expect(wrapper.find('.post-detail-header-stub').text()).toBe('3');
  });
});
