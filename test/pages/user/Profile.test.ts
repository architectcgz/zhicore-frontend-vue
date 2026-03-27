/* eslint-disable vue/one-component-per-file */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, ref, type Ref } from 'vue';
import Profile from '@/pages/user/Profile.vue';
import type { Post, User } from '@/types';
import type { ProfileTabKey } from '@/types/user/profile';

const useProfilePageContent = vi.fn();

vi.mock('@/composables/useProfilePageContent', () => ({
  useProfilePageContent: () => useProfilePageContent(),
}));

vi.mock('@/components/common/LoadingSpinner.vue', () => ({
  default: defineComponent({
    name: 'LoadingSpinnerStub',
    template: '<div class="loading-spinner-stub">loading</div>',
  }),
}));

vi.mock('@/components/user/profile/ProfileErrorState.vue', () => ({
  default: defineComponent({
    name: 'ProfileErrorStateStub',
    props: {
      message: {
        type: String,
        default: '',
      },
      isUnauthorizedError: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['retry', 'go-login', 'go-home'],
    template: `
      <div class="profile-error-state-stub">
        <span class="error-message">{{ message }}</span>
        <button class="retry-btn" @click="$emit('retry')">retry</button>
        <button class="go-login-btn" @click="$emit('go-login')">login</button>
        <button class="go-home-btn" @click="$emit('go-home')">home</button>
      </div>
    `,
  }),
}));

vi.mock('@/components/user/profile/ProfileHeaderSection.vue', () => ({
  default: defineComponent({
    name: 'ProfileHeaderSectionStub',
    props: {
      userId: {
        type: String,
        default: '',
      },
      isCurrentUser: {
        type: Boolean,
        default: false,
      },
      isFollowing: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['edit-profile', 'follow-toggle', 'send-message'],
    template: `
      <div class="profile-header-section-stub">
        <span class="user-id">{{ userId }}</span>
        <button class="edit-profile-btn" @click="$emit('edit-profile')">edit</button>
        <button class="follow-toggle-btn" @click="$emit('follow-toggle')">follow</button>
        <button class="send-message-btn" @click="$emit('send-message')">message</button>
      </div>
    `,
  }),
}));

vi.mock('@/components/user/profile/ProfileTabsSection.vue', () => ({
  default: defineComponent({
    name: 'ProfileTabsSectionStub',
    props: {
      activeTab: {
        type: String,
        default: 'posts',
      },
    },
    emits: [
      'update:active-tab',
      'load-tab',
      'create-post',
      'post-like-change',
      'post-favorite-change',
      'user-click',
    ],
    template: `
      <div class="profile-tabs-section-stub">
        <span class="active-tab">{{ activeTab }}</span>
        <button class="tab-update-btn" @click="$emit('update:active-tab', 'followers')">tab</button>
        <button class="retry-posts-btn" @click="$emit('load-tab', { tab: 'posts' })">retry posts</button>
        <button class="load-more-posts-btn" @click="$emit('load-tab', { tab: 'posts', append: true })">load posts</button>
        <button class="retry-favorites-btn" @click="$emit('load-tab', { tab: 'favorites' })">retry favorites</button>
        <button class="load-more-favorites-btn" @click="$emit('load-tab', { tab: 'favorites', append: true })">load favorites</button>
        <button class="retry-following-btn" @click="$emit('load-tab', { tab: 'following' })">retry following</button>
        <button class="load-more-following-btn" @click="$emit('load-tab', { tab: 'following', append: true })">load following</button>
        <button class="retry-followers-btn" @click="$emit('load-tab', { tab: 'followers' })">retry followers</button>
        <button class="load-more-followers-btn" @click="$emit('load-tab', { tab: 'followers', append: true })">load followers</button>
        <button class="create-post-btn" @click="$emit('create-post')">create</button>
        <button class="like-change-btn" @click="$emit('post-like-change', { postId: 'post-1', isLiked: true, likeCount: 8 })">like</button>
        <button class="favorite-change-btn" @click="$emit('post-favorite-change', { postId: 'post-1', isFavorited: true, favoriteCount: 5 })">favorite</button>
        <button class="user-click-btn" @click="$emit('user-click', 'user-2')">user</button>
      </div>
    `,
  }),
}));

const createUser = (): User => ({
  id: 'user-1',
  username: 'tester',
  email: 'tester@example.com',
  nickname: '测试用户',
  avatar: '',
  bio: '',
  role: 'USER',
  followersCount: 3,
  followingCount: 4,
  postsCount: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const createPostState = (): Post[] => [];

const createProfileState = () => ({
  userId: ref('user-1'),
  userProfile: ref(createUser()) as Ref<User | null>,
  loading: ref(false),
  error: ref(''),
  isUnauthorizedError: ref(false),
  displayErrorMessage: ref(''),
  isCurrentUser: ref(true),
  isFollowing: ref(false),
  followLoading: ref(false),
  isCreatingConversation: ref(false),
  activeTab: ref<ProfileTabKey>('posts'),
  posts: ref({
    list: createPostState(),
    loading: false,
    loadingMore: false,
    error: '',
    hasMore: false,
    page: 1,
  }),
  favorites: ref({
    list: createPostState(),
    loading: false,
    loadingMore: false,
    error: '',
    hasMore: false,
    page: 1,
  }),
  following: ref({
    list: [] as User[],
    loading: false,
    loadingMore: false,
    error: '',
    hasMore: false,
    page: 1,
  }),
  followers: ref({
    list: [] as User[],
    loading: false,
    loadingMore: false,
    error: '',
    hasMore: false,
    page: 1,
  }),
  handleRetry: vi.fn(),
  handleGoLogin: vi.fn(),
  handleGoHome: vi.fn(),
  handleEditProfile: vi.fn(),
  handleFollowToggle: vi.fn(),
  handleSendMessage: vi.fn(),
  handleCreatePost: vi.fn(),
  handleUserClick: vi.fn(),
  loadPostsPage: vi.fn(),
  loadFavoritesPage: vi.fn(),
  loadFollowingPage: vi.fn(),
  loadFollowersPage: vi.fn(),
  handleLikeChange: vi.fn(),
  handleFavoriteChange: vi.fn(),
});

describe('Profile 页面装配', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应显示加载态', () => {
    const state = createProfileState();
    state.loading = ref(true);
    state.userProfile = ref(null);
    useProfilePageContent.mockReturnValue(state);

    const wrapper = mount(Profile);

    expect(wrapper.find('.loading-container').exists()).toBe(true);
    expect(wrapper.find('.loading-spinner-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('正在加载用户信息');
  });

  it('应显示错误态并转发错误操作', async () => {
    const state = createProfileState();
    state.userProfile = ref(null);
    state.error = ref('加载失败');
    state.displayErrorMessage = ref('请稍后重试');
    useProfilePageContent.mockReturnValue(state);

    const wrapper = mount(Profile);

    await wrapper.find('.retry-btn').trigger('click');
    await wrapper.find('.go-login-btn').trigger('click');
    await wrapper.find('.go-home-btn').trigger('click');

    expect(wrapper.find('.profile-error-state-stub').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toBe('请稍后重试');
    expect(state.handleRetry).toHaveBeenCalledTimes(1);
    expect(state.handleGoLogin).toHaveBeenCalledTimes(1);
    expect(state.handleGoHome).toHaveBeenCalledTimes(1);
  });

  it('应转发 Header 和 Tabs 事件给 composable', async () => {
    const state = createProfileState();
    useProfilePageContent.mockReturnValue(state);

    const wrapper = mount(Profile);

    expect(wrapper.find('.user-id').text()).toBe('user-1');
    expect(wrapper.find('.active-tab').text()).toBe('posts');

    await wrapper.find('.edit-profile-btn').trigger('click');
    await wrapper.find('.follow-toggle-btn').trigger('click');
    await wrapper.find('.send-message-btn').trigger('click');
    await wrapper.find('.tab-update-btn').trigger('click');
    await wrapper.find('.retry-posts-btn').trigger('click');
    await wrapper.find('.load-more-posts-btn').trigger('click');
    await wrapper.find('.retry-favorites-btn').trigger('click');
    await wrapper.find('.load-more-favorites-btn').trigger('click');
    await wrapper.find('.retry-following-btn').trigger('click');
    await wrapper.find('.load-more-following-btn').trigger('click');
    await wrapper.find('.retry-followers-btn').trigger('click');
    await wrapper.find('.load-more-followers-btn').trigger('click');
    await wrapper.find('.create-post-btn').trigger('click');
    await wrapper.find('.like-change-btn').trigger('click');
    await wrapper.find('.favorite-change-btn').trigger('click');
    await wrapper.find('.user-click-btn').trigger('click');

    expect(state.handleEditProfile).toHaveBeenCalledTimes(1);
    expect(state.handleFollowToggle).toHaveBeenCalledTimes(1);
    expect(state.handleSendMessage).toHaveBeenCalledTimes(1);
    expect(state.activeTab.value).toBe('followers');
    expect(state.loadPostsPage).toHaveBeenNthCalledWith(1, false);
    expect(state.loadPostsPage).toHaveBeenNthCalledWith(2, true);
    expect(state.loadFavoritesPage).toHaveBeenNthCalledWith(1, false);
    expect(state.loadFavoritesPage).toHaveBeenNthCalledWith(2, true);
    expect(state.loadFollowingPage).toHaveBeenNthCalledWith(1, false);
    expect(state.loadFollowingPage).toHaveBeenNthCalledWith(2, true);
    expect(state.loadFollowersPage).toHaveBeenNthCalledWith(1, false);
    expect(state.loadFollowersPage).toHaveBeenNthCalledWith(2, true);
    expect(state.handleCreatePost).toHaveBeenCalledTimes(1);
    expect(state.handleLikeChange).toHaveBeenCalledWith({
      postId: 'post-1',
      isLiked: true,
      likeCount: 8,
    });
    expect(state.handleFavoriteChange).toHaveBeenCalledWith({
      postId: 'post-1',
      isFavorited: true,
      favoriteCount: 5,
    });
    expect(state.handleUserClick).toHaveBeenCalledWith('user-2');
  });
});
