<script setup lang="ts">
import { computed } from 'vue';
import ProfilePostsTabPanel from '@/components/user/profile/ProfilePostsTabPanel.vue';
import ProfileUsersTabPanel from '@/components/user/profile/ProfileUsersTabPanel.vue';
import type { Post, User } from '@/types';
import type {
  ProfileCollectionState,
  ProfileFavoriteChange,
  ProfileLikeChange,
  ProfileTabLoadRequest,
  ProfileTabKey,
} from '@/types/user/profile';

interface Props {
  activeTab: ProfileTabKey;
  isAuthenticated: boolean;
  isCurrentUser: boolean;
  postsState: ProfileCollectionState<Post>;
  favoritesState: ProfileCollectionState<Post>;
  followingState: ProfileCollectionState<User>;
  followersState: ProfileCollectionState<User>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:active-tab': [tab: ProfileTabKey];
  'load-tab': [request: ProfileTabLoadRequest];
  'create-post': [];
  'post-like-change': [change: ProfileLikeChange];
  'post-favorite-change': [change: ProfileFavoriteChange];
  'user-click': [userId: string];
  'go-login': [];
}>();

const postTabConfigs = computed(() => [
  {
    key: 'posts' as const,
    label: '文章',
    state: props.postsState,
    loadingText: '正在加载文章...',
    errorTitle: '加载文章失败',
    emptyTitle: props.isCurrentUser ? '还没有发布文章' : '该用户还没有发布文章',
    emptyDescription: props.isCurrentUser ? '开始创作你的第一篇文章吧' : '',
    emptyIcon: 'el-icon-document',
    showCreateAction: props.isCurrentUser,
    onRetry: () => emit('load-tab', { tab: 'posts' }),
    onLoadMore: () => emit('load-tab', { tab: 'posts', append: true }),
  },
  {
    key: 'favorites' as const,
    label: '收藏',
    state: props.favoritesState,
    loadingText: '正在加载收藏...',
    errorTitle: '加载收藏失败',
    emptyTitle: '还没有收藏文章',
    emptyDescription: '收藏喜欢的文章，方便以后查看',
    emptyIcon: 'el-icon-star-off',
    showCreateAction: false,
    onRetry: () => emit('load-tab', { tab: 'favorites' }),
    onLoadMore: () => emit('load-tab', { tab: 'favorites', append: true }),
  },
]);

const userTabConfigs = computed(() => [
  {
    key: 'following' as const,
    label: '关注',
    state: props.followingState,
    loadingText: '正在加载关注列表...',
    errorTitle: '加载关注失败',
    emptyTitle: '还没有关注任何人',
    emptyDescription: '关注感兴趣的作者，获取最新动态',
    emptyIcon: 'el-icon-user',
    onRetry: () => emit('load-tab', { tab: 'following' }),
    onLoadMore: () => emit('load-tab', { tab: 'following', append: true }),
  },
  {
    key: 'followers' as const,
    label: '粉丝',
    state: props.followersState,
    loadingText: '正在加载粉丝列表...',
    errorTitle: '加载粉丝失败',
    emptyTitle: '还没有粉丝',
    emptyDescription: '创作优质内容，吸引更多关注者',
    emptyIcon: 'el-icon-user',
    onRetry: () => emit('load-tab', { tab: 'followers' }),
    onLoadMore: () => emit('load-tab', { tab: 'followers', append: true }),
  },
]);

const tabs = computed(() => [...postTabConfigs.value, ...userTabConfigs.value]);

const activePostTab = computed(() =>
  postTabConfigs.value.find((tab) => tab.key === props.activeTab) ?? null
);

const activeUserTab = computed(() =>
  userTabConfigs.value.find((tab) => tab.key === props.activeTab) ?? null
);

const selectTab = (tab: ProfileTabKey) => {
  if (tab !== props.activeTab) {
    emit('update:active-tab', tab);
  }
};
</script>

