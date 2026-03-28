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
}>();

const activeTabModel = computed({
  get: () => props.activeTab,
  set: (value) => emit('update:active-tab', value as ProfileTabKey),
});

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
</script>

<template>
  <div class="profile-tabs">
    <el-tabs v-model="activeTabModel">
      <el-tab-pane
        v-for="tab in postTabConfigs"
        :key="tab.key"
        :label="tab.label"
        :name="tab.key"
      >
        <ProfilePostsTabPanel
          :state="tab.state"
          :loading-text="tab.loadingText"
          :error-title="tab.errorTitle"
          :empty-title="tab.emptyTitle"
          :empty-description="tab.emptyDescription"
          :empty-icon="tab.emptyIcon"
          :show-create-action="tab.showCreateAction"
          @retry="tab.onRetry"
          @load-more="tab.onLoadMore"
          @create-post="emit('create-post')"
          @like-change="emit('post-like-change', $event)"
          @favorite-change="emit('post-favorite-change', $event)"
        />
      </el-tab-pane>

      <el-tab-pane
        v-for="tab in userTabConfigs"
        :key="tab.key"
        :label="tab.label"
        :name="tab.key"
      >
        <ProfileUsersTabPanel
          :state="tab.state"
          :loading-text="tab.loadingText"
          :error-title="tab.errorTitle"
          :empty-title="tab.emptyTitle"
          :empty-description="tab.emptyDescription"
          :empty-icon="tab.emptyIcon"
          @retry="tab.onRetry"
          @load-more="tab.onLoadMore"
          @user-click="emit('user-click', $event)"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.profile-tabs {
  padding: 0 var(--space-lg);
}

/* 下划线 Tab 样式：去除 el-tabs 默认边框，激活色使用 --color-cta */
:deep(.el-tabs__nav-wrap::after) {
  background-color: var(--color-border-light);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--color-cta);
}

:deep(.el-tabs__item) {
  color: var(--color-text-secondary);
}

:deep(.el-tabs__item:hover) {
  color: var(--color-cta);
}

:deep(.el-tabs__item.is-active) {
  color: var(--color-cta);
  font-weight: 600;
}

@media (max-width: 768px) {
  .profile-tabs {
    padding: 0 var(--space-md);
  }
}
</style>
