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

const ElTabsStub = defineComponent({
  name: 'ElTabsStub',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  template: '<div class="el-tabs-stub"><slot /></div>',
});

const ElTabPaneStub = defineComponent({
  name: 'ElTabPaneStub',
  props: {
    label: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
  },
  template:
    '<section class="el-tab-pane-stub" :data-name="name" :data-label="label"><slot /></section>',
});

const createCollectionState = <T>(list: T[] = []): ProfileCollectionState<T> => ({
  list,
  loading: false,
  loadingMore: false,
  error: '',
  hasMore: false,
  page: 1,
});

describe('ProfileTabsSection', () => {
  it('应按配置渲染四个 tab，并给文章 tab 传递当前用户文案', () => {
    const wrapper = mount(ProfileTabsSection, {
      props: {
        activeTab: 'posts',
        isCurrentUser: true,
        postsState: createCollectionState<Post>(),
        favoritesState: createCollectionState<Post>(),
        followingState: createCollectionState<User>(),
        followersState: createCollectionState<User>(),
      },
      global: {
        stubs: {
          'el-tabs': ElTabsStub,
          'el-tab-pane': ElTabPaneStub,
        },
      },
    });

    const panes = wrapper.findAll('.el-tab-pane-stub');
    expect(panes).toHaveLength(4);
    expect(panes.map((pane) => pane.attributes('data-name'))).toEqual([
      'posts',
      'favorites',
      'following',
      'followers',
    ]);

    const postPanels = wrapper.findAll('.profile-posts-tab-panel-stub');
    expect(postPanels[0].find('.empty-title').text()).toBe('还没有发布文章');
    expect(postPanels[0].find('.show-create').text()).toBe('true');
    expect(postPanels[1].find('.empty-title').text()).toBe('还没有收藏文章');
    expect(postPanels[1].find('.show-create').text()).toBe('false');
  });

  it('应转发 post 和 user 面板事件', async () => {
    const wrapper = mount(ProfileTabsSection, {
      props: {
        activeTab: 'posts',
        isCurrentUser: false,
        postsState: createCollectionState<Post>(),
        favoritesState: createCollectionState<Post>(),
        followingState: createCollectionState<User>(),
        followersState: createCollectionState<User>(),
      },
      global: {
        stubs: {
          'el-tabs': ElTabsStub,
          'el-tab-pane': ElTabPaneStub,
        },
      },
    });

    const postPanels = wrapper.findAll('.profile-posts-tab-panel-stub');
    const userPanels = wrapper.findAll('.profile-users-tab-panel-stub');

    await postPanels[0].find('.retry-btn').trigger('click');
    await postPanels[0].find('.load-more-btn').trigger('click');
    await postPanels[0].find('.create-post-btn').trigger('click');
    await postPanels[0].find('.like-change-btn').trigger('click');
    await postPanels[0].find('.favorite-change-btn').trigger('click');
    await userPanels[0].find('.retry-btn').trigger('click');
    await userPanels[0].find('.load-more-btn').trigger('click');
    await userPanels[0].find('.user-click-btn').trigger('click');

    expect(wrapper.emitted('load-tab')).toEqual([
      [{ tab: 'posts' }],
      [{ tab: 'posts', append: true }],
      [{ tab: 'following' }],
      [{ tab: 'following', append: true }],
    ]);
    expect(wrapper.emitted('create-post')).toHaveLength(1);
    expect(wrapper.emitted('post-like-change')).toEqual([
      [{ postId: 'post-1', isLiked: true, likeCount: 9 }],
    ]);
    expect(wrapper.emitted('post-favorite-change')).toEqual([
      [{ postId: 'post-1', isFavorited: true, favoriteCount: 7 }],
    ]);
    expect(wrapper.emitted('user-click')).toEqual([['user-2']]);
  });
});