<template>
  <div class="profile-tabs">
    <div class="profile-tabs__bar">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="profile-tabs__tab"
        :class="{ 'profile-tabs__tab--active': tab.key === props.activeTab }"
        type="button"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="profile-tabs__panel">
      <div
        v-if="!props.isAuthenticated"
        class="profile-tabs__locked"
      >
        <p class="profile-tabs__locked-title">
          登录后可查看文章、收藏、关注和粉丝列表
        </p>
        <p class="profile-tabs__locked-copy">
          当前用户主页信息已展示，登录后可继续查看更多内容与互动数据。
        </p>
        <button
          class="profile-tabs__login-btn"
          type="button"
          @click="emit('go-login')"
        >
          去登录
        </button>
      </div>

      <ProfilePostsTabPanel
        v-else-if="activePostTab"
        :state="activePostTab.state"
        :loading-text="activePostTab.loadingText"
        :error-title="activePostTab.errorTitle"
        :empty-title="activePostTab.emptyTitle"
        :empty-description="activePostTab.emptyDescription"
        :empty-icon="activePostTab.emptyIcon"
        :show-create-action="activePostTab.showCreateAction"
        @retry="activePostTab.onRetry"
        @load-more="activePostTab.onLoadMore"
        @create-post="emit('create-post')"
        @like-change="emit('post-like-change', $event)"
        @favorite-change="emit('post-favorite-change', $event)"
      />

      <ProfileUsersTabPanel
        v-else-if="activeUserTab"
        :state="activeUserTab.state"
        :loading-text="activeUserTab.loadingText"
        :error-title="activeUserTab.errorTitle"
        :empty-title="activeUserTab.emptyTitle"
        :empty-description="activeUserTab.emptyDescription"
        :empty-icon="activeUserTab.emptyIcon"
        @retry="activeUserTab.onRetry"
        @load-more="activeUserTab.onLoadMore"
        @user-click="emit('user-click', $event)"
      />

      <div
        v-else
        class="profile-tabs__fallback"
      >
        <p>当前标签暂不可用。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-tabs {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 20px;
  background: rgba(255, 252, 247, 0.92);
  border: 1px solid rgba(15, 49, 80, 0.08);
  box-shadow: 0 14px 34px rgba(16, 39, 56, 0.06);
  overflow: hidden;
}

.profile-tabs__bar {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: 0 clamp(20px, 4vw, 32px);
  border-bottom: 1px solid rgba(15, 49, 80, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 244, 237, 0.88));
  overflow-x: auto;
}

.profile-tabs__tab {
  position: relative;
  flex-shrink: 0;
  padding: 16px 0 14px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: color var(--transition-base);
}

.profile-tabs__tab::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  border-radius: 999px;
  background: transparent;
  transition: background-color var(--transition-base);
}

.profile-tabs__tab:hover,
.profile-tabs__tab--active {
  color: var(--color-cta);
}

.profile-tabs__tab--active::after {
  background: var(--color-cta);
}

.profile-tabs__panel {
  padding: var(--space-md) clamp(20px, 4vw, 32px) var(--space-xl);
  background:
    radial-gradient(circle at top right, rgba(244, 223, 191, 0.12), transparent 20%),
    linear-gradient(180deg, rgba(249, 246, 239, 0.7), rgba(255, 255, 255, 0.98));
}

.profile-tabs__locked,
.profile-tabs__fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: clamp(32px, 7vw, 56px) var(--space-lg);
  border: 1px dashed rgba(15, 49, 80, 0.16);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.profile-tabs__locked-title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.05rem;
  font-weight: 700;
}

.profile-tabs__locked-copy,
.profile-tabs__fallback p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.profile-tabs__login-btn {
  margin-top: var(--space-sm);
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  background: var(--color-cta);
  color: var(--color-text-inverse);
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .profile-tabs__bar {
    gap: var(--space-md);
    padding: 0 var(--space-lg);
  }

  .profile-tabs__panel {
    padding: var(--space-sm) var(--space-lg) var(--space-lg);
  }
}
</style>
