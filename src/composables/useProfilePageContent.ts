import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useProfileCollections } from '@/composables/useProfileCollections';
import { useAuthStore } from '@/stores/auth';
import { useUser } from '@/composables/useUser';
import { useCreateConversationMutation } from '@/queries/messages';
import type { ProfileTabKey } from '@/types/user/profile';

const createLoadedTabsState = (): Record<ProfileTabKey, boolean> => ({
  posts: false,
  favorites: false,
  following: false,
  followers: false,
});

export function useProfilePageContent() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const {
    userProfile,
    loading,
    error,
    errorStatus,
    followLoading,
    isFollowing,
    fetchUserProfile,
    followUser,
    unfollowUser,
    getUserPosts,
    getUserFavorites,
    getUserFollowing,
    getUserFollowers,
    uploadAvatar,
  } = useUser();
  const { mutate: createConversation, isPending: isCreatingConversation } =
    useCreateConversationMutation();

  const userId = computed(() => String(route.params.id ?? '').trim());
  const activeTab = ref<ProfileTabKey>('posts');
  const loadedTabs = ref<Record<ProfileTabKey, boolean>>(createLoadedTabsState());
  const {
    posts,
    favorites,
    following,
    followers,
    resetCollectionStates,
    loadPostsPage: loadPostsPageRaw,
    loadFavoritesPage: loadFavoritesPageRaw,
    loadFollowingPage: loadFollowingPageRaw,
    loadFollowersPage: loadFollowersPageRaw,
    handleLikeChange,
    handleFavoriteChange,
  } = useProfileCollections({
    userId,
    getUserPosts,
    getUserFavorites,
    getUserFollowing,
    getUserFollowers,
  });

  const loadPostsPage = async (append = false) => {
    await loadPostsPageRaw(append);
    if (!append && !posts.value.error) {
      loadedTabs.value.posts = true;
    }
  };

  const loadFavoritesPage = async (append = false) => {
    await loadFavoritesPageRaw(append);
    if (!append && !favorites.value.error) {
      loadedTabs.value.favorites = true;
    }
  };

  const loadFollowingPage = async (append = false) => {
    await loadFollowingPageRaw(append);
    if (!append && !following.value.error) {
      loadedTabs.value.following = true;
    }
  };

  const loadFollowersPage = async (append = false) => {
    await loadFollowersPageRaw(append);
    if (!append && !followers.value.error) {
      loadedTabs.value.followers = true;
    }
  };

  const isCurrentUser = computed(() => authStore.user?.id === userId.value);
  const isUnauthorizedError = computed(() => errorStatus.value === 401);
  const displayErrorMessage = computed(() => {
    if (isUnauthorizedError.value) {
      return '请先登录后再试。';
    }

    return error.value || '加载用户信息失败，请稍后重试';
  });

  const isAuthenticated = computed(() => authStore.isAuthenticated);

  const loadActiveTabContent = async (tab: ProfileTabKey = activeTab.value) => {
    if (!userProfile.value || error.value) {
      return;
    }

    if (!isAuthenticated.value) {
      return;
    }

    switch (tab) {
      case 'posts':
        if (!loadedTabs.value.posts) {
          await loadPostsPage();
        }
        break;
      case 'favorites':
        if (!loadedTabs.value.favorites) {
          await loadFavoritesPage();
        }
        break;
      case 'following':
        if (!loadedTabs.value.following) {
          await loadFollowingPage();
        }
        break;
      case 'followers':
        if (!loadedTabs.value.followers) {
          await loadFollowersPage();
        }
        break;
    }
  };

  const loadProfilePage = async () => {
    resetCollectionStates();
    loadedTabs.value = createLoadedTabsState();
    await fetchUserProfile(userId.value);

    if (!userProfile.value || error.value) {
      return;
    }

    await loadActiveTabContent(activeTab.value);
  };

  watch(
    userId,
    () => {
      void loadProfilePage();
    },
    { immediate: true }
  );

  watch(activeTab, (tab) => {
    void loadActiveTabContent(tab);
  });

  const handleRetry = () => {
    void loadProfilePage();
  };

  const handleGoLogin = () => {
    router.push({
      path: '/auth/login',
      query: { redirect: route.fullPath },
    });
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleEditProfile = () => {
    router.push('/settings');
  };

  const handleFollowToggle = async () => {
    if (!userProfile.value) {
      return;
    }

    try {
      if (isFollowing.value) {
        await unfollowUser(userProfile.value.id);
      } else {
        await followUser(userProfile.value.id);
      }

      await fetchUserProfile(userId.value);
    } catch (requestError) {
      console.error('关注操作失败:', requestError);
    }
  };

  const handleSendMessage = () => {
    if (!userProfile.value) {
      return;
    }

    createConversation(userProfile.value.id, {
      onSuccess: (conversation) => {
        void router.push(`/messages?conversation=${conversation.id}`);
      },
      onError: (requestError) => {
        console.error('创建会话失败:', requestError);
        ElMessage.error('创建会话失败，请稍后重试');
      },
    });
  };

  const handleCreatePost = () => {
    void router.push('/posts/create');
  };

  const handleUserClick = (targetUserId: string) => {
    void router.push(`/users/${targetUserId}`);
  };

  /**
   * 处理头像上传：从 ProfileUserIdentity 冒泡上来的事件
   * 打开文件选择器，由用户选择图片后调用 uploadAvatar，成功后刷新用户信息
   */
  const handleUploadAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file || !userProfile.value) {
        return;
      }
      try {
        const result = await uploadAvatar(file);
        // 上传成功后用新 URL 更新本地 userProfile，避免重新请求全量数据
        userProfile.value = { ...userProfile.value, avatar: result.url };
      } catch {
        // uploadAvatar 内部已通过 ElMessage.error 展示错误，此处静默处理
      }
    };
    input.click();
  };

  return {
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
  };
}
