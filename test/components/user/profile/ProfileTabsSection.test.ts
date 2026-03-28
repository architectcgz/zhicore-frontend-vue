/* eslint-disable vue/one-component-per-file */

import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import ProfileTabsSection from '@/components/user/profile/ProfileTabsSection.vue';
import type { ProfileCollectionState } from '@/types/user/profile';
import type { Post, User } from '@/types';

vi.mock('@/components/user/profile/ProfilePostsTabPanel.vue', () => ({
  default: defineComponent({
    name: 'ProfilePostsTabPanelStub',
    props: {
      emptyTitle: {
        type: String,
        default: '',
      },
      showCreateAction: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['retry', 'load-more', 'create-post', 'like-change', 'favorite-change'],
    template: `
      <div class="profile-posts-tab-panel-stub">
        <span class="empty-title">{{ emptyTitle }}</span>
        <span class="show-create">{{ showCreateAction }}</span>
        <button class="retry-btn" @click="$emit('retry')">retry</button>
        <button class="load-more-btn" @click="$emit('load-more')">load-more</button>
        <button class="create-post-btn" @click="$emit('create-post')">create</button>
        <button class="like-change-btn" @click="$emit('like-change', { postId: 'post-1', isLiked: true, likeCount: 9 })">like</button>
        <button class="favorite-change-btn" @click="$emit('favorite-change', { postId: 'post-1', isFavorited: true, favoriteCount: 7 })">favorite</button>
      </div>
    `,
  }),
}));

vi.mock('@/components/user/profile/ProfileUsersTabPanel.vue', () => ({
  default: defineComponent({
    name: 'ProfileUsersTabPanelStub',
    props: {
      emptyTitle: {
        type: String,
        default: '',
      },
    },
    emits: ['retry', 'load-more', 'user-click'],
    template: `
      <div class="profile-users-tab-panel-stub">
        <span class="empty-title">{{ emptyTitle }}</span>
        <button class="retry-btn" @click="$emit('retry')">retry</button>
        <button class="load-more-btn" @click="$emit('load-more')">load-more</button>
        <button class="user-click-btn" @click="$emit('user-click', 'user-2')">user</button>
      </div>
    `,
  }),
}));

const createCollectionState = <T>(list: T[] = []): ProfileCollectionState<T> => ({
  list,
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: false,
  page: 1,
});

describe('ProfileTabsSection', () => {
  it('renders four custom tab buttons and only shows the active panel', async () => {
    const wrapper = mount(ProfileTabsSection, {
      props: {
        activeTab: 'posts',
        isAuthenticated: true,
        isCurrentUser: true,
        postsState: createCollectionState<Post>(),
        favoritesState: createCollectionState<Post>(),
        followingState: createCollectionState<User>(),
        followersState: createCollectionState<User>(),
      },
    });

    const tabs = wrapper.findAll('.profile-tabs__tab');
    expect(tabs).toHaveLength(4);
    expect(tabs.map((tab) => tab.text())).toEqual(['文章', '收藏', '关注', '粉丝']);
    expect(wrapper.findAll('.profile-posts-tab-panel-stub')).toHaveLength(1);
    expect(wrapper.find('.profile-users-tab-panel-stub').exists()).toBe(false);
    expect(wrapper.find('.empty-title').text()).toBe('还没有发布文章');
    expect(wrapper.find('.show-create').text()).toBe('true');

    await tabs[2].trigger('click');
    expect(wrapper.emitted('update:active-tab')).toEqual([['following']]);
  });

  it('forwards active panel events only', async () => {
    const wrapper = mount(ProfileTabsSection, {
      props: {
        activeTab: 'following',
        isAuthenticated: true,
        isCurrentUser: false,
        postsState: createCollectionState<Post>(),
        favoritesState: createCollectionState<Post>(),
        followingState: createCollectionState<User>(),
        followersState: createCollectionState<User>(),
      },
    });

    const userPanel = wrapper.find('.profile-users-tab-panel-stub');
    expect(userPanel.exists()).toBe(true);
    expect(wrapper.find('.profile-posts-tab-panel-stub').exists()).toBe(false);

    await userPanel.find('.retry-btn').trigger('click');
    await userPanel.find('.load-more-btn').trigger('click');
    await userPanel.find('.user-click-btn').trigger('click');

    expect(wrapper.emitted('load-tab')).toEqual([
      [{ tab: 'following' }],
      [{ tab: 'following', append: true }],
    ]);
    expect(wrapper.emitted('user-click')).toEqual([['user-2']]);
  });

  it('shows a login prompt when the viewer is not authenticated', async () => {
    const wrapper = mount(ProfileTabsSection, {
      props: {
        activeTab: 'posts',
        isAuthenticated: false,
        isCurrentUser: false,
        postsState: createCollectionState<Post>(),
        favoritesState: createCollectionState<Post>(),
        followingState: createCollectionState<User>(),
        followersState: createCollectionState<User>(),
      },
    });

    expect(wrapper.find('.profile-tabs__locked').exists()).toBe(true);
    expect(wrapper.text()).toContain('登录后可查看文章、收藏、关注和粉丝列表');

    await wrapper.find('.profile-tabs__login-btn').trigger('click');
    expect(wrapper.emitted('go-login')).toHaveLength(1);
  });
});
