<!--
  用户主页
  显示用户信息、文章列表、收藏列表、关注列表等
-->
<script setup lang="ts">
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import ProfileErrorState from '@/components/user/profile/ProfileErrorState.vue';
import ProfileHeaderSection from '@/components/user/profile/ProfileHeaderSection.vue';
import ProfileTabsSection from '@/components/user/profile/ProfileTabsSection.vue';
import { useProfilePageContent } from '@/composables/useProfilePageContent';
import type { ProfileTabLoadRequest } from '@/types/user/profile';

const {
  userId,
  userProfile,
  loading,
  error,
  isUnauthorizedError,
  displayErrorMessage,
  isAuthenticated,
  isCurrentUser,
  isFollowing,
  followLoading,
  isCreatingConversation,
  activeTab,
  posts,
  favorites,
  following,
  followers,
  handleRetry,
  handleGoLogin,
  handleGoHome,
  handleEditProfile,
  handleFollowToggle,
  handleSendMessage,
  handleCreatePost,
  handleUserClick,
  handleUploadAvatar,
  loadPostsPage,
  loadFavoritesPage,
  loadFollowingPage,
  loadFollowersPage,
  handleLikeChange,
  handleFavoriteChange,
} = useProfilePageContent();

/**
 * 处理封面更新：ProfileHeaderSection 上传成功后触发
 * 乐观更新本地 userProfile.coverImage，无需重新请求全量数据
 */
const handleCoverUpdated = (url: string) => {
  if (userProfile.value) {
    userProfile.value = { ...userProfile.value, coverImage: url };
  }
};

const handleLoadTab = ({ tab, append = false }: ProfileTabLoadRequest) => {
  switch (tab) {
    case 'posts':
      void loadPostsPage(append);
      break;
    case 'favorites':
      void loadFavoritesPage(append);
      break;
    case 'following':
      void loadFollowingPage(append);
      break;
    case 'followers':
      void loadFollowersPage(append);
      break;
  }
};
</script>

<template>
  <div class="user-profile-page">
    <div
      v-if="loading"
      class="loading-container"
    >
      <LoadingSpinner size="large" />
      <p>正在加载用户信息...</p>
    </div>

    <ProfileErrorState
      v-else-if="error"
      :message="displayErrorMessage"
      :is-unauthorized-error="isUnauthorizedError"
      @retry="handleRetry"
      @go-login="handleGoLogin"
      @go-home="handleGoHome"
    />

    <template v-else-if="userProfile">
      <ProfileHeaderSection
        :user="userProfile"
        :user-id="userId"
        :is-current-user="isCurrentUser"
        :is-following="isFollowing"
        :follow-loading="followLoading"
        :is-creating-conversation="isCreatingConversation"
        @edit-profile="handleEditProfile"
        @follow-toggle="handleFollowToggle"
        @send-message="handleSendMessage"
        @upload-avatar="handleUploadAvatar"
        @cover-updated="handleCoverUpdated"
      />

      <div class="content-container">
        <ProfileTabsSection
          :active-tab="activeTab"
          :is-authenticated="isAuthenticated"
          :is-current-user="isCurrentUser"
          :posts-state="posts"
          :favorites-state="favorites"
          :following-state="following"
          :followers-state="followers"
          @update:active-tab="activeTab = $event"
          @load-tab="handleLoadTab"
          @create-post="handleCreatePost"
          @post-like-change="handleLikeChange"
          @post-favorite-change="handleFavoriteChange"
          @user-click="handleUserClick"
          @go-login="handleGoLogin"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.user-profile-page {
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  margin-top: calc(var(--space-lg) * -1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: var(--color-text-secondary);
}

.loading-container p {
  margin: var(--space-md) 0;
  font-size: 1rem;
}

.content-container {
  max-width: 1160px;
  margin: 0 auto;
  padding: 0 var(--space-lg) var(--space-2xl);
}

@media (max-width: 768px) {
  .user-profile-page {
    margin-top: calc(var(--space-md) * -1);
  }

  .content-container {
    padding: 0 var(--space-md) var(--space-xl);
  }
}
</style>
