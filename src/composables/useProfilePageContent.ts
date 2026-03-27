import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useProfileCollections } from '@/composables/useProfileCollections';
import { useAuthStore } from '@/stores/auth';
import { useUser } from '@/composables/useUser';
import { useCreateConversationMutation } from '@/queries/messages';
import type { ProfileTabKey } from '@/types/user/profile';

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
  } = useUser();
  const { mutate: createConversation, isPending: isCreatingConversation } =
    useCreateConversationMutation();

  const userId = computed(() => String(route.params.id ?? '').trim());
  const activeTab = ref<ProfileTabKey>('posts');
  const {
    posts,
    favorites,
    following,
    followers,
    resetCollectionStates,
    loadPostsPage,
    loadFavoritesPage,
    loadFollowingPage,
    loadFollowersPage,
    handleLikeChange,
    handleFavoriteChange,
  } = useProfileCollections({
    userId,
    getUserPosts,
    getUserFavorites,
    getUserFollowing,
    getUserFollowers,
  });

  const isCurrentUser = computed(() => authStore.user?.id === userId.value);
  const isUnauthorizedError = computed(() => errorStatus.value === 401);
  const displayErrorMessage = computed(() => {
    if (isUnauthorizedError.value) {
      return '请先登录后再试。';
    }

    return error.value || '加载用户信息失败，请稍后重试';
  });

  const loadActiveTabContent = async (tab: ProfileTabKey = activeTab.value) => {
    if (!userProfile.value || error.value) {
      return;
    }

    switch (tab) {
      case 'posts':
        if (posts.value.list.length === 0) {
          await loadPostsPage();
        }
        break;
      case 'favorites':
        if (favorites.value.list.length === 0) {
          await loadFavoritesPage();
        }
        break;
      case 'following':
        if (following.value.list.length === 0) {
          await loadFollowingPage();
        }
        break;
      case 'followers':
        if (followers.value.list.length === 0) {
          await loadFollowersPage();
        }
        break;
    }
  };

  const loadProfilePage = async () => {
    resetCollectionStates();
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

  return {
    userId,
    userProfile,
    loading,
    error,
    isUnauthorizedError,
    displayErrorMessage,
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
    loadPostsPage,
    loadFavoritesPage,
    loadFollowingPage,
    loadFollowersPage,
    handleLikeChange,
    handleFavoriteChange,
  };
}
